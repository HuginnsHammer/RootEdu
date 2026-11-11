"""Create institution, academic scope, and event foundations."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_tenant_foundation"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "institutions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(80), nullable=False, unique=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        "programmes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("institution_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("institutions.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("code", sa.String(20), nullable=False), sa.Column("name", sa.String(200), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("institution_id", "code", name="uq_programme_institution_code"),
    )
    op.create_table(
        "academic_cohorts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("institution_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("institutions.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("programme_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("programmes.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("academic_year", sa.String(9), nullable=False), sa.Column("semester", sa.Integer(), nullable=False),
        sa.Column("cohort_code", sa.String(40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("institution_id", "programme_id", "academic_year", "semester", "cohort_code", name="uq_cohort_scope"),
        sa.CheckConstraint("semester > 0", name="ck_cohort_semester_positive"),
    )
    op.create_index("ix_cohorts_institution_year", "academic_cohorts", ["institution_id", "academic_year"])
    op.create_table(
        "audit_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("institution_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("institutions.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True)), sa.Column("action", sa.String(100), nullable=False),
        sa.Column("target_type", sa.String(80)), sa.Column("target_id", sa.String(100)),
        sa.Column("outcome", sa.String(20), nullable=False, server_default="success"),
        sa.Column("request_id", sa.String(100)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_audit_institution_created", "audit_events", ["institution_id", "created_at"])
    op.create_table(
        "security_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("institution_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("institutions.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("event_type", sa.String(80), nullable=False), sa.Column("severity", sa.String(20), nullable=False, server_default="medium"),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True)), sa.Column("request_id", sa.String(100)),
        sa.Column("details", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("severity IN ('info', 'low', 'medium', 'high', 'critical')", name="ck_security_event_severity"),
    )
    op.create_index("ix_security_institution_created", "security_events", ["institution_id", "created_at"])

    # App queries must set app.tenant_id from authenticated server-side identity.
    # The production runtime role must not own these tables or have BYPASSRLS.
    for table in ("programmes", "academic_cohorts", "audit_events", "security_events"):
        op.execute(sa.text(f'ALTER TABLE "{table}" ENABLE ROW LEVEL SECURITY'))
        op.execute(sa.text(f'ALTER TABLE "{table}" FORCE ROW LEVEL SECURITY'))
        op.execute(sa.text(
            f'''CREATE POLICY tenant_isolation ON "{table}"
                USING (institution_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
                WITH CHECK (institution_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)'''
        ))


def downgrade() -> None:
    for table in ("security_events", "audit_events", "academic_cohorts", "programmes", "institutions"):
        op.drop_table(table)
