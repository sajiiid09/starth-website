"""LLM service — calls NVIDIA NeMo (OpenAI-compatible chat completions API)."""

import json
import logging
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# Timeout for LLM API calls (seconds)
LLM_TIMEOUT = 60.0


async def invoke_llm(
    prompt: str,
    response_json_schema: dict[str, Any] | None = None,
    add_context_from_internet: bool = False,
    system_prompt: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 2048,
) -> dict[str, Any]:
    """Send a prompt to the NVIDIA NeMo LLM and return the parsed response.

    Args:
        prompt: The user prompt text.
        response_json_schema: If set, request structured JSON output.
        add_context_from_internet: Hint for the LLM to include web context.
        system_prompt: Optional system message for guiding behavior.
        temperature: Sampling temperature (0.0-1.0).
        max_tokens: Maximum tokens in the response.

    Returns:
        Dict with the LLM response. If a JSON schema was requested,
        the response is parsed into a dict. Otherwise returns {"text": "..."}.
    """
    if not settings.NVIDIA_API_KEY:
        logger.warning("NVIDIA_API_KEY not set — returning mock LLM response")
        return _mock_response(prompt, response_json_schema)

    messages: list[dict[str, str]] = []

    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    elif response_json_schema:
        messages.append({
            "role": "system",
            "content": (
                "You are a helpful event planning assistant. "
                "Always respond with valid JSON matching the requested schema."
            ),
        })
    else:
        messages.append({
            "role": "system",
            "content": "You are a helpful event planning assistant for the Strathwell platform.",
        })

    if add_context_from_internet:
        messages.append({
            "role": "system",
            "content": "Use your knowledge to provide current, accurate information.",
        })

    messages.append({"role": "user", "content": prompt})

    request_body: dict[str, Any] = {
        "model": settings.NVIDIA_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    if response_json_schema:
        request_body["response_format"] = {"type": "json_object"}

    url = f"{settings.NVIDIA_API_BASE}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=LLM_TIMEOUT) as client:
        response = await client.post(url, json=request_body, headers=headers)
        response.raise_for_status()

    data = response.json()
    content = data["choices"][0]["message"]["content"]

    if response_json_schema:
        try:
            parsed = json.loads(content)
            return parsed
        except json.JSONDecodeError:
            logger.warning("LLM returned non-JSON despite schema request: %s", content[:200])
            return {"text": content}

    return {"text": content}


async def invoke_llm_with_messages(
    messages: list[dict[str, str]],
    temperature: float = 0.7,
    max_tokens: int = 2048,
    response_json: bool = False,
) -> str:
    """Lower-level call: send a full message list and get raw text back.

    Used by the planner service where we manage message history ourselves.
    """
    if not settings.NVIDIA_API_KEY:
        logger.warning("NVIDIA_API_KEY not set — returning mock message response")
        return "I'm a mock assistant response. Configure NVIDIA_API_KEY for real LLM calls."

    request_body: dict[str, Any] = {
        "model": settings.NVIDIA_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    if response_json:
        request_body["response_format"] = {"type": "json_object"}

    url = f"{settings.NVIDIA_API_BASE}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=LLM_TIMEOUT) as client:
        response = await client.post(url, json=request_body, headers=headers)
        response.raise_for_status()

    data = response.json()
    return data["choices"][0]["message"]["content"]


def _mock_response(prompt: str, schema: dict[str, Any] | None) -> dict[str, Any]:
    """Return a plausible mock response when no API key is configured."""
    if schema:
        return {
            "text": "Mock structured response",
            "mock": True,
            "prompt_preview": prompt[:100],
        }
    return {
        "text": (
            "This is a mock LLM response. To get real responses, "
            "configure your NVIDIA_API_KEY in .env."
        ),
        "mock": True,
    }
