from datetime import date, datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    Attendance,
    Holiday,
    LeaveBalance,
    LeaveRequest,
    Task,
    User,
)
from ..schemas import (
    AttendanceResponse,
    EmployeeCalendarResponse,
    EmployeeDashboardResponse,
)
from ..security import get_current_user


router = APIRouter(
    prefix="/api/employee",
    tags=["Employee"],
)

IST = ZoneInfo("Asia/Kolkata")


def get_today() -> date:
    return datetime.now(IST).date()


def get_current_local_datetime() -> datetime:
    return datetime.now(IST).replace(tzinfo=None)


@router.get(
    "/dashboard",
    response_model=EmployeeDashboardResponse,
)
def employee_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = get_today()

    attendance = db.scalar(
        select(Attendance)
        .where(
            Attendance.employee_id == current_user.id,
            Attendance.attendance_date == today,
        )
        .order_by(Attendance.id.desc())
    )

    today_tasks = db.scalars(
        select(Task)
        .where(
            Task.employee_id == current_user.id,
            Task.task_date == today,
        )
        .order_by(Task.id.desc())
    ).all()

    leave_requests = db.scalars(
        select(LeaveRequest)
        .where(
            LeaveRequest.employee_id == current_user.id,
        )
        .order_by(LeaveRequest.created_at.desc())
        .limit(10)
    ).all()

    upcoming_holidays = db.scalars(
        select(Holiday)
        .where(
            Holiday.is_active.is_(True),
            Holiday.holiday_date >= today,
        )
        .order_by(Holiday.holiday_date.asc())
        .limit(5)
    ).all()

    leave_balance = db.scalar(
        select(LeaveBalance).where(
            LeaveBalance.employee_id == current_user.id
        )
    )

    return {
        "user": current_user,
        "today": today,
        "attendance": attendance,
        "today_tasks": today_tasks,
        "leave_requests": leave_requests,
        "upcoming_holidays": upcoming_holidays,
        "leave_balance": leave_balance,
    }


@router.post(
    "/attendance/check-in",
    response_model=AttendanceResponse,
)
def check_in(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = get_today()

    existing_attendance = db.scalar(
        select(Attendance).where(
            Attendance.employee_id == current_user.id,
            Attendance.attendance_date == today,
        )
    )

    if existing_attendance:
        raise HTTPException(
            status_code=400,
            detail="Attendance has already been marked for today.",
        )

    attendance = Attendance(
        employee_id=current_user.id,
        attendance_date=today,
        check_in=get_current_local_datetime(),
        status="Present",
    )

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return attendance


@router.post(
    "/attendance/check-out",
    response_model=AttendanceResponse,
)
def check_out(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = get_today()

    attendance = db.scalar(
        select(Attendance).where(
            Attendance.employee_id == current_user.id,
            Attendance.attendance_date == today,
        )
    )

    if not attendance:
        raise HTTPException(
            status_code=400,
            detail="Please check in before checking out.",
        )

    if not attendance.check_in:
        raise HTTPException(
            status_code=400,
            detail="Please check in before checking out.",
        )

    if attendance.check_out:
        raise HTTPException(
            status_code=400,
            detail="Attendance has already been checked out.",
        )

    attendance.check_out = get_current_local_datetime()

    db.commit()
    db.refresh(attendance)

    return attendance


@router.get(
    "/holidays",
)
def get_employee_holidays(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = get_today()

    holidays = db.scalars(
        select(Holiday)
        .where(
            Holiday.is_active.is_(True),
        )
        .order_by(Holiday.holiday_date.asc())
    ).all()

    return {
        "today": today,
        "holidays": holidays,
    }


@router.get(
    "/calendar",
    response_model=EmployeeCalendarResponse,
)
def get_employee_calendar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = get_today()

    # --------------------------------------------------------
    # Attendance
    # --------------------------------------------------------

    attendance_records = db.scalars(
        select(Attendance)
        .where(
            Attendance.employee_id == current_user.id,
        )
        .order_by(Attendance.attendance_date.asc())
    ).all()

    attendance_data = [
        {
            "date": attendance.attendance_date,
            "status": attendance.status,
            "check_in": attendance.check_in,
            "check_out": attendance.check_out,
        }
        for attendance in attendance_records
    ]

    # --------------------------------------------------------
    # Tasks
    # --------------------------------------------------------

    task_records = db.scalars(
        select(Task)
        .where(
            Task.employee_id == current_user.id,
        )
        .order_by(Task.task_date.asc(), Task.id.asc())
    ).all()

    task_data = [
        {
            "id": task.id,
            "date": task.task_date,
            "title": task.title,
            "status": task.status,
        }
        for task in task_records
    ]

    # --------------------------------------------------------
    # Leaves
    # --------------------------------------------------------

    leave_records = db.scalars(
        select(LeaveRequest)
        .where(
            LeaveRequest.employee_id == current_user.id,
        )
        .order_by(LeaveRequest.from_date.asc())
    ).all()

    leave_data = [
        {
            "id": leave.id,
            "from_date": leave.from_date,
            "to_date": leave.to_date,
            "leave_type": leave.leave_type,
            "status": leave.status,
        }
        for leave in leave_records
    ]

    # --------------------------------------------------------
    # Company Holidays
    # --------------------------------------------------------

    holiday_records = db.scalars(
        select(Holiday)
        .where(
            Holiday.is_active.is_(True),
        )
        .order_by(Holiday.holiday_date.asc())
    ).all()

    holiday_data = [
        {
            "id": holiday.id,
            "date": holiday.holiday_date,
            "name": holiday.name,
            "description": holiday.description,
        }
        for holiday in holiday_records
    ]

    return {
        "today": today,
        "attendance": attendance_data,
        "tasks": task_data,
        "leaves": leave_data,
        "holidays": holiday_data,
    }