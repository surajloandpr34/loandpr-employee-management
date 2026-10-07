import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar as CalendarIcon,
  CalendarCheck2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Home,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function getStoredAuth() {
  const possibleKeys = [
    "employeeAuth",
    "auth",
    "employee_auth",
    "userAuth",
    "sessionAuth",
  ];

  const storages = [localStorage, sessionStorage];

  for (const storage of storages) {
    for (const key of possibleKeys) {
      const value = storage.getItem(key);

      if (!value) {
        continue;
      }

      try {
        const parsed = JSON.parse(value);

        if (parsed?.access_token) {
          return parsed;
        }

        if (parsed?.token) {
          return {
            ...parsed,
            access_token: parsed.token,
          };
        }
      } catch {
        // Ignore invalid JSON.
      }
    }
  }

  const tokenKeys = [
    "access_token",
    "token",
    "employeeToken",
  ];

  for (const storage of storages) {
    for (const key of tokenKeys) {
      const token = storage.getItem(key);

      if (token) {
        return {
          access_token: token,
        };
      }
    }
  }

  return null;
}

function clearStoredAuth() {
  const keys = [
    "employeeAuth",
    "auth",
    "employee_auth",
    "userAuth",
    "sessionAuth",
    "access_token",
    "token",
    "employeeToken",
  ];

  for (const storage of [localStorage, sessionStorage]) {
    keys.forEach((key) => storage.removeItem(key));
  }
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(dateString) {
  if (!dateString) {
    return null;
  }

  return new Date(`${dateString}T00:00:00`);
}

function formatLongDate(dateString) {
  const date = parseDate(dateString);

  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatShortDate(dateString) {
  const date = parseDate(dateString);

  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(dateTimeString) {
  if (!dateTimeString) {
    return "-";
  }

  const date = new Date(dateTimeString);

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function SidebarItem({
  icon: Icon,
  label,
  to,
  active = false,
  onClick,
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
        active
          ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

function Calendar() {
  const navigate = useNavigate();

  const auth = useMemo(() => getStoredAuth(), []);

  const [calendarData, setCalendarData] = useState({
    today: "",
    attendance: [],
    tasks: [],
    leaves: [],
    holidays: [],
  });

  const [currentMonth, setCurrentMonth] = useState(
    new Date(),
  );

  const [selectedDate, setSelectedDate] = useState(
    toDateKey(new Date()),
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  useEffect(() => {
    async function loadCalendar() {
      if (!auth?.access_token) {
        setError(
          "Your session has expired. Please login again.",
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/employee/calendar`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${auth.access_token}`,
            },
          },
        );

        if (response.status === 401) {
          clearStoredAuth();
          navigate("/login");
          return;
        }

        if (!response.ok) {
          const data = await response.json().catch(() => null);

          throw new Error(
            data?.detail || "Unable to load calendar data.",
          );
        }

        const data = await response.json();

        setCalendarData({
          today: data.today || "",
          attendance: data.attendance || [],
          tasks: data.tasks || [],
          leaves: data.leaves || [],
          holidays: data.holidays || [],
        });

        if (data.today) {
          setSelectedDate(data.today);

          const todayDate = parseDate(data.today);

          if (todayDate) {
            setCurrentMonth(todayDate);
          }
        }
      } catch (requestError) {
        setError(
          requestError.message ||
            "Something went wrong while loading calendar.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCalendar();
  }, [auth, navigate]);

  const monthLabel = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();

    const daysInMonth = new Date(
      year,
      month + 1,
      0,
    ).getDate();

    const daysInPreviousMonth = new Date(
      year,
      month,
      0,
    ).getDate();

    const cells = [];

    // Previous month dates
    for (let index = firstWeekday - 1; index >= 0; index -= 1) {
      const day = daysInPreviousMonth - index;

      const date = new Date(
        year,
        month - 1,
        day,
      );

      cells.push({
        date,
        key: toDateKey(date),
        currentMonth: false,
      });
    }

    // Current month dates
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);

      cells.push({
        date,
        key: toDateKey(date),
        currentMonth: true,
      });
    }

    // Next month dates
    let nextDay = 1;

    while (cells.length < 42) {
      const date = new Date(
        year,
        month + 1,
        nextDay,
      );

      cells.push({
        date,
        key: toDateKey(date),
        currentMonth: false,
      });

      nextDay += 1;
    }

    return cells;
  }, [currentMonth]);

  const attendanceByDate = useMemo(() => {
    const map = {};

    calendarData.attendance.forEach((item) => {
      map[item.date] = item;
    });

    return map;
  }, [calendarData.attendance]);

  const holidayByDate = useMemo(() => {
    const map = {};

    calendarData.holidays.forEach((item) => {
      map[item.date] = item;
    });

    return map;
  }, [calendarData.holidays]);

  const tasksByDate = useMemo(() => {
    const map = {};

    calendarData.tasks.forEach((task) => {
      if (!map[task.date]) {
        map[task.date] = [];
      }

      map[task.date].push(task);
    });

    return map;
  }, [calendarData.tasks]);

  function isDateInsideLeave(dateKey) {
    return calendarData.leaves.some((leave) => {
      return (
        dateKey >= leave.from_date &&
        dateKey <= leave.to_date
      );
    });
  }

  function getLeaveForDate(dateKey) {
    return calendarData.leaves.find((leave) => {
      return (
        dateKey >= leave.from_date &&
        dateKey <= leave.to_date
      );
    });
  }

  const selectedAttendance =
    attendanceByDate[selectedDate] || null;

  const selectedHoliday =
    holidayByDate[selectedDate] || null;

  const selectedTasks =
    tasksByDate[selectedDate] || [];

  const selectedLeave =
    getLeaveForDate(selectedDate);

  const selectedDateObject = parseDate(selectedDate);

  const selectedDateLabel = selectedDateObject
    ? new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(selectedDateObject)
    : "Select a date";

  function goToPreviousMonth() {
    setCurrentMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() - 1,
          1,
        ),
    );
  }

  function goToNextMonth() {
    setCurrentMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + 1,
          1,
        ),
    );
  }

  function goToToday() {
    const todayDate = parseDate(calendarData.today);

    if (!todayDate) {
      const now = new Date();

      setCurrentMonth(now);
      setSelectedDate(toDateKey(now));

      return;
    }

    setCurrentMonth(todayDate);
    setSelectedDate(calendarData.today);
  }

  function handleLogout() {
    clearStoredAuth();
    navigate("/login");
  }

  function closeMobileSidebar() {
    setMobileSidebarOpen(false);
  }

  function getDayStatus(dateKey) {
    const status = [];

    if (holidayByDate[dateKey]) {
      status.push("holiday");
    }

    if (attendanceByDate[dateKey]) {
      status.push("attendance");
    }

    if (isDateInsideLeave(dateKey)) {
      status.push("leave");
    }

    if (tasksByDate[dateKey]?.length) {
      status.push("task");
    }

    return status;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col bg-[#071a36] transition-transform duration-300 ${
          mobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-[88px] items-center justify-between border-b border-white/10 px-6">
          <Link
            to="/employee-dashboard"
            onClick={closeMobileSidebar}
            className="flex items-center"
          >
            <img
              src="/logo.png"
              alt="LoanDPR Creditum Management"
              className="h-14 w-auto object-contain"
            />
          </Link>

          <button
            type="button"
            onClick={closeMobileSidebar}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Main Menu
          </p>

          <nav className="space-y-1">
            <SidebarItem
              icon={Home}
              label="Dashboard"
              to="/employee-dashboard"
              onClick={closeMobileSidebar}
            />

            <SidebarItem
              icon={FileText}
              label="My Tasks"
              to="/tasks"
              onClick={closeMobileSidebar}
            />

            <SidebarItem
              icon={CalendarCheck2}
              label="Attendance"
              to="/attendance"
              onClick={closeMobileSidebar}
            />

            <SidebarItem
              icon={CalendarDays}
              label="Leaves"
              to="/leaves"
              onClick={closeMobileSidebar}
            />

            <SidebarItem
              icon={CalendarIcon}
              label="Holidays"
              to="/holidays"
              onClick={closeMobileSidebar}
            />

            <SidebarItem
              icon={CalendarDays}
              label="Calendar"
              to="/calendar"
              active
              onClick={closeMobileSidebar}
            />

            <SidebarItem
              icon={Bell}
              label="Announcements"
              to="/announcements"
              onClick={closeMobileSidebar}
            />

            <SidebarItem
              icon={UserRound}
              label="Profile"
              to="/profile"
              onClick={closeMobileSidebar}
            />
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="min-h-screen lg:ml-[270px]">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-[88px] items-center justify-between px-5 md:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Employee Portal
                </p>

                <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
                  Calendar
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-cyan-600" />

                  <span className="text-sm font-medium text-slate-600">
                    {calendarData.today
                      ? formatLongDate(calendarData.today)
                      : "Loading..."}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="relative rounded-xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:border-cyan-300 hover:text-cyan-600"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />

                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-500" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-5 md:p-8">
          {/* Page Intro */}
          <section className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#071a36] to-[#0b3158] p-6 text-white shadow-lg md:p-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2 text-cyan-300">
                  <CalendarIcon className="h-5 w-5" />

                  <span className="text-sm font-semibold uppercase tracking-wider">
                    Work Calendar
                  </span>
                </div>

                <h2 className="text-2xl font-bold md:text-3xl">
                  Your Work Calendar
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                  Track your attendance, tasks, leave and company
                  holidays from one place.
                </p>
              </div>

              <button
                type="button"
                onClick={goToToday}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <CalendarCheck2 className="h-4 w-4" />
                Today
              </button>
            </div>
          </section>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
              <div className="h-[650px] animate-pulse rounded-2xl bg-white shadow-sm" />
              <div className="h-[650px] animate-pulse rounded-2xl bg-white shadow-sm" />
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="mb-5 flex flex-wrap gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-3 w-3 rounded-full bg-cyan-500" />
                  Holiday
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  Attendance
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  Leave
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-3 w-3 rounded-full bg-violet-500" />
                  Task
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
                {/* Calendar */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  {/* Calendar Header */}
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {monthLabel}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Select a date to view details
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={goToPreviousMonth}
                        className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:border-cyan-300 hover:text-cyan-600"
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        onClick={goToToday}
                        className="hidden rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-600 sm:block"
                      >
                        Today
                      </button>

                      <button
                        type="button"
                        onClick={goToNextMonth}
                        className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:border-cyan-300 hover:text-cyan-600"
                        aria-label="Next month"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Week Days */}
                  <div className="mb-2 grid grid-cols-7">
                    {[
                      "Sun",
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                    ].map((day) => (
                      <div
                        key={day}
                        className="py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-slate-200">
                    {calendarDays.map((cell) => {
                      const statuses = getDayStatus(cell.key);
                      const isToday =
                        cell.key === calendarData.today;
                      const isSelected =
                        cell.key === selectedDate;

                      return (
                        <button
                          type="button"
                          key={cell.key}
                          onClick={() =>
                            setSelectedDate(cell.key)
                          }
                          className={`relative min-h-[82px] border-b border-r border-slate-100 p-2 text-left transition sm:min-h-[100px] ${
                            cell.currentMonth
                              ? "bg-white hover:bg-slate-50"
                              : "bg-slate-50/70"
                          } ${
                            isSelected
                              ? "ring-2 ring-inset ring-cyan-500"
                              : ""
                          }`}
                        >
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                              isToday
                                ? "bg-cyan-500 text-white"
                                : cell.currentMonth
                                  ? "text-slate-700"
                                  : "text-slate-300"
                            }`}
                          >
                            {cell.date.getDate()}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-1">
                            {statuses.includes("holiday") && (
                              <span className="h-2 w-2 rounded-full bg-cyan-500" />
                            )}

                            {statuses.includes("attendance") && (
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            )}

                            {statuses.includes("leave") && (
                              <span className="h-2 w-2 rounded-full bg-amber-500" />
                            )}

                            {statuses.includes("task") && (
                              <span className="h-2 w-2 rounded-full bg-violet-500" />
                            )}
                          </div>

                          {holidayByDate[cell.key] && (
                            <p className="mt-2 hidden truncate text-[10px] font-medium text-cyan-700 sm:block">
                              {holidayByDate[cell.key].name}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Selected Date */}
                <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600">
                      Selected Date
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-slate-900">
                      {selectedDateLabel}
                    </h2>
                  </div>

                  <div className="space-y-5 p-6">
                    {/* Holiday */}
                    {selectedHoliday && (
                      <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4">
                        <div className="flex gap-3">
                          <div className="rounded-lg bg-cyan-100 p-2 text-cyan-700">
                            <CalendarIcon className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                              Company Holiday
                            </p>

                            <h3 className="mt-1 font-bold text-slate-900">
                              {selectedHoliday.name}
                            </h3>

                            {selectedHoliday.description && (
                              <p className="mt-1 text-sm leading-5 text-slate-600">
                                {selectedHoliday.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Attendance */}
                    {selectedAttendance && (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                        <div className="flex gap-3">
                          <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                            <CalendarCheck2 className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                              Attendance
                            </p>

                            <h3 className="mt-1 font-bold text-slate-900">
                              {selectedAttendance.status}
                            </h3>

                            <p className="mt-1 text-sm text-slate-600">
                              Check-in:{" "}
                              {formatTime(
                                selectedAttendance.check_in,
                              )}
                            </p>

                            <p className="text-sm text-slate-600">
                              Check-out:{" "}
                              {formatTime(
                                selectedAttendance.check_out,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Leave */}
                    {selectedLeave && (
                      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                        <div className="flex gap-3">
                          <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                            <CalendarDays className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                              Leave
                            </p>

                            <h3 className="mt-1 font-bold text-slate-900">
                              {selectedLeave.leave_type}
                            </h3>

                            <p className="mt-1 text-sm text-slate-600">
                              {formatShortDate(
                                selectedLeave.from_date,
                              )}{" "}
                              —{" "}
                              {formatShortDate(
                                selectedLeave.to_date,
                              )}
                            </p>

                            <span className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {selectedLeave.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tasks */}
                    {selectedTasks.length > 0 && (
                      <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
                        <div className="flex gap-3">
                          <div className="rounded-lg bg-violet-100 p-2 text-violet-700">
                            <FileText className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                              Tasks
                            </p>

                            <div className="mt-2 space-y-2">
                              {selectedTasks.map((task) => (
                                <div
                                  key={task.id}
                                  className="rounded-lg bg-white p-3"
                                >
                                  <p className="font-semibold text-slate-800">
                                    {task.title}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {task.status}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Empty selected date */}
                    {!selectedHoliday &&
                      !selectedAttendance &&
                      !selectedLeave &&
                      selectedTasks.length === 0 && (
                        <div className="py-10 text-center">
                          <CalendarIcon className="mx-auto h-10 w-10 text-slate-200" />

                          <h3 className="mt-4 font-semibold text-slate-700">
                            No activity recorded
                          </h3>

                          <p className="mt-1 text-sm leading-5 text-slate-500">
                            There are no attendance, task, leave or
                            holiday records for this date.
                          </p>
                        </div>
                      )}
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Calendar;