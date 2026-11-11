from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health", summary="Process liveness")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready", summary="Basic application readiness")
async def ready() -> dict[str, str]:
    # Dependency checks will be added with persistence and storage adapters.
    return {"status": "ready"}
