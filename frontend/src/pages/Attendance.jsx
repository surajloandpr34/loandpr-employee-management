
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck2,
  Clock3,
  LogOut,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function getStoredAuth() {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  return token ? { access_token: token } : null;
}

function clearStoredAuth() {
  const keys = ["access_token", "token", "user"];
  [localStorage, sessionStorage].forEach((storage) =>
    keys.forEach((key) => storage.removeItem(key))
  );
}

function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatLongDate(value) {
  if (!value) return "Today";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Today";

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function calculateWorkingDuration(checkIn, checkOut) {
  if (!checkIn || !checkOut) return "—";

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return "—";
  }

  const totalMinutes = Math.floor((end - start) / 60000);
  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
}

export default function Attendance() {
  const navigate = useNavigate();
  const auth = useMemo(() => getStoredAuth(), []);

  const [attendance, setAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAttendance = useCallback(async () => {
    if (!auth?.access_token) {
      setError("Please log in to view your attendance.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/employee/calendar`,
        {
          headers: {
            Authorization: `Bearer ${auth.access_token}`,
          },
        }
      );

      if (response.status === 401) {
        clearStoredAuth();
        navigate("/login", { replace: true });
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || "Unable to load attendance records."
        );
      }

      const records = Array.isArray(data?.attendance)
        ? data.attendance
        : [];
      const currentDate = data?.today || "";

      setToday(currentDate);
      setHistory(records);
      setAttendance(
        records.find((record) => record.date === currentDate) || null
      );
    } catch (err) {
      setError(err.message || "Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  }, [auth, navigate]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

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

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.access_token}`,
        },
      });

      if (response.status === 401) {
        clearStoredAuth();
        navigate("/login", { replace: true });
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || `Unable to ${action.replace("-", " ")}.`
        );
      }

      setSuccess(
        action === "check-in"
          ? "Check-in marked successfully."
          : "Check-out marked successfully."
      );

      await loadAttendance();
    } catch (err) {
      setError(err.message || "Attendance action failed.");
    } finally {
      setActionLoading(false);
    }
  }

  const hasCheckedIn = Boolean(attendance?.check_in);
  const hasCheckedOut = Boolean(attendance?.check_out);
  const workingDuration = calculateWorkingDuration(
    attendance?.check_in,
    attendance?.check_out
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      {/* Compact heading */}
      <section className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#102338] to-[#164e78] px-5 py-4 text-white shadow-md">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            <CalendarCheck2 className="h-4 w-4" />
            Attendance Management
          </p>
          <h1 className="mt-1 text-xl font-bold">My Attendance</h1>
          <p className="mt-1 text-sm text-slate-300">
            {formatLongDate(today)}
          </p>
        </div>

        <button
          type="button"
          onClick={loadAttendance}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </section>

      {error && (
        <div
          role="alert"
          className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700"
        >
          {success}
        </div>
      )}

      {loading ? (
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
          <div className="min-h-48 animate-pulse rounded-2xl bg-white" />
          <div className="min-h-48 animate-pulse rounded-2xl bg-white" />
        </div>
      ) : (
        <>
          {/* Attendance cards */}
          <section className="grid shrink-0 gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Today's record
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">
                    {hasCheckedOut
                      ? "Day completed"
                      : hasCheckedIn
                        ? "Currently checked in"
                        : "Not checked in"}
                  </h2>
                </div>
                <div className="rounded-xl bg-cyan-50 p-3 text-cyan-700">
                  <Clock3 className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ["Check In", formatTime(attendance?.check_in)],
                  ["Check Out", formatTime(attendance?.check_out)],
                  ["Work Time", workingDuration],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 break-words text-base font-bold text-slate-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => markAttendance("check-in")}
                  disabled={actionLoading || hasCheckedIn}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                >
                  <CalendarCheck2 className="h-4 w-4" />
                  {actionLoading && !hasCheckedIn
                    ? "Processing..."
                    : hasCheckedIn
                      ? "Checked In"
                      : "Check In"}
                </button>

                <button
                  type="button"
                  onClick={() => markAttendance("check-out")}
                  disabled={actionLoading || !hasCheckedIn || hasCheckedOut}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#102338] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1b3d5c] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                >
                  <LogOut className="h-4 w-4" />
                  {actionLoading && hasCheckedIn
                    ? "Processing..."
                    : hasCheckedOut
                      ? "Checked Out"
                      : "Check Out"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Attendance summary
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Today's status
              </h2>

              <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">Status</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      hasCheckedOut
                        ? "bg-slate-200 text-slate-700"
                        : hasCheckedIn
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {attendance?.status || (hasCheckedIn ? "Present" : "Not marked")}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
                  <span className="text-sm text-slate-500">Check-in time</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatTime(attendance?.check_in)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
                  <span className="text-sm text-slate-500">Check-out time</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatTime(attendance?.check_out)}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Attendance information is loaded from the employee portal.
              </p>
            </div>
          </section>

          {/* History gets its own scroll area */}
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
              <div>
                <h2 className="font-bold text-slate-900">Attendance History</h2>
                <p className="text-xs text-slate-500">
                  Your available attendance records
                </p>
              </div>
              <span className="shrink-0 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                {history.length} record{history.length === 1 ? "" : "s"}
              </span>
            </div>

            {history.length === 0 ? (
              <div className="flex min-h-24 flex-1 flex-col items-center justify-center p-4 text-center">
                <CalendarCheck2 className="h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  No attendance records yet
                </p>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full min-w-[620px] border-collapse text-left">
                  <thead className="sticky top-0 z-[1] bg-slate-50">
                    <tr>
                      {["Date", "Status", "Check In", "Check Out", "Work Time"].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {[...history].reverse().map((record, index) => (
                      <tr
                        key={`${record.date || "record"}-${record.check_in || index}`}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-800">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {record.status || "—"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {formatTime(record.check_in)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {formatTime(record.check_out)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-700">
                          {calculateWorkingDuration(record.check_in, record.check_out)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
