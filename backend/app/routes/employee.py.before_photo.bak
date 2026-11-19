from datetime import date, datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import extract, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    ActivityLog,
    Announcement,
    AnnouncementRead,
    Attendance,
    Holiday,
    LeaveBalance,
    LeaveRequest,
    Task,
    User,
)
from ..schemas import (
    ActivityResponse,
    AnnouncementListResponse,
    AnnouncementResponse,
    AttendanceResponse,
    BirthdayEmployeeResponse,
    BirthdayListResponse,
    EmployeeCalendarResponse,
    EmployeeDashboardResponse,
    EmployeeProfileUpdateRequest,
    TaskResponse,
    TaskStatusUpdate,
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


def log_activity(
    db: Session,
    *,
    actor_id: int | None,
    employee_id: int | None,
    event_type: str,
    title: str,
    description: str,
    is_admin_notice: bool = False,
) -> None:
    db.add(
        ActivityLog(
            actor_id=actor_id,
            employee_id=employee_id,
            event_type=event_type,
            title=title,
            description=description,
            is_admin_notice=is_admin_notice,
        )
    )


# ============================================================
# DASHBOARD
# ============================================================

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
        .where(LeaveRequest.employee_id == current_user.id)
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


# ============================================================
# EMPLOYEE PROFILE
# ============================================================

@router.get("/profile")
def get_employee_profile(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "employee_id": current_user.employee_id,
        "email": current_user.email,
        "mobile": current_user.mobile,
        "department": current_user.department,
        "role": current_user.role,
        "date_of_birth": current_user.date_of_birth,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
    }


@router.put("/profile")
def update_employee_profile(
    request: EmployeeProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ("employee", "manager", "admin"):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to update this profile.",
        )

    email = str(request.email).strip().lower()

    existing_email = db.scalar(
        select(User).where(
            func.lower(User.email) == email,
            User.id != current_user.id,
        )
    )

    if existing_email:
        raise HTTPException(
            status_code=409,
            detail="This email address is already in use.",
        )

    if request.date_of_birth and request.date_of_birth > get_today():
        raise HTTPException(
            status_code=400,
            detail="Date of birth cannot be in the future.",
        )

    changes = []

    if current_user.full_name != request.full_name.strip():
        changes.append("name")

    if (current_user.email or "").lower() != email:
        changes.append("email")

    new_mobile = (
        request.mobile.strip()
        if request.mobile and request.mobile.strip()
        else None
    )

    if current_user.mobile != new_mobile:
        changes.append("mobile")

    if current_user.date_of_birth != request.date_of_birth:
        changes.append("date of birth")

    current_user.full_name = request.full_name.strip()
    current_user.email = email
    current_user.mobile = new_mobile
    current_user.date_of_birth = request.date_of_birth

    if changes:
        log_activity(
            db,
            actor_id=current_user.id,
            employee_id=current_user.id,
            event_type="profile_updated",
            title="Profile updated",
            description=(
                f"{current_user.full_name} updated: "
                + ", ".join(changes)
                + "."
            ),
            is_admin_notice=current_user.role == "admin",
        )

    try:
        db.commit()
        db.refresh(current_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Could not update profile. Check the email address.",
        )

    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "employee_id": current_user.employee_id,
        "email": current_user.email,
        "mobile": current_user.mobile,
        "department": current_user.department,
        "role": current_user.role,
        "date_of_birth": current_user.date_of_birth,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
    }


# ============================================================
# BIRTHDAYS
# ============================================================

@router.get(
    "/birthdays",
    response_model=BirthdayListResponse,
)
def get_birthdays(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = get_today()

    birthdays = db.scalars(
        select(User)
        .where(
            User.role == "employee",
            User.is_active.is_(True),
            User.date_of_birth.is_not(None),
            extract("month", User.date_of_birth) == today.month,
            extract("day", User.date_of_birth) == today.day,
        )
        .order_by(User.full_name.asc())
    ).all()

    return {
        "today": today,
        "birthdays": [
            {
                "id": employee.id,
                "full_name": employee.full_name,
                "employee_id": employee.employee_id,
                "department": employee.department,
                "date_of_birth": employee.date_of_birth,
            }
            for employee in birthdays
        ],
    }


# ============================================================
# ANNOUNCEMENTS
# ============================================================

@router.get(
    "/announcements",
    response_model=AnnouncementListResponse,
)
def get_announcements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    announcements = db.scalars(
        select(Announcement)
        .where(Announcement.is_active.is_(True))
        .order_by(Announcement.created_at.desc())
    ).all()

    read_ids = set(
        db.scalars(
            select(AnnouncementRead.announcement_id).where(
                AnnouncementRead.employee_id == current_user.id
            )
        ).all()
    )

    results = []
    unread_count = 0

    for announcement in announcements:
        is_read = announcement.id in read_ids

        if not is_read:
            unread_count += 1

        results.append({
            "id": announcement.id,
            "title": announcement.title,
            "content": announcement.content,
            "created_by": announcement.created_by,
            "is_active": announcement.is_active,
            "created_at": announcement.created_at,
            "updated_at": announcement.updated_at,
            "is_read": is_read,
        })

    return {
        "announcements": results,
        "unread_count": unread_count,
    }


@router.post("/announcements/{announcement_id}/read")
def mark_announcement_read(
    announcement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    announcement = db.scalar(
        select(Announcement).where(
            Announcement.id == announcement_id,
            Announcement.is_active.is_(True),
        )
    )

    if not announcement:
        raise HTTPException(
            status_code=404,
            detail="Announcement not found.",
        )

    existing = db.scalar(
        select(AnnouncementRead).where(
            AnnouncementRead.announcement_id == announcement_id,
            AnnouncementRead.employee_id == current_user.id,
        )
    )

    if not existing:
        db.add(
            AnnouncementRead(
                announcement_id=announcement_id,
                employee_id=current_user.id,
                read_at=get_current_local_datetime(),
            )
        )

        try:
            db.commit()
        except IntegrityError:
            db.rollback()

    unread_count = db.scalar(
        select(func.count(Announcement.id))
        .where(
            Announcement.is_active.is_(True),
            ~Announcement.id.in_(
                select(AnnouncementRead.announcement_id).where(
                    AnnouncementRead.employee_id == current_user.id
                )
            ),
        )
    ) or 0

    return {
        "message": "Announcement marked as read.",
        "unread_count": unread_count,
    }


# ============================================================
# ACTIVITY FEED
# ============================================================

@router.get(
    "/activity",
    response_model=list[ActivityResponse],
)
def get_employee_activity(
    limit: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    limit = max(1, min(limit, 100))

    activities = db.scalars(
        select(ActivityLog)
        .where(
            (ActivityLog.employee_id == current_user.id)
            | (
                ActivityLog.is_admin_notice.is_(True)
                & ActivityLog.employee_id.is_(None)
            )
        )
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
    ).all()

    return activities


# ============================================================
# ATTENDANCE CHECK-IN
# ============================================================

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

    log_activity(
        db,
        actor_id=current_user.id,
        employee_id=current_user.id,
        event_type="attendance_check_in",
        title="Attendance check-in",
        description=f"{current_user.full_name} checked in.",
    )

    db.commit()
    db.refresh(attendance)

    return attendance


# ============================================================
# ATTENDANCE CHECK-OUT
# ============================================================

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

    if not attendance or not attendance.check_in:
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

    log_activity(
        db,
        actor_id=current_user.id,
        employee_id=current_user.id,
        event_type="attendance_check_out",
        title="Attendance check-out",
        description=f"{current_user.full_name} checked out.",
    )

    db.commit()
    db.refresh(attendance)

    return attendance


# ============================================================
# HOLIDAYS
# ============================================================

@router.get("/holidays")
def get_employee_holidays(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = get_today()

    holidays = db.scalars(
        select(Holiday)
        .where(Holiday.is_active.is_(True))
        .order_by(Holiday.holiday_date.asc())
    ).all()

    return {
        "today": today,
        "holidays": holidays,
    }


# ============================================================
# EMPLOYEE CALENDAR
# ============================================================

@router.get(
    "/calendar",
    response_model=EmployeeCalendarResponse,
)
def get_employee_calendar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = get_today()

    attendance_records = db.scalars(
        select(Attendance)
        .where(Attendance.employee_id == current_user.id)
        .order_by(Attendance.attendance_date.asc())
    ).all()

    attendance_data = [
        {
            "date": item.attendance_date,
            "status": item.status,
            "check_in": item.check_in,
            "check_out": item.check_out,
        }
        for item in attendance_records
    ]

    task_records = db.scalars(
        select(Task)
        .where(Task.employee_id == current_user.id)
        .order_by(Task.task_date.asc(), Task.id.asc())
    ).all()

    task_data = [
        {
            "id": item.id,
            "date": item.task_date,
            "title": item.title,
            "status": item.status,
        }
        for item in task_records
    ]

    leave_records = db.scalars(
        select(LeaveRequest)
        .where(LeaveRequest.employee_id == current_user.id)
        .order_by(LeaveRequest.from_date.asc())
    ).all()

    leave_data = [
        {
            "id": item.id,
            "from_date": item.from_date,
            "to_date": item.to_date,
            "leave_type": item.leave_type,
            "status": item.status,
        }
        for item in leave_records
    ]

    holiday_records = db.scalars(
        select(Holiday)
        .where(Holiday.is_active.is_(True))
        .order_by(Holiday.holiday_date.asc())
    ).all()

    holiday_data = [
        {
            "id": item.id,
            "date": item.holiday_date,
            "name": item.name,
            "description": item.description,
        }
        for item in holiday_records
    ]

    return {
        "today": today,
        "attendance": attendance_data,
        "tasks": task_data,
        "leaves": leave_data,
        "holidays": holiday_data,
    }


# ============================================================
# EMPLOYEE TASKS
# ============================================================

@router.get(
    "/tasks",
    response_model=list[TaskResponse],
)
def get_employee_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return tasks assigned only to the logged-in employee."""
    return db.scalars(
        select(Task)
        .where(Task.employee_id == current_user.id)
        .order_by(Task.task_date.desc(), Task.id.desc())
    ).all()


@router.patch(
    "/tasks/{task_id}/status",
    response_model=TaskResponse,
)
def update_employee_task_status(
    task_id: int,
    request: TaskStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Allow an employee to update only their own task status."""
    task = db.scalar(
        select(Task).where(
            Task.id == task_id,
            Task.employee_id == current_user.id,
        )
    )

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found.",
        )

    previous_status = task.status
    task.status = request.status

    if previous_status != request.status:
        log_activity(
            db,
            actor_id=current_user.id,
            employee_id=current_user.id,
            event_type="task_status_updated",
            title="Task status updated",
            description=(
                f"{current_user.full_name} updated task "
                f"'{task.title}' from {previous_status} "
                f"to {request.status}."
            ),
        )

    db.commit()
    db.refresh(task)

    return task