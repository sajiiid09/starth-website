"""Email sending service — async SMTP in production, console fallback in dev."""

import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, html_body: str) -> bool:
    """Send an email. Returns True on success, False on failure.

    In dev mode (SMTP_USERNAME empty), logs the email to console instead.
    Uses run_in_executor to avoid blocking the async event loop.
    """
    if not settings.SMTP_USERNAME:
        logger.info(
            "DEV EMAIL — To: %s | Subject: %s | Body: %s",
            to,
            subject,
            html_body[:200],
        )
        return True

    try:
        # Run synchronous SMTP in a thread pool to avoid blocking the event loop
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, _send_smtp, to, subject, html_body)
        return True
    except Exception:
        logger.exception("Failed to send email to %s", to)
        return False


def _send_smtp(to: str, subject: str, html_body: str) -> None:
    """Synchronous SMTP send — called via run_in_executor."""
    msg = MIMEMultipart("alternative")
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, to, msg.as_string())


async def send_otp_email(to: str, otp_code: str) -> bool:
    """Send an OTP verification email."""
    subject = f"Your Strathwell verification code: {otp_code}"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px;
                    padding: 16px; background: #f5f5f5; text-align: center;
                    border-radius: 8px; margin: 16px 0;">
            {otp_code}
        </div>
        <p>This code expires in 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">
            If you didn't request this code, please ignore this email.
        </p>
    </div>
    """
    return await send_email(to, subject, html_body)


async def send_password_reset_email(to: str, otp_code: str) -> bool:
    """Send a password-reset OTP email."""
    subject = f"Strathwell — Password reset code: {otp_code}"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>We received a request to reset your password. Use the code below:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px;
                    padding: 16px; background: #f5f5f5; text-align: center;
                    border-radius: 8px; margin: 16px 0;">
            {otp_code}
        </div>
        <p>This code expires in 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">
            If you didn't request a password reset, you can safely ignore this email.
        </p>
    </div>
    """
    return await send_email(to, subject, html_body)


async def send_booking_notification(
    to: str,
    event_type: str,
    event_date: str,
    role: str,
) -> bool:
    """Send a booking notification email to a venue owner or service provider."""
    subject = f"New booking request: {event_type} on {event_date}"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>New Booking Request</h2>
        <p>You have received a new booking request as a <strong>{role}</strong>.</p>
        <ul>
            <li><strong>Event type:</strong> {event_type}</li>
            <li><strong>Date:</strong> {event_date}</li>
        </ul>
        <p>Please log in to your Strathwell dashboard to review and respond.</p>
        <a href="{settings.FRONTEND_URL}/dashboard"
           style="display: inline-block; padding: 12px 24px; background: #4f46e5;
                  color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            View Dashboard
        </a>
    </div>
    """
    return await send_email(to, subject, html_body)


async def send_payment_notification(
    to: str,
    amount: float,
    event_type: str,
    status: str,
) -> bool:
    """Send a payment status notification."""
    subject = f"Payment {status}: ${amount:.2f} for {event_type}"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Payment {status.title()}</h2>
        <p>A payment of <strong>${amount:.2f}</strong> for your <strong>{event_type}</strong>
           event has been <strong>{status}</strong>.</p>
        <a href="{settings.FRONTEND_URL}/dashboard/payments"
           style="display: inline-block; padding: 12px 24px; background: #4f46e5;
                  color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            View Payments
        </a>
    </div>
    """
    return await send_email(to, subject, html_body)
