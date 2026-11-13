import hashlib
from email.message import EmailMessage
from typing import Literal

import aiosmtplib
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field
from redis.asyncio import Redis

from app.core.config import get_settings

router = APIRouter(prefix="/feedback", tags=["feedback"])

EMAIL_PATTERN = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"


class FeedbackSubmission(BaseModel):
    category: Literal["bug", "idea", "experience", "other"]
    message: str = Field(min_length=10, max_length=5000)
    reply_email: str | None = Field(default=None, max_length=254, pattern=EMAIL_PATTERN)
    app_version: str = Field(default="unknown", max_length=32)
    device_platform: Literal["android", "ios", "unknown"] = "unknown"


async def enforce_feedback_rate_limit(request: Request) -> None:
    settings = get_settings()
    if request.client is None:
        raise HTTPException(status_code=429, detail="Feedback submission could not be verified.")
    address_digest = hashlib.sha256(request.client.host.encode()).hexdigest()[:24]
    key = f"rootedu:feedback:rate:{address_digest}"
    client = Redis.from_url(settings.redis_url, decode_responses=True)
    try:
        count = await client.incr(key)
        if count == 1:
            await client.expire(key, 3600)
        if count > 5:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Feedback limit reached. Please try again later.",
            )
    except HTTPException:
        raise
    except Exception as exc:
        # Do not turn a Redis outage into an unmetered public email relay.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Feedback is temporarily unavailable. Please try again later.",
        ) from exc
    finally:
        await client.aclose()


@router.post("", status_code=status.HTTP_202_ACCEPTED, summary="Send product feedback")
async def submit_feedback(payload: FeedbackSubmission, request: Request) -> dict[str, str]:
    await enforce_feedback_rate_limit(request)
    settings = get_settings()
    required = (
        settings.feedback_smtp_host,
        settings.feedback_smtp_username,
        settings.feedback_smtp_password,
        settings.feedback_smtp_from,
    )
    if not all(required):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Feedback email delivery is not configured yet.",
        )

    message = EmailMessage()
    message["Subject"] = f"[RootEdu beta feedback] {payload.category}"
    message["From"] = settings.feedback_smtp_from
    message["To"] = settings.feedback_recipient
    if payload.reply_email:
        message["Reply-To"] = payload.reply_email
    message.set_content(
        "New RootEdu beta feedback\n"
        f"Category: {payload.category}\n"
        f"App version: {payload.app_version}\n"
        f"Platform: {payload.device_platform}\n"
        f"Reply email: {payload.reply_email or 'Not provided'}\n"
        f"Client IP: {request.client.host if request.client else 'unknown'}\n\n"
        f"{payload.message}"
    )

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.feedback_smtp_host,
            port=settings.feedback_smtp_port,
            username=settings.feedback_smtp_username,
            password=settings.feedback_smtp_password,
            start_tls=True,
            timeout=15,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Feedback could not be delivered. Please try again later.",
        ) from exc

    return {
        "status": "accepted",
        "message": "Thank you. Your feedback has been emailed to the RootEdu team.",
    }
