import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  CalendarCheck2,
  CalendarDays,
  ChevronRight,
  Circle,
  Clock3,
  FileText,
  Home,
  LogOut,
  Menu,
  UserRound,
  UsersRound,
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
        // Ignore invalid JSON values.
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

function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getDay(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
  }).format(date);
}

function getMonth(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
  }).format(date);
}

function isPastHoliday(dateString, todayString) {
  return dateString < todayString;
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

function Holidays() {
  const navigate = useNavigate();

  const [holidays, setHolidays] = useState([]);
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const auth = useMemo(() => getStoredAuth(), []);

  useEffect(() => {
    async function loadHolidays() {
      if (!auth?.access_token) {
        setError("Your session has expired. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/employee/holidays`,
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
            data?.detail || "Unable to load holidays.",
          );
        }

        const data = await response.json();

        setToday(data.today || "");
        setHolidays(data.holidays || []);
      } catch (requestError) {
        setError(
          requestError.message ||
            "Something went wrong while loading holidays.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadHolidays();
  }, [auth, navigate]);

  const pastHolidays = useMemo(() => {
    return holidays.filter((holiday) =>
      isPastHoliday(holiday.holiday_date, today),
    );
  }, [holidays, today]);

  const upcomingHolidays = useMemo(() => {
    return holidays.filter(
      (holiday) =>
        !isPastHoliday(holiday.holiday_date, today),
    );
  }, [holidays, today]);

  function handleLogout() {
    clearStoredAuth();
    navigate("/login");
  }

  function closeMobileSidebar() {
    setMobileSidebarOpen(false);
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
              icon={Calendar}
              label="Holidays"
              to="/holidays"
              active
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

      {/* Main Content */}
      <main className="min-h-screen lg:ml-[270px]">
        {/* Top Header */}
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
                  Company Holidays
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-cyan-600" />

                  <span className="text-sm font-medium text-slate-600">
                    {today ? formatDate(today) : "Loading..."}
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
          <section className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#071a36] to-[#0b3158] p-6 text-white shadow-lg md:p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2 text-cyan-300">
                  <Calendar className="h-5 w-5" />

                  <span className="text-sm font-semibold uppercase tracking-wider">
                    Holiday Calendar
                  </span>
                </div>

                <h2 className="text-2xl font-bold md:text-3xl">
                  Company Holiday Schedule
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                  View the official company holiday schedule and
                  plan your work and leave accordingly.
                </p>
              </div>

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <CalendarDays className="h-10 w-10 text-cyan-300" />
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Total Holidays
                      </p>

                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {holidays.length}
                      </p>
                    </div>

                    <div className="rounded-xl bg-cyan-50 p-3 text-cyan-600">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Upcoming Holidays
                      </p>

                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {upcomingHolidays.length}
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                      <CalendarCheck2 className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Past Holidays
                      </p>

                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {pastHolidays.length}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                      <Clock3 className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming */}
              <section className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Upcoming Holidays
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your upcoming company holidays
                    </p>
                  </div>

                  <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700">
                    {upcomingHolidays.length} Holidays
                  </span>
                </div>

                {upcomingHolidays.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

                    <h3 className="mt-4 font-semibold text-slate-800">
                      No upcoming holidays
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      There are currently no upcoming holidays in
                      the company calendar.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {upcomingHolidays.map((holiday) => (
                      <div
                        key={holiday.id}
                        className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
                      >
                        <div className="flex gap-4">
                          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                            <span className="text-xl font-bold leading-none">
                              {getDay(holiday.holiday_date)}
                            </span>

                            <span className="mt-1 text-[11px] font-semibold uppercase">
                              {getMonth(holiday.holiday_date)}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-bold text-slate-900">
                                  {holiday.name}
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                  {formatDate(
                                    holiday.holiday_date,
                                  )}
                                </p>
                              </div>

                              <Circle className="h-2.5 w-2.5 shrink-0 fill-cyan-500 text-cyan-500" />
                            </div>

                            {holiday.description && (
                              <p className="mt-3 text-sm leading-5 text-slate-500">
                                {holiday.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Past */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Past Holidays
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Holidays already completed this year
                    </p>
                  </div>

                  <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:inline-flex">
                    {pastHolidays.length} Holidays
                  </span>
                </div>

                {pastHolidays.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <Clock3 className="mx-auto h-10 w-10 text-slate-300" />

                    <h3 className="mt-4 font-semibold text-slate-800">
                      No past holidays
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      No company holidays have passed yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="divide-y divide-slate-100">
                      {pastHolidays.map((holiday) => (
                        <div
                          key={holiday.id}
                          className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                              <Calendar className="h-5 w-5" />
                            </div>

                            <div>
                              <h3 className="font-semibold text-slate-800">
                                {holiday.name}
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                {formatDate(
                                  holiday.holiday_date,
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                            Completed
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Empty database state */}
              {holidays.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                  <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />

                  <h3 className="mt-4 text-lg font-bold text-slate-800">
                    No holidays available
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    The company holiday calendar does not contain
                    any active holiday records yet.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Holidays;