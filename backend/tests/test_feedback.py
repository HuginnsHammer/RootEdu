import pytest
from pydantic import ValidationError

from app.api.routes.feedback import FeedbackSubmission


def test_feedback_requires_meaningful_message() -> None:
    with pytest.raises(ValidationError):
        FeedbackSubmission(category="bug", message="short")


def test_feedback_rejects_invalid_reply_address() -> None:
    with pytest.raises(ValidationError):
        FeedbackSubmission(category="idea", message="A useful idea for RootEdu", reply_email="not-an-email")


def test_feedback_accepts_valid_beta_feedback() -> None:
    feedback = FeedbackSubmission(
        category="experience",
        message="The home screen is clear, but timetable needs a weekly view.",
        reply_email="tester@example.com",
        device_platform="android",
    )
    assert feedback.category == "experience"
    assert feedback.device_platform == "android"
