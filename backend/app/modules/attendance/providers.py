# ruff: noqa: I001
from dataclasses import dataclass
from typing import Literal, Protocol

ProximityMethod = Literal["ble", "ultrasound", "mock"]


@dataclass(frozen=True)
class ProximityObservation:
    method: ProximityMethod
    token: str
    rssi_dbm: int | None = None
    captured_at_unix: int | None = None


class ProximityProvider(Protocol):
    """Client-side provider contract; observations are evidence, not identity."""

    async def observe(self) -> ProximityObservation: ...


class AttestationProvider(Protocol):
    """Verifies platform attestation before a device key is trusted."""

    async def verify(self, attestation: str, public_key_b64: str) -> bool: ...


class DevelopmentAttestationProvider:
    """DEV ONLY. Accepts a local test assertion; never valid in production."""

    DEV_ONLY = True

    async def verify(self, attestation: str, public_key_b64: str) -> bool:
        return attestation == "ROOTEDU-LOCAL-DEV-ATTESTATION"


class MockProximityProvider:
    """DEV ONLY emulator provider. Never establishes physical presence."""

    DEV_ONLY = True

    def __init__(self, token: str) -> None:
        self._token = token

    async def observe(self) -> ProximityObservation:
        return ProximityObservation(method="mock", token=self._token)
