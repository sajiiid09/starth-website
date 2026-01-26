from fastapi import APIRouter

from app.api.routes.admin_subscriptions import router as admin_subscriptions_router
from app.api.routes.admin_templates import router as admin_templates_router
from app.api.routes.auth import router as auth_router
from app.api.routes.planner import router as planner_router
from app.api.routes.subscription import router as subscription_router
from app.api.routes.templates import router as templates_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(subscription_router)
router.include_router(admin_subscriptions_router)
router.include_router(admin_templates_router)
router.include_router(planner_router)
router.include_router(templates_router)
