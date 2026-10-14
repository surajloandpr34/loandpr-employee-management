
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ============================================================
# AUTHENTICATION
# ============================================================

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


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_token: str = Field(min_length=20, max_length=500)
    new_password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    id: int
    full_name: str
    employee_id: str
    email: EmailStr
    mobile: str | None
    role: str
    department: str | None
    date_of_birth: date | None = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ============================================================
# ADMIN EMPLOYEE MANAGEMENT
# ============================================================

class EmployeeCreateRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    employee_id: str = Field(min_length=2, max_length=50)
    email: EmailStr
    mobile: str | None = Field(default=None, max_length=20)
    department: str | None = Field(default=None, max_length=100)
    date_of_birth: date | None = None
    password: str = Field(min_length=8, max_length=128)


class EmployeeUpdateRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    mobile: str | None = Field(default=None, max_length=20)
    department: str | None = Field(default=None, max_length=100)
    date_of_birth: date | None = None


class EmployeeStatusUpdate(BaseModel):
    is_active: bool


class EmployeePasswordUpdate(BaseModel):
    new_password: str = Field(min_length=8, max_length=128)


class EmployeeResponse(UserResponse):
    created_at: datetime


# ============================================================
# EMPLOYEE PROFILE
# ============================================================

class EmployeeProfileUpdateRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    mobile: str | None = Field(default=None, max_length=20)
    date_of_birth: date | None = None


# ============================================================
# ATTENDANCE
# ============================================================

class AttendanceResponse(BaseModel):
    id: int
    attendance_date: date
    check_in: datetime | None
    check_out: datetime | None
    status: str

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# TASKS
# ============================================================

class TaskResponse(BaseModel):
    id: int
    employee_id: int
    title: str
    description: str | None
    task_date: date
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskCreateRequest(BaseModel):
    employee_id: int = Field(gt=0)
    title: str = Field(min_length=2, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    task_date: date


class TaskUpdateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    task_date: date
    status: Literal["Pending", "In Progress", "Completed"]


class TaskStatusUpdate(BaseModel):
    status: Literal["Pending", "In Progress", "Completed"]


# ============================================================
# LEAVES
# ============================================================

class LeaveCreateRequest(BaseModel):
    from_date: date
    to_date: date
    leave_type: str = Field(min_length=2, max_length=50)
    reason: str | None = Field(default=None, max_length=2000)


class LeaveResponse(BaseModel):
    id: int
    from_date: date
    to_date: date
    leave_type: str
    reason: str | None
    status: str

    model_config = ConfigDict(from_attributes=True)


class AdminLeaveResponse(BaseModel):
    id: int
    employee_id: int
    employee_name: str | None
    employee_code: str | None
    from_date: date
    to_date: date
    leave_type: str
    reason: str | None
    status: str
    created_at: datetime


class LeaveStatusUpdate(BaseModel):
    status: Literal["Approved", "Rejected"]


class LeaveBalanceResponse(BaseModel):
    id: int
    annual_leave: int
    used_leave: int

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# HOLIDAYS
# ============================================================

class HolidayResponse(BaseModel):
    id: int
    holiday_date: date
    name: str
    description: str | None

    model_config = ConfigDict(from_attributes=True)


class HolidayCreateRequest(BaseModel):
    holiday_date: date
    name: str = Field(min_length=1, max_length=150)
    description: str | None = Field(default=None, max_length=2000)


class HolidayUpdateRequest(BaseModel):
    holiday_date: date
    name: str = Field(min_length=1, max_length=150)
    description: str | None = Field(default=None, max_length=2000)


# ============================================================
# EMPLOYEE CALENDAR
# ============================================================

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


# ============================================================
# EMPLOYEE DASHBOARD
# ============================================================

class EmployeeDashboardResponse(BaseModel):
    user: UserResponse
    today: date
    attendance: AttendanceResponse | None
    today_tasks: list[TaskResponse]
    leave_requests: list[LeaveResponse]
    upcoming_holidays: list[HolidayResponse]
    leave_balance: LeaveBalanceResponse | None


# ============================================================
# ANNOUNCEMENTS
# ============================================================

class AnnouncementCreateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    content: str = Field(min_length=1, max_length=10000)


class AnnouncementUpdateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    content: str = Field(min_length=1, max_length=10000)
    is_active: bool = True


class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    created_by: int | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    is_read: bool = False

    model_config = ConfigDict(from_attributes=True)


class AnnouncementListResponse(BaseModel):
    announcements: list[AnnouncementResponse]
    unread_count: int


# ============================================================
# ACTIVITY FEED
# ============================================================

class ActivityResponse(BaseModel):
    id: int
    actor_id: int | None
    employee_id: int | None
    event_type: str
    title: str
    description: str
    is_admin_notice: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# BIRTHDAYS
# ============================================================

class BirthdayEmployeeResponse(BaseModel):
    id: int
    full_name: str
    employee_id: str
    department: str | None
    date_of_birth: date


class BirthdayListResponse(BaseModel):
    today: date
    birthdays: list[BirthdayEmployeeResponse]
