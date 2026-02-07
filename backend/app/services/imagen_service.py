"""Image generation service — Google Imagen via Vertex AI.

Falls back to a placeholder when credentials are not configured.
"""

import base64
import logging
from typing import Any

import httpx

from app.core.config import settings
from app.services.cloudinary_service import upload_bytes

logger = logging.getLogger(__name__)

# Vertex AI REST endpoint for image generation
VERTEX_URL_TEMPLATE = (
    "https://us-central1-aiplatform.googleapis.com/v1/"
    "projects/{project}/locations/us-central1/"
    "publishers/google/models/{model}:predict"
)

IMAGEN_TIMEOUT = 60.0


async def generate_image(
    prompt: str,
    negative_prompt: str = "",
    aspect_ratio: str = "1:1",
    sample_count: int = 1,
) -> str:
    """Generate an image from a text prompt using Google Imagen.

    Args:
        prompt: The text prompt describing the desired image.
        negative_prompt: Things to avoid in the image.
        aspect_ratio: Output aspect ratio (e.g. "1:1", "16:9").
        sample_count: Number of images to generate (we use the first).

    Returns:
        Public URL of the generated image (uploaded to Cloudinary).
    """
    if not settings.GOOGLE_API_KEY or not settings.GOOGLE_PROJECT_ID:
        logger.warning("Google Imagen not configured — returning placeholder")
        return _placeholder_url(prompt)

    url = VERTEX_URL_TEMPLATE.format(
        project=settings.GOOGLE_PROJECT_ID,
        model=settings.IMAGEN_MODEL,
    )

    request_body: dict[str, Any] = {
        "instances": [
            {
                "prompt": prompt,
            }
        ],
        "parameters": {
            "sampleCount": sample_count,
            "aspectRatio": aspect_ratio,
        },
    }

    if negative_prompt:
        request_body["instances"][0]["negativePrompt"] = negative_prompt

    headers = {
        "Authorization": f"Bearer {settings.GOOGLE_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=IMAGEN_TIMEOUT) as client:
        response = await client.post(url, json=request_body, headers=headers)
        response.raise_for_status()

    data = response.json()
    predictions = data.get("predictions", [])

    if not predictions:
        logger.error("Imagen returned no predictions for prompt: %s", prompt[:100])
        return _placeholder_url(prompt)

    # Decode the base64 image bytes
    image_b64: str = predictions[0].get("bytesBase64Encoded", "")
    if not image_b64:
        logger.error("Imagen prediction has no image bytes")
        return _placeholder_url(prompt)

    image_bytes = base64.b64decode(image_b64)

    # Upload to Cloudinary for persistent hosting
    cloudinary_url = await upload_bytes(
        data=image_bytes,
        folder="generated-images",
        filename="imagen-output.png",
    )

    return cloudinary_url


def _placeholder_url(prompt: str) -> str:
    """Return a placeholder image URL when Imagen is not configured."""
    # Use a deterministic placeholder based on the prompt
    safe_text = prompt[:40].replace(" ", "+")
    return f"https://placehold.co/800x600/1a1a2e/e0e0e0?text={safe_text}"
