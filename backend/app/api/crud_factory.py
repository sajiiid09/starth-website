"""Generic CRUD router factory — mirrors the frontend's createEntity() pattern.

For any SQLAlchemy model + resource path, generates standard REST endpoints:
  GET    /api/{resource}          — list with query-param filters
  GET    /api/{resource}/search   — search across text columns
  GET    /api/{resource}/{id}     — get by UUID
  POST   /api/{resource}          — create
  PUT    /api/{resource}/{id}     — update
  DELETE /api/{resource}/{id}     — delete
"""

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import String, Text, inspect, or_, select
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_current_user_optional
from app.db.base import Base
from app.db.engine import get_db
from app.models.user import User
from app.utils.exceptions import ForbiddenError, NotFoundError, UnauthorizedError


def _is_jsonb_model(model: type[Base]) -> bool:
    """Check if the model uses a JSONB `data` column (extra entity pattern)."""
    mapper = inspect(model)
    for col in mapper.columns:
        if col.name == "data":
            return True
    return False


def _get_text_columns(model: type[Base]) -> list[str]:
    """Return column names that are String or Text typed (for search)."""
    mapper = inspect(model)
    text_cols: list[str] = []
    for col in mapper.columns:
        if isinstance(col.type, (String, Text)):
            text_cols.append(col.name)
    return text_cols


def _serialize_row(row: Any) -> dict[str, Any]:
    """Convert a SQLAlchemy model instance to a JSON-safe dict."""
    mapper = inspect(type(row))
    result: dict[str, Any] = {}
    for col in mapper.columns:
        value = getattr(row, col.name)
        if isinstance(value, uuid.UUID):
            value = str(value)
        elif isinstance(value, datetime):
            value = value.isoformat()
        elif isinstance(value, date):
            value = value.isoformat()
        elif isinstance(value, Decimal):
            value = float(value)
        result[col.name] = value
    return result


def create_crud_router(
    model: type[Base],
    resource: str,
    require_auth: bool = True,
    owner_field: str | None = None,
    tags: list[str] | None = None,
) -> APIRouter:
    """Build a full CRUD APIRouter for the given model.

    Args:
        model: The SQLAlchemy model class.
        resource: URL path segment (e.g. "venues", "dfy-leads").
        require_auth: If True, all mutating endpoints require JWT.
        owner_field: Column name for ownership checks (e.g. "user_id").
                     When set, create auto-sets it and update/delete verify it.
        tags: OpenAPI tags for grouping.
    """
    router = APIRouter(prefix=f"/api/{resource}", tags=tags or [resource])
    is_jsonb = _is_jsonb_model(model)

    # ------------------------------------------------------------------
    # LIST
    # ------------------------------------------------------------------
    @router.get("")
    async def list_items(
        request: Request,
        db: AsyncSession = Depends(get_db),
        _user: User | None = Depends(get_current_user_optional),
        _sort: str | None = Query(None),
        _limit: int = Query(100, le=500),
    ) -> dict[str, Any]:
        stmt = select(model)

        # Apply field-level filters from query params
        mapper = inspect(model)
        col_names = {col.name for col in mapper.columns}
        for key, value in request.query_params.items():
            if key.startswith("_"):
                continue
            if key in col_names:
                stmt = stmt.where(getattr(model, key) == value)

        # Sorting
        if _sort:
            desc = _sort.startswith("-")
            col_name = _sort.lstrip("-")
            if col_name in col_names:
                col_attr = getattr(model, col_name)
                stmt = stmt.order_by(col_attr.desc() if desc else col_attr.asc())

        stmt = stmt.limit(_limit)
        result = await db.execute(stmt)
        rows = result.scalars().all()

        return {
            "success": True,
            "data": [_serialize_row(r) for r in rows],
            "total": len(rows),
        }

    # ------------------------------------------------------------------
    # SEARCH
    # ------------------------------------------------------------------
    @router.get("/search")
    async def search_items(
        q: str = Query("", min_length=0),
        db: AsyncSession = Depends(get_db),
        _user: User | None = Depends(get_current_user_optional),
        _limit: int = Query(50, le=200),
    ) -> dict[str, Any]:
        text_cols = _get_text_columns(model)

        if not text_cols or not q.strip():
            return {"success": True, "data": [], "total": 0}

        pattern = f"%{q}%"
        conditions = [getattr(model, col).ilike(pattern) for col in text_cols]
        stmt = select(model).where(or_(*conditions)).limit(_limit)
        result = await db.execute(stmt)
        rows = result.scalars().all()

        return {
            "success": True,
            "data": [_serialize_row(r) for r in rows],
            "total": len(rows),
        }

    # ------------------------------------------------------------------
    # GET BY ID
    # ------------------------------------------------------------------
    @router.get("/{item_id}")
    async def get_item(
        item_id: uuid.UUID,
        db: AsyncSession = Depends(get_db),
        _user: User | None = Depends(get_current_user_optional),
    ) -> dict[str, Any]:
        result = await db.execute(select(model).where(model.id == item_id))
        row = result.scalar_one_or_none()
        if row is None:
            raise NotFoundError(f"{resource} not found")
        return {"success": True, "data": _serialize_row(row)}

    # ------------------------------------------------------------------
    # CREATE
    # ------------------------------------------------------------------
    @router.post("", status_code=201)
    async def create_item(
        request: Request,
        db: AsyncSession = Depends(get_db),
        user: User | None = Depends(
            get_current_user if require_auth else get_current_user_optional
        ),
    ) -> dict[str, Any]:
        body = await request.json()

        # Ownership enforcement: if owner_field is configured, user must be authenticated
        if owner_field and not user:
            raise UnauthorizedError("Authentication required")

        if is_jsonb:
            kwargs: dict[str, Any] = {"data": body}
            if owner_field and user:
                kwargs[owner_field] = user.id
            row = model(**kwargs)
        else:
            mapper = inspect(model)
            col_names = {col.name for col in mapper.columns}
            kwargs = {k: v for k, v in body.items() if k in col_names and k != "id"}
            if owner_field and user:
                kwargs[owner_field] = user.id
            row = model(**kwargs)

        db.add(row)
        await db.flush()
        return {"success": True, "data": _serialize_row(row)}

    # ------------------------------------------------------------------
    # UPDATE
    # ------------------------------------------------------------------
    @router.put("/{item_id}")
    async def update_item(
        item_id: uuid.UUID,
        request: Request,
        db: AsyncSession = Depends(get_db),
        user: User | None = Depends(
            get_current_user if require_auth else get_current_user_optional
        ),
    ) -> dict[str, Any]:
        result = await db.execute(select(model).where(model.id == item_id))
        row = result.scalar_one_or_none()
        if row is None:
            raise NotFoundError(f"{resource} not found")

        # Ownership check
        if owner_field:
            if not user:
                raise UnauthorizedError("Authentication required")
            if getattr(row, owner_field, None) != user.id:
                raise ForbiddenError("You do not own this resource")

        body = await request.json()

        if is_jsonb:
            # Merge into existing data
            existing_data: dict = row.data or {}
            existing_data.update(body)
            row.data = existing_data
        else:
            mapper = inspect(model)
            col_names = {col.name for col in mapper.columns}
            for key, value in body.items():
                if key in col_names and key not in ("id", "created_at"):
                    setattr(row, key, value)

        await db.flush()
        return {"success": True, "data": _serialize_row(row)}

    # ------------------------------------------------------------------
    # DELETE
    # ------------------------------------------------------------------
    @router.delete("/{item_id}")
    async def delete_item(
        item_id: uuid.UUID,
        db: AsyncSession = Depends(get_db),
        user: User | None = Depends(
            get_current_user if require_auth else get_current_user_optional
        ),
    ) -> dict[str, Any]:
        result = await db.execute(select(model).where(model.id == item_id))
        row = result.scalar_one_or_none()
        if row is None:
            raise NotFoundError(f"{resource} not found")

        # Ownership check
        if owner_field:
            if not user:
                raise UnauthorizedError("Authentication required")
            if getattr(row, owner_field, None) != user.id:
                raise ForbiddenError("You do not own this resource")

        await db.delete(row)
        await db.flush()
        return {"success": True, "deleted_id": str(item_id)}

    return router
