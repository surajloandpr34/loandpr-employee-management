
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  LogIn,
  LogOut,
  RefreshCw,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

// LoanDPR attendance policy
const LATE_AFTER = "09:35";
const HALF_DAY_AFTER = "11:00";

const IST_TIME_ZONE = "Asia/Kolkata";

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
}

function clearAuth() {
  for (const storage of [localStorage, sessionStorage]) {
    ["access_token", "token", "user"].forEach((key) =>
      storage.removeItem(key)
    );
  }
}

function isTimezoneAware(value) {
  return /[zZ]$|[+-]\d{2}:\d{2}$/.test(String(value || ""));
}

// Backend stores local India timestamps without timezone.
// Extract the stored time directly to avoid browser timezone shifts.
function getISTClock(value) {
  if (!value) return null;

  const text = String(value);

  if (!isTimezoneAware(text)) {
    const match = text.match(/[T ](\d{2}):(\d{2})/);

    if (!match) return null;

    return `${match[1]}:${match[2]}`;
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function formatTime(value) {
  const clock = getISTClock(value);

  if (!clock) return "—";

  const [hourText, minute] = clock.split(":");
  const hour = Number(hourText);

  return `${String(hour % 12 || 12).padStart(2, "0")}:${minute} ${
    hour >= 12 ? "PM" : "AM"
  }`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(
    `${String(value).slice(0, 10)}T12:00:00`
  );

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLongDate(value) {
  if (!value) return "Today";

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return "Today";

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getTimestamp(value) {
  if (!value) return null;

  const text = String(value);

  // Treat naive backend timestamps as IST.
  const normalized = isTimezoneAware(text)
    ? text
    : `${text.replace(" ", "T")}+05:30`;

  const date = new Date(normalized);

  return Number.isNaN(date.getTime())
    ? null
    : date.getTime();
}

function getDurationMinutes(checkIn, checkOut) {
  const start = getTimestamp(checkIn);
  const end = getTimestamp(checkOut);

  if (start === null || end === null || end <= start) {
    return null;
  }

  return Math.floor((end - start) / 60000);
}

function formatMinutes(minutes) {
  if (minutes === null || minutes === undefined) {
    return "—";
  }

  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function getAttendanceRemark(checkIn) {
  const clock = getISTClock(checkIn);

  if (!clock) return "Not Marked";

  if (clock > HALF_DAY_AFTER) return "Half Day";

  if (clock > LATE_AFTER) return "Late";

  return "On Time";
}

function getRemarkStyle(remark) {
  switch (remark) {
    case "On Time":
      return "bg-emerald-50 text-emerald-700";
    case "Late":
      return "bg-amber-50 text-amber-700";
    case "Half Day":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getCurrentISTMonth() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;

  return `${year}-${month}`;
}

function downloadCSV(records, month) {
  const headers = [
    "Date",
    "Attendance Status",
    "Check In",
    "Check Out",
    "Working Minutes",
    "Arrival Remark",
    "Missing Checkout",
  ];

  const escapeCSV = (value) => {
    const text = String(value ?? "");

    // Prevent spreadsheet formula injection.
    const safeText = /^[=+\-@\t\r]/.test(text)
      ? `'${text}`
      : text;

    return `"${safeText.replace(/"/g, '""')}"`;
  };

  const rows = records.map((record) => [
    record.date,
    record.status || "—",
    formatTime(record.check_in),
    formatTime(record.check_out),
    getDurationMinutes(
      record.check_in,
      record.check_out
    ) ?? "",
    getAttendanceRemark(record.check_in),
    record.check_in && !record.check_out
      ? "Yes"
      : "No",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `LoanDPR_Attendance_${month}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-2.5 ${color}`}>
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

export default function Attendance() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [today, setToday] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    getCurrentISTMonth()
  );

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const logout = useCallback(() => {
    clearAuth();
    navigate("/login", { replace: true });
  }, [navigate]);

  const loadAttendance = useCallback(
    async (showLoading = true) => {
      const token = getToken();

      if (!token) {
        logout();
        return;
      }

      if (showLoading) setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/employee/calendar`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          logout();
          return;
        }

        if (!response.ok) {
          throw new Error(
            typeof data.detail === "string"
              ? data.detail
              : "Unable to load attendance."
          );
        }

        setToday(data.today || "");

        setHistory(
          Array.isArray(data.attendance)
            ? data.attendance
            : []
        );
      } catch (err) {
        setError(
          err.message || "Attendance load failed."
        );
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [logout]
  );

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const todayRecord = useMemo(
    () => history.find((record) => record.date === today),
    [history, today]
  );

  const hasCheckedIn = Boolean(todayRecord?.check_in);
  const hasCheckedOut = Boolean(todayRecord?.check_out);

  const monthlyRecords = useMemo(() => {
    return history
      .filter((record) =>
        String(record.date || "").startsWith(selectedMonth)
      )
      .sort((a, b) =>
        String(b.date).localeCompare(String(a.date))
      );
  }, [history, selectedMonth]);

  const summary = useMemo(() => {
    const checkedIn = monthlyRecords.filter(
      (record) => Boolean(record.check_in)
    );

    const completed = checkedIn.filter(
      (record) => Boolean(record.check_out)
    );

    const late = checkedIn.filter(
      (record) =>
        getAttendanceRemark(record.check_in) === "Late"
    );

    const halfDay = checkedIn.filter(
      (record) =>
        getAttendanceRemark(record.check_in) === "Half Day"
    );

    const onTime = checkedIn.filter(
      (record) =>
        getAttendanceRemark(record.check_in) === "On Time"
    );

    const missingCheckout = checkedIn.filter(
      (record) =>
        !record.check_out && record.date < today
    );

    const totalMinutes = monthlyRecords.reduce(
      (total, record) =>
        total +
        (getDurationMinutes(
          record.check_in,
          record.check_out
        ) ?? 0),
      0
    );

    return {
      present: checkedIn.length,
      completed: completed.length,
      onTime: onTime.length,
      late: late.length,
      halfDay: halfDay.length,
      missingCheckout: missingCheckout.length,
      totalMinutes,
    };
  }, [monthlyRecords, today]);

  const availableMonths = useMemo(() => {
    const months = new Set(
      history
        .map((record) =>
          String(record.date || "").slice(0, 7)
        )
        .filter((month) =>
          /^\d{4}-\d{2}$/.test(month)
        )
    );

    months.add(getCurrentISTMonth());
    months.add(selectedMonth);

    return [...months].sort().reverse();
  }, [history, selectedMonth]);

  async function markAttendance(action) {
    const token = getToken();

    if (!token) {
      logout();
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const endpoint =
        action === "check-in"
          ? "/employee/attendance/check-in"
          : "/employee/attendance/check-out";

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Attendance action failed."
        );
      }

      await loadAttendance(false);

      setSuccess(
        action === "check-in"
          ? "Check-in marked successfully."
          : "Check-out marked successfully."
      );
    } catch (err) {
      setError(
        err.message || "Attendance action failed."
      );
    } finally {
      setActionLoading(false);
    }
  }

  const todayRemark = getAttendanceRemark(
    todayRecord?.check_in
  );

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <div className="mx-auto max-w-7xl space-y-4 pb-8">
        {/* HEADER */}
        <section className="rounded-2xl bg-gradient-to-r from-[#102338] to-[#164e78] p-5 text-white shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <CalendarCheck2 size={16} />
                Employee Portal
              </p>

              <h1 className="mt-2 text-2xl font-extrabold">
                My Attendance
              </h1>

              <p className="mt-1 text-sm text-slate-200">
                {formatLongDate(today)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccess("");
                loadAttendance();
              }}
              disabled={loading || actionLoading}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </section>

        {/* MESSAGES */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
          >
            {success}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">
            Loading attendance...
          </div>
        ) : (
          <>
            {/* TODAY'S ATTENDANCE */}
            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Today's Attendance
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      {hasCheckedOut
                        ? "Day Completed"
                        : hasCheckedIn
                          ? "Currently Checked In"
                          : "Not Checked In"}
                    </h2>
                  </div>

                  <Clock3
                    className="text-blue-600"
                    size={24}
                  />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    [
                      "Check In",
                      formatTime(todayRecord?.check_in),
                    ],
                    [
                      "Check Out",
                      formatTime(todayRecord?.check_out),
                    ],
                    [
                      "Work Time",
                      formatMinutes(
                        getDurationMinutes(
                          todayRecord?.check_in,
                          todayRecord?.check_out
                        )
                      ),
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="min-w-0 rounded-xl bg-slate-50 p-3"
                    >
                      <p className="text-xs text-slate-500">
                        {label}
                      </p>

                      <p className="mt-2 break-words text-sm font-bold text-slate-900">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      markAttendance("check-in")
                    }
                    disabled={
                      actionLoading || hasCheckedIn
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-3 py-3 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    <LogIn size={17} />
                    {hasCheckedIn
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
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#102338] px-3 py-3 text-sm font-semibold text-white hover:bg-[#1b3d5c] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    <LogOut size={17} />
                    {hasCheckedOut
                      ? "Checked Out"
                      : "Check Out"}
                  </button>
                </div>
              </section>

              {/* TODAY'S STATUS */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Attendance Status
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Today's Summary
                </h2>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                    <span className="text-sm text-slate-500">
                      Database Status
                    </span>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {todayRecord?.status ||
                        "Not Marked"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                    <span className="text-sm text-slate-500">
                      Arrival Remark
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getRemarkStyle(
                        todayRemark
                      )}`}
                    >
                      {todayRemark}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                    <span className="text-sm text-slate-500">
                      Check-in Time
                    </span>

                    <span className="text-sm font-bold text-slate-900">
                      {formatTime(todayRecord?.check_in)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                    <span className="text-sm text-slate-500">
                      Check-out Time
                    </span>

                    <span className="text-sm font-bold text-slate-900">
                      {formatTime(todayRecord?.check_out)}
                    </span>
                  </div>

                  {hasCheckedIn &&
                    !hasCheckedOut && (
                      <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                        <AlertTriangle
                          size={17}
                          className="shrink-0"
                        />
                        Remember to check out when
                        your working day ends.
                      </div>
                    )}

                  {todayRemark === "Late" && (
                    <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                      <Clock3
                        size={17}
                        className="shrink-0"
                      />
                      Check-in was after 9:35 AM.
                      Arrival marked Late.
                    </div>
                  )}

                  {todayRemark === "Half Day" && (
                    <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-800">
                      <AlertTriangle
                        size={17}
                        className="shrink-0"
                      />
                      Check-in was after 11:00 AM.
                      Arrival marked Half Day.
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* MONTHLY REPORT */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <CalendarDays
                      size={20}
                      className="text-blue-700"
                    />
                    Monthly Attendance Report
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Summary of available attendance records
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Select month"
                    value={selectedMonth}
                    onChange={(event) =>
                      setSelectedMonth(event.target.value)
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                  >
                    {availableMonths.map((month) => (
                      <option
                        key={month}
                        value={month}
                      >
                        {new Date(
                          `${month}-01T12:00:00`
                        ).toLocaleDateString("en-IN", {
                          month: "long",
                          year: "numeric",
                        })}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      downloadCSV(
                        monthlyRecords,
                        selectedMonth
                      )
                    }
                    disabled={
                      monthlyRecords.length === 0
                    }
                    className="flex items-center gap-2 rounded-xl bg-blue-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatCard
                  label="Days Checked In"
                  value={summary.present}
                  icon={CalendarCheck2}
                  color="bg-blue-50 text-blue-700"
                />

                <StatCard
                  label="On Time"
                  value={summary.onTime}
                  icon={CheckCircle2}
                  color="bg-emerald-50 text-emerald-700"
                />

                <StatCard
                  label="Late"
                  value={summary.late}
                  icon={Clock3}
                  color="bg-amber-50 text-amber-700"
                />

                <StatCard
                  label="Half Day"
                  value={summary.halfDay}
                  icon={AlertTriangle}
                  color="bg-red-50 text-red-700"
                />

                <StatCard
                  label="Completed Shifts"
                  value={summary.completed}
                  icon={CheckCircle2}
                  color="bg-teal-50 text-teal-700"
                />

                <StatCard
                  label="Total Work Time"
                  value={formatMinutes(
                    summary.totalMinutes
                  )}
                  icon={Clock3}
                  color="bg-violet-50 text-violet-700"
                />
              </div>

              {summary.missingCheckout > 0 && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                  {summary.missingCheckout} previous
                  attendance record(s) have no checkout time.
                  Contact your admin if a correction is needed.
                </div>
              )}

              <p className="mt-4 text-xs leading-5 text-slate-500">
                Arrival policy: On Time up to 9:35 AM,
                Late after 9:35 AM through 11:00 AM,
                and Half Day after 11:00 AM.
                These are calculated arrival remarks;
                official database status is shown separately.
              </p>
            </section>

            {/* ATTENDANCE HISTORY */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 sm:p-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Attendance History
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Records for the selected month
                  </p>
                </div>

                <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                  {monthlyRecords.length} Records
                </span>
              </div>

              {monthlyRecords.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <CalendarCheck2
                    size={36}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No attendance records for this month.
                  </p>
                </div>
              ) : (
                <div className="max-h-[420px] overflow-auto">
                  <table className="w-full min-w-[780px] border-collapse text-left">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr>
                        {[
                          "Date",
                          "DB Status",
                          "Check In",
                          "Check Out",
                          "Work Time",
                          "Arrival Remark",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {monthlyRecords.map(
                        (record, index) => {
                          const remark =
                            getAttendanceRemark(
                              record.check_in
                            );

                          const missingCheckout =
                            record.check_in &&
                            !record.check_out &&
                            record.date < today;

                          return (
                            <tr
                              key={`${record.date}-${index}`}
                              className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                            >
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-800">
                                {formatDate(
                                  record.date
                                )}
                              </td>

                              <td className="px-4 py-3 text-sm text-slate-600">
                                {record.status || "—"}
                              </td>

                              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                                {formatTime(
                                  record.check_in
                                )}
                              </td>

                              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                                {formatTime(
                                  record.check_out
                                )}
                              </td>

                              <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-700">
                                {formatMinutes(
                                  getDurationMinutes(
                                    record.check_in,
                                    record.check_out
                                  )
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex flex-col items-start gap-1">
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getRemarkStyle(
                                      remark
                                    )}`}
                                  >
                                    {remark}
                                  </span>

                                  {missingCheckout && (
                                    <span className="text-xs font-semibold text-red-600">
                                      Missing Checkout
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
