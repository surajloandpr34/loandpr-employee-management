import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarCheck2,
  CalendarDays,
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

      if (!value) continue;

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

function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatLongDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function calculateWorkingDuration(checkIn, checkOut) {
  if (!checkIn || !checkOut) {
    return "-";
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const difference = end.getTime() - start.getTime();

  if (difference <= 0) {
    return "-";
  }

  const totalMinutes = Math.floor(
    difference / (1000 * 60),
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
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

function Attendance() {
  const navigate = useNavigate();

  const auth = useMemo(() => getStoredAuth(), []);

  const [attendance, setAttendance] = useState(null);
  const [history, setHistory] = useState([]);

  const [today, setToday] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  async function loadAttendance() {
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
          data?.detail ||
            "Unable to load attendance data.",
        );
      }

      const data = await response.json();

      const records = data.attendance || [];

      setToday(data.today || "");
      setHistory(records);

      const todayRecord = records.find(
        (item) => item.date === data.today,
      );

      setAttendance(todayRecord || null);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Something went wrong while loading attendance.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAttendance();
  }, []);

  async function markAttendance(action) {
    if (!auth?.access_token) {
      navigate("/login");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const endpoint =
        action === "check-in"
          ? "/api/employee/attendance/check-in"
          : "/api/employee/attendance/check-out";

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "POST",
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

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            `Unable to ${action.replace("-", " ")}.`,
        );
      }

      setAttendance(data);

      setSuccess(
        action === "check-in"
          ? "Check-in marked successfully."
          : "Check-out marked successfully.",
      );

      await loadAttendance();
    } catch (requestError) {
      setError(
        requestError.message ||
          "Attendance action failed.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  function handleLogout() {
    clearStoredAuth();
    navigate("/login");
  }

  function closeMobileSidebar() {
    setMobileSidebarOpen(false);
  }

  const workingDuration = calculateWorkingDuration(
    attendance?.check_in,
    attendance?.check_out,
  );

  const hasCheckedIn = Boolean(attendance?.check_in);
  const hasCheckedOut = Boolean(attendance?.check_out);

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
              active
              onClick={closeMobileSidebar}
            />

            <SidebarItem
              icon={CalendarDays}
              label="Leaves"
              to="/leaves"
              onClick={closeMobileSidebar}
            />

            <SidebarItem
              icon={CalendarDays}
              label="Holidays"
              to="/holidays"
              onClick={closeMobileSidebar}
            />

            <SidebarItem
              icon={CalendarDays}
              label="Calendar"
              to="/calendar"
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
                  Attendance
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-cyan-600" />

                  <span className="text-sm font-medium text-slate-600">
                    {today
                      ? formatLongDate(today)
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
          {/* Intro */}
          <section className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#071a36] to-[#0b3158] p-6 text-white shadow-lg md:p-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2 text-cyan-300">
                  <CalendarCheck2 className="h-5 w-5" />

                  <span className="text-sm font-semibold uppercase tracking-wider">
                    Attendance Management
                  </span>
                </div>

                <h2 className="text-2xl font-bold md:text-3xl">
                  Manage Your Attendance
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                  Mark your daily check-in and check-out and
                  review your attendance history.
                </p>
              </div>
            </div>
          </section>

          {/* Alerts */}
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
              {success}
            </div>
          )}

          {loading ? (
            <div className="space-y-6">
              <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
              <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm" />
            </div>
          ) : (
            <>
              {/* Today's Attendance */}
              <section className="mb-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">
                        Today's Attendance
                      </p>

                      <h2 className="mt-2 text-2xl font-bold text-slate-900">
                        {today
                          ? formatLongDate(today)
                          : "Today"}
                      </h2>

                      <div className="mt-4">
                        {attendance ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                            {attendance.status}
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">
                            Not checked in
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                      <CalendarCheck2 className="h-8 w-8" />
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock3 className="h-4 w-4" />

                        <span className="text-xs font-semibold uppercase tracking-wide">
                          Check In
                        </span>
                      </div>

                      <p className="mt-3 text-xl font-bold text-slate-900">
                        {formatTime(
                          attendance?.check_in,
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock3 className="h-4 w-4" />

                        <span className="text-xs font-semibold uppercase tracking-wide">
                          Check Out
                        </span>
                      </div>

                      <p className="mt-3 text-xl font-bold text-slate-900">
                        {formatTime(
                          attendance?.check_out,
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock3 className="h-4 w-4" />

                        <span className="text-xs font-semibold uppercase tracking-wide">
                          Working Time
                        </span>
                      </div>

                      <p className="mt-3 text-xl font-bold text-slate-900">
                        {workingDuration}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() =>
                        markAttendance("check-in")
                      }
                      disabled={
                        actionLoading ||
                        hasCheckedIn
                      }
                      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition ${
                        hasCheckedIn
                          ? "cursor-not-allowed bg-slate-100 text-slate-400"
                          : "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-600"
                      }`}
                    >
                      <CalendarCheck2 className="h-5 w-5" />

                      {actionLoading && !hasCheckedIn
                        ? "Processing..."
                        : hasCheckedIn
                          ? "Checked In"
                          : "Check In"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        markAttendance("check-out")
                      }
                      disabled={
                        actionLoading ||
                        !hasCheckedIn ||
                        hasCheckedOut
                      }
                      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition ${
                        !hasCheckedIn ||
                        hasCheckedOut
                          ? "cursor-not-allowed bg-slate-100 text-slate-400"
                          : "bg-[#071a36] text-white hover:bg-[#0b3158]"
                      }`}
                    >
                      <LogOut className="h-5 w-5" />

                      {actionLoading && hasCheckedIn
                        ? "Processing..."
                        : hasCheckedOut
                          ? "Checked Out"
                          : "Check Out"}
                    </button>
                  </div>
                </div>

                {/* Status Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Current Status
                  </p>

                  <div className="mt-6 flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                        hasCheckedOut
                          ? "bg-slate-100 text-slate-600"
                          : hasCheckedIn
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      <Clock3 className="h-7 w-7" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {hasCheckedOut
                          ? "Day completed"
                          : hasCheckedIn
                            ? "Currently checked in"
                            : "Not checked in"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {hasCheckedOut
                          ? "Your attendance has been checked out for today."
                          : hasCheckedIn
                            ? "You can check out when your workday is complete."
                            : "Use Check In to mark today's attendance."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-xl bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Today's Record
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-500">
                          Status
                        </span>

                        <span className="text-sm font-semibold text-slate-900">
                          {attendance?.status || "-"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-500">
                          Check In
                        </span>

                        <span className="text-sm font-semibold text-slate-900">
                          {formatTime(
                            attendance?.check_in,
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-500">
                          Check Out
                        </span>

                        <span className="text-sm font-semibold text-slate-900">
                          {formatTime(
                            attendance?.check_out,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Attendance History */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-6 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Attendance History
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Attendance records available in the system.
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600">
                    {history.length} record
                    {history.length === 1 ? "" : "s"}
                  </div>
                </div>

                {history.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <CalendarCheck2 className="mx-auto h-12 w-12 text-slate-200" />

                    <h3 className="mt-4 text-lg font-semibold text-slate-700">
                      No attendance records
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      No attendance record is available yet.
                      Once you check in, your actual record will
                      appear here.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-[700px]">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Date
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Status
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Check In
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Check Out
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Working Time
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {history
                            .slice()
                            .reverse()
                            .map((record) => (
                              <tr
                                key={`${record.date}-${record.check_in || "attendance"}`}
                                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                              >
                                <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                  {formatDate(
                                    record.date,
                                  )}
                                </td>

                                <td className="px-6 py-4">
                                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    {record.status || "-"}
                                  </span>
                                </td>

                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {formatTime(
                                    record.check_in,
                                  )}
                                </td>

                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {formatTime(
                                    record.check_out,
                                  )}
                                </td>

                                <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                  {calculateWorkingDuration(
                                    record.check_in,
                                    record.check_out,
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="space-y-3 p-4 md:hidden">
                      {history
                        .slice()
                        .reverse()
                        .map((record) => (
                          <div
                            key={`${record.date}-${record.check_in || "attendance-mobile"}`}
                            className="rounded-xl border border-slate-200 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {formatDate(
                                    record.date,
                                  )}
                                </p>

                                <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                  {record.status || "-"}
                                </span>
                              </div>

                              <CalendarCheck2 className="h-5 w-5 text-cyan-600" />
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-xs text-slate-500">
                                  Check In
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                  {formatTime(
                                    record.check_in,
                                  )}
                                </p>
                              </div>

                              <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-xs text-slate-500">
                                  Check Out
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                  {formatTime(
                                    record.check_out,
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Attendance;