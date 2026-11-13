"Create device-bound attendance sessions and verifiable check-ins."

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0002_verified_attendance"
down_revision = "0001_tenant_foundation"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "student_cohort_memberships",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("institution_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("institutions.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("cohort_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("academic_cohorts.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("uq_student_active_cohort", "student_cohort_memberships", ["institution_id", "student_id", "cohort_id"], unique=True, postgresql_where=sa.text("is_active = true"))

    op.create_table(
        "user_devices",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("institution_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("institutions.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("public_key", sa.String(128), nullable=False),
        sa.Column("attestation_provider", sa.String(40), nullable=False),
        sa.Column("attestation_level", sa.String(30), nullable=False),
        sa.Column("device_label", sa.String(100)),
        sa.Column("registered_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("revoked_at", sa.DateTime(timezone=True)),
        sa.CheckConstraint("attestation_level IN ('development', 'device_integrity', 'hardware_backed')", name="ck_user_device_attestation_level"),
    )
    op.create_index("uq_user_devices_one_active_student", "user_devices", ["institution_id", "student_id"], unique=True, postgresql_where=sa.text("revoked_at IS NULL"))
    op.create_table(
        "attendance_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("institution_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("institutions.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("cohort_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("academic_cohorts.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("lecturer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("timetable_slot_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("window_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("window_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(16), nullable=False, server_default="open"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("closed_at", sa.DateTime(timezone=True)),
        sa.CheckConstraint("window_end > window_start", name="ck_attendance_window_order"),
        sa.CheckConstraint("status IN ('open', 'closed', 'cancelled')", name="ck_attendance_session_status"),
    )
    op.create_index("ix_attendance_sessions_cohort_window", "attendance_sessions", ["institution_id", "cohort_id", "window_start"])
    op.create_table(
        "attendance_checkins",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("institution_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("institutions.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("attendance_sessions.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("device_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("user_devices.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("nonce_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("proximity_method", sa.String(16), nullable=False),
        sa.Column("rssi_dbm", sa.Integer()),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("session_id", "student_id", name="uq_attendance_once_per_student"),
        sa.CheckConstraint("proximity_method IN ('ble', 'ultrasound', 'mock')", name="ck_attendance_proximity_method"),
    )
    op.create_index("ix_attendance_checkins_session", "attendance_checkins", ["institution_id", "session_id", "verified_at"])
    for table in ("student_cohort_memberships", "user_devices", "attendance_sessions", "attendance_checkins"):
        op.execute(sa.text(f'ALTER TABLE "{table}" ENABLE ROW LEVEL SECURITY'))
        op.execute(sa.text(f'ALTER TABLE "{table}" FORCE ROW LEVEL SECURITY'))
        op.execute(sa.text(f"""
            CREATE POLICY tenant_isolation ON "{table}"
            USING (institution_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
            WITH CHECK (institution_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
        """))


def downgrade() -> None:
    for table in ("attendance_checkins", "attendance_sessions", "user_devices", "student_cohort_memberships"):
        op.drop_table(table)
