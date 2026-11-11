from dataclasses import dataclass

from app.core.config import Settings


@dataclass(frozen=True)
class PilotProgramme:
    code: str
    name: str


PILOT_PROGRAMMES = {
    "CT206": "Bachelor of Computer Security and Forensics",
    "CT204": "Bachelor of Computer Technology",
    "CT201": "Bachelor of Computer Science",
}


class DomainPolicy:
    """MUST pilot policy; matching a domain or prefix does not prove enrollment."""

    def __init__(self, settings: Settings) -> None:
        self.tenant_id = settings.tenant_id
        self.institution_name = settings.institution_name
        self.allowed_email_domains = {d.lower().strip() for d in settings.allowed_email_domains}
        self.registration_prefixes = {p.upper().strip() for p in settings.registration_prefixes}

    def email_domain_allowed(self, email: str) -> bool:
        domain = email.rpartition("@")[2].lower()
        return bool(domain and domain in self.allowed_email_domains)

    def registration_prefix_allowed(self, registration_number: str) -> bool:
        prefix = registration_number.split("/", maxsplit=1)[0].upper()
        return prefix in self.registration_prefixes

    def programme_for(self, registration_number: str) -> PilotProgramme | None:
        parts = registration_number.strip().upper().split("/")
        if len(parts) != 3 or not parts[1].isdigit() or not parts[2].isdigit():
            return None
        code = parts[0]
        if code not in self.registration_prefixes or code not in PILOT_PROGRAMMES:
            return None
        return PilotProgramme(code=code, name=PILOT_PROGRAMMES[code])
