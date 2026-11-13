from fastapi import FastAPI

from app.api.routes.attendance import router as attendance_router
from app.api.routes.feedback import router as feedback_router
from app.api.routes.health import router as health_router
from app.api.routes.mobile import router as mobile_router
from app.core.config import get_settings

settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs" if settings.app_env == "development" else None,
    redoc_url=None,
)
app.include_router(health_router, prefix=settings.api_v1_prefix)
app.include_router(mobile_router, prefix=settings.api_v1_prefix)
app.include_router(feedback_router, prefix=settings.api_v1_prefix)
app.include_router(attendance_router, prefix=settings.api_v1_prefix)
