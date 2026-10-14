from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import LeaveBalance, LeaveRequest, User
from ..schemas import (
    LeaveBalanceResponse,
    LeaveCreateRequest,
    LeaveResponse,
)
from ..security import get_current_user


router = APIRouter(
    prefix="/api/employee/leaves",
    tags=["Employee Leaves"],
)


@router.get("", response_model=list[LeaveResponse])
def get_my_leaves(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    leaves = db.scalars(
        select(LeaveRequest)
        .where(
            LeaveRequest.employee_id == current_user.id
        )
        .order_by(LeaveRequest.created_at.desc())
    ).all()

    return leaves


@router.get(
    "/balance",
    response_model=LeaveBalanceResponse | None,
)
def get_my_leave_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    balance = db.scalar(
        select(LeaveBalance).where(
            LeaveBalance.employee_id == current_user.id
        )
    )

    return balance


@router.post(
    "",
    response_model=LeaveResponse,
)
def apply_leave(
    request: LeaveCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if request.from_date > request.to_date:
        raise HTTPException(
            status_code=400,
            detail="From date cannot be after to date.",
        )

    if request.from_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Leave cannot be applied for a past date.",
        )

    leave_type = request.leave_type.strip()

    if not leave_type:
        raise HTTPException(
            status_code=400,
            detail="Leave type is required.",
        )

    overlapping_leave = db.scalar(
        select(LeaveRequest).where(
            LeaveRequest.employee_id == current_user.id,
            LeaveRequest.from_date <= request.to_date,
            LeaveRequest.to_date >= request.from_date,
            LeaveRequest.status.in_(
                ["Pending", "Approved"]
            ),
        )
    )

    if overlapping_leave:
        raise HTTPException(
            status_code=400,
            detail=(
                "You already have a pending or approved "
                "leave for these dates."
            ),
        )

    leave = LeaveRequest(
        employee_id=current_user.id,
        from_date=request.from_date,
        to_date=request.to_date,
        leave_type=leave_type,
        reason=(
            request.reason.strip()
            if request.reason
            else None
        ),
        status="Pending",
    )

    db.add(leave)
    db.commit()
    db.refresh(leave)

    return leave