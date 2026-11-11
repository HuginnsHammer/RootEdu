from collections.abc import Generator
from uuid import UUID

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


settings = get_settings()
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def set_tenant_context(session: Session, institution_id: UUID) -> None:
    """Set transaction-local RLS context from a trusted server-side identity.

    Never pass a tenant/institution ID supplied directly by a mobile client.
    Call after authentication and before any tenant-scoped query.
    """
    session.execute(
        text("SELECT set_config('app.tenant_id', :tenant_id, true)"),
        {"tenant_id": str(institution_id)},
    )


def get_db() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
