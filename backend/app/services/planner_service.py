"""Planner service — AI-powered event planning conversation and generation.

Handles:
- Conversational requirement collection (event type, date, budget, city, guests)
- Session persistence via the Conversation JSONB table
- Event plan generation from collected requirements
- Venue/provider matching via DB queries
"""

import json
import logging
import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.extra import Conversation
from app.models.template import Template
from app.models.venue import Venue
from app.models.service_provider import ServiceProvider
from app.services.llm_service import invoke_llm, invoke_llm_with_messages

logger = logging.getLogger(__name__)

# Fields the planner needs to collect before generating
REQUIRED_BRIEF_FIELDS = ["eventType", "guestCount", "budget", "city", "dateRange"]

SYSTEM_PROMPT = """You are Strathwell's AI event planner. Your job is to help users plan events.

CURRENT PHASE: Collecting event requirements.

You need to gather these details from the user:
- Event type (wedding, corporate, birthday, conference, etc.)
- Approximate guest count
- Budget range
- City (USA only)
- Preferred date or date range

RULES:
1. Be conversational and friendly, but concise.
2. Combine 2-3 questions in each message when possible.
3. If the user provides info, acknowledge it and ask for what's still missing.
4. Once you have ALL required fields, tell the user their brief is ready for plan generation.
5. Always respond in plain text, not markdown.

ALREADY COLLECTED:
{collected_fields}

STILL NEEDED:
{missing_fields}
"""

GENERATION_PROMPT = """Generate a complete event plan based on these requirements:

Event Type: {event_type}
Guest Count: {guest_count}
Budget: ${budget}
City: {city}
Date Range: {date_range}

Available Venues:
{venues_summary}

Available Service Providers:
{providers_summary}

Generate a JSON response with this exact structure:
{{
  "blueprintId": "<uuid>",
  "title": "<event title>",
  "summary": "<2-3 sentence summary>",
  "kpis": {{
    "totalCost": <number>,
    "costPerAttendee": <number>,
    "confidencePct": <0-100>
  }},
  "spacePlan": {{
    "beforeLabel": "<venue before description>",
    "afterLabel": "<planned setup description>",
    "inventory": {{
      "chairs": <number>,
      "tables": <number>,
      "stage": <0 or 1>,
      "buffet": <0 or 1>
    }}
  }},
  "timeline": [
    {{"time": "<HH:MM>", "title": "<activity>", "notes": "<details>"}}
  ],
  "budget": {{
    "total": <number>,
    "breakdown": [
      {{"label": "<category>", "pct": <percentage>}}
    ],
    "tradeoffNote": "<optional cost-saving suggestion>"
  }},
  "status": "draft"
}}

Include a 10% platform fee in the budget breakdown labeled "Platform Fee".
The total should not exceed the user's budget.
Timeline should include setup, main event phases, and breakdown.
"""


async def handle_message(
    db: AsyncSession,
    user_id: uuid.UUID,
    session_id: str,
    user_text: str,
    messages: list[dict[str, Any]],
    draft_brief: dict[str, Any] | None,
    mode: str | None,
    brief_status: str | None,
    planner_state: dict[str, Any] | None,
) -> dict[str, Any]:
    """Process a user message in the planner conversation.

    Returns:
        Dict matching the frontend's SendMessageResponse shape:
        {assistantMessage, updatedPlannerState?, updatedSession?}
    """
    current_brief = draft_brief or {}
    current_status = brief_status or "collecting"

    # Build the LLM conversation
    collected = {k: v for k, v in current_brief.items() if v is not None}
    missing = [f for f in REQUIRED_BRIEF_FIELDS if f not in collected or collected[f] is None]

    system_msg = SYSTEM_PROMPT.format(
        collected_fields=json.dumps(collected, indent=2) if collected else "None yet",
        missing_fields=", ".join(missing) if missing else "ALL COLLECTED",
    )

    llm_messages: list[dict[str, str]] = [{"role": "system", "content": system_msg}]

    # Add conversation history (last 20 messages max for context window)
    for msg in messages[-20:]:
        role = msg.get("role", "user")
        text = msg.get("text", "")
        if role in ("user", "assistant"):
            llm_messages.append({"role": role, "content": text})

    llm_messages.append({"role": "user", "content": user_text})

    # Call LLM
    assistant_text = await invoke_llm_with_messages(llm_messages, temperature=0.7)

    # Try to extract any brief fields the user mentioned
    updated_brief = await _extract_brief_fields(user_text, current_brief)

    # Check if brief is now complete
    updated_missing = [
        f for f in REQUIRED_BRIEF_FIELDS
        if f not in updated_brief or updated_brief[f] is None
    ]
    new_status = current_status
    if not updated_missing and current_status == "collecting":
        new_status = "ready_to_generate"

    # Build response
    now_ms = int(__import__("time").time() * 1000)
    assistant_message = {
        "id": f"msg-{uuid.uuid4()}",
        "role": "assistant",
        "text": assistant_text,
        "createdAt": now_ms,
        "status": "final",
    }

    response: dict[str, Any] = {
        "assistantMessage": assistant_message,
    }

    # Include session updates if brief changed
    session_update: dict[str, Any] = {}
    if updated_brief != current_brief:
        session_update["draftBrief"] = updated_brief
    if new_status != current_status:
        session_update["briefStatus"] = new_status
    if session_update:
        response["updatedSession"] = session_update

    # Persist session to DB
    await _save_session(db, user_id, session_id, {
        "messages": messages + [
            {"id": f"msg-{uuid.uuid4()}", "role": "user", "text": user_text, "createdAt": now_ms},
            assistant_message,
        ],
        "draftBrief": updated_brief,
        "briefStatus": new_status,
        "mode": mode or "scratch",
        "plannerState": planner_state,
    })

    return response


async def generate_plan(
    db: AsyncSession,
    user_id: uuid.UUID,
    draft_brief: dict[str, Any],
) -> dict[str, Any]:
    """Generate a complete event plan from the collected brief.

    Queries the database for matching venues and providers,
    then uses the LLM to generate a full plan.

    Returns:
        {plan: PlannerState, success: True}
    """
    event_type = draft_brief.get("eventType", "event")
    guest_count = draft_brief.get("guestCount", 50)
    budget = draft_brief.get("budget", 5000)
    city = draft_brief.get("city", "")
    date_range = draft_brief.get("dateRange", "TBD")

    # Query matching venues
    venues = await _find_matching_venues(db, city, guest_count, budget)
    venues_summary = _format_venues(venues)

    # Query matching providers
    providers = await _find_matching_providers(db, city)
    providers_summary = _format_providers(providers)

    # Generate plan via LLM
    prompt = GENERATION_PROMPT.format(
        event_type=event_type,
        guest_count=guest_count,
        budget=budget,
        city=city,
        date_range=date_range,
        venues_summary=venues_summary or "No venues found in database yet.",
        providers_summary=providers_summary or "No providers found in database yet.",
    )

    result = await invoke_llm(
        prompt=prompt,
        response_json_schema={"type": "object"},
        system_prompt="You are an expert event planner. Return valid JSON only.",
    )

    # Ensure we have a valid plan structure
    plan = _ensure_plan_structure(result, event_type, guest_count, budget)

    return {"plan": plan, "success": True}


async def get_sessions(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> list[dict[str, Any]]:
    """Fetch all planner sessions for a user from the conversations table."""
    stmt = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
        .limit(50)
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    sessions: list[dict[str, Any]] = []
    for row in rows:
        data = row.data or {}
        if data.get("_type") != "planner_session":
            continue
        session_data = data.get("session", {})
        session_data["id"] = str(row.id)
        sessions.append(session_data)

    return sessions


async def approve_layout(
    db: AsyncSession,
    user_id: uuid.UUID,
    session_id: str,
) -> dict[str, Any]:
    """Approve the current plan layout and begin the booking flow.

    This transitions the plan to 'approved' status and would trigger
    venue/provider booking requests (handled by booking_service).
    """
    # Load the session
    try:
        sid = uuid.UUID(session_id)
    except ValueError:
        return {"success": False, "error": "Invalid session ID"}

    result = await db.execute(
        select(Conversation).where(
            Conversation.id == sid,
            Conversation.user_id == user_id,
        )
    )
    row = result.scalar_one_or_none()
    if row is None:
        return {"success": False, "error": "Session not found"}

    data = row.data or {}
    session_data = data.get("session", {})
    planner_state = session_data.get("plannerState", {})

    if planner_state:
        planner_state["status"] = "approved"
        session_data["plannerState"] = planner_state
        session_data["canvasState"] = "visible"
        data["session"] = session_data
        row.data = data

    return {"success": True, "plannerState": planner_state}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


async def _extract_brief_fields(
    user_text: str,
    current_brief: dict[str, Any],
) -> dict[str, Any]:
    """Use the LLM to extract structured brief fields from user text.

    Returns the updated brief dict with any newly extracted fields merged in.
    """
    extraction_prompt = f"""Extract event planning details from this user message.
Only extract fields that are explicitly mentioned. Return a JSON object with these keys
(use null for fields not mentioned):

- eventType: string or null (e.g. "wedding", "corporate", "birthday")
- guestCount: integer or null
- budget: integer or null (in USD)
- city: string or null (US city name)
- dateRange: string or null (e.g. "March 2026", "next Saturday")

User message: "{user_text}"

Current known values: {json.dumps(current_brief)}

Return JSON only, no extra text."""

    try:
        result = await invoke_llm(
            prompt=extraction_prompt,
            response_json_schema={"type": "object"},
            temperature=0.1,
        )

        # Merge non-null extracted values into current brief
        updated = dict(current_brief)
        for field in REQUIRED_BRIEF_FIELDS:
            extracted_value = result.get(field)
            if extracted_value is not None:
                updated[field] = extracted_value

        return updated
    except Exception:
        logger.warning("Brief extraction failed, returning current brief", exc_info=True)
        return current_brief


async def _save_session(
    db: AsyncSession,
    user_id: uuid.UUID,
    session_id: str,
    session_data: dict[str, Any],
) -> None:
    """Persist a planner session to the conversations table."""
    try:
        sid = uuid.UUID(session_id)
    except ValueError:
        # Client-generated IDs may not be UUIDs; create a new record
        sid = uuid.uuid4()

    result = await db.execute(
        select(Conversation).where(
            Conversation.id == sid,
            Conversation.user_id == user_id,
        )
    )
    row = result.scalar_one_or_none()

    payload = {"_type": "planner_session", "session": session_data}

    if row:
        row.data = payload
    else:
        row = Conversation(id=sid, user_id=user_id, data=payload)
        db.add(row)


async def _find_matching_venues(
    db: AsyncSession,
    city: str,
    guest_count: int,
    budget: float,
) -> list[Any]:
    """Find venues matching the brief criteria."""
    stmt = select(Venue).where(Venue.status == "approved")

    if city:
        stmt = stmt.where(Venue.location_city.ilike(f"%{city}%"))

    stmt = stmt.where(Venue.capacity >= guest_count)
    stmt = stmt.limit(10)

    result = await db.execute(stmt)
    return list(result.scalars().all())


async def _find_matching_providers(
    db: AsyncSession,
    city: str,
) -> list[Any]:
    """Find service providers matching the brief criteria."""
    stmt = select(ServiceProvider).where(ServiceProvider.status == "approved")

    if city:
        stmt = stmt.where(ServiceProvider.location_city.ilike(f"%{city}%"))

    stmt = stmt.limit(20)

    result = await db.execute(stmt)
    return list(result.scalars().all())


def _format_venues(venues: list[Any]) -> str:
    """Format venue list for the LLM prompt."""
    if not venues:
        return ""

    lines: list[str] = []
    for v in venues:
        lines.append(
            f"- {v.name} in {v.location_city} "
            f"(capacity: {v.capacity}, status: {v.status})"
        )
    return "\n".join(lines)


def _format_providers(providers: list[Any]) -> str:
    """Format provider list for the LLM prompt."""
    if not providers:
        return ""

    lines: list[str] = []
    for p in providers:
        lines.append(
            f"- {p.business_name} in {p.location_city} (status: {p.status})"
        )
    return "\n".join(lines)


def _ensure_plan_structure(
    raw: dict[str, Any],
    event_type: str,
    guest_count: int,
    budget: float,
) -> dict[str, Any]:
    """Ensure the LLM response has the required PlannerState structure.

    Fills in defaults for any missing fields.
    """
    plan: dict[str, Any] = {
        "blueprintId": raw.get("blueprintId", str(uuid.uuid4())),
        "title": raw.get("title", f"{event_type.title()} Event Plan"),
        "summary": raw.get("summary", f"A {event_type} for {guest_count} guests."),
        "kpis": raw.get("kpis", {
            "totalCost": budget,
            "costPerAttendee": round(budget / max(guest_count, 1), 2),
            "confidencePct": 75,
        }),
        "spacePlan": raw.get("spacePlan", {
            "beforeLabel": "Empty venue space",
            "afterLabel": f"Configured for {event_type}",
            "inventory": {
                "chairs": guest_count,
                "tables": max(guest_count // 8, 1),
                "stage": 1 if event_type in ("wedding", "conference", "corporate") else 0,
                "buffet": 1,
            },
        }),
        "timeline": raw.get("timeline", [
            {"time": "08:00", "title": "Setup", "notes": "Venue preparation and decoration"},
            {"time": "10:00", "title": "Guest Arrival", "notes": "Welcome and registration"},
            {"time": "12:00", "title": "Main Event", "notes": f"{event_type.title()} program"},
            {"time": "15:00", "title": "Wrap Up", "notes": "Closing and teardown"},
        ]),
        "budget": raw.get("budget", {
            "total": budget,
            "breakdown": [
                {"label": "Venue", "pct": 35},
                {"label": "Catering", "pct": 25},
                {"label": "Entertainment", "pct": 15},
                {"label": "Decor", "pct": 10},
                {"label": "Platform Fee", "pct": 10},
                {"label": "Miscellaneous", "pct": 5},
            ],
            "tradeoffNote": None,
        }),
        "status": raw.get("status", "draft"),
    }
    return plan
