
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    ActivityLog,
    Announcement,
    Holiday,
    LeaveBalance,
    LeaveRequest,
    User,
)
from ..schemas import (
    AnnouncementCreateRequest,
    AnnouncementUpdateRequest,
    EmployeeCreateRequest,
    EmployeePasswordUpdate,
    EmployeeResponse,
    EmployeeStatusUpdate,
    EmployeeUpdateRequest,
    HolidayCreateRequest,
    HolidayUpdateRequest,
    LeaveStatusUpdate,
)
from ..security import (
    get_current_user,
    hash_password,
    require_admin,
    require_manager_or_admin,
)


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)

IST = ZoneInfo("Asia/Kolkata")


def log_activity(
    db: Session,
    *,
    actor_id: int | None,
    employee_id: int | None,
    event_type: str,
    title: str,
    description: str,
    is_admin_notice: bool = True,
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


def get_employee_or_404(db: Session, employee_id: int) -> User:
    employee = db.scalar(
        select(User).where(User.id == employee_id)
    )
    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found.",
        )
    return employee


# ============================================================
# ADMIN DASHBOARD
# ============================================================

@router.get("/dashboard")
def admin_dashboard(
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db),
):
    total_employees = db.scalar(
        select(func.count(User.id)).where(
            User.role == "employee"
        )
    ) or 0

    active_employees = db.scalar(
        select(func.count(User.id)).where(
            User.role == "employee",
            User.is_active.is_(True),
        )
    ) or 0

    pending_leaves = db.scalar(
        select(func.count(LeaveRequest.id)).where(
            LeaveRequest.status == "Pending"
        )
    ) or 0

    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "pending_leaves": pending_leaves,
    }


# ============================================================
# EMPLOYEE MANAGEMENT
# ============================================================

@router.get("/employees", response_model=list[EmployeeResponse])
def list_employees(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(User).order_by(User.id.desc())
    ).all()


@router.post("/employees", response_model=EmployeeResponse)
def create_employee(
    request: EmployeeCreateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    email = str(request.email).strip().lower()
    employee_code = request.employee_id.strip()

    if request.date_of_birth and request.date_of_birth > datetime.now(IST).date():
        raise HTTPException(
            status_code=400,
            detail="Date of birth cannot be in the future.",
        )

    duplicate = db.scalar(
        select(User).where(
            (func.lower(User.email) == email)
            | (User.employee_id == employee_code)
        )
    )

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="Email or employee ID already exists.",
        )

    employee = User(
        full_name=request.full_name.strip(),
        employee_id=employee_code,
        email=email,
        mobile=request.mobile,
        department=request.department,
        date_of_birth=request.date_of_birth,
        password_hash=hash_password(request.password),
        role="employee",
        is_active=True,
    )

    db.add(employee)

    try:
        db.flush()

        db.add(
            LeaveBalance(
                employee_id=employee.id,
                annual_leave=12,
                used_leave=0,
            )
        )

        log_activity(
            db,
            actor_id=current_user.id,
            employee_id=employee.id,
            event_type="employee_created",
            title="New employee added",
            description=(
                f"{current_user.full_name} added employee "
                f"{employee.full_name} ({employee.employee_id})."
            ),
        )

        db.commit()
        db.refresh(employee)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Employee could not be created. Check unique fields.",
        )

    return employee


@router.get("/employees/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_employee_or_404(db, employee_id)


@router.put("/employees/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    request: EmployeeUpdateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    employee = get_employee_or_404(db, employee_id)

    if request.date_of_birth and request.date_of_birth > datetime.now(IST).date():
        raise HTTPException(
            status_code=400,
            detail="Date of birth cannot be in the future.",
        )

    email = str(request.email).strip().lower()

    duplicate_email = db.scalar(
        select(User).where(
            func.lower(User.email) == email,
            User.id != employee.id,
        )
    )

    if duplicate_email:
        raise HTTPException(
            status_code=409,
            detail="Email address is already in use.",
        )

    employee.full_name = request.full_name.strip()
    employee.email = email
    employee.mobile = request.mobile
    employee.department = request.department
    employee.date_of_birth = request.date_of_birth

    log_activity(
        db,
        actor_id=current_user.id,
        employee_id=employee.id,
        event_type="employee_updated",
        title="Employee record updated",
        description=(
            f"{current_user.full_name} updated the employee record "
            f"for {employee.full_name} ({employee.employee_id})."
        ),
    )

    try:
        db.commit()
        db.refresh(employee)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Employee could not be updated. Check the email address.",
        )

    return employee


@router.patch("/employees/{employee_id}/status")
def update_employee_status(
    employee_id: int,
    request: EmployeeStatusUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    employee = get_employee_or_404(db, employee_id)

    if employee.id == current_user.id and not request.is_active:
        raise HTTPException(
            status_code=400,
            detail="You cannot deactivate your own account.",
        )

    employee.is_active = request.is_active

    action = "activated" if request.is_active else "deactivated"

    log_activity(
        db,
        actor_id=current_user.id,
        employee_id=employee.id,
        event_type="employee_status_changed",
        title="Employee status changed",
        description=(
            f"{current_user.full_name} {action} "
            f"{employee.full_name}'s account."
        ),
    )

    db.commit()

    return {
        "message": f"Employee {action} successfully.",
        "is_active": employee.is_active,
    }


@router.patch("/employees/{employee_id}/password")
def update_employee_password(
    employee_id: int,
    request: EmployeePasswordUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    employee = get_employee_or_404(db, employee_id)
    employee.password_hash = hash_password(request.new_password)
    db.commit()

    return {"message": "Employee password updated successfully."}


# ============================================================
# HOLIDAYS
# ============================================================

@router.get("/holidays")
def list_holidays(
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(Holiday).order_by(Holiday.holiday_date.asc())
    ).all()


@router.post("/holidays")
def create_holiday(
    request: HolidayCreateRequest,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db),
):
    existing = db.scalar(
        select(Holiday).where(
            Holiday.holiday_date == request.holiday_date
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="A holiday already exists on this date.",
        )

    holiday = Holiday(
        holiday_date=request.holiday_date,
        name=request.name.strip(),
        description=request.description,
        is_active=True,
    )

    db.add(holiday)
    db.flush()

    log_activity(
        db,
        actor_id=current_user.id,
        employee_id=None,
        event_type="holiday_created",
        title="New holiday announced",
        description=(
            f"{current_user.full_name} added holiday "
            f"{holiday.name} on {holiday.holiday_date.isoformat()}."
        ),
    )

    try:
        db.commit()
        db.refresh(holiday)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Could not create holiday. The date may already exist.",
        )

    return holiday


@router.put("/holidays/{holiday_id}")
def update_holiday(
    holiday_id: int,
    request: HolidayUpdateRequest,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db),
):
    holiday = db.get(Holiday, holiday_id)

    if not holiday:
        raise HTTPException(
            status_code=404,
            detail="Holiday not found.",
        )

    duplicate = db.scalar(
        select(Holiday).where(
            Holiday.holiday_date == request.holiday_date,
            Holiday.id != holiday.id,
        )
    )

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="Another holiday already exists on this date.",
        )

    holiday.holiday_date = request.holiday_date
    holiday.name = request.name.strip()
    holiday.description = request.description

    log_activity(
        db,
        actor_id=current_user.id,
        employee_id=None,
        event_type="holiday_updated",
        title="Holiday updated",
        description=(
            f"{current_user.full_name} updated holiday "
            f"{holiday.name} to {holiday.holiday_date.isoformat()}."
        ),
    )

    try:
        db.commit()
        db.refresh(holiday)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Could not update holiday.",
        )

    return holiday


@router.delete("/holidays/{holiday_id}")
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

    holiday_name = holiday.name
    holiday_date = holiday.holiday_date

    # Soft delete: preserve existing records and audit history.
    holiday.is_active = False

    log_activity(
        db,
        actor_id=current_user.id,
        employee_id=None,
        event_type="holiday_removed",
        title="Holiday removed",
        description=(
            f"{current_user.full_name} removed holiday "
            f"{holiday_name} dated {holiday_date.isoformat()}."
        ),
    )

    db.commit()

    return {"message": "Holiday removed successfully."}


# ============================================================
# LEAVE MANAGEMENT
# ============================================================

@router.get("/leaves")
def list_all_leaves(
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db),
):
    leaves = db.scalars(
        select(LeaveRequest).order_by(LeaveRequest.created_at.desc())
    ).all()

    results = []

    for leave in leaves:
        employee = db.get(User, leave.employee_id)

        results.append({
            "id": leave.id,
            "employee_id": leave.employee_id,
            "employee_name": employee.full_name if employee else None,
            "employee_code": employee.employee_id if employee else None,
            "from_date": leave.from_date,
            "to_date": leave.to_date,
            "leave_type": leave.leave_type,
            "reason": leave.reason,
            "status": leave.status,
            "created_at": leave.created_at,
        })

    return results


@router.get("/leaves/pending")
def list_pending_leaves(
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db),
):
    leaves = db.scalars(
        select(LeaveRequest)
        .where(LeaveRequest.status == "Pending")
        .order_by(LeaveRequest.created_at.asc())
    ).all()

    results = []

    for leave in leaves:
        employee = db.get(User, leave.employee_id)

        results.append({
            "id": leave.id,
            "employee_id": leave.employee_id,
            "employee_name": employee.full_name if employee else None,
            "employee_code": employee.employee_id if employee else None,
            "from_date": leave.from_date,
            "to_date": leave.to_date,
            "leave_type": leave.leave_type,
            "reason": leave.reason,
            "status": leave.status,
            "created_at": leave.created_at,
        })

    return results


@router.put("/leaves/{leave_id}/status")
def update_leave_status(
    leave_id: int,
    request: LeaveStatusUpdate,
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db),
):
    leave = db.get(LeaveRequest, leave_id)

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found.",
        )

    if leave.status != "Pending":
        raise HTTPException(
            status_code=400,
            detail="This leave request has already been processed.",
        )

    employee = db.get(User, leave.employee_id)

    if request.status == "Approved":
        overlapping_leave = db.scalar(
            select(LeaveRequest).where(
                LeaveRequest.employee_id == leave.employee_id,
                LeaveRequest.id != leave.id,
                LeaveRequest.status == "Approved",
                LeaveRequest.from_date <= leave.to_date,
                LeaveRequest.to_date >= leave.from_date,
            )
        )

        if overlapping_leave:
            raise HTTPException(
                status_code=400,
                detail="This leave overlaps an already approved leave.",
            )

        balance = db.scalar(
            select(LeaveBalance).where(
                LeaveBalance.employee_id == leave.employee_id
            )
        )

        leave_days = (leave.to_date - leave.from_date).days + 1

        if balance:
            available_days = balance.annual_leave - balance.used_leave

            if leave_days > available_days:
                raise HTTPException(
                    status_code=400,
                    detail="Employee does not have enough leave balance.",
                )

            balance.used_leave += leave_days

    leave.status = request.status

    employee_name = employee.full_name if employee else "Employee"

    log_activity(
        db,
        actor_id=current_user.id,
        employee_id=leave.employee_id,
        event_type="leave_status_changed",
        title=f"Leave {request.status.lower()}",
        description=(
            f"{current_user.full_name} {request.status.lower()} "
            f"{employee_name}'s {leave.leave_type} leave "
            f"({leave.from_date.isoformat()} to {leave.to_date.isoformat()})."
        ),
    )

    db.commit()

    return {
        "message": f"Leave {request.status.lower()} successfully.",
        "status": leave.status,
    }


# ============================================================
# ANNOUNCEMENTS
# ============================================================

@router.get("/announcements")
def list_announcements(
    current_user: User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(Announcement).order_by(Announcement.created_at.desc())
    ).all()


@router.post("/announcements")
def create_announcement(
    request: AnnouncementCreateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    announcement = Announcement(
        title=request.title.strip(),
        content=request.content.strip(),
        created_by=current_user.id,
        is_active=True,
    )

    db.add(announcement)
    db.flush()

    log_activity(
        db,
        actor_id=current_user.id,
        employee_id=None,
        event_type="announcement_created",
        title="New company announcement",
        description=(
            f"{current_user.full_name} published: "
            f"{announcement.title}."
        ),
    )

    db.commit()
    db.refresh(announcement)

    return announcement


@router.put("/announcements/{announcement_id}")
def update_announcement(
    announcement_id: int,
    request: AnnouncementUpdateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    announcement = db.get(Announcement, announcement_id)

    if not announcement:
        raise HTTPException(
            status_code=404,
            detail="Announcement not found.",
        )

    announcement.title = request.title.strip()
    announcement.content = request.content.strip()
    announcement.is_active = request.is_active
    announcement.updated_at = datetime.now(IST).replace(tzinfo=None)

    log_activity(
        db,
        actor_id=current_user.id,
        employee_id=None,
        event_type="announcement_updated",
        title="Company announcement updated",
        description=(
            f"{current_user.full_name} updated announcement: "
            f"{announcement.title}."
        ),
    )

    db.commit()
    db.refresh(announcement)

    return announcement


@router.delete("/announcements/{announcement_id}")
def deactivate_announcement(
    announcement_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    announcement = db.get(Announcement, announcement_id)

    if not announcement:
        raise HTTPException(
            status_code=404,
            detail="Announcement not found.",
        )

    announcement.is_active = False
    announcement.updated_at = datetime.now(IST).replace(tzinfo=None)

    log_activity(
        db,
        actor_id=current_user.id,
        employee_id=None,
        event_type="announcement_deactivated",
        title="Announcement deactivated",
        description=(
            f"{current_user.full_name} deactivated announcement: "
            f"{announcement.title}."
        ),
    )

    db.commit()

    return {"message": "Announcement deactivated successfully."}
