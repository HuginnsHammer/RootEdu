from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(prefix="/mobile", tags=["mobile"])


def build_mobile_bootstrap() -> dict:
    """Return public, non-personalized configuration required by the mobile client."""
    settings = get_settings()
    programmes = [
        {"code": code, "name": name}
        for code, name in sorted(settings.programme_catalog.items())
    ]
    return {
        "product": "RootEdu",
        "institution": settings.institution_name,
        "pilot": "MUST",
        "programmes": programmes,
        "capabilities": {
            "authentication": "not_yet_available",
            "academic_resources": "not_yet_available",
            "timetable": "not_yet_available",
            "announcements": "not_yet_available",
            "push_notifications": "not_yet_available",
        },
    }


@router.get("/bootstrap", summary="Mobile application configuration")
async def mobile_bootstrap() -> dict:
    return build_mobile_bootstrap()
