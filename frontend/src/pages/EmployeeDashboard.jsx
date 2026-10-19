
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  BriefcaseBusiness,
  Calendar,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  FileText,
  Gift,
  Megaphone,
  RefreshCw,
  UserRound,
  UsersRound,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function getStoredAuth() {
  const tokenKeys = ["access_token", "token", "authToken", "employeeToken"];

  let token = null;

  for (const key of tokenKeys) {
    token =
      localStorage.getItem(key) ||
      sessionStorage.getItem(key);

    if (token) break;
  }

  const userText =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  let user = null;

  try {
    user = userText ? JSON.parse(userText) : null;
  } catch {
    user = null;
  }

  return { token, user };
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLongDate(value) {
  if (!value) return "—";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatActivityDate(value) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getTaskStatusClass(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "completed") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (normalized === "in progress") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-amber-50 text-amber-700";
}

function getAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function getActivityIcon(eventType = "") {
  const type = eventType.toLowerCase();

  if (type.includes("announcement") || type.includes("notice")) {
    return Megaphone;
  }

  if (type.includes("profile") || type.includes("employee")) {
    return UserRound;
  }

  if (
    type.includes("attendance") ||
    type.includes("check_in") ||
    type.includes("check_out")
  ) {
    return CalendarCheck2;
  }

  if (type.includes("leave")) {
    return CalendarDays;
  }

  return Activity;
}

function SectionCard({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeading({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon && (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass = "bg-blue-50 text-blue-600",
  children,
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-2 truncate text-xl font-bold text-slate-900">
            {value}
          </p>
          <p className="mt-1 truncate text-xs text-slate-400">{subtitle}</p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {children}
    </div>
  );
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const auth = useMemo(() => getStoredAuth(), []);

  const [dashboard, setDashboard] = useState(null);
  const [birthdays, setBirthdays] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [extrasLoading, setExtrasLoading] = useState(true);
  const [error, setError] = useState("");
  const [extrasError, setExtrasError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!auth.token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/employee/dashboard`, {
        headers: getAuthHeaders(auth.token),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        const tokenKeys = [
          "access_token",
          "token",
          "authToken",
          "employeeToken",
        ];

        tokenKeys.forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });

        localStorage.removeItem("user");
        sessionStorage.removeItem("user");

        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load dashboard.");
      }

      setDashboard(data);
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [auth.token, navigate]);

  const loadDashboardExtras = useCallback(async () => {
    if (!auth.token) return;

    setExtrasLoading(true);
    setExtrasError("");

    const requests = [
      {
        key: "birthdays",
        url: `${API_URL}/api/employee/birthdays`,
      },
      {
        key: "announcements",
        url: `${API_URL}/api/employee/announcements`,
      },
      {
        key: "activity",
        url: `${API_URL}/api/employee/activity?limit=6`,
      },
    ];

    const results = await Promise.allSettled(
      requests.map(async (request) => {
        const response = await fetch(request.url, {
          headers: getAuthHeaders(auth.token),
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Your session may have expired. Please log in again."
          );
        }

        if (!response.ok) {
          throw new Error(data.detail || `Unable to load ${request.key}.`);
        }

        return { key: request.key, data };
      })
    );

    let failed = false;

    results.forEach((result) => {
      if (result.status !== "fulfilled") {
        failed = true;
        return;
      }

      const { key, data } = result.value;

      if (key === "birthdays") {
        setBirthdays(Array.isArray(data.birthdays) ? data.birthdays : []);
      }

      if (key === "announcements") {
        setUnreadCount(Number(data.unread_count || 0));
      }

      if (key === "activity") {
        setActivities(Array.isArray(data) ? data : []);
      }
    });

    if (failed) {
      setExtrasError(
        "Some dashboard updates could not be loaded. You can still use the main dashboard."
      );
    }

    setExtrasLoading(false);
  }, [auth.token]);

  useEffect(() => {
    loadDashboard();
    loadDashboardExtras();
  }, [loadDashboard, loadDashboardExtras]);

  async function handleAttendance(action) {
    if (!auth.token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/employee/attendance/${action}`,
        {
          method: "POST",
          headers: getAuthHeaders(auth.token),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Unable to update attendance.");
      }

      await loadDashboard();
      await loadDashboardExtras();
    } catch (err) {
      setError(err.message || "Unable to update attendance.");
    } finally {
      setActionLoading(false);
    }
  }

  const user = dashboard?.user || auth.user;
  const attendance = dashboard?.attendance;
  const tasks = dashboard?.today_tasks || [];
  const holidays = dashboard?.upcoming_holidays || [];
  const leaveRequests = dashboard?.leave_requests || [];
  const leaveBalance = dashboard?.leave_balance || null;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const taskTotal = tasks.length;

  const completionPercentage =
    taskTotal > 0
      ? Math.round((completedTasks / taskTotal) * 100)
      : 0;

  const remainingLeave = leaveBalance
    ? Math.max(
        Number(leaveBalance.annual_leave || 0) -
          Number(leaveBalance.used_leave || 0),
        0
      )
    : null;

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-5 pb-2">
      {/* Welcome header */}
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 xl:flex-row xl:items-center">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">
            {dashboard?.today ? formatLongDate(dashboard.today) : "Employee Workspace"}
          </p>

          <h1 className="mt-1.5 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {getGreeting()}, {user?.full_name || "Employee"}!
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            Here's what's happening with your work today.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate("/announcements")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Bell className="h-4 w-4" />
            Announcements
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <BriefcaseBusiness className="h-4 w-4" />
            View Tasks
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {extrasError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {extrasError}
        </div>
      )}

      {loading && !dashboard && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          Loading your dashboard...
        </div>
      )}

      {/* Summary cards */}
      <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <SummaryCard
          title="Attendance"
          value={attendance ? formatTime(attendance.check_in) : "Not marked"}
          subtitle={attendance ? "Check-in time" : "No check-in recorded"}
          icon={CalendarCheck2}
          iconClass="bg-emerald-50 text-emerald-600"
        >
          {!attendance && (
            <button
              type="button"
              disabled={actionLoading || loading}
              onClick={() => handleAttendance("check-in")}
              className="mt-3 w-full rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? "Please wait..." : "Check In"}
            </button>
          )}

          {attendance && !attendance.check_out && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleAttendance("check-out")}
              className="mt-3 w-full rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? "Please wait..." : "Check Out"}
            </button>
          )}
        </SummaryCard>

        <SummaryCard
          title="Today's Tasks"
          value={taskTotal}
          subtitle={`${completedTasks} completed`}
          icon={FileText}
          iconClass="bg-blue-50 text-blue-600"
        >
          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Open tasks →
          </button>
        </SummaryCard>

        <SummaryCard
          title="Leave Balance"
          value={remainingLeave !== null ? remainingLeave : "—"}
          subtitle={leaveBalance ? "Days remaining" : "Not available"}
          icon={CalendarDays}
          iconClass="bg-orange-50 text-orange-600"
        >
          <button
            type="button"
            onClick={() => navigate("/leaves")}
            className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View leaves →
          </button>
        </SummaryCard>

        <SummaryCard
          title="Upcoming Holiday"
          value={holidays[0]?.name || "No holiday"}
          subtitle={
            holidays[0] ? formatDate(holidays[0].holiday_date) : "Not available"
          }
          icon={Calendar}
          iconClass="bg-purple-50 text-purple-600"
        >
          <button
            type="button"
            onClick={() => navigate("/holidays")}
            className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Holiday calendar →
          </button>
        </SummaryCard>
      </section>

      {/* Birthdays and announcements */}
      <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard className="border-pink-100">
          <SectionHeading
            icon={Gift}
            title="Today's Birthdays"
            subtitle="Wish your teammates a happy birthday"
            action={
              <span className="shrink-0 rounded-full bg-pink-50 px-2.5 py-1 text-xs font-bold text-pink-700">
                {birthdays.length}
              </span>
            }
          />

          <div className="mt-4 space-y-2.5">
            {extrasLoading ? (
              <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">
                Checking today's birthdays...
              </p>
            ) : birthdays.length === 0 ? (
              <div className="rounded-lg border border-dashed border-pink-200 bg-pink-50/50 px-3 py-5 text-center">
                <Gift className="mx-auto h-6 w-6 text-pink-400" />
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  No birthdays today
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Employee birthdays will appear here when their date of birth matches today.
                </p>
              </div>
            ) : (
              birthdays.map((employee) => (
                <div
                  key={employee.id}
                  className="flex min-w-0 items-center gap-3 rounded-lg border border-pink-100 bg-pink-50/40 p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-700">
                    {(employee.full_name || "E").charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {employee.full_name || "Employee"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {employee.department || "Team member"}
                      {employee.employee_id ? ` • ${employee.employee_id}` : ""}
                    </p>
                  </div>

                  <span aria-label="Birthday" className="text-lg">
                    🎂
                  </span>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard className="border-blue-100">
          <SectionHeading
            icon={Bell}
            title="Announcements"
            subtitle="Company news and important notices"
            action={
              <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                {unreadCount} unread
              </span>
            }
          />

          <div className="mt-4 rounded-lg bg-blue-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <Megaphone className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  Stay up to date
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Check the announcements page for company news, policy updates, and important notices.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/announcements")}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              View Announcements
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </SectionCard>
      </section>

      {/* Work progress and tasks */}
      <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard>
          <SectionHeading
            icon={Activity}
            title="Today's Work Progress"
            subtitle="Your task completion overview"
          />

          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
            <div
              className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#16a34a ${completionPercentage}%, #e5e7eb ${completionPercentage}% 100%)`,
              }}
            >
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
                <p className="text-2xl font-bold text-slate-900">
                  {completionPercentage}%
                </p>
                <p className="text-[11px] text-slate-500">Completed</p>
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:max-w-[220px]">
              <div className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50 px-3 py-2.5">
                <span className="flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </span>
                <span className="font-bold text-emerald-800">
                  {completedTasks}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg bg-blue-50 px-3 py-2.5">
                <span className="flex items-center gap-2 text-xs text-blue-800">
                  <Clock3 className="h-4 w-4" />
                  In Progress
                </span>
                <span className="font-bold text-blue-800">
                  {inProgressTasks}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2.5">
                <span className="flex items-center gap-2 text-xs text-amber-800">
                  <Circle className="h-4 w-4" />
                  Pending
                </span>
                <span className="font-bold text-amber-800">
                  {pendingTasks}
                </span>
              </div>
            </div>
          </div>

          {taskTotal === 0 && (
            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-center text-xs text-slate-500">
              No task data is available yet.
            </p>
          )}
        </SectionCard>

        <SectionCard>
          <SectionHeading
            icon={BriefcaseBusiness}
            title="Today's Tasks"
            subtitle="Your assigned work"
            action={
              <button
                type="button"
                onClick={() => navigate("/tasks")}
                className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all →
              </button>
            }
          />

          <div className="mt-4 space-y-2.5">
            {tasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center">
                <BriefcaseBusiness className="mx-auto h-6 w-6 text-slate-400" />
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  No tasks assigned today
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Your assigned work will appear here.
                </p>
              </div>
            ) : (
              tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex min-w-0 items-center gap-2.5 rounded-lg border border-slate-100 px-3 py-2.5"
                >
                  {task.status === "Completed" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : task.status === "In Progress" ? (
                    <Clock3 className="h-4 w-4 shrink-0 text-blue-500" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-slate-400" />
                  )}

                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                    {task.title || "Untitled task"}
                  </p>

                  <span
                    className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold ${getTaskStatusClass(task.status)}`}
                  >
                    {task.status || "Pending"}
                  </span>

                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </section>

      {/* Attendance and holidays */}
      <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard>
          <SectionHeading
            icon={Clock3}
            title="Today's Attendance"
            subtitle="Your attendance record for today"
          />

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Status</p>
              <p className="mt-1.5 truncate text-sm font-bold text-slate-800">
                {attendance?.status || "Not marked"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Check In</p>
              <p className="mt-1.5 text-sm font-bold text-slate-800">
                {formatTime(attendance?.check_in)}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Check Out</p>
              <p className="mt-1.5 text-sm font-bold text-slate-800">
                {formatTime(attendance?.check_out)}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeading
            icon={CalendarDays}
            title="Upcoming Holidays"
            subtitle="Company holiday calendar"
            action={
              <button
                type="button"
                onClick={() => navigate("/holidays")}
                className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all →
              </button>
            }
          />

          <div className="mt-4 space-y-2.5">
            {holidays.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-5 text-center">
                <CalendarDays className="mx-auto h-6 w-6 text-slate-400" />
                <p className="mt-2 text-xs font-semibold text-slate-600">
                  No upcoming holidays available
                </p>
              </div>
            ) : (
              holidays.slice(0, 3).map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-100 p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <Calendar className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {holiday.name || "Holiday"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(holiday.holiday_date)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </section>

      {/* Recent activity */}
      <SectionCard>
        <SectionHeading
          icon={Activity}
          title="Recent Activity"
          subtitle="Recent updates and important company notices"
          action={
            <button
              type="button"
              onClick={loadDashboardExtras}
              disabled={extrasLoading}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${extrasLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {extrasLoading ? "Refreshing..." : "Refresh"}
              </span>
            </button>
          }
        />

        <div className="mt-4 space-y-2.5">
          {extrasLoading && activities.length === 0 ? (
            <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">
              Loading recent activity...
            </p>
          ) : activities.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-5 text-center">
              <Activity className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-700">
                No recent activity
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Relevant updates will appear here when recorded.
              </p>
            </div>
          ) : (
            activities.map((item) => {
              const Icon = getActivityIcon(item.event_type);
              const adminNotice = Boolean(item.is_admin_notice);

              return (
                <div
                  key={item.id}
                  className={`flex min-w-0 items-start gap-3 rounded-lg border p-3 ${
                    adminNotice
                      ? "border-amber-200 bg-amber-50/70"
                      : "border-slate-100 bg-white"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      adminNotice
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.title || "Activity update"}
                      </p>

                      {adminNotice && (
                        <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                          Admin Notice
                        </span>
                      )}
                    </div>

                    <p className="mt-1 break-words text-xs leading-5 text-slate-600">
                      {item.description || "An update was recorded."}
                    </p>

                    <p className="mt-1.5 text-[11px] text-slate-400">
                      {formatActivityDate(item.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SectionCard>

      {/* Leave information */}
      <SectionCard>
        <SectionHeading
          icon={UsersRound}
          title="Leave Information"
          subtitle="Your leave balance and recent requests"
          action={
            <button
              type="button"
              onClick={() => navigate("/leaves")}
              className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Manage leaves →
            </button>
          }
        />

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-orange-50 p-3.5">
            <p className="text-xs text-orange-700">Annual Leave</p>
            <p className="mt-1.5 text-xl font-bold text-slate-900">
              {leaveBalance ? leaveBalance.annual_leave : "—"}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-3.5">
            <p className="text-xs text-slate-600">Used Leave</p>
            <p className="mt-1.5 text-xl font-bold text-slate-900">
              {leaveBalance ? leaveBalance.used_leave : "—"}
            </p>
          </div>

          <div className="rounded-lg bg-emerald-50 p-3.5">
            <p className="text-xs text-emerald-700">Remaining Leave</p>
            <p className="mt-1.5 text-xl font-bold text-slate-900">
              {remainingLeave !== null ? remainingLeave : "—"}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {leaveRequests.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500">
              No leave requests have been recorded for this employee.
            </div>
          ) : (
            leaveRequests.slice(0, 3).map((leave) => (
              <div
                key={leave.id}
                className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {leave.leave_type || "Leave request"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(leave.from_date)} – {formatDate(leave.to_date)}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                  {leave.status || "Pending"}
                </span>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}
