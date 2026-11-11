from app.core.config import Settings
from app.core.domain_policy import DomainPolicy


def policy() -> DomainPolicy:
    return DomainPolicy(Settings())


def test_allows_configured_student_email_domain() -> None:
    assert policy().email_domain_allowed("student@students.must.ac.ke")


def test_rejects_lookalike_email_domain() -> None:
    assert not policy().email_domain_allowed("student@students.must.ac.ke.attacker.test")


def test_recognizes_pilot_registration_pattern() -> None:
    result = policy().programme_for("CT206/123456/25")
    assert result is not None and result.code == "CT206"


def test_rejects_unknown_programme_and_malformed_registration() -> None:
    assert policy().programme_for("CT999/123456/25") is None
    assert policy().programme_for("CT206-123456-25") is None
