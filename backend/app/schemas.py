from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    employee_id: str = Field(min_length=2, max_length=50)
    email: EmailStr
    mobile: str | None = Field(default=None, max_length=20)
    password: str = Field(min_length=8, max_length=128)
    role: Literal["employee", "manager", "admin"] = "employee"


class LoginRequest(BaseModel):
    login_id: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: int
    full_name: str
    employee_id: str
    email: EmailStr
    mobile: str | None
    role: str
    department: str | None
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class AttendanceResponse(BaseModel):
    id: int
    attendance_date: date
    check_in: datetime | None
    check_out: datetime | None
    status: str

    class Config:
        from_attributes = True


class TaskResponse(BaseModel):
    id: int
    employee_id: int
    title: str
    description: str | None
    task_date: date
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TaskCreateRequest(BaseModel):
    employee_id: int = Field(gt=0)
    title: str = Field(min_length=2, max_length=255)
    description: str | None = Field(
        default=None,
        max_length=2000,
    )
    task_date: date


class TaskUpdateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str | None = Field(
        default=None,
        max_length=2000,
    )
    task_date: date
    status: Literal[
        "Pending",
        "In Progress",
        "Completed",
    ]


class TaskStatusUpdate(BaseModel):
    status: Literal[
        "Pending",
        "In Progress",
        "Completed",
    ]


class LeaveResponse(BaseModel):
    id: int
    from_date: date
    to_date: date
    leave_type: str
    reason: str | None
    status: str

    class Config:
        from_attributes = True


class LeaveBalanceResponse(BaseModel):
    id: int
    annual_leave: int
    used_leave: int

    class Config:
        from_attributes = True


class HolidayResponse(BaseModel):
    id: int
    holiday_date: date
    name: str
    description: str | None

    class Config:
        from_attributes = True


class CalendarAttendance(BaseModel):
    date: date
    status: str
    check_in: datetime | None
    check_out: datetime | None


class CalendarTask(BaseModel):
    id: int
    date: date
    title: str
    status: str


class CalendarLeave(BaseModel):
    id: int
    from_date: date
    to_date: date
    leave_type: str
    status: str


class CalendarHoliday(BaseModel):
    id: int
    date: date
    name: str
    description: str | None


class EmployeeCalendarResponse(BaseModel):
    today: date
    attendance: list[CalendarAttendance]
    tasks: list[CalendarTask]
    leaves: list[CalendarLeave]
    holidays: list[CalendarHoliday]


class EmployeeDashboardResponse(BaseModel):
    user: UserResponse
    today: date
    attendance: AttendanceResponse | None
    today_tasks: list[TaskResponse]
    leave_requests: list[LeaveResponse]
    upcoming_holidays: list[HolidayResponse]
    leave_balance: LeaveBalanceResponse | None