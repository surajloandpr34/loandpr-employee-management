import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  Users,
  X,
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

  return {
    token,
    user,
  };
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(`${dateValue}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status) {
  if (status === "Completed" || status === "Approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "In Progress") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (status === "Rejected") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function AdminDashboard() {
  const navigate = useNavigate();

  const auth = useMemo(() => getStoredAuth(), []);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function loadDashboard() {
    if (!auth.token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/dashboard`,
        {
          method: "GET",
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
        throw new Error(
          data.detail ||
            "Unable to load admin dashboard."
        );
      }

      setDashboard(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");

    navigate("/login", { replace: true });
  }

  const user = dashboard?.current_user || auth.user;

  const stats = dashboard?.stats || {
    active_employees: 0,
    today_attendance: 0,
    pending_tasks: 0,
    pending_leaves: 0,
  };

  const employees = dashboard?.employees || [];
  const todayTasks = dashboard?.today_tasks || [];
  const pendingLeaves =
    dashboard?.pending_leave_requests || [];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 md:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white">
              <img
                src="/logo.png"
                alt="LoanDPR Creditum Management"
                className="h-9 w-auto object-contain"
              />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900">
                Management Portal
              </p>

              <p className="text-xs text-slate-500">
                LoanDPR Creditum Management
              </p>
            </div>

          </div>

          <div className="hidden items-center gap-5 md:flex">

            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                {user?.full_name || "Administrator"}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {user?.role || "admin"}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>

          </div>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen((previous) => !previous)
            }
            className="rounded-lg p-2 text-slate-700 md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">

            <div className="mb-4 rounded-xl bg-slate-50 p-4">

              <p className="font-semibold text-slate-900">
                {user?.full_name || "Administrator"}
              </p>

              <p className="mt-1 text-xs capitalize text-slate-500">
                {user?.role || "admin"}
              </p>

            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>

          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-8 md:px-8">

        {/* PAGE TITLE */}

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">
              Management Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Company Overview
            </h1>

            <p className="mt-2 text-slate-500">
              Real-time information from the employee management system.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700 disabled:opacity-60 lg:self-auto"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Unable to load dashboard
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* LOADING */}

        {loading && !dashboard ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}

          </div>
        ) : (
          <>

            {/* STAT CARDS */}

            <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Active Employees
                    </p>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {stats.active_employees}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Active employee accounts
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <Users className="h-5 w-5" />
                  </div>

                </div>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Today's Attendance
                    </p>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {stats.today_attendance}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Attendance marked today
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CalendarCheck2 className="h-5 w-5" />
                  </div>

                </div>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Pending Tasks
                    </p>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {stats.pending_tasks}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Pending or in-progress tasks
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>

                </div>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Pending Leaves
                    </p>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {stats.pending_leaves}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Leave requests awaiting action
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <CalendarDays className="h-5 w-5" />
                  </div>

                </div>

              </div>

            </section>

            {/* EMPLOYEES */}

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">
                    Employee Management
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Employees
                  </h2>
                </div>

                <Users className="h-6 w-6 text-slate-400" />

              </div>

              <div className="p-6">

                {employees.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">

                    <Users className="mx-auto h-8 w-8 text-slate-300" />

                    <p className="mt-3 font-semibold text-slate-700">
                      No employees found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Employee accounts will appear here when they are created.
                    </p>

                  </div>
                ) : (
                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[800px]">

                      <thead>
                        <tr className="border-b border-slate-200 text-left">

                          <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Employee
                          </th>

                          <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Employee ID
                          </th>

                          <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Department
                          </th>

                          <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Email
                          </th>

                          <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Status
                          </th>

                        </tr>
                      </thead>

                      <tbody>

                        {employees.map((employee) => (
                          <tr
                            key={employee.id}
                            className="border-b border-slate-100 last:border-0"
                          >

                            <td className="py-4">
                              <p className="font-semibold text-slate-800">
                                {employee.full_name}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {employee.role}
                              </p>
                            </td>

                            <td className="py-4 text-sm font-medium text-slate-700">
                              {employee.employee_id}
                            </td>

                            <td className="py-4 text-sm text-slate-600">
                              {employee.department || "Not assigned"}
                            </td>

                            <td className="py-4 text-sm text-slate-600">
                              {employee.email}
                            </td>

                            <td className="py-4">

                              <span
                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                  employee.is_active
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-red-200 bg-red-50 text-red-700"
                                }`}
                              >
                                {employee.is_active
                                  ? "Active"
                                  : "Inactive"}
                              </span>

                            </td>

                          </tr>
                        ))}

                      </tbody>

                    </table>

                  </div>
                )}

              </div>
            </section>

            {/* TASKS + LEAVES */}

            <section className="mt-6 grid gap-6 lg:grid-cols-2">

              {/* TASKS */}

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">
                      Work Management
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      Today's Tasks
                    </h2>
                  </div>

                  <BriefcaseBusiness className="h-6 w-6 text-slate-400" />

                </div>

                <div className="p-6">

                  {todayTasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">

                      <BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-300" />

                      <p className="mt-3 font-semibold text-slate-700">
                        No tasks assigned today
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Assigned tasks will appear here.
                      </p>

                    </div>
                  ) : (
                    <div className="space-y-3">

                      {todayTasks.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-xl border border-slate-200 p-4"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="min-w-0">

                              <h3 className="font-semibold text-slate-900">
                                {task.title}
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                {task.employee_name ||
                                  "Employee"}
                                {" • "}
                                {task.employee_code || "—"}
                              </p>

                              {task.description && (
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                  {task.description}
                                </p>
                              )}

                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>

                          </div>

                        </div>
                      ))}

                    </div>
                  )}

                </div>
              </div>

              {/* LEAVES */}

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">
                      Leave Management
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      Pending Leave Requests
                    </h2>
                  </div>

                  <Clock3 className="h-6 w-6 text-slate-400" />

                </div>

                <div className="p-6">

                  {pendingLeaves.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">

                      <CheckCircle2 className="mx-auto h-8 w-8 text-slate-300" />

                      <p className="mt-3 font-semibold text-slate-700">
                        No pending leave requests
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        New requests will appear here for review.
                      </p>

                    </div>
                  ) : (
                    <div className="space-y-3">

                      {pendingLeaves.map((leave) => (
                        <div
                          key={leave.id}
                          className="rounded-xl border border-slate-200 p-4"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div>

                              <h3 className="font-semibold text-slate-900">
                                {leave.employee_name ||
                                  "Employee"}
                              </h3>

                              <p className="mt-1 text-xs text-slate-400">
                                {leave.employee_code || "—"}
                              </p>

                              <p className="mt-3 text-sm font-medium text-slate-700">
                                {leave.leave_type}
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                {formatDate(leave.from_date)}
                                {" → "}
                                {formatDate(leave.to_date)}
                              </p>

                              {leave.reason && (
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                  {leave.reason}
                                </p>
                              )}

                              <p className="mt-2 text-xs text-slate-400">
                                Requested{" "}
                                {formatDateTime(
                                  leave.created_at
                                )}
                              </p>

                            </div>

                            <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                              Pending
                            </span>

                          </div>

                        </div>
                      ))}

                    </div>
                  )}

                </div>
              </div>

            </section>

          </>
        )}

      </main>
    </div>
  );
}

export default AdminDashboard;