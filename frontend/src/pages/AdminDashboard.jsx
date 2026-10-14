
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000/api";

function getAuthToken() {
  return (
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
}

function getErrorMessage(data, fallback) {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => item.msg)
      .filter(Boolean)
      .join(", ");
  }

  return fallback;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status) {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized === "completed" ||
    normalized === "approved" ||
    normalized === "present"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    normalized === "in progress" ||
    normalized === "in_progress"
  ) {
    return "bg-blue-50 text-blue-700";
  }

  if (
    normalized === "rejected" ||
    normalized === "absent"
  ) {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value ?? 0}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ title, description, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:shadow-md"
    >
      <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
        <Icon size={22} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <ArrowRight
        size={18}
        className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700"
      />
    </button>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [processingLeaveId, setProcessingLeaveId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("access_token");
    sessionStorage.removeItem("access_token");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    navigate("/login", { replace: true });
  }, [navigate]);

  const loadDashboard = useCallback(
    async (showRefresh = false) => {
      const token = getAuthToken();

      if (!token) {
        setError("Your session has expired. Please log in again.");
        setLoading(false);
        navigate("/login", { replace: true });
        return;
      }

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/dashboard`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          handleLogout();
          return;
        }

        if (!response.ok) {
          throw new Error(
            getErrorMessage(data, "Unable to load the admin dashboard.")
          );
        }

        setDashboard(data);
      } catch (err) {
        setError(
          err.message ||
            "Unable to connect to the server. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [handleLogout, navigate]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const updateLeaveStatus = async (leaveId, status) => {
    if (processingLeaveId !== null) return;

    const token = getAuthToken();

    if (!token) {
      handleLogout();
      return;
    }

    const action = status === "Approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this leave request?`
    );

    if (!confirmed) return;

    setProcessingLeaveId(leaveId);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/leaves/${leaveId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to update the leave request.")
        );
      }

      setNotice(
        `Leave request ${status.toLowerCase()} successfully.`
      );

      await loadDashboard(true);
    } catch (err) {
      setError(
        err.message || "Unable to update the leave request."
      );
    } finally {
      setProcessingLeaveId(null);
    }
  };

  const stats = dashboard?.stats || {};
  const employees = dashboard?.employees || [];
  const tasks = dashboard?.today_tasks || [];
  const pendingLeaves = dashboard?.pending_leave_requests || [];
  const currentUser = dashboard?.current_user || {};

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
          <p className="mt-4 font-medium text-slate-600">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-xl bg-blue-700 p-2.5 text-white">
              <ShieldCheck size={25} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                Admin Dashboard
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                LoanDPR Creditum Management Pvt. Ltd.
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="font-semibold text-slate-800">
                {currentUser.full_name || "Administrator"}
              </p>
              <p className="text-xs capitalize text-slate-500">
                {currentUser.role || "admin"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              title="Refresh dashboard"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw
                size={19}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 font-semibold text-red-700 transition hover:bg-red-100"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 sm:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="space-y-2 border-t border-slate-200 bg-white p-4 sm:hidden">
            <p className="font-semibold text-slate-800">
              {currentUser.full_name || "Administrator"}
            </p>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                loadDashboard(true);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw size={18} />
              Refresh dashboard
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-red-700 hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 sm:py-8">
        {/* Welcome */}
        <section className="rounded-3xl bg-gradient-to-r from-blue-800 to-indigo-700 p-6 text-white shadow-sm sm:p-8">
          <p className="text-sm font-medium text-blue-100">
            Administration
          </p>

          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            Welcome, {currentUser.full_name || "Administrator"}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
            Manage employees, review leave requests, and monitor
            daily operations from one place.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-blue-100">
            <CalendarDays size={17} />
            <span>
              {formatDate(dashboard?.today)}
            </span>
          </div>
        </section>

        {/* Messages */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
          >
            <AlertCircle size={21} className="mt-0.5 shrink-0" />
            <div className="flex-1 text-sm">{error}</div>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="rounded p-1 hover:bg-red-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
          >
            <CheckCircle2 size={21} className="mt-0.5 shrink-0" />
            <div className="flex-1 text-sm">{notice}</div>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
              className="rounded p-1 hover:bg-emerald-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Current employee and task summary.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Active Employees"
              value={stats.active_employees}
              icon={Users}
              color="bg-blue-50 text-blue-700"
            />

            <StatCard
              title="Present Today"
              value={stats.today_attendance}
              icon={CalendarCheck2}
              color="bg-emerald-50 text-emerald-700"
            />

            <StatCard
              title="Pending Tasks"
              value={stats.pending_tasks}
              icon={ClipboardList}
              color="bg-amber-50 text-amber-700"
            />

            <StatCard
              title="Pending Leaves"
              value={stats.pending_leaves}
              icon={CalendarClock}
              color="bg-purple-50 text-purple-700"
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Quick Actions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Open a management section.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <QuickAction
              title="Manage Employees"
              description="View and manage employee records"
              icon={UserPlus}
              onClick={() => navigate("/employee-management")}
            />

            <QuickAction
              title="Manage Tasks"
              description="Open task management"
              icon={BriefcaseBusiness}
              onClick={() => navigate("/admin-tasks")}
            />

            <QuickAction
              title="Review Leave Requests"
              description="Go to pending leave requests"
              icon={CalendarClock}
              onClick={() =>
                document
                  .getElementById("pending-leaves")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            />
          </div>
        </section>

        {/* Employees */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Employees
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Recently created employee accounts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/employee-management")}
              className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Manage Employees
              <ArrowRight size={16} />
            </button>
          </div>

          {employees.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Users className="mx-auto text-slate-300" size={38} />
              <p className="mt-3 font-semibold text-slate-700">
                No employees found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Employee records will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Employee</th>
                    <th className="px-6 py-4 font-semibold">Employee ID</th>
                    <th className="px-6 py-4 font-semibold">Department</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {employee.full_name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {employee.email}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-700">
                        {employee.employee_id || "—"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {employee.department || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            employee.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {employee.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Today's Tasks */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Today&apos;s Tasks
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tasks scheduled for today.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin-tasks")}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View Tasks
              <ArrowRight size={16} />
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <ClipboardList
                className="mx-auto text-slate-300"
                size={36}
              />
              <p className="mt-3 font-semibold text-slate-700">
                No tasks scheduled for today
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      {task.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {task.employee_name || "Unassigned"}
                      {task.employee_code
                        ? ` • ${task.employee_code}`
                        : ""}
                    </p>
                    {task.description && (
                      <p className="mt-1 text-sm text-slate-500">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <span
                    className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                      task.status
                    )}`}
                  >
                    {task.status || "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending Leave Requests */}
        <section
          id="pending-leaves"
          className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pending Leave Requests
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review employee leave applications.
              </p>
            </div>

            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
              {pendingLeaves.length} pending
            </span>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle2
                className="mx-auto text-emerald-500"
                size={40}
              />
              <p className="mt-3 font-semibold text-slate-800">
                All caught up!
              </p>
              <p className="mt-1 text-sm text-slate-500">
                There are no pending leave requests.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingLeaves.map((leave) => {
                const isProcessing =
                  processingLeaveId === leave.id;

                return (
                  <div
                    key={leave.id}
                    className="p-5 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">
                            {leave.employee_name || "Employee"}
                          </h3>

                          {leave.employee_code && (
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                              {leave.employee_code}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-slate-600">
                          <span className="font-semibold">Leave type:</span>{" "}
                          {leave.leave_type || "Not specified"}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          <span className="font-semibold">Dates:</span>{" "}
                          {formatDate(leave.from_date)} –{" "}
                          {formatDate(leave.to_date)}
                        </p>

                        {leave.reason && (
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                            <span className="font-semibold">Reason:</span>{" "}
                            {leave.reason}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-slate-400">
                          Applied on {formatDate(leave.created_at)}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={processingLeaveId !== null}
                          onClick={() =>
                            updateLeaveStatus(leave.id, "Approved")
                          }
                          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <RefreshCw
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Check size={17} />
                          )}
                          Approve
                        </button>

                        <button
                          type="button"
                          disabled={processingLeaveId !== null}
                          onClick={() =>
                            updateLeaveStatus(leave.id, "Rejected")
                          }
                          className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <RefreshCw
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <X size={17} />
                          )}
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-5 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} LoanDPR Creditum Management Pvt. Ltd.
          <span className="mx-2">•</span>
          Admin Portal
        </footer>
      </main>
    </div>
  );
}

export default AdminDashboard;
