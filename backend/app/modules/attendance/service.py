import hashlib
import json
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.modules.attendance.crypto import (
    canonical_checkin_message,
    verify_device_signature,
    verify_room_token,
    verify_rolling_code,
)


class AttendanceRejected(Exception):
    def __init__(self, event_type: str, message: str, severity: str = "medium") -> None:
        self.event_type = event_type
        self.message = message
        self.severity = severity
        super().__init__(message)


def _secret() -> bytes:
    value = get_settings().attendance_hmac_secret
    if not value or len(value.encode()) < 32:
        raise RuntimeError("ATTENDANCE_HMAC_SECRET must contain at least 32 characters.")
    return value.encode()


def open_attendance_session(
    db: Session,
    *,
    institution_id: UUID,
    cohort_id: UUID,
    lecturer_id: UUID,
    timetable_slot_id: UUID,
    window_minutes: int = 10,
) -> UUID:
    if not 1 <= window_minutes <= 180:
        raise ValueError("Attendance window must be between 1 and 180 minutes.")
    session_id = uuid4()
    now = datetime.now(timezone.utc)
    db.execute(
        text("""
            INSERT INTO attendance_sessions
                (id, institution_id, cohort_id, lecturer_id, timetable_slot_id,
                 window_start, window_end, status, created_at)
            VALUES
                (:id, :institution_id, :cohort_id, :lecturer_id, :slot_id,
                 :starts, :ends, 'open', now())
        """),
        {
            "id": session_id,
            "institution_id": institution_id,
            "cohort_id": cohort_id,
            "lecturer_id": lecturer_id,
            "slot_id": timetable_slot_id,
            "starts": now,
            "ends": now + timedelta(minutes=window_minutes),
        },
    )
    db.flush()
    return session_id


def check_in(
    db: Session,
    *,
    institution_id: UUID,
    student_id: UUID,
    cohort_id: UUID,
    device_id: UUID,
    session_id: UUID,
    code: str,
    room_token: str,
    nonce: str,
    signature: str,
    proximity_method: str,
    rssi_dbm: int | None,
) -> tuple[UUID, datetime, str]:
    """Verify and persist one attendance event in the caller's transaction."""
    settings = get_settings()
    if proximity_method == "mock" and settings.app_env != "development":
        raise AttendanceRejected("DEV_PROXIMITY_REJECTED", "Development proximity is disabled.", "high")
    if proximity_method == "ble" and (rssi_dbm is None or rssi_dbm <= -75):
        raise AttendanceRejected(
            "SIGNAL_THRESHOLD_VIOLATION", "BLE signal did not meet the configured threshold.", "low"
        )

    session_row = db.execute(
        text("""
            SELECT cohort_id, window_start, window_end, status
            FROM attendance_sessions
            WHERE id = :session_id AND institution_id = :institution_id
            FOR UPDATE
        """),
        {"session_id": session_id, "institution_id": institution_id},
    ).mappings().first()
    if session_row is None or session_row["cohort_id"] != cohort_id:
        raise AttendanceRejected("COHORT_MISMATCH", "Student is not in this session's cohort.", "high")

    now = db.execute(text("SELECT now()")).scalar_one()
    if session_row["status"] != "open" or not (
        session_row["window_start"] <= now <= session_row["window_end"]
    ):
        raise AttendanceRejected("ATTENDANCE_WINDOW_CLOSED", "The attendance window is not open.", "low")

    device = db.execute(
        text("""
            SELECT public_key
            FROM user_devices
            WHERE id = :device_id AND institution_id = :institution_id
              AND student_id = :student_id AND revoked_at IS NULL
            FOR UPDATE
        """),
        {"device_id": device_id, "institution_id": institution_id, "student_id": student_id},
    ).mappings().first()
    if device is None:
        raise AttendanceRejected("DEVICE_MISMATCH", "No active device is bound to this student.", "high")

    secret = _secret()
    if not verify_rolling_code(secret, session_id, code, at=int(now.timestamp())):
        raise AttendanceRejected("INVALID_SESSION_CODE", "The rolling attendance code is invalid.", "medium")
    if not verify_room_token(secret, session_id, room_token):
        raise AttendanceRejected("ROOM_TOKEN_MISMATCH", "The room token is invalid.", "high")

    message = canonical_checkin_message(session_id, student_id, device_id, nonce, code, room_token)
    if not verify_device_signature(device["public_key"], signature, message):
        raise AttendanceRejected("DEVICE_SIGNATURE_INVALID", "Device signature verification failed.", "critical")

    nonce_hash = hashlib.sha256(nonce.encode()).hexdigest()
    checkin_id = uuid4()
    db.execute(
        text("""
            INSERT INTO attendance_checkins
                (id, institution_id, session_id, student_id, device_id,
                 nonce_hash, proximity_method, rssi_dbm, verified_at)
            VALUES
                (:id, :institution_id, :session_id, :student_id, :device_id,
                 :nonce_hash, :method, :rssi, :verified_at)
        """),
        {
            "id": checkin_id,
            "institution_id": institution_id,
            "session_id": session_id,
            "student_id": student_id,
            "device_id": device_id,
            "nonce_hash": nonce_hash,
            "method": proximity_method,
            "rssi": rssi_dbm,
            "verified_at": now,
        },
    )
    db.flush()
    assurance = "development_mock" if proximity_method == "mock" else "device_signature_and_session_code"
    return checkin_id, now, assurance


def log_security_event(
    db: Session,
    *,
    institution_id: UUID,
    student_id: UUID,
    event_type: str,
    severity: str,
    details: dict[str, str],
) -> None:
    db.execute(
        text("""
            INSERT INTO security_events
                (id, institution_id, event_type, severity, actor_id, details, created_at)
            VALUES (:id, :institution_id, :event_type, :severity, :actor_id, CAST(:details AS jsonb), now())
        """),
        {
            "id": uuid4(),
            "institution_id": institution_id,
            "event_type": event_type,
            "severity": severity,
            "actor_id": student_id,
            "details": json.dumps(details),
        },
    )
