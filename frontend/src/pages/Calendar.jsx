
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Palmtree,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function getToken() {
  const storages = [localStorage, sessionStorage];

  for (const storage of storages) {
    for (const key of ["access_token", "token", "authToken", "employeeToken"]) {
      const token = storage.getItem(key);
      if (token) return token;
    }

    for (const key of [
      "employeeAuth",
      "auth",
      "employee_auth",
      "userAuth",
      "sessionAuth",
    ]) {
      const value = storage.getItem(key);
      if (!value) continue;

      try {
        const parsed = JSON.parse(value);
        const token = parsed?.access_token || parsed?.token;
        if (token) return token;
      } catch {
        // Ignore invalid JSON.
      }
    }
  }

  return null;
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDate(value) {
  if (!value) return null;

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "Not recorded";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function StatusDot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 sm:text-xs">
      <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function DetailCard({ icon: Icon, label, title, color, children }) {
  return (
    <div className={`rounded-lg border p-2 ${color}`}>
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />

        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-wide opacity-80">
            {label}
          </p>

          <h3 className="mt-0.5 break-words text-xs font-bold">{title}</h3>

          {children}
        </div>
      </div>
    </div>
  );
}

export default function Calendar() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    today: "",
    attendance: [],
    tasks: [],
    leaves: [],
    holidays: [],
  });

  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() =>
    dateKey(new Date()),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCalendar() {
    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/employee/calendar`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        setError("Your session has expired. Please log in again.");
        return;
      }

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.detail || "Unable to load calendar.");
      }

      const normalized = {
        today: String(result?.today || "").slice(0, 10),
        attendance: Array.isArray(result?.attendance)
          ? result.attendance
          : [],
        tasks: Array.isArray(result?.tasks) ? result.tasks : [],
        leaves: Array.isArray(result?.leaves) ? result.leaves : [],
        holidays: Array.isArray(result?.holidays) ? result.holidays : [],
      };

      setData(normalized);

      if (normalized.today) {
        setSelectedDate(normalized.today);

        const todayDate = parseDate(normalized.today);
        if (todayDate) setMonth(todayDate);
      }
    } catch (requestError) {
      setError(requestError.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCalendar();
  }, []);

  const monthLabel = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(month);

  const days = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const cells = [];

    for (let index = 0; index < firstWeekday; index += 1) {
      const date = new Date(year, monthIndex, index - firstWeekday + 1);
      cells.push({ date, key: dateKey(date), inMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, monthIndex, day);
      cells.push({ date, key: dateKey(date), inMonth: true });
    }

    let nextDay = 1;

    while (cells.length < 42) {
      const date = new Date(year, monthIndex + 1, nextDay++);
      cells.push({ date, key: dateKey(date), inMonth: false });
    }

    return cells;
  }, [month]);

  const attendanceByDate = useMemo(() => {
    const map = {};

    data.attendance.forEach((item) => {
      const key = String(item.date || "").slice(0, 10);
      if (key) map[key] = item;
    });

    return map;
  }, [data.attendance]);

  const holidayByDate = useMemo(() => {
    const map = {};

    data.holidays.forEach((item) => {
      const key = String(item.date || "").slice(0, 10);
      if (key) map[key] = item;
    });

    return map;
  }, [data.holidays]);

  const tasksByDate = useMemo(() => {
    const map = {};

    data.tasks.forEach((task) => {
      const key = String(task.date || "").slice(0, 10);
      if (!key) return;

      if (!map[key]) map[key] = [];
      map[key].push(task);
    });

    return map;
  }, [data.tasks]);

  const leavesByDate = useMemo(() => {
    const map = {};

    data.leaves.forEach((leave) => {
      if (!leave.from_date || !leave.to_date) return;

      let current = parseDate(leave.from_date);
      const end = parseDate(leave.to_date);
      let count = 0;

      while (current && end && current <= end && count < 370) {
        const key = dateKey(current);

        if (!map[key]) map[key] = [];
        map[key].push(leave);

        current.setDate(current.getDate() + 1);
        count += 1;
      }
    });

    return map;
  }, [data.leaves]);

  const selectedAttendance = attendanceByDate[selectedDate];
  const selectedHoliday = holidayByDate[selectedDate];
  const selectedTasks = tasksByDate[selectedDate] || [];
  const selectedLeaves = leavesByDate[selectedDate] || [];

  function goToMonth(offset) {
    setMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + offset, 1),
    );
  }

  function goToToday() {
    const today = data.today || dateKey(new Date());
    setSelectedDate(today);

    const todayDate = parseDate(today);
    if (todayDate) setMonth(todayDate);
  }

  function getDayMarkers(key) {
    return [
      holidayByDate[key] && "bg-cyan-500",
      attendanceByDate[key] && "bg-emerald-500",
      leavesByDate[key]?.length && "bg-amber-500",
      tasksByDate[key]?.length && "bg-violet-500",
    ].filter(Boolean);
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden bg-slate-50 p-2 text-slate-900">
      {/* Compact header */}
      <section className="flex shrink-0 items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-[#071a36] to-[#0b3158] px-3 py-2.5 text-white shadow-sm">
        <div className="flex min-w-0 items-center gap-2">
          <div className="hidden rounded-lg bg-white/10 p-2 sm:block">
            <CalendarDays className="h-5 w-5 text-cyan-200" />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-cyan-200">
              Employee Portal
            </p>
            <h1 className="text-lg font-bold sm:text-xl">Work Calendar</h1>
            <p className="hidden text-[10px] text-slate-300 sm:block">
              Attendance, tasks, leave and company holidays
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={goToToday}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100"
        >
          <CalendarCheck2 className="h-3.5 w-3.5" />
          Today
        </button>
      </section>

      {error && (
        <div
          role="alert"
          className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700"
        >
          <p>{error}</p>

          {error.toLowerCase().includes("log in") ? (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-md bg-red-700 px-3 py-1.5 font-semibold text-white"
            >
              Go to Login
            </button>
          ) : (
            <button
              type="button"
              onClick={loadCalendar}
              className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2 py-1.5 font-semibold"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      )}

      {/* Compact legend */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
        <StatusDot color="bg-cyan-500" label="Holiday" />
        <StatusDot color="bg-emerald-500" label="Attendance" />
        <StatusDot color="bg-amber-500" label="Leave" />
        <StatusDot color="bg-violet-500" label="Task" />
      </div>

      {/* Remaining screen area */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden xl:grid-cols-[minmax(0,1.5fr)_minmax(250px,0.8fr)]">
        {loading ? (
          <>
            <div className="min-h-0 animate-pulse rounded-xl bg-white" />
            <div className="min-h-0 animate-pulse rounded-xl bg-white" />
          </>
        ) : (
          <>
            {/* Calendar grid: no scrolling */}
            <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <div className="mb-1 flex shrink-0 items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold sm:text-lg">
                    {monthLabel}
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    Select a date
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => goToMonth(-1)}
                    aria-label="Previous month"
                    className="rounded-md border border-slate-200 p-1.5 hover:border-cyan-300 hover:text-cyan-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => goToMonth(1)}
                    aria-label="Next month"
                    className="rounded-md border border-slate-200 p-1.5 hover:border-cyan-300 hover:text-cyan-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid shrink-0 grid-cols-7">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="py-1 text-center text-[9px] font-semibold uppercase text-slate-400 sm:text-[10px]"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 overflow-hidden rounded-md border-l border-t border-slate-200">
                {days.map((cell) => {
                  const today = cell.key === data.today;
                  const selected = cell.key === selectedDate;
                  const markers = getDayMarkers(cell.key);

                  return (
                    <button
                      type="button"
                      key={cell.key}
                      onClick={() => setSelectedDate(cell.key)}
                      aria-label={`Select ${formatDate(cell.key)}`}
                      aria-pressed={selected}
                      className={`flex min-h-0 min-w-0 flex-col items-start overflow-hidden border-b border-r border-slate-200 p-0.5 text-left transition sm:p-1 ${
                        cell.inMonth
                          ? "bg-white hover:bg-slate-50"
                          : "bg-slate-50 text-slate-300"
                      } ${selected ? "ring-2 ring-inset ring-cyan-500" : ""}`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold sm:h-6 sm:w-6 sm:text-[11px] ${
                          today
                            ? "bg-cyan-600 text-white"
                            : cell.inMonth
                              ? "text-slate-700"
                              : "text-slate-300"
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>

                      <div className="mt-0.5 flex min-h-1 flex-wrap gap-0.5">
                        {markers.map((color, index) => (
                          <span
                            key={`${cell.key}-${index}`}
                            className={`h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5 ${color}`}
                          />
                        ))}
                      </div>

                      {holidayByDate[cell.key] && (
                        <span className="hidden max-w-full truncate text-[8px] font-medium text-cyan-700 sm:block">
                          {holidayByDate[cell.key].name}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Selected date details: no scrolling */}
            <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="shrink-0 border-b border-slate-200 px-3 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-cyan-700">
                  Selected Date
                </p>

                <h2 className="mt-0.5 text-sm font-bold sm:text-base">
                  {formatDate(selectedDate)}
                </h2>

                {selectedDate === data.today && (
                  <span className="mt-1 inline-flex rounded-full bg-cyan-50 px-2 py-0.5 text-[9px] font-semibold text-cyan-700">
                    Today
                  </span>
                )}
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-2">
                {selectedHoliday && (
                  <DetailCard
                    icon={Palmtree}
                    label="Company Holiday"
                    title={selectedHoliday.name}
                    color="border-cyan-100 bg-cyan-50 text-cyan-900"
                  >
                    {selectedHoliday.description && (
                      <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-[10px] leading-4 text-slate-600">
                        {selectedHoliday.description}
                      </p>
                    )}
                  </DetailCard>
                )}

                {selectedAttendance && (
                  <DetailCard
                    icon={CalendarCheck2}
                    label="Attendance"
                    title={selectedAttendance.status || "Recorded"}
                    color="border-emerald-100 bg-emerald-50 text-emerald-900"
                  >
                    <p className="mt-1 text-[10px] text-slate-600">
                      In: {formatTime(selectedAttendance.check_in)}
                    </p>
                    <p className="text-[10px] text-slate-600">
                      Out: {formatTime(selectedAttendance.check_out)}
                    </p>
                  </DetailCard>
                )}

                {selectedLeaves.map((leave, index) => (
                  <DetailCard
                    key={leave.id ?? `${leave.from_date}-${index}`}
                    icon={CalendarDays}
                    label="Leave"
                    title={leave.leave_type || "Leave request"}
                    color="border-amber-100 bg-amber-50 text-amber-900"
                  >
                    <p className="mt-1 text-[10px] text-slate-600">
                      {formatDate(leave.from_date)} – {formatDate(leave.to_date)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-600">
                      Status: {leave.status || "Pending"}
                    </p>
                  </DetailCard>
                ))}

                {selectedTasks.map((task, index) => (
                  <DetailCard
                    key={task.id ?? `${task.title}-${index}`}
                    icon={FileText}
                    label="Task"
                    title={task.title || "Assigned task"}
                    color="border-violet-100 bg-violet-50 text-violet-900"
                  >
                    <p className="mt-1 text-[10px] text-slate-600">
                      {task.status || "Status unavailable"}
                    </p>
                  </DetailCard>
                ))}

                {!selectedHoliday &&
                  !selectedAttendance &&
                  selectedLeaves.length === 0 &&
                  selectedTasks.length === 0 && (
                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
                      <Clock3 className="h-6 w-6 text-slate-300" />
                      <h3 className="mt-1 text-xs font-semibold text-slate-800">
                        No activity recorded
                      </h3>
                      <p className="mt-1 text-[10px] leading-4 text-slate-500">
                        No attendance, task, leave or holiday on this date.
                      </p>
                    </div>
                  )}
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
