import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Home,
  LogOut,
  Megaphone,
  UserCircle,
  Users,
  XCircle,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function getStoredValue(key) {
  return (
    localStorage.getItem(key) ||
    sessionStorage.getItem(key) ||
    ""
  );
}

function getToken() {
  return (
    getStoredValue("access_token") ||
    getStoredValue("token") ||
    getStoredValue("authToken")
  );
}

function getStoredUser() {
  const raw =
    getStoredValue("user") ||
    getStoredValue("currentUser");

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusClasses(status) {
  switch (status) {
    case "Approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "Rejected":
      return "bg-red-50 text-red-700 border-red-200";

    case "Pending":
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "Approved":
      return <CheckCircle2 size={15} />;

    case "Rejected":
      return <XCircle size={15} />;

    default:
      return <Clock3 size={15} />;
  }
}

function calculateDays(fromDate, toDate) {
  if (!fromDate || !toDate) {
    return 0;
  }

  const start = new Date(`${fromDate}T00:00:00`);
  const end = new Date(`${toDate}T00:00:00`);

  const difference =
    end.getTime() - start.getTime();

  if (difference < 0) {
    return 0;
  }

  return Math.floor(
    difference / (1000 * 60 * 60 * 24)
  ) + 1;
}

function SidebarLink({
  to,
  icon,
  label,
  active = false,
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
        active
          ? "bg-white/15 text-white"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default function Leaves() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    from_date: "",
    to_date: "",
    leave_type: "",
    reason: "",
  });

  const token = getToken();

  useEffect(() => {
    const storedUser = getStoredUser();

    if (storedUser) {
      setUser(storedUser);
    }

    if (!token) {
      navigate("/login");
      return;
    }

    loadLeaves();
  }, [navigate]);

  async function loadLeaves() {
    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [leavesResponse, balanceResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/employee/leaves`, {
            headers,
          }),
          fetch(
            `${API_URL}/api/employee/leaves/balance`,
            {
              headers,
            }
          ),
        ]);

      if (
        leavesResponse.status === 401 ||
        balanceResponse.status === 401
      ) {
        logout();
        return;
      }

      if (!leavesResponse.ok) {
        throw new Error(
          "Unable to load leave requests."
        );
      }

      const leavesData =
        await leavesResponse.json();

      setLeaves(
        Array.isArray(leavesData)
          ? leavesData
          : []
      );

      if (balanceResponse.ok) {
        const balanceData =
          await balanceResponse.json();

        setBalance(balanceData);
      } else {
        setBalance(null);
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to load leave information."
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");

    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("currentUser");

    navigate("/login");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.from_date) {
      setError("Please select the start date.");
      return;
    }

    if (!form.to_date) {
      setError("Please select the end date.");
      return;
    }

    if (form.from_date > form.to_date) {
      setError(
        "From date cannot be after the end date."
      );
      return;
    }

    if (!form.leave_type.trim()) {
      setError("Please enter the leave type.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/employee/leaves`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            from_date: form.from_date,
            to_date: form.to_date,
            leave_type: form.leave_type.trim(),
            reason: form.reason.trim() || null,
          }),
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to submit leave request."
        );
      }

      setSuccess(
        "Leave request submitted successfully."
      );

      setForm({
        from_date: "",
        to_date: "",
        leave_type: "",
        reason: "",
      });

      await loadLeaves();
    } catch (err) {
      setError(
        err.message ||
          "Unable to submit leave request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const statistics = useMemo(() => {
    const pending = leaves.filter(
      (leave) => leave.status === "Pending"
    ).length;

    const approved = leaves.filter(
      (leave) => leave.status === "Approved"
    ).length;

    const rejected = leaves.filter(
      (leave) => leave.status === "Rejected"
    ).length;

    return {
      total: leaves.length,
      pending,
      approved,
      rejected,
    };
  }, [leaves]);

  const remainingLeave = balance
    ? Math.max(
        Number(balance.annual_leave || 0) -
          Number(balance.used_leave || 0),
        0
      )
    : null;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 bg-[#071a36] text-white lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-5 py-5">
            <img
              src="/logo.png"
              alt="LoanDPR Creditum"
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="flex-1 px-4 py-6">
            <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Employee Portal
            </p>

            <nav className="space-y-1">
              <SidebarLink
                to="/employee-dashboard"
                icon={<Home size={18} />}
                label="Dashboard"
              />

              <SidebarLink
                to="/tasks"
                icon={<FileText size={18} />}
                label="My Tasks"
              />

              <SidebarLink
                to="/attendance"
                icon={<Clock3 size={18} />}
                label="Attendance"
              />

              <SidebarLink
                to="/leaves"
                icon={<CalendarDays size={18} />}
                label="Leaves"
                active
              />

              <SidebarLink
                to="/holidays"
                icon={<CalendarDays size={18} />}
                label="Holidays"
              />

              <SidebarLink
                to="/calendar"
                icon={<CalendarDays size={18} />}
                label="Calendar"
              />

              <SidebarLink
                to="/announcements"
                icon={<Megaphone size={18} />}
                label="Announcements"
              />

              <SidebarLink
                to="/profile"
                icon={<UserCircle size={18} />}
                label="Profile"
              />
            </nav>
          </div>

          <div className="border-t border-white/10 p-4">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Header */}
          <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">
                  Employee Portal
                </p>

                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Leave Management
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.full_name || "Employee"}
                  </p>

                  <p className="text-xs text-slate-500">
                    {user?.employee_id || ""}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#071a36] text-sm font-bold text-white">
                  {user?.full_name
                    ? user.full_name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "EM"}
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              <Link
                to="/employee-dashboard"
                className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700"
              >
                Dashboard
              </Link>

              <Link
                to="/attendance"
                className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700"
              >
                Attendance
              </Link>

              <Link
                to="/leaves"
                className="whitespace-nowrap rounded-lg bg-[#071a36] px-3 py-2 text-xs font-medium text-white"
              >
                Leaves
              </Link>

              <Link
                to="/holidays"
                className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700"
              >
                Holidays
              </Link>

              <Link
                to="/calendar"
                className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700"
              >
                Calendar
              </Link>
            </div>
          </header>

          <div className="p-5 sm:p-8">
            {/* Alerts */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {success}
              </div>
            )}

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Total Requests
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {statistics.total}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                    <FileText size={22} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-700">
                      Pending
                    </p>

                    <p className="mt-2 text-3xl font-bold text-amber-800">
                      {statistics.pending}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3 text-amber-600">
                    <Clock3 size={22} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-700">
                      Approved
                    </p>

                    <p className="mt-2 text-3xl font-bold text-emerald-800">
                      {statistics.approved}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3 text-emerald-600">
                    <CheckCircle2 size={22} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700">
                      Rejected
                    </p>

                    <p className="mt-2 text-3xl font-bold text-red-800">
                      {statistics.rejected}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3 text-red-600">
                    <XCircle size={22} />
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Balance */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Leave Balance
                  </p>

                  {balance ? (
                    <>
                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {remainingLeave} days remaining
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Annual: {balance.annual_leave} days
                        {" • "}
                        Used: {balance.used_leave} days
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-1 text-lg font-semibold text-slate-800">
                        Not available
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        No leave balance has been configured for your account.
                      </p>
                    </>
                  )}
                </div>

                <div className="rounded-2xl bg-[#071a36] p-4 text-white">
                  <CalendarDays size={28} />
                </div>
              </div>
            </div>

            {/* Apply Leave + Info */}
            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.75fr]">
              {/* Apply Leave */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <p className="text-sm font-medium text-cyan-700">
                    Leave Request
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Apply for Leave
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Submit your leave request for manager/admin approval.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="from_date"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        From Date
                      </label>

                      <input
                        id="from_date"
                        name="from_date"
                        type="date"
                        value={form.from_date}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="to_date"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        To Date
                      </label>

                      <input
                        id="to_date"
                        name="to_date"
                        type="date"
                        value={form.to_date}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                  </div>

                  {form.from_date &&
                    form.to_date &&
                    form.from_date <= form.to_date && (
                      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Requested duration:{" "}
                        <span className="font-bold text-slate-900">
                          {calculateDays(
                            form.from_date,
                            form.to_date
                          )}{" "}
                          {calculateDays(
                            form.from_date,
                            form.to_date
                          ) === 1
                            ? "day"
                            : "days"}
                        </span>
                      </div>
                    )}

                  <div>
                    <label
                      htmlFor="leave_type"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Leave Type
                    </label>

                    <input
                      id="leave_type"
                      name="leave_type"
                      type="text"
                      value={form.leave_type}
                      onChange={handleChange}
                      placeholder="Enter leave type"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reason"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Reason
                    </label>

                    <textarea
                      id="reason"
                      name="reason"
                      value={form.reason}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Enter reason for leave"
                      className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-[#071a36] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0b2a54] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Leave Request"}
                  </button>
                </form>
              </section>

              {/* Information */}
              <section className="rounded-2xl border border-slate-200 bg-[#071a36] p-6 text-white shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <Users size={24} />
                </div>

                <h2 className="mt-5 text-xl font-bold">
                  Leave Request Process
                </h2>

                <div className="mt-6 space-y-5">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-[#071a36]">
                      1
                    </div>

                    <div>
                      <p className="font-semibold">
                        Submit Request
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        Enter your leave dates, leave type and reason.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-[#071a36]">
                      2
                    </div>

                    <div>
                      <p className="font-semibold">
                        Manager Review
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        Your request is sent to the authorized manager/admin.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-[#071a36]">
                      3
                    </div>

                    <div>
                      <p className="font-semibold">
                        Final Status
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        You can track whether your request is pending, approved or rejected.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* History */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Leave History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your actual leave requests from the database.
                </p>
              </div>

              {loading ? (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  Loading leave history...
                </div>
              ) : leaves.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <CalendarDays size={25} />
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-900">
                    No leave requests yet
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Your submitted leave requests will appear here.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[760px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-left">
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Date
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Leave Type
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Duration
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Reason
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {leaves.map((leave) => (
                          <tr
                            key={leave.id}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">
                                {formatDate(
                                  leave.from_date
                                )}
                              </div>

                              <div className="mt-1 text-xs text-slate-500">
                                to{" "}
                                {formatDate(
                                  leave.to_date
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-4 text-sm font-medium text-slate-700">
                              {leave.leave_type}
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-600">
                              {calculateDays(
                                leave.from_date,
                                leave.to_date
                              )}{" "}
                              {calculateDays(
                                leave.from_date,
                                leave.to_date
                              ) === 1
                                ? "day"
                                : "days"}
                            </td>

                            <td className="max-w-xs px-6 py-4 text-sm text-slate-600">
                              <span className="line-clamp-2">
                                {leave.reason || "-"}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                                  leave.status
                                )}`}
                              >
                                {getStatusIcon(
                                  leave.status
                                )}

                                {leave.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile */}
                  <div className="space-y-3 p-4 md:hidden">
                    {leaves.map((leave) => (
                      <div
                        key={leave.id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {leave.leave_type}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {formatDate(
                                leave.from_date
                              )}{" "}
                              -{" "}
                              {formatDate(
                                leave.to_date
                              )}
                            </p>
                          </div>

                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                              leave.status
                            )}`}
                          >
                            {getStatusIcon(
                              leave.status
                            )}

                            {leave.status}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">
                              Duration
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {calculateDays(
                                leave.from_date,
                                leave.to_date
                              )}{" "}
                              {calculateDays(
                                leave.from_date,
                                leave.to_date
                              ) === 1
                                ? "day"
                                : "days"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">
                              Request ID
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              #{leave.id}
                            </p>
                          </div>
                        </div>

                        {leave.reason && (
                          <div className="mt-3 rounded-lg bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">
                              Reason
                            </p>

                            <p className="mt-1 text-sm text-slate-700">
                              {leave.reason}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}