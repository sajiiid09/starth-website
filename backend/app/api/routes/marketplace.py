"""Marketplace routes — public browsing and direct booking for venues and services.

Endpoints:
- GET /api/marketplace/venues — filter by city, capacity, price, ratings, amenities, venue type
- GET /api/marketplace/services — filter by service type, location, price, ratings
- POST /api/marketplace/book-venue — direct venue booking (bypass AI planner)
- POST /api/marketplace/book-service — direct service provider booking
"""

import uuid
from typing import Any

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_current_user_optional
from app.db.engine import get_db
from app.models.review import Review
from app.models.service import Service
from app.models.service_provider import ServiceProvider, ServiceProviderService
from app.models.user import User
from app.models.venue import Venue
from app.services.booking_service import book_service_provider, book_venue

router = APIRouter(prefix="/api/marketplace", tags=["marketplace"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class DirectBookVenueRequest(BaseModel):
    event_id: str
    venue_id: str


class DirectBookServiceRequest(BaseModel):
    event_id: str
    provider_id: str
    service_id: str | None = None
    agreed_price: float


# ---------------------------------------------------------------------------
# Browse venues
# ---------------------------------------------------------------------------


@router.get("/venues")
async def list_marketplace_venues(
    db: AsyncSession = Depends(get_db),
    _user: User | None = Depends(get_current_user_optional),
    city: str | None = Query(None, description="Filter by city name"),
    min_capacity: int | None = Query(None, ge=0),
    max_capacity: int | None = Query(None, ge=0),
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    amenities: str | None = Query(None, description="Comma-separated amenity names"),
    venue_type: str | None = Query(None, description="Type of venue"),
    min_rating: float | None = Query(None, ge=0, le=5),
    sort_by: str = Query("newest", description="newest | rating | capacity"),
    _limit: int = Query(20, alias="limit", ge=1, le=100),
    _offset: int = Query(0, alias="offset", ge=0),
) -> dict[str, Any]:
    """Browse approved venues with filtering and sorting."""
    query = select(Venue).where(Venue.status == "approved")

    # Apply filters
    if city:
        query = query.where(func.lower(Venue.location_city) == city.lower())

    if min_capacity is not None:
        query = query.where(Venue.capacity >= min_capacity)
    if max_capacity is not None:
        query = query.where(Venue.capacity <= max_capacity)

    if venue_type:
        # Venue type is stored in pricing_structure JSONB, or in description
        query = query.where(
            Venue.description.ilike(f"%{venue_type}%")
        )

    # Sorting
    if sort_by == "capacity":
        query = query.order_by(Venue.capacity.desc())
    else:  # newest is default
        query = query.order_by(Venue.created_at.desc())

    query = query.limit(_limit).offset(_offset)
    result = await db.execute(query)
    venues = result.scalars().all()

    # Enrich with ratings
    venue_data = []
    for v in venues:
        avg_rating = await _get_avg_rating(db, "venue", v.id)

        if min_rating is not None and (avg_rating or 0) < min_rating:
            continue

        venue_data.append({
            "id": str(v.id),
            "name": v.name,
            "description": v.description,
            "city": v.location_city,
            "address": v.location_address,
            "capacity": v.capacity,
            "amenities": v.amenities or [],
            "photos": v.photos or [],
            "pricing_structure": v.pricing_structure or {},
            "avg_rating": avg_rating,
        })

    return {"data": venue_data, "count": len(venue_data)}


# ---------------------------------------------------------------------------
# Browse services
# ---------------------------------------------------------------------------


@router.get("/services")
async def list_marketplace_services(
    db: AsyncSession = Depends(get_db),
    _user: User | None = Depends(get_current_user_optional),
    service_type: str | None = Query(None, description="Service category name"),
    city: str | None = Query(None, description="Provider city"),
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    min_rating: float | None = Query(None, ge=0, le=5),
    sort_by: str = Query("newest", description="newest | rating"),
    _limit: int = Query(20, alias="limit", ge=1, le=100),
    _offset: int = Query(0, alias="offset", ge=0),
) -> dict[str, Any]:
    """Browse approved service providers with filtering."""
    query = select(ServiceProvider).where(ServiceProvider.status == "approved")

    if city:
        query = query.where(func.lower(ServiceProvider.location_city) == city.lower())

    query = query.order_by(ServiceProvider.created_at.desc())
    query = query.limit(_limit).offset(_offset)

    result = await db.execute(query)
    providers = result.scalars().all()

    provider_data = []
    for sp in providers:
        # Filter by service type if specified
        if service_type:
            has_service = False
            for sps in sp.offered_services:
                if sps.service and sps.service.category and sps.service.category.lower() == service_type.lower():
                    has_service = True
                    break
            if not has_service:
                continue

        avg_rating = await _get_avg_rating(db, "service_provider", sp.id)
        if min_rating is not None and (avg_rating or 0) < min_rating:
            continue

        # Build services list
        services_list = []
        for sps in sp.offered_services:
            service_info: dict[str, Any] = {
                "id": str(sps.service_id),
                "price_range": sps.price_range,
            }
            if sps.service:
                service_info["name"] = sps.service.name
                service_info["category"] = sps.service.category
            services_list.append(service_info)

        provider_data.append({
            "id": str(sp.id),
            "business_name": sp.business_name,
            "description": sp.description,
            "city": sp.location_city,
            "service_area": sp.service_area or [],
            "photos": sp.photos or [],
            "services": services_list,
            "avg_rating": avg_rating,
        })

    return {"data": provider_data, "count": len(provider_data)}


# ---------------------------------------------------------------------------
# Direct booking
# ---------------------------------------------------------------------------


@router.post("/book-venue")
async def marketplace_book_venue(
    body: DirectBookVenueRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Direct venue booking from marketplace (bypasses AI planner)."""
    result = await book_venue(
        db=db,
        event_id=uuid.UUID(body.event_id),
        venue_id=uuid.UUID(body.venue_id),
        user_id=user.id,
    )
    return result


@router.post("/book-service")
async def marketplace_book_service(
    body: DirectBookServiceRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Direct service provider booking from marketplace (bypasses AI planner)."""
    result = await book_service_provider(
        db=db,
        event_id=uuid.UUID(body.event_id),
        provider_id=uuid.UUID(body.provider_id),
        service_id=uuid.UUID(body.service_id) if body.service_id else None,
        agreed_price=body.agreed_price,
        user_id=user.id,
    )
    return result


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _get_avg_rating(
    db: AsyncSession,
    reviewee_type: str,
    reviewee_id: uuid.UUID,
) -> float | None:
    """Get the average rating for an entity from the reviews table."""
    result = await db.execute(
        select(func.avg(Review.rating)).where(
            Review.reviewee_type == reviewee_type,
            Review.reviewee_id == reviewee_id,
        )
    )
    avg = result.scalar_one_or_none()
    return round(float(avg), 2) if avg else None
