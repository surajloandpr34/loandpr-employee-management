
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from .database import Base


# ============================================================
# USERS / EMPLOYEES
# ============================================================

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    full_name: Mapped[str] = mapped_column(
        String(150), nullable=False
    )

    employee_id: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )

    mobile: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )

    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=False
    )

    role: Mapped[str] = mapped_column(
        String(20), default="employee", nullable=False
    )

    department: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )

    # Employee birthday; optional for existing records.
    date_of_birth: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    attendance = relationship(
        "Attendance",
        back_populates="employee",
        cascade="all, delete-orphan",
    )

    tasks = relationship(
        "Task",
        back_populates="employee",
        cascade="all, delete-orphan",
    )

    leaves = relationship(
        "LeaveRequest",
        back_populates="employee",
        cascade="all, delete-orphan",
    )

    leave_balance = relationship(
        "LeaveBalance",
        back_populates="employee",
        uselist=False,
        cascade="all, delete-orphan",
    )

    password_reset_otps = relationship(
        "PasswordResetOTP",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    announcement_reads = relationship(
        "AnnouncementRead",
        back_populates="employee",
        cascade="all, delete-orphan",
    )


# ============================================================
# ATTENDANCE
# ============================================================

class Attendance(Base):
    __tablename__ = "attendance"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    employee_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )

    attendance_date: Mapped[date] = mapped_column(
        Date, nullable=False
    )

    check_in: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True
    )

    check_out: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(30), default="Present", nullable=False
    )

    employee = relationship(
        "User", back_populates="attendance"
    )


# ============================================================
# TASKS
# ============================================================

class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    employee_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )

    title: Mapped[str] = mapped_column(
        String(255), nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    task_date: Mapped[date] = mapped_column(
        Date, nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30), default="Pending", nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    employee = relationship(
        "User", back_populates="tasks"
    )


# ============================================================
# LEAVE REQUESTS
# ============================================================

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    employee_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )

    from_date: Mapped[date] = mapped_column(
        Date, nullable=False
    )

    to_date: Mapped[date] = mapped_column(
        Date, nullable=False
    )

    leave_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )

    reason: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(30), default="Pending", nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    employee = relationship(
        "User", back_populates="leaves"
    )


# ============================================================
# LEAVE BALANCE
# ============================================================

class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    employee_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
        index=True,
    )

    annual_leave: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )

    used_leave: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    employee = relationship(
        "User", back_populates="leave_balance"
    )


# ============================================================
# COMPANY HOLIDAYS
# ============================================================

class Holiday(Base):
    __tablename__ = "holidays"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    holiday_date: Mapped[date] = mapped_column(
        Date, nullable=False, unique=True
    )

    name: Mapped[str] = mapped_column(
        String(150), nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )


# ============================================================
# PASSWORD RESET OTP
# ============================================================

class PasswordResetOTP(Base):
    __tablename__ = "password_reset_otps"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )

    otp_hash: Mapped[str] = mapped_column(
        String(64), nullable=False, index=True
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False
    )

    attempts: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )

    verified_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True
    )

    reset_token_hash: Mapped[str | None] = mapped_column(
        String(64), nullable=True, unique=True, index=True
    )

    reset_token_expires_at: Mapped[datetime | None] = (
        mapped_column(DateTime, nullable=True)
    )

    used_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    user = relationship(
        "User", back_populates="password_reset_otps"
    )


# ============================================================
# ANNOUNCEMENTS
# ============================================================

class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    title: Mapped[str] = mapped_column(
        String(200), nullable=False
    )

    content: Mapped[str] = mapped_column(
        Text, nullable=False
    )

    # General announcements can be read by all active employees.
    # Optional targeting can be added later if required.
    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    reads = relationship(
        "AnnouncementRead",
        back_populates="announcement",
        cascade="all, delete-orphan",
    )


# ============================================================
# PER-EMPLOYEE ANNOUNCEMENT READ STATUS
# ============================================================

class AnnouncementRead(Base):
    __tablename__ = "announcement_reads"

    __table_args__ = (
        UniqueConstraint(
            "announcement_id",
            "employee_id",
            name="uq_announcement_read_employee",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    announcement_id: Mapped[int] = mapped_column(
        ForeignKey("announcements.id"),
        nullable=False,
        index=True,
    )

    employee_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    read_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    announcement = relationship(
        "Announcement", back_populates="reads"
    )

    employee = relationship(
        "User", back_populates="announcement_reads"
    )


# ============================================================
# ACTIVITY FEED
# ============================================================

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    # Actor: admin, manager, or employee who performed the action.
    actor_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Optional employee the event relates to.
    employee_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    event_type: Mapped[str] = mapped_column(
        String(60), nullable=False, index=True
    )

    title: Mapped[str] = mapped_column(
        String(200), nullable=False
    )

    description: Mapped[str] = mapped_column(
        Text, nullable=False
    )

    # Explicit flag so admin actions can be highlighted in the UI.
    is_admin_notice: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False, index=True
    )
