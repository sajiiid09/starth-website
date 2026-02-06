"""Integrations router — real implementations backed by service layer."""

from typing import Any

from fastapi import APIRouter, Depends, File, UploadFile
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.models.user import User
from app.services import cloudinary_service, imagen_service, llm_service
from app.services.email_service import send_email

router = APIRouter(prefix="/api/integrations", tags=["integrations"])


# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------


class InvokeLLMRequest(BaseModel):
    prompt: str
    response_json_schema: dict[str, Any] | None = None
    add_context_from_internet: bool = False


class SendEmailRequest(BaseModel):
    to: str
    subject: str
    body: str


class GenerateImageRequest(BaseModel):
    prompt: str
    negative_prompt: str = ""
    aspect_ratio: str = "1:1"


class SignedUrlRequest(BaseModel):
    public_id: str
    resource_type: str = "image"
    expires_in: int = 3600


class ExtractDataRequest(BaseModel):
    file_url: str
    extraction_prompt: str = "Extract all structured data from this document."


class GooglePlacePhotosRequest(BaseModel):
    place_id: str | None = None
    query: str | None = None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("/invoke-llm")
async def invoke_llm(
    body: InvokeLLMRequest,
    _user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Invoke the LLM (NVIDIA NeMo) with a prompt."""
    result = await llm_service.invoke_llm(
        prompt=body.prompt,
        response_json_schema=body.response_json_schema,
        add_context_from_internet=body.add_context_from_internet,
    )
    return result


@router.post("/send-email")
async def send_email_endpoint(
    body: SendEmailRequest,
    _user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Send an email via the backend SMTP service."""
    success = await send_email(to=body.to, subject=body.subject, html_body=body.body)
    return {"success": success}


@router.post("/upload-file")
async def upload_file(
    file: UploadFile = File(...),
    _user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Upload a file to Cloudinary (public)."""
    file_url = await cloudinary_service.upload_file(file=file, folder="uploads")
    return {"file_url": file_url}


@router.post("/generate-image")
async def generate_image(
    body: GenerateImageRequest,
    _user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Generate an image using Google Imagen."""
    url = await imagen_service.generate_image(
        prompt=body.prompt,
        negative_prompt=body.negative_prompt,
        aspect_ratio=body.aspect_ratio,
    )
    return {"url": url}


@router.post("/google-place-photos")
async def google_place_photos(
    body: GooglePlacePhotosRequest,
    _user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Google Place Photos — not needed (USA-only, venues provide own photos).

    Returns empty photos array. Kept for frontend compatibility.
    """
    return {"photos": []}


@router.post("/create-file-signed-url")
async def create_file_signed_url(
    body: SignedUrlRequest,
    _user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Create a time-limited signed URL for a private Cloudinary resource."""
    signed_url = cloudinary_service.create_signed_url(
        public_id=body.public_id,
        resource_type=body.resource_type,
        expires_in=body.expires_in,
    )
    return {"signedUrl": signed_url}


@router.post("/upload-private-file")
async def upload_private_file(
    file: UploadFile = File(...),
    _user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Upload a file to Cloudinary with private access."""
    file_url = await cloudinary_service.upload_private_file(file=file, folder="private")
    return {"file_url": file_url}


@router.post("/extract-data-from-file")
async def extract_data_from_file(
    body: ExtractDataRequest,
    _user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Extract structured data from an uploaded file using LLM.

    The file should already be uploaded (via upload-file). This endpoint
    sends the file URL to the LLM with an extraction prompt.
    """
    prompt = (
        f"Extract structured data from the document at this URL: {body.file_url}\n\n"
        f"Instructions: {body.extraction_prompt}\n\n"
        "Return the extracted data as a JSON object."
    )

    result = await llm_service.invoke_llm(
        prompt=prompt,
        response_json_schema={"type": "object"},
    )
    return result
