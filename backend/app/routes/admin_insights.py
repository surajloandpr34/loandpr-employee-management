from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from ..database import Base, get_db
from ..models import ActivityLog, Announcement, Attendance, Holiday, LeaveRequest, Task, User
from ..security import require_admin

router = APIRouter(prefix="/api/admin/insights", tags=["Admin Insights"])
IST = ZoneInfo("Asia/Kolkata")


class CalendarEvent(Base):
    __tablename__ = "admin_calendar_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    event_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(30), nullable=False, default="Meeting")
    start_time: Mapped[str | None] = mapped_column(String(5), nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


def today_ist():
    return datetime.now(IST).date()


def day_value(value):
    return value.isoformat() if value else None


def task_data(task, names):
    return {"id": task.id, "title": task.title, "description": task.description,
            "employee_id": task.employee_id, "employee_name": names.get(task.employee_id, "Employee"),
            "task_date": day_value(task.task_date), "status": task.status}


def event_data(event):
    return {"id": event.id, "date": day_value(event.event_date), "title": event.title,
            "description": event.description or "", "category": event.category,
            "start_time": event.start_time or ""}


class TaskInput(BaseModel):
    employee_id: int = Field(gt=0)
    title: str = Field(min_length=2, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    task_date: date


class TaskEdit(TaskInput):
    status: str = "Pending"


class CalendarEventInput(BaseModel):
    event_date: date
    title: str = Field(min_length=2, max_length=180)
    description: str | None = Field(default=None, max_length=2000)
    category: str = "Meeting"
    start_time: str | None = None


def validate_event(request: CalendarEventInput):
    if request.category not in {"Meeting", "Training", "Deadline", "Office Event", "Reminder"}:
        raise HTTPException(400, "Invalid event category")
    if request.start_time:
        try:
            time.fromisoformat(request.start_time)
        except ValueError:
            raise HTTPException(400, "Time must be HH:MM")


@router.get("/overview")
def overview(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    today = today_ist()
    employees = db.scalars(select(User).where(User.role == "employee").order_by(User.full_name)).all()
    active = [e for e in employees if e.is_active]
    names = {e.id: e.full_name for e in employees}
    attendance = db.scalars(select(Attendance).where(Attendance.attendance_date == today)).all()
    attendance_ids = {a.employee_id for a in attendance if a.check_in}
    pending_leaves = db.scalars(select(LeaveRequest).where(LeaveRequest.status == "Pending").order_by(LeaveRequest.created_at.desc())).all()
    all_tasks = db.scalars(select(Task).order_by(Task.task_date.desc(), Task.id.desc())).all()
    announcements = db.scalars(select(Announcement).order_by(Announcement.created_at.desc()).limit(20)).all()
    holidays = db.scalars(select(Holiday).where(Holiday.is_active.is_(True)).order_by(Holiday.holiday_date)).all()
    approved_leaves = db.scalars(select(LeaveRequest).where(LeaveRequest.status == "Approved")).all()
    activity = db.scalars(select(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(20)).all()
    events = db.scalars(select(CalendarEvent).order_by(CalendarEvent.event_date, CalendarEvent.start_time, CalendarEvent.id)).all()

    weekly = []
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        records = db.scalars(select(Attendance).where(Attendance.attendance_date == day)).all()
        weekly.append({"date": day.isoformat(), "present": len({r.employee_id for r in records if r.check_in})})

    birthdays = [
        {"id": e.id, "name": e.full_name, "date": day_value(e.date_of_birth), "department": e.department}
        for e in active if e.date_of_birth and e.date_of_birth.month == today.month and e.date_of_birth.day == today.day
    ]
    attendance_rows = [
        {"id": e.id, "name": e.full_name, "employee_code": e.employee_id, "department": e.department,
         "status": "Present" if e.id in attendance_ids else "On Leave" if any(
             l.employee_id == e.id and l.from_date <= today <= l.to_date for l in approved_leaves
         ) else "Not Checked In",
         "check_in": next((a.check_in.isoformat() for a in attendance if a.employee_id == e.id and a.check_in), None),
         "check_out": next((a.check_out.isoformat() for a in attendance if a.employee_id == e.id and a.check_out), None)}
        for e in active
    ]
    performance = []
    for e in active:
        assigned = [t for t in all_tasks if t.employee_id == e.id]
        completed = sum(t.status == "Completed" for t in assigned)
        performance.append({"employee_id": e.id, "name": e.full_name, "department": e.department,
                            "assigned": len(assigned), "completed": completed,
                            "pending": sum(t.status != "Completed" for t in assigned),
                            "completion_rate": round(100 * completed / len(assigned)) if assigned else 0})

    return {
        "today": today.isoformat(),
        "stats": {"total_employees": len(employees), "active_employees": len(active),
                  "present_today": len(attendance_ids.intersection({e.id for e in active})),
                  "not_checked_in": len(active) - len(attendance_ids.intersection({e.id for e in active})),
                  "pending_leaves": len(pending_leaves),
                  "pending_tasks": sum(t.status != "Completed" for t in all_tasks)},
        "employees": [{"id": e.id, "name": e.full_name, "employee_code": e.employee_id, "department": e.department} for e in active],
        "attendance": attendance_rows, "weekly": weekly,
        "leaves": [{"id": l.id, "employee_name": names.get(l.employee_id, "Employee"), "employee_id": l.employee_id,
                    "from_date": day_value(l.from_date), "to_date": day_value(l.to_date), "leave_type": l.leave_type,
                    "reason": l.reason, "status": l.status} for l in pending_leaves],
        "calendar_leaves": [{"id": l.id, "employee_name": names.get(l.employee_id, "Employee"),
                             "from_date": day_value(l.from_date), "to_date": day_value(l.to_date), "status": l.status}
                            for l in approved_leaves],
        "holidays": [{"id": h.id, "name": h.name, "date": day_value(h.holiday_date)} for h in holidays],
        "calendar_events": [event_data(e) for e in events],
        "tasks": [task_data(t, names) for t in all_tasks[:200]],
        "performance": performance, "birthdays": birthdays,
        "announcements": [{"id": a.id, "title": a.title, "content": a.content,
                           "image_data": getattr(a, "image_data", None), "is_active": a.is_active,
                           "created_at": a.created_at.isoformat()} for a in announcements],
        "activity": [{"id": a.id, "title": a.title, "description": a.description,
                      "created_at": a.created_at.isoformat()} for a in activity],
    }


@router.post("/calendar-events")
def create_calendar_event(request: CalendarEventInput, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    validate_event(request)
    event = CalendarEvent(event_date=request.event_date, title=request.title.strip(),
                          description=request.description, category=request.category,
                          start_time=request.start_time or None, created_by=current_user.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event_data(event)


@router.put("/calendar-events/{event_id}")
def update_calendar_event(event_id: int, request: CalendarEventInput, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    event = db.get(CalendarEvent, event_id)
    if event is None:
        raise HTTPException(404, "Calendar event not found")
    validate_event(request)
    event.event_date = request.event_date
    event.title = request.title.strip()
    event.description = request.description
    event.category = request.category
    event.start_time = request.start_time or None
    db.commit()
    return event_data(event)


@router.delete("/calendar-events/{event_id}")
def delete_calendar_event(event_id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    event = db.get(CalendarEvent, event_id)
    if event is None:
        raise HTTPException(404, "Calendar event not found")
    db.delete(event)
    db.commit()
    return {"message": "Calendar event deleted"}


@router.post("/tasks")
def create_task(request: TaskInput, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    employee = db.get(User, request.employee_id)
    if not employee or employee.role != "employee" or not employee.is_active:
        raise HTTPException(404, "Active employee not found")
    task = Task(employee_id=request.employee_id, title=request.title.strip(), description=request.description,
                task_date=request.task_date, status="Pending")
    db.add(task)
    db.commit()
    db.refresh(task)
    return {"id": task.id, "message": "Task created"}


@router.put("/tasks/{task_id}")
def edit_task(task_id: int, request: TaskEdit, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    employee = db.get(User, request.employee_id)
    if not employee or employee.role != "employee" or not employee.is_active:
        raise HTTPException(404, "Active employee not found")
    if request.status not in ("Pending", "In Progress", "Completed"):
        raise HTTPException(400, "Invalid task status")
    task.employee_id = request.employee_id
    task.title = request.title.strip()
    task.description = request.description
    task.task_date = request.task_date
    task.status = request.status
    db.commit()
    return {"message": "Task updated"}