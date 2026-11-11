from app.db.base import Base
from app.db import models  # noqa: F401


def test_event_streams_are_separate_tables() -> None:
    assert "audit_events" in Base.metadata.tables
    assert "security_events" in Base.metadata.tables
    assert Base.metadata.tables["audit_events"] is not Base.metadata.tables["security_events"]


def test_tenant_scoped_tables_have_institution_foreign_keys() -> None:
    for table_name in ("programmes", "academic_cohorts", "audit_events", "security_events"):
        table = Base.metadata.tables[table_name]
        assert table.c.institution_id is not None
        assert any(fk.target_fullname == "institutions.id" for fk in table.c.institution_id.foreign_keys)
