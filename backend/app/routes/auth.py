import os
import smtplib
from datetime import datetime, timedelta
from email.message import EmailMessage

from dotenv import load_dotenv

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    PasswordResetOTP,
    User,
)

from ..schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
    VerifyOTPRequest,
)

from ..security import (
    create_access_token,
    generate_otp,
    generate_reset_token,
    hash_otp,
    hash_password,
    hash_reset_token,
    verify_password,
)


load_dotenv()


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


OTP_EXPIRE_MINUTES = int(
    os.getenv(
        "OTP_EXPIRE_MINUTES",
        "5",
    )
)

OTP_MAX_ATTEMPTS = int(
    os.getenv(
        "OTP_MAX_ATTEMPTS",
        "5",
    )
)

OTP_RESEND_SECONDS = int(
    os.getenv(
        "OTP_RESEND_SECONDS",
        "60",
    )
)

RESET_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "RESET_TOKEN_EXPIRE_MINUTES",
        "10",
    )
)


def send_otp_email(
    email: str,
    otp: str,
) -> None:
    smtp_host = os.getenv(
        "SMTP_HOST"
    )

    smtp_port = int(
        os.getenv(
            "SMTP_PORT",
            "587",
        )
    )

    smtp_username = os.getenv(
        "SMTP_USERNAME"
    )

    smtp_password = os.getenv(
        "SMTP_PASSWORD"
    )

    smtp_from_email = os.getenv(
        "SMTP_FROM_EMAIL",
        smtp_username,
    )

    if not smtp_host:
        raise RuntimeError(
            "SMTP_HOST is not configured."
        )

    if not smtp_username:
        raise RuntimeError(
            "SMTP_USERNAME is not configured."
        )

    if not smtp_password:
        raise RuntimeError(
            "SMTP_PASSWORD is not configured."
        )

    if not smtp_from_email:
        raise RuntimeError(
            "SMTP_FROM_EMAIL is not configured."
        )

    message = EmailMessage()

    message["Subject"] = (
        "LoanDPR Creditum - Password Reset OTP"
    )

    message["From"] = smtp_from_email
    message["To"] = email

    message.set_content(
        f"""
Hello,

We received a request to reset your LoanDPR Creditum Management employee portal password.

Your One-Time Password (OTP) is:

{otp}

This OTP is valid for {OTP_EXPIRE_MINUTES} minutes.

For security:
- Do not share this OTP with anyone.
- If you did not request a password reset, you can ignore this email.

Regards,
LoanDPR Creditum Management Pvt. Ltd.
Employee Management System
"""
    )

    with smtplib.SMTP(
        smtp_host,
        smtp_port,
        timeout=20,
    ) as server:
        server.starttls()
        server.login(
            smtp_username,
            smtp_password,
        )
        server.send_message(message)


@router.post(
    "/register",
    response_model=UserResponse,
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = db.scalar(
        select(User).where(
            or_(
                User.email
                == str(request.email).lower(),
                User.employee_id
                == request.employee_id,
            )
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail=(
                "An account with this email "
                "or employee ID already exists."
            ),
        )

    user = User(
        full_name=request.full_name.strip(),
        employee_id=request.employee_id.strip(),
        email=str(
            request.email
        ).lower().strip(),
        mobile=(
            request.mobile.strip()
            if request.mobile
            else None
        ),
        password_hash=hash_password(
            request.password
        ),
        role=request.role,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    login_id = request.login_id.strip()

    user = db.scalar(
        select(User).where(
            or_(
                User.email
                == login_id.lower(),
                User.employee_id
                == login_id,
            )
        )
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid login ID or password.",
        )

    if not verify_password(
        request.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid login ID or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Your account is inactive.",
        )

    token = create_access_token(
        user.id
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    email = str(
        request.email
    ).lower().strip()

    user = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    generic_message = (
        "If an account exists for this email, "
        "a password reset OTP has been sent."
    )

    if not user:
        return {
            "message": generic_message
        }

    if not user.is_active:
        return {
            "message": generic_message
        }

    now = datetime.utcnow()

    recent_otp = db.scalar(
        select(PasswordResetOTP)
        .where(
            PasswordResetOTP.user_id
            == user.id,
            PasswordResetOTP.created_at
            >= (
                now
                - timedelta(
                    seconds=OTP_RESEND_SECONDS
                )
            ),
            PasswordResetOTP.used_at.is_(None),
        )
        .order_by(
            PasswordResetOTP.created_at.desc()
        )
    )

    if recent_otp:
        raise HTTPException(
            status_code=429,
            detail=(
                f"Please wait "
                f"{OTP_RESEND_SECONDS} seconds "
                "before requesting another OTP."
            ),
        )

    # Invalidate previous OTPs.
    old_otps = db.scalars(
        select(PasswordResetOTP).where(
            PasswordResetOTP.user_id
            == user.id,
            PasswordResetOTP.used_at.is_(None),
        )
    ).all()

    for old_otp in old_otps:
        old_otp.used_at = now

    otp = generate_otp()

    otp_record = PasswordResetOTP(
        user_id=user.id,
        otp_hash=hash_otp(otp),
        expires_at=(
            now
            + timedelta(
                minutes=OTP_EXPIRE_MINUTES
            )
        ),
        attempts=0,
        verified_at=None,
        reset_token_hash=None,
        reset_token_expires_at=None,
        used_at=None,
    )

    db.add(otp_record)

    try:
        send_otp_email(
            email,
            otp,
        )

        db.commit()

    except Exception as error:
        db.rollback()

        print(
            "OTP email sending error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to send OTP email. "
                "Please check the email service configuration."
            ),
        )

    return {
        "message": generic_message,
        "expires_in_minutes": OTP_EXPIRE_MINUTES,
    }


@router.post("/verify-otp")
def verify_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db),
):
    email = str(
        request.email
    ).lower().strip()

    user = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP.",
        )

    otp_record = db.scalar(
        select(PasswordResetOTP)
        .where(
            PasswordResetOTP.user_id
            == user.id,
            PasswordResetOTP.used_at.is_(None),
            PasswordResetOTP.verified_at.is_(None),
        )
        .order_by(
            PasswordResetOTP.created_at.desc()
        )
    )

    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP.",
        )

    now = datetime.utcnow()

    if now >= otp_record.expires_at:
        otp_record.used_at = now
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="OTP has expired.",
        )

    if (
        otp_record.attempts
        >= OTP_MAX_ATTEMPTS
    ):
        otp_record.used_at = now
        db.commit()

        raise HTTPException(
            status_code=400,
            detail=(
                "Maximum OTP attempts exceeded. "
                "Please request a new OTP."
            ),
        )

    otp_record.attempts += 1

    if hash_otp(
        request.otp
    ) != otp_record.otp_hash:
        db.commit()

        remaining = max(
            0,
            OTP_MAX_ATTEMPTS
            - otp_record.attempts,
        )

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid OTP. "
                f"{remaining} attempts remaining."
            ),
        )

    reset_token = generate_reset_token()

    otp_record.verified_at = now

    otp_record.reset_token_hash = (
        hash_reset_token(
            reset_token
        )
    )

    otp_record.reset_token_expires_at = (
        now
        + timedelta(
            minutes=RESET_TOKEN_EXPIRE_MINUTES
        )
    )

    db.commit()

    return {
        "message": "OTP verified successfully.",
        "reset_token": reset_token,
        "expires_in_minutes": RESET_TOKEN_EXPIRE_MINUTES,
    }


@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    email = str(
        request.email
    ).lower().strip()

    user = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid password reset request.",
        )

    reset_token_hash = hash_reset_token(
        request.reset_token
    )

    otp_record = db.scalar(
        select(PasswordResetOTP).where(
            PasswordResetOTP.user_id
            == user.id,
            PasswordResetOTP.reset_token_hash
            == reset_token_hash,
            PasswordResetOTP.verified_at.is_not(None),
            PasswordResetOTP.used_at.is_(None),
        )
    )

    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset session.",
        )

    now = datetime.utcnow()

    if (
        not otp_record.reset_token_expires_at
        or now
        >= otp_record.reset_token_expires_at
    ):
        otp_record.used_at = now
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Reset session has expired.",
        )

    user.password_hash = hash_password(
        request.new_password
    )

    otp_record.used_at = now

    # Invalidate all other reset sessions.
    other_records = db.scalars(
        select(PasswordResetOTP).where(
            PasswordResetOTP.user_id
            == user.id,
            PasswordResetOTP.id
            != otp_record.id,
            PasswordResetOTP.used_at.is_(None),
        )
    ).all()

    for record in other_records:
        record.used_at = now

    db.commit()

    return {
        "message": "Password reset successfully."
    }