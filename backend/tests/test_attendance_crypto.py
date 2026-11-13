import base64
from uuid import uuid4

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat

from app.modules.attendance.crypto import (
    canonical_checkin_message,
    room_token,
    rolling_code,
    verify_device_signature,
    verify_room_token,
    verify_rolling_code,
)


def test_six_second_code_is_session_bound_and_accepts_one_step_drift() -> None:
    secret = b"attendance-test-secret-that-is-long-enough"
    session_id = uuid4()
    other_session = uuid4()
    now = 1_800_000_000
    code = rolling_code(secret, session_id, now)
    assert len(code) == 6
    assert verify_rolling_code(secret, session_id, code, now + 6)
    assert not verify_rolling_code(secret, other_session, code, now)


def test_room_token_is_session_bound_and_constant_time_verified() -> None:
    secret = b"attendance-test-secret-that-is-long-enough"
    session_id = uuid4()
    token = room_token(secret, session_id)
    assert verify_room_token(secret, session_id, token)
    assert not verify_room_token(secret, uuid4(), token)


def test_ed25519_device_signature_verifies_canonical_payload() -> None:
    private_key = Ed25519PrivateKey.generate()
    public_key = private_key.public_key().public_bytes(Encoding.Raw, PublicFormat.Raw)
    session_id, student_id, device_id = uuid4(), uuid4(), uuid4()
    message = canonical_checkin_message(
        session_id, student_id, device_id, "nonce-value", "123456", "room-token", "ble", -60
    )
    signature = private_key.sign(message)
    public_b64 = base64.b64encode(public_key).decode()
    signature_b64 = base64.b64encode(signature).decode()
    assert verify_device_signature(public_b64, signature_b64, message)
    assert not verify_device_signature(public_b64, signature_b64, message + b"x")
    changed_signal = canonical_checkin_message(
        session_id, student_id, device_id, "nonce-value", "123456", "room-token", "ble", -80
    )
    assert not verify_device_signature(public_b64, signature_b64, changed_signal)
