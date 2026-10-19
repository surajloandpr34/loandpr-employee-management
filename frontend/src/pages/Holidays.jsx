
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CalendarCheck2,
  Clock3,
  Gift,
  RefreshCw,
  Calendar,
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
        // Ignore values that are not JSON.
      }
    }
  }

  return null;
}

function formatDate(value) {
  if (!value) return "Date not available";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Date not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getDay(value) {
  if (!value) return "--";
  return value.slice(8, 10);
}

function getMonth(value) {
  if (!value) return "---";

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "---";

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
  }).format(date);
}

function HolidayCard({ holiday, today }) {
  const holidayDate = String(holiday.holiday_date || "").slice(0, 10);
  const isToday = holidayDate === today;
  const isPast = Boolean(today) && holidayDate < today;

  return (
    <article className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-cyan-200 hover:shadow-sm sm:p-4">
      <div
        className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl ${
          isPast
            ? "bg-slate-100 text-slate-500"
            : "bg-cyan-50 text-cyan-700"
        }`}
      >
        <span className="text-lg font-bold leading-none">
          {getDay(holidayDate)}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase">
          {getMonth(holidayDate)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900">
            {holiday.name || "Company Holiday"}
          </h3>

          {isToday && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              Today
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-slate-500">
          {formatDate(holidayDate)}
        </p>

        {holiday.description && (
          <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">
            {holiday.description}
          </p>
        )}

        <p
          className={`mt-2 inline-flex items-center gap-1 text-[11px] font-semibold ${
            isToday
              ? "text-emerald-700"
              : isPast
                ? "text-slate-400"
                : "text-cyan-700"
          }`}
        >
          {isToday ? (
            <Gift size={13} />
          ) : isPast ? (
            <Clock3 size={13} />
          ) : (
            <CalendarCheck2 size={13} />
          )}

          {isToday
            ? "Holiday today"
            : isPast
              ? "Completed"
              : "Upcoming holiday"}
        </p>
      </div>
    </article>
  );
}

export default function Holidays() {
  const navigate = useNavigate();

  const [holidays, setHolidays] = useState([]);
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHolidays = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/employee/holidays`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        setError("Your session has expired. Please log in again.");
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Unable to load company holidays.");
      }

      setToday(String(data?.today || "").slice(0, 10));
      setHolidays(Array.isArray(data?.holidays) ? data.holidays : []);
    } catch (requestError) {
      setError(requestError.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHolidays();
  }, [loadHolidays]);

  const sortedHolidays = useMemo(
    () =>
      [...holidays].sort((a, b) =>
        String(a.holiday_date || "").localeCompare(
          String(b.holiday_date || "")
        )
      ),
    [holidays]
  );

  const upcomingHolidays = useMemo(
    () =>
      sortedHolidays.filter(
        (holiday) =>
          String(holiday.holiday_date || "").slice(0, 10) >= today
      ),
    [sortedHolidays, today]
  );

  const pastHolidays = useMemo(
    () =>
      sortedHolidays.filter(
        (holiday) =>
          String(holiday.holiday_date || "").slice(0, 10) < today
      ),
    [sortedHolidays, today]
  );

  const todayHoliday = upcomingHolidays.some(
    (holiday) =>
      String(holiday.holiday_date || "").slice(0, 10) === today
  );

  function handleLogin() {
    navigate("/login");
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-3 overflow-hidden text-slate-900">
      {/* Compact header */}
      <header className="flex shrink-0 items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-[#071a36] to-[#0b3158] px-4 py-3 text-white shadow-sm sm:px-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-cyan-300 sm:text-xs">
            <CalendarDays size={15} />
            Employee Portal
          </p>
          <h1 className="mt-1 text-lg font-bold sm:text-xl">
            Company Holidays
          </h1>
          <p className="mt-0.5 hidden text-xs text-slate-300 sm:block">
            View company holidays and plan your schedule.
          </p>
        </div>

        <button
          type="button"
          onClick={loadHolidays}
          disabled={loading}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold hover:bg-white/10 disabled:opacity-60"
        >
          <RefreshCw
            size={14}
            className={loading ? "animate-spin" : ""}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          <span>{error}</span>

          {error.toLowerCase().includes("log in") ||
          error.toLowerCase().includes("session has expired") ? (
            <button
              type="button"
              onClick={handleLogin}
              className="rounded-lg bg-red-700 px-3 py-1.5 font-semibold text-white hover:bg-red-800"
            >
              Go to Login
            </button>
          ) : (
            <button
              type="button"
              onClick={loadHolidays}
              className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 font-semibold hover:bg-red-100"
            >
              <RefreshCw size={12} />
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Summary cards */}
      <section className="grid shrink-0 grid-cols-3 gap-2">
        {[
          {
            label: "Total Holidays",
            value: holidays.length,
            icon: CalendarDays,
            style: "bg-cyan-50 text-cyan-700",
          },
          {
            label: "Upcoming",
            value: upcomingHolidays.length,
            icon: CalendarCheck2,
            style: "bg-emerald-50 text-emerald-700",
          },
          {
            label: "Past Holidays",
            value: pastHolidays.length,
            icon: Clock3,
            style: "bg-amber-50 text-amber-700",
          },
        ].map(({ label, value, icon: Icon, style }) => (
          <div
            key={label}
            className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:px-4"
          >
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 sm:text-xs">
                {label}
              </p>
              <p className="mt-0.5 text-xl font-bold sm:text-2xl">
                {loading ? "—" : value}
              </p>
            </div>
            <div className={`hidden rounded-lg p-2 sm:block ${style}`}>
              <Icon size={18} />
            </div>
          </div>
        ))}
      </section>

      {/* Today's holiday banner */}
      {!loading && todayHoliday && (
        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          <Gift size={16} className="shrink-0 text-emerald-700" />
          <p>
            <strong>Today is a company holiday!</strong>{" "}
            Check the holiday details below.
          </p>
        </div>
      )}

      {/* Scrollable holidays content */}
      <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold sm:text-lg">
              Upcoming Holidays
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
              Holidays from today onward
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold text-cyan-800 sm:text-xs">
            {loading ? "Loading..." : `${upcomingHolidays.length} holidays`}
          </span>
        </div>

        {loading ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-xl bg-slate-200"
              />
            ))}
          </div>
        ) : upcomingHolidays.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {upcomingHolidays.map((holiday, index) => (
              <HolidayCard
                key={holiday.id ?? `${holiday.holiday_date}-${index}`}
                holiday={holiday}
                today={today}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-2 text-sm font-semibold text-slate-800">
              No upcoming holidays
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              There are no upcoming holidays in the company calendar right now.
            </p>
          </div>
        )}

        {!loading && pastHolidays.length > 0 && (
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold sm:text-lg">
                  Past Holidays
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
                  Previously observed company holidays
                </p>
              </div>
              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                {pastHolidays.length}
              </span>
            </div>

            <div className="grid gap-2 lg:grid-cols-2">
              {pastHolidays.map((holiday, index) => (
                <div
                  key={holiday.id ?? `${holiday.holiday_date}-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Calendar size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-slate-800">
                      {holiday.name || "Company Holiday"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(holiday.holiday_date)}
                    </p>
                  </div>
                  <span className="hidden text-[10px] font-semibold text-slate-400 sm:inline">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && holidays.length === 0 && (
          <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-2 text-sm font-semibold text-slate-800">
              No holidays have been added yet
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Company holidays will appear here when published.
            </p>
          </div>
        )}

        <p className="mt-4 border-t border-slate-200 pt-3 text-[11px] leading-5 text-slate-500">
          Holiday information is displayed from the company calendar. For
          corrections, please contact your administrator.
        </p>
      </section>
    </div>
  );
}
