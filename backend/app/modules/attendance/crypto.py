import base64
import hashlib
import hmac
import struct
import time
from uuid import UUID

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey


def _mac(secret: bytes, message: bytes) -> bytes:
    return hmac.new(secret, message, hashlib.sha256).digest()


def rolling_code(secret: bytes, session_id: UUID, at: int | None = None) -> str:
    """Six-digit, six-second HMAC code bound to one attendance session."""
    step = int(time.time() if at is None else at) // 6
    digest = _mac(secret, b"rootedu:attendance:totp:v1:" + session_id.bytes + struct.pack(">Q", step))
    offset = digest[-1] & 0x0F
    value = struct.unpack(">I", digest[offset : offset + 4])[0] & 0x7FFFFFFF
    return f"{value % 1_000_000:06d}"


def verify_rolling_code(secret: bytes, session_id: UUID, submitted: str, at: int | None = None) -> bool:
    now = int(time.time() if at is None else at)
    return any(
        hmac.compare_digest(rolling_code(secret, session_id, now + drift * 6), submitted)
        for drift in (-1, 0, 1)
    )


def room_token(secret: bytes, session_id: UUID) -> str:
    digest = _mac(secret, b"rootedu:attendance:room:v1:" + session_id.bytes)
    return base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")


def verify_room_token(secret: bytes, session_id: UUID, submitted: str) -> bool:
    return hmac.compare_digest(room_token(secret, session_id), submitted)


def canonical_checkin_message(
    session_id: UUID,
    student_id: UUID,
    device_id: UUID,
    nonce: str,
    code: str,
    room_token_value: str,
) -> bytes:
    fields = (
        "rootedu-attendance-checkin-v1",
        str(session_id),
        str(student_id),
        str(device_id),
        nonce,
        code,
        room_token_value,
    )
    return "\n".join(fields).encode("utf-8")


def verify_device_signature(public_key_b64: str, signature_b64: str, message: bytes) -> bool:
    try:
        public_key = Ed25519PublicKey.from_public_bytes(base64.b64decode(public_key_b64, validate=True))
        signature = base64.b64decode(signature_b64, validate=True)
        public_key.verify(signature, message)
        return True
    except (ValueError, InvalidSignature):
        return False
