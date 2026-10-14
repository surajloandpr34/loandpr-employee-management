
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Calendar,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  FileText,
  UsersRound,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function getStoredAuth() {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

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

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(`${dateValue}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLongDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(`${dateValue}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateValue) {
  if (!dateValue) return "—";

  return new Date(dateValue).toLocaleTimeString("en-IN", {
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
  if (status === "Completed") {
    return "bg-emerald-50 text-emerald-600";
  }

  if (status === "In Progress") {
    return "bg-blue-50 text-blue-600";
  }

  return "bg-red-50 text-red-500";
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const auth = useMemo(() => getStoredAuth(), []);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  async function loadDashboard() {
    if (!auth.token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/employee/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("access_token");
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
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleAttendance(action) {
    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/employee/attendance/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Unable to update attendance.");
      }

      await loadDashboard();
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
        leaveBalance.annual_leave - leaveBalance.used_leave,
        0
      )
    : null;

  return (
    <div className="w-full min-w-0">
      <main className="w-full">
        {/* Greeting */}
        <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm text-slate-400">
              {dashboard?.today
                ? formatLongDate(dashboard.today)
                : "—"}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {getGreeting()}, {user?.full_name || "Employee"}!
            </h1>

            <p className="mt-2 text-base text-slate-500">
              Here's what's happening with your work today.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <span className="text-xl leading-none">+</span>
            View Tasks
          </button>
        </section>

        {/* Error and loading */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && !dashboard && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
            Loading your dashboard...
          </div>
        )}

        {/* Summary cards */}
        <section className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {/* Attendance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Attendance
                </p>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {attendance
                    ? formatTime(attendance.check_in)
                    : "Not marked"}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {attendance ? "Check-in time" : "No check-in recorded"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CalendarCheck2 className="h-5 w-5" />
              </div>
            </div>

            {!attendance && (
              <button
                type="button"
                disabled={actionLoading || loading}
                onClick={() => handleAttendance("check-in")}
                className="mt-4 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading ? "Please wait..." : "Check In"}
              </button>
            )}

            {attendance && !attendance.check_out && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleAttendance("check-out")}
                className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? "Please wait..." : "Check Out"}
              </button>
            )}
          </div>

          {/* Tasks */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Today's Tasks
                </p>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {taskTotal}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {completedTasks} Completed
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Leave balance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Leave Balance
                </p>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {remainingLeave !== null ? remainingLeave : "—"}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {leaveBalance ? "Days Left" : "Not available"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Upcoming holiday */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-400">
                  Upcoming Holiday
                </p>

                <p className="mt-3 truncate text-base font-bold text-slate-900">
                  {holidays[0]?.name || "No holiday available"}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {holidays[0]
                    ? formatDate(holidays[0].holiday_date)
                    : "Not available"}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* Progress and tasks */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          {/* Work progress */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Today's Work Progress
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Your task completion overview
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-8 md:flex-row">
              <div
                className="relative flex h-48 w-48 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#16a34a ${completionPercentage}%, #e5e7eb ${completionPercentage}% 100%)`,
                }}
              >
                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                  <p className="text-3xl font-bold text-slate-900">
                    {completionPercentage}%
                  </p>
                  <p className="text-xs text-slate-400">Completed</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-500">Completed</span>
                  <span className="ml-8 font-bold text-slate-800">
                    {completedTasks}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-slate-500">In Progress</span>
                  <span className="ml-4 font-bold text-slate-800">
                    {inProgressTasks}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm text-slate-500">Pending</span>
                  <span className="ml-8 font-bold text-slate-800">
                    {pendingTasks}
                  </span>
                </div>
              </div>
            </div>

            {taskTotal === 0 && (
              <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
                No task data is available yet.
              </div>
            )}
          </div>

          {/* Today's tasks */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Today's Tasks
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Your work for today
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/tasks")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {tasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                  <BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 font-semibold text-slate-700">
                    No tasks assigned today
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Your assigned work will appear here.
                  </p>
                </div>
              ) : (
                tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3"
                  >
                    {task.status === "Completed" ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                    ) : task.status === "In Progress" ? (
                      <Clock3 className="h-5 w-5 shrink-0 text-blue-500" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                    )}

                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                      {task.title}
                    </p>

                    <span
                      className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${getTaskStatusClass(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>

                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Attendance and holidays */}
        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Today's Attendance
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Your attendance record for today
                </p>
              </div>

              <Clock3 className="h-6 w-6 text-blue-500" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Status</p>
                <p className="mt-2 font-bold text-slate-800">
                  {attendance?.status || "Not marked"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Check In</p>
                <p className="mt-2 font-bold text-slate-800">
                  {formatTime(attendance?.check_in)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Check Out</p>
                <p className="mt-2 font-bold text-slate-800">
                  {formatTime(attendance?.check_out)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Upcoming Holidays
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Company holiday calendar
                </p>
              </div>

              <CalendarDays className="h-6 w-6 text-purple-500" />
            </div>

            <div className="mt-5 space-y-3">
              {holidays.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                  <CalendarDays className="mx-auto h-7 w-7 text-slate-300" />
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    No upcoming holidays available
                  </p>
                </div>
              ) : (
                holidays.slice(0, 3).map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center gap-4 rounded-xl border border-slate-100 p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                      <Calendar className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">
                        {holiday.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(holiday.holiday_date)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Leave information */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Leave Information
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Your actual leave balance and requests
              </p>
            </div>

            <UsersRound className="h-6 w-6 text-orange-500" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-orange-50 p-5">
              <p className="text-sm text-orange-600">Annual Leave</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {leaveBalance ? leaveBalance.annual_leave : "—"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Used Leave</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {leaveBalance ? leaveBalance.used_leave : "—"}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-5">
              <p className="text-sm text-emerald-600">Remaining Leave</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {remainingLeave !== null ? remainingLeave : "—"}
              </p>
            </div>
          </div>

          {leaveRequests.length === 0 && (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-500">
              No leave requests have been recorded for this employee.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
