from __future__ import annotations

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.template import Template

TEMPLATES = [
    {
        "title": "Corporate Gala",
        "category": "corporate",
        "summary": "High-end corporate gala with formal seating and staged program flow.",
        "est_cost_min": 25000,
        "est_cost_max": 90000,
        "blueprint_json": {
            "space_plan": {
                "before": "Empty ballroom",
                "after": "Stage + banquet seating + sponsor lounge",
                "zones": ["stage", "banquet", "reception", "sponsor lounge"],
                "capacity": {"comfortable": 200, "max": 260},
            },
            "service_stack": {
                "venue": "Hotel ballroom",
                "services": ["catering", "av", "decor", "security"],
            },
            "budget": {
                "line_items": [
                    {"label": "Venue", "amount": 25000},
                    {"label": "Catering", "amount": 32000},
                    {"label": "AV", "amount": 12000},
                ],
                "trade_offs": ["reduce floral scope", "shorten program runtime"],
            },
            "timeline": {
                "phases": [
                    {"name": "Load-in", "hours_before": 8},
                    {"name": "Guest arrival", "hours_before": 0},
                    {"name": "Program", "hours_after": 1},
                ],
                "dependencies": ["AV install before decor"],
            },
            "risk_compliance": {
                "permits": ["sound permit"],
                "noise": "Indoor curfew 11pm",
                "insurance": "General liability required",
            },
        },
    },
    {
        "title": "Wedding Reception",
        "category": "wedding",
        "summary": "Classic wedding reception layout with ceremony-to-reception flip.",
        "est_cost_min": 18000,
        "est_cost_max": 70000,
        "blueprint_json": {
            "space_plan": {
                "before": "Ceremony seating",
                "after": "Dining + dance floor",
                "zones": ["dining", "dance floor", "bar", "photo lounge"],
                "capacity": {"comfortable": 150, "max": 200},
            },
            "service_stack": {
                "venue": "Garden venue",
                "services": ["catering", "florals", "dj", "photography"],
            },
            "budget": {
                "line_items": [
                    {"label": "Venue", "amount": 15000},
                    {"label": "Catering", "amount": 20000},
                    {"label": "Photography", "amount": 6000},
                ],
                "trade_offs": ["simplify floral install"],
            },
            "timeline": {
                "phases": [
                    {"name": "Ceremony", "hours_before": 2},
                    {"name": "Reception", "hours_after": 1},
                    {"name": "Send-off", "hours_after": 4},
                ],
                "dependencies": ["flip crew scheduled after ceremony"],
            },
            "risk_compliance": {
                "permits": ["outdoor amplification"],
                "noise": "Outdoor cutoff 10pm",
                "insurance": "Event insurance required",
            },
        },
    },
    {
        "title": "Product Launch",
        "category": "marketing",
        "summary": "Modern product launch with demo zones and press area.",
        "est_cost_min": 12000,
        "est_cost_max": 50000,
        "blueprint_json": {
            "space_plan": {
                "before": "Warehouse open floor",
                "after": "Stage + demo pods + media riser",
                "zones": ["stage", "demo pods", "media riser", "lounge"],
                "capacity": {"comfortable": 120, "max": 180},
            },
            "service_stack": {
                "venue": "Industrial loft",
                "services": ["av", "lighting", "catering", "branding"],
            },
            "budget": {
                "line_items": [
                    {"label": "AV", "amount": 10000},
                    {"label": "Lighting", "amount": 7000},
                    {"label": "Catering", "amount": 8000},
                ],
                "trade_offs": ["reduce LED wall size"],
            },
            "timeline": {
                "phases": [
                    {"name": "Press preview", "hours_before": 1},
                    {"name": "Launch moment", "hours_after": 0},
                    {"name": "Networking", "hours_after": 2},
                ],
                "dependencies": ["stage build before lighting"],
            },
            "risk_compliance": {
                "permits": ["occupancy permit"],
                "noise": "Indoor event",
                "insurance": "Vendor COIs required",
            },
        },
    },
    {
        "title": "Conference / Lecture",
        "category": "conference",
        "summary": "Lecture-style conference with breakout flow and sponsor zones.",
        "est_cost_min": 15000,
        "est_cost_max": 60000,
        "blueprint_json": {
            "space_plan": {
                "before": "Open hall",
                "after": "Keynote stage + breakout rooms",
                "zones": ["keynote", "breakouts", "registration", "expo"],
                "capacity": {"comfortable": 300, "max": 400},
            },
            "service_stack": {
                "venue": "Convention center",
                "services": ["av", "staffing", "catering"],
            },
            "budget": {
                "line_items": [
                    {"label": "Venue", "amount": 20000},
                    {"label": "AV", "amount": 15000},
                    {"label": "Staffing", "amount": 6000},
                ],
                "trade_offs": ["reduce expo footprint"],
            },
            "timeline": {
                "phases": [
                    {"name": "Registration", "hours_before": 1},
                    {"name": "Keynote", "hours_after": 0},
                    {"name": "Breakouts", "hours_after": 2},
                ],
                "dependencies": ["room splits before seating"],
            },
            "risk_compliance": {
                "permits": ["fire marshal walkthrough"],
                "noise": "Indoor venue",
                "insurance": "Venue insurance on file",
            },
        },
    },
    {
        "title": "Birthday Celebration",
        "category": "social",
        "summary": "Vibrant birthday party with flexible lounge and photo zones.",
        "est_cost_min": 4000,
        "est_cost_max": 20000,
        "blueprint_json": {
            "space_plan": {
                "before": "Studio space",
                "after": "Lounge + games + dessert bar",
                "zones": ["lounge", "games", "dessert bar", "photo"],
                "capacity": {"comfortable": 60, "max": 90},
            },
            "service_stack": {
                "venue": "Studio loft",
                "services": ["decor", "dj", "catering"],
            },
            "budget": {
                "line_items": [
                    {"label": "Venue", "amount": 5000},
                    {"label": "Decor", "amount": 2500},
                    {"label": "Catering", "amount": 3000},
                ],
                "trade_offs": ["swap live DJ for playlist"],
            },
            "timeline": {
                "phases": [
                    {"name": "Setup", "hours_before": 3},
                    {"name": "Party", "hours_after": 0},
                    {"name": "Cleanup", "hours_after": 4},
                ],
                "dependencies": ["decor before photo zone"],
            },
            "risk_compliance": {
                "permits": [],
                "noise": "Local quiet hours 10pm",
                "insurance": "Optional event insurance",
            },
        },
    },
    {
        "title": "Community Fundraiser",
        "category": "community",
        "summary": "Fundraising event with auction flow and sponsor recognition.",
        "est_cost_min": 8000,
        "est_cost_max": 35000,
        "blueprint_json": {
            "space_plan": {
                "before": "Community hall",
                "after": "Stage + auction + dining",
                "zones": ["stage", "auction", "dining", "sponsor wall"],
                "capacity": {"comfortable": 180, "max": 240},
            },
            "service_stack": {
                "venue": "Community hall",
                "services": ["catering", "av", "volunteers"],
            },
            "budget": {
                "line_items": [
                    {"label": "Venue", "amount": 6000},
                    {"label": "Catering", "amount": 9000},
                    {"label": "AV", "amount": 5000},
                ],
                "trade_offs": ["reduce printed materials"],
            },
            "timeline": {
                "phases": [
                    {"name": "Silent auction", "hours_before": 1},
                    {"name": "Program", "hours_after": 0},
                    {"name": "Paddle raise", "hours_after": 1},
                ],
                "dependencies": ["auction setup before doors"],
            },
            "risk_compliance": {
                "permits": ["raffle permit"],
                "noise": "Indoor event",
                "insurance": "Nonprofit liability coverage",
            },
        },
    },
]


def seed_templates() -> None:
    db = SessionLocal()
    try:
        for entry in TEMPLATES:
            existing = db.execute(
                select(Template).where(Template.title == entry["title"])
            ).scalar_one_or_none()
            if existing:
                existing.category = entry["category"]
                existing.summary = entry["summary"]
                existing.blueprint_json = entry["blueprint_json"]
                existing.est_cost_min = entry["est_cost_min"]
                existing.est_cost_max = entry["est_cost_max"]
                db.add(existing)
            else:
                db.add(Template(**entry))
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_templates()
