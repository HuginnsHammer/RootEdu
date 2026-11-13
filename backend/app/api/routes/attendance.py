import base64
from datetime import UTC
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db, set_tenant_context
from app.modules.attendance.providers import DevelopmentAttestationProvider
from app.modules.attendance.schemas import (
    AttendanceCheckInRequest,
    AttendanceReceipt,
    DeviceBindReceipt,
    DeviceBindRequest,
)
from app.modules.attendance.service import AttendanceRejected, check_in, log_security_event

router = APIRouter(prefix="/attendance", tags=["attendance"])


def authenticated_student(request: Request) -> dict:
    """Authentication middleware must populate request.state.identity."""
    identity = getattr(request.state, "identity", None)
    if not isinstance(identity, dict):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    required = ("sub", "institution_id", "cohort_id", "role")
    if any(not identity.get(key) for key in required) or identity["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A verified student identity is required.",
        )
    try:
        result = {
            "student_id": UUID(identity["sub"]),
            "institution_id": UUID(identity["institution_id"]),
            "cohort_id": UUID(identity["cohort_id"]),
        }
        if identity.get("device_id"):
            result["device_id"] = UUID(identity["device_id"])
        return result
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid authenticated identity.") from exc


@router.post("/devices/bind", response_model=DeviceBindReceipt, status_code=201)
async def bind_development_device(
    payload: DeviceBindRequest,
    identity: Annotated[dict, Depends(authenticated_student)],
    db: Annotated[Session, Depends(get_db)],
) -> DeviceBindReceipt:
    """Local-only device binding until Android hardware attestation is integrated."""
    if get_settings().app_env != "development":
        raise HTTPException(
            status_code=503,
            detail=(
                "Production device attestation is not configured. "
                "Device binding is unavailable."
            ),
        )
    try:
        public_key = base64.b64decode(payload.public_key, validate=True)
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail="Invalid Ed25519 public key encoding.",
        ) from exc
    if len(public_key) != 32:
        raise HTTPException(
            status_code=422,
            detail="Ed25519 public keys must be 32 bytes.",
        )
    provider = DevelopmentAttestationProvider()
    if not await provider.verify(payload.attestation, payload.public_key):
        raise HTTPException(status_code=403, detail="Development attestation failed.")

    device_id = uuid4()
    try:
        with db.begin():
            set_tenant_context(db, identity["institution_id"])
            active = db.execute(
                text("""
                    SELECT id FROM user_devices
                    WHERE institution_id = :institution_id
                      AND student_id = :student_id AND revoked_at IS NULL
                    FOR UPDATE
                """),
                {
                    "institution_id": identity["institution_id"],
                    "student_id": identity["student_id"],
                },
            ).scalar_one_or_none()
            if active is not None:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "This student already has an active device. "
                        "An approved reset is required."
                    ),
                )
            db.execute(
                text("""
                    INSERT INTO user_devices
                        (id, institution_id, student_id, public_key, attestation_provider,
                         attestation_level, device_label, registered_at)
                    VALUES
                        (:id, :institution_id, :student_id, :public_key, 'development',
                         'development', :device_label, now())
                """),
                {
                    "id": device_id,
                    "institution_id": identity["institution_id"],
                    "student_id": identity["student_id"],
                    "public_key": payload.public_key,
                    "device_label": payload.device_label,
                },
            )
            log_security_event(
                db,
                institution_id=identity["institution_id"],
                student_id=identity["student_id"],
                event_type="DEVICE_BOUND_DEV",
                severity="info",
                details={
                    "device_id": str(device_id),
                    "attestation_level": "development",
                },
            )
    except IntegrityError as exc:
        raise HTTPException(
            status_code=409,
            detail="An active device is already registered.",
        ) from exc

    return DeviceBindReceipt(
        device_id=device_id,
        attestation_level="development",
        status="bound",
    )


@router.post("/check-in", response_model=AttendanceReceipt, status_code=201)
def attendance_check_in(
    payload: AttendanceCheckInRequest,
    identity: Annotated[dict, Depends(authenticated_student)],
    db: Annotated[Session, Depends(get_db)],
) -> AttendanceReceipt:
    device_id = identity.get("device_id")
    if device_id is None:
        raise HTTPException(
            status_code=403,
            detail="This account has no registered active device.",
        )
    try:
        with db.begin():
            set_tenant_context(db, identity["institution_id"])
            checkin_id, verified_at, assurance = check_in(
                db,
                institution_id=identity["institution_id"],
                student_id=identity["student_id"],
                cohort_id=identity["cohort_id"],
                device_id=device_id,
                session_id=payload.session_id,
                code=payload.code,
                room_token=payload.room_token,
                nonce=payload.nonce,
                signature=payload.signature,
                proximity_method=payload.proximity_method,
                rssi_dbm=payload.rssi_dbm,
            )
    except AttendanceRejected as exc:
        with db.begin():
            set_tenant_context(db, identity["institution_id"])
            log_security_event(
                db,
                institution_id=identity["institution_id"],
                student_id=identity["student_id"],
                event_type=exc.event_type,
                severity=exc.severity,
                details={
                    "message": exc.message,
                    "session_id": str(payload.session_id),
                },
            )
        raise HTTPException(status_code=403, detail=exc.message) from exc
    except IntegrityError as exc:
        constraint = getattr(
            getattr(exc.orig, "diag", None),
            "constraint_name",
            None,
        )
        replay_constraints = {
            "uq_attendance_once_per_student",
            "attendance_checkins_nonce_hash_key",
        }
        if constraint not in replay_constraints:
            raise
        with db.begin():
            set_tenant_context(db, identity["institution_id"])
            log_security_event(
                db,
                institution_id=identity["institution_id"],
                student_id=identity["student_id"],
                event_type="REPLAY_ATTACK_DETECTED",
                severity="critical",
                details={
                    "session_id": str(payload.session_id),
                    "constraint": str(constraint),
                },
            )
        raise HTTPException(
            status_code=409,
            detail="This attendance challenge has already been used.",
        ) from exc

    return AttendanceReceipt(
        checkin_id=checkin_id,
        session_id=payload.session_id,
        verified_at=verified_at.astimezone(UTC).isoformat(),
        status="present_verified",
        assurance=assurance,
    )
