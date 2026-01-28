from fastapi import APIRouter

from app.api.routes.admin_subscriptions import router as admin_subscriptions_router
from app.api.routes.admin_templates import router as admin_templates_router
from app.api.routes.admin_ops import router as admin_ops_router
from app.api.routes.admin_overview import router as admin_overview_router
from app.api.routes.admin_vendors import router as admin_vendors_router
from app.api.routes.admin_payouts import router as admin_payouts_router
from app.api.routes.admin_webhooks import router as admin_webhooks_router
from app.api.routes.admin_finance import router as admin_finance_router
from app.api.routes.auth import router as auth_router
from app.api.routes.bookings import router as bookings_router
from app.api.routes.disputes import router as disputes_router
from app.api.routes.payments import router as payments_router
from app.api.routes.planner import router as planner_router
from app.api.routes.public_vendors import router as public_vendors_router
from app.api.routes.subscription import router as subscription_router
from app.api.routes.templates import router as templates_router
from app.api.routes.trust import router as trust_router
from app.api.routes.uploads import router as uploads_router
from app.api.routes.vendor_payouts import router as vendor_payouts_router
from app.api.routes.vendors import router as vendors_router
from app.api.routes.webhooks import router as webhooks_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(subscription_router)
router.include_router(admin_subscriptions_router)
router.include_router(admin_templates_router)
router.include_router(admin_ops_router)
router.include_router(admin_overview_router)
router.include_router(admin_payouts_router)
router.include_router(admin_vendors_router)
router.include_router(admin_webhooks_router)
router.include_router(admin_finance_router)
router.include_router(bookings_router)
router.include_router(disputes_router)
router.include_router(payments_router)
router.include_router(planner_router)
router.include_router(templates_router)
router.include_router(trust_router)
router.include_router(vendor_payouts_router)
router.include_router(vendors_router)
router.include_router(public_vendors_router)
router.include_router(uploads_router)
router.include_router(webhooks_router)
