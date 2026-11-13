from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class DeviceBindRequest(BaseModel):
    public_key: str = Field(min_length=40, max_length=64)
    attestation: str = Field(min_length=8, max_length=4096)
    device_label: str | None = Field(default=None, max_length=100)


class DeviceBindReceipt(BaseModel):
    device_id: UUID
    attestation_level: Literal["development", "device_integrity", "hardware_backed"]
    status: Literal["bound"]


class AttendanceCheckInRequest(BaseModel):
    session_id: UUID
    code: str = Field(pattern=r"^\d{6}$")
    room_token: str = Field(min_length=32, max_length=128)
    nonce: str = Field(min_length=22, max_length=128)
    signature: str = Field(min_length=80, max_length=256)
    proximity_method: Literal["ble", "ultrasound", "mock"]
    rssi_dbm: int | None = Field(default=None, ge=-127, le=0)


class AttendanceReceipt(BaseModel):
    checkin_id: UUID
    session_id: UUID
    verified_at: str
    status: Literal["present_verified"]
    assurance: Literal["device_signature_and_session_code", "development_mock"]
