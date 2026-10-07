from datetime import date, datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    Attendance,
    Holiday,
    LeaveRequest,
    Task,
    User,
)
from ..schemas import HolidayResponse
from ..security import require_manager_or_admin


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)

IST = ZoneInfo("Asia/Kolkata")


def get_today() -> date:
    return datetime.now(IST).date()


def serialize_user(user: User):
    return {
        "id": user.id,
        "full_name": user.full_name,
        "employee_id": user.employee_id,
        "email": user.email,
        "mobile": user.mobile,
        "role": user.role,
        "department": user.department,
        "is_active": user.is_active,
    }


def serialize_task(task: Task):
    return {
        "id": task.id,
        "employee_id": task.employee_id,
        "title": task.title,
        "description": task.description,
        "task_date": task.task_date,
        "status": task.status,
        "created_at": task.created_at,
        "employee_name": (
            task.employee.full_name
            if task.employee
            else None
        ),
        "employee_code": (
            task.employee.employee_id
            if task.employee
            else None
        ),
    }


def serialize_leave(leave: LeaveRequest):
    return {
        "id": leave.id,
        "employee_id": leave.employee_id,
        "employee_name": (
            leave.employee.full_name
            if leave.employee
            else None
        ),
        "employee_code": (
            leave.employee.employee_id
            if leave.employee
            else None
        ),
        "from_date": leave.from_date,
        "to_date": leave.to_date,
        "leave_type": leave.leave_type,
        "reason": leave.reason,
        "status": leave.status,
        "created_at": leave.created_at,
    }


@router.get("/dashboard")
def admin_dashboard(
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db),
):
    today = get_today()

    active_employees = db.scalar(
        select(func.count(User.id)).where(
            User.role == "employee",
            User.is_active.is_(True),
        )
    ) or 0

    today_attendance = db.scalar(
        select(func.count(Attendance.id)).where(
            Attendance.attendance_date == today,
            Attendance.status == "Present",
        )
    ) or 0

    pending_tasks = db.scalar(
        select(func.count(Task.id)).where(
            Task.status.in_(["Pending", "In Progress"]),
        )
    ) or 0

    pending_leaves = db.scalar(
        select(func.count(LeaveRequest.id)).where(
            LeaveRequest.status == "Pending",
        )
    ) or 0

    employees = db.scalars(
        select(User)
        .where(User.role == "employee")
        .order_by(User.created_at.desc())
        .limit(10)
    ).all()

    today_tasks = db.scalars(
        select(Task)
        .where(Task.task_date == today)
        .order_by(Task.id.desc())
        .limit(10)
    ).all()

    pending_leave_records = db.scalars(
        select(LeaveRequest)
        .where(LeaveRequest.status == "Pending")
        .order_by(LeaveRequest.created_at.desc())
        .limit(10)
    ).all()

    return {
        "today": today,
        "current_user": serialize_user(current_user),
        "stats": {
            "active_employees": active_employees,
            "today_attendance": today_attendance,
            "pending_tasks": pending_tasks,
            "pending_leaves": pending_leaves,
        },
        "employees": [
            serialize_user(employee)
            for employee in employees
        ],
        "today_tasks": [
            serialize_task(task)
            for task in today_tasks
        ],
        "pending_leave_requests": [
            serialize_leave(leave)
            for leave in pending_leave_records
        ],
    }


# ============================================================
# HOLIDAYS
# ============================================================

@router.get(
    "/holidays",
    response_model=list[HolidayResponse],
)
def get_holidays(
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db),
):
    holidays = db.scalars(
        select(Holiday)
        .where(Holiday.is_active.is_(True))
        .order_by(Holiday.holiday_date.asc())
    ).all()

    return holidays


@router.post(
    "/holidays",
    response_model=HolidayResponse,
)
def create_holiday(
    holiday_date: date,
    name: str,
    description: str | None = None,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db),
):
    existing_holiday = db.scalar(
        select(Holiday).where(
            Holiday.holiday_date == holiday_date
        )
    )

    if existing_holiday:
        raise HTTPException(
            status_code=400,
            detail="A holiday already exists for this date.",
        )

    holiday = Holiday(
        holiday_date=holiday_date,
        name=name.strip(),
        description=description.strip()
        if description
        else None,
        is_active=True,
    )

    db.add(holiday)
    db.commit()
    db.refresh(holiday)

    return holiday


@router.put(
    "/holidays/{holiday_id}",
    response_model=HolidayResponse,
)
def update_holiday(
    holiday_id: int,
    holiday_date: date,
    name: str,
    description: str | None = None,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db),
):
    holiday = db.get(Holiday, holiday_id)

    if not holiday:
        raise HTTPException(
            status_code=404,
            detail="Holiday not found.",
        )

    existing_holiday = db.scalar(
        select(Holiday).where(
            Holiday.holiday_date == holiday_date,
            Holiday.id != holiday_id,
        )
    )

    if existing_holiday:
        raise HTTPException(
            status_code=400,
            detail="Another holiday already exists for this date.",
        )

    holiday.holiday_date = holiday_date
    holiday.name = name.strip()
    holiday.description = (
        description.strip()
        if description
        else None
    )

    db.commit()
    db.refresh(holiday)

    return holiday


@router.delete(
    "/holidays/{holiday_id}"
)
def delete_holiday(
    holiday_id: int,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db),
):
    holiday = db.get(Holiday, holiday_id)

    if not holiday:
        raise HTTPException(
            status_code=404,
            detail="Holiday not found.",
        )

    # Soft delete instead of physically deleting
    holiday.is_active = False

    db.commit()

    return {
        "message": "Holiday deleted successfully."
    }