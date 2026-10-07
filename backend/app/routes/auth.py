from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import LoginRequest, TokenResponse
from ..security import create_access_token, verify_password


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    login_id = data.login_id.strip()

    user = db.scalar(
        select(User).where(
            or_(
                User.email == login_id.lower(),
                User.employee_id == login_id,
            )
        )
    )

    # --------------------------------------------------------
    # INVALID USER
    # --------------------------------------------------------

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid login credentials.",
        )

    # --------------------------------------------------------
    # INACTIVE USER
    # --------------------------------------------------------

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail=(
                "Your account is inactive. "
                "Please contact administrator."
            ),
        )

    # --------------------------------------------------------
    # PASSWORD CHECK
    # --------------------------------------------------------

    if not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid login credentials.",
        )

    # --------------------------------------------------------
    # CREATE JWT TOKEN
    # --------------------------------------------------------

    token = create_access_token(
        user.id
    )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }