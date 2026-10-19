
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Users,
  XCircle,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function getStoredValue(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key) || "";
}

function getToken() {
  return (
    getStoredValue("access_token") ||
    getStoredValue("token") ||
    getStoredValue("authToken")
  );
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateDays(fromDate, toDate) {
  if (!fromDate || !toDate || fromDate > toDate) return 0;
  const start = new Date(`${fromDate}T00:00:00`);
  const end = new Date(`${toDate}T00:00:00`);
  return Math.floor((end - start) / 86400000) + 1;
}

function getStatusClasses(status) {
  switch (status) {
    case "Approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Rejected":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function StatusIcon({ status }) {
  if (status === "Approved") return <CheckCircle2 size={14} />;
  if (status === "Rejected") return <XCircle size={14} />;
  return <Clock3 size={14} />;
}

export default function Leaves() {
  const navigate = useNavigate();
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

  const token = useMemo(() => getToken(), []);

  const logout = useCallback(() => {
    const keys = [
      "access_token",
      "token",
      "authToken",
      "user",
      "currentUser",
    ];

    [localStorage, sessionStorage].forEach((storage) => {
      keys.forEach((key) => storage.removeItem(key));
    });

    navigate("/login", { replace: true });
  }, [navigate]);

  const loadLeaves = useCallback(async () => {
    if (!token) {
      setError("Please log in to view your leave requests.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const headers = { Authorization: `Bearer ${token}` };

      const [leavesResponse, balanceResponse] = await Promise.all([
        fetch(`${API_URL}/api/employee/leaves`, { headers }),
        fetch(`${API_URL}/api/employee/leaves/balance`, { headers }),
      ]);

      if (
        leavesResponse.status === 401 ||
        balanceResponse.status === 401
      ) {
        logout();
        return;
      }

      const leavesData = await leavesResponse.json().catch(() => null);

      if (!leavesResponse.ok) {
        throw new Error(
          leavesData?.detail || "Unable to load leave requests."
        );
      }

      setLeaves(Array.isArray(leavesData) ? leavesData : []);

      if (balanceResponse.ok) {
        setBalance(await balanceResponse.json());
      } else {
        setBalance(null);
      }
    } catch (err) {
      setError(err.message || "Unable to load leave information.");
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.from_date || !form.to_date) {
      setError("Please select both leave dates.");
      return;
    }

    if (form.from_date > form.to_date) {
      setError("From date cannot be after the end date.");
      return;
    }

    if (!form.leave_type.trim()) {
      setError("Please enter the leave type.");
      return;
    }

    if (!token) {
      logout();
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/api/employee/leaves`, {
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
      });

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Unable to submit leave request.");
      }

      setSuccess("Leave request submitted successfully.");
      setForm({
        from_date: "",
        to_date: "",
        leave_type: "",
        reason: "",
      });

      await loadLeaves();
    } catch (err) {
      setError(err.message || "Unable to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  }

  const statistics = useMemo(
    () => ({
      total: leaves.length,
      pending: leaves.filter((item) => item.status === "Pending").length,
      approved: leaves.filter((item) => item.status === "Approved").length,
      rejected: leaves.filter((item) => item.status === "Rejected").length,
    }),
    [leaves]
  );

  const remainingLeave = balance
    ? Math.max(
        Number(balance.annual_leave || 0) -
          Number(balance.used_leave || 0),
        0
      )
    : null;

  const statCards = [
    {
      label: "Total Requests",
      value: statistics.total,
      icon: FileText,
      style: "bg-slate-100 text-slate-700",
    },
    {
      label: "Pending",
      value: statistics.pending,
      icon: Clock3,
      style: "bg-amber-50 text-amber-700",
    },
    {
      label: "Approved",
      value: statistics.approved,
      icon: CheckCircle2,
      style: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Rejected",
      value: statistics.rejected,
      icon: XCircle,
      style: "bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-3 overflow-hidden text-slate-900">
      {/* Compact page header */}
      <header className="flex shrink-0 items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-[#102338] to-[#164e78] px-4 py-3 text-white shadow-sm sm:px-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-cyan-300 sm:text-xs">
            <CalendarDays size={15} />
            Employee Portal
          </p>
          <h1 className="mt-1 text-lg font-bold sm:text-xl">
            Leave Management
          </h1>
          <p className="mt-0.5 hidden text-xs text-slate-300 sm:block">
            Apply for leave and track your request status.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLeaves}
          disabled={loading}
          title="Refresh leave information"
          className="flex shrink-0 items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold hover:bg-white/10 disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      {(error || success) && (
        <div
          role={error ? "alert" : "status"}
          className={`shrink-0 rounded-lg border px-3 py-2 text-xs ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || success}
        </div>
      )}

      {/* Compact summary cards */}
      <section className="grid shrink-0 grid-cols-2 gap-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, style }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:px-4"
          >
            <div>
              <p className="text-[11px] text-slate-500 sm:text-xs">{label}</p>
              <p className="mt-0.5 text-xl font-bold sm:text-2xl">{value}</p>
            </div>
            <div className={`rounded-lg p-2 ${style}`}>
              <Icon size={19} />
            </div>
          </div>
        ))}
      </section>

      {/* Main area */}
      <section className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden xl:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
        {/* Apply form */}
        <div className="min-h-0 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold sm:text-lg">Apply for Leave</h2>
              <p className="mt-1 text-xs text-slate-500">
                Enter the dates and leave details.
              </p>
            </div>

            <div className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
              <CalendarDays size={20} />
            </div>
          </div>

          {remainingLeave !== null && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <div>
                <p className="text-[11px] text-slate-500">Leave balance</p>
                <p className="text-sm font-bold text-slate-900">
                  {remainingLeave} day(s) remaining
                </p>
              </div>
              <p className="text-[11px] text-slate-500">
                Annual: {balance?.annual_leave ?? 0} · Used:{" "}
                {balance?.used_leave ?? 0}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="from_date"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  From Date
                </label>
                <input
                  id="from_date"
                  name="from_date"
                  type="date"
                  required
                  value={form.from_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label
                  htmlFor="to_date"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  To Date
                </label>
                <input
                  id="to_date"
                  name="to_date"
                  type="date"
                  required
                  min={form.from_date || undefined}
                  value={form.to_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>
            </div>

            {form.from_date &&
              form.to_date &&
              form.from_date <= form.to_date && (
                <p className="rounded-lg bg-cyan-50 px-3 py-2 text-xs text-cyan-800">
                  Requested duration:{" "}
                  <strong>
                    {calculateDays(form.from_date, form.to_date)} day(s)
                  </strong>
                </p>
              )}

            <div>
              <label
                htmlFor="leave_type"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Leave Type
              </label>
              <input
                id="leave_type"
                name="leave_type"
                type="text"
                required
                value={form.leave_type}
                onChange={handleChange}
                placeholder="e.g. Casual Leave, Sick Leave"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label
                htmlFor="reason"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Reason
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                value={form.reason}
                onChange={handleChange}
                placeholder="Enter your reason for leave"
                className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[#102338] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1b3d5c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Leave Request"}
            </button>
          </form>
        </div>

        {/* History panel: internal scrolling only */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="text-base font-bold">Leave History</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Your submitted requests
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {leaves.length} total
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {loading ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Loading leave history...
              </div>
            ) : leaves.length === 0 ? (
              <div className="p-6 text-center">
                <CalendarDays className="mx-auto h-9 w-9 text-slate-300" />
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  No leave requests yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Your submitted requests will appear here.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop/tablet table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[600px]">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr>
                        {["Dates", "Type", "Days", "Status"].map((heading) => (
                          <th
                            key={heading}
                            className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:px-4"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map((leave, index) => (
                        <tr
                          key={leave.id ?? `${leave.from_date}-${index}`}
                          className="border-t border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-3 py-3 text-xs sm:px-4">
                            <p className="font-semibold text-slate-800">
                              {formatDate(leave.from_date)}
                            </p>
                            <p className="mt-1 text-slate-500">
                              to {formatDate(leave.to_date)}
                            </p>
                            {leave.reason && (
                              <p className="mt-1 max-w-[190px] truncate text-slate-400">
                                {leave.reason}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-700 sm:px-4">
                            {leave.leave_type || "—"}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-700 sm:px-4">
                            {calculateDays(leave.from_date, leave.to_date)}
                          </td>
                          <td className="px-3 py-3 sm:px-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusClasses(
                                leave.status
                              )}`}
                            >
                              <StatusIcon status={leave.status} />
                              {leave.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile history cards */}
                <div className="space-y-2 p-3 md:hidden">
                  {leaves.map((leave, index) => (
                    <article
                      key={leave.id ?? `${leave.from_date}-mobile-${index}`}
                      className="rounded-lg border border-slate-200 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {leave.leave_type || "Leave"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(leave.from_date)} –{" "}
                            {formatDate(leave.to_date)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusClasses(
                            leave.status
                          )}`}
                        >
                          <StatusIcon status={leave.status} />
                          {leave.status || "Pending"}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-600">
                        Duration:{" "}
                        <strong>
                          {calculateDays(leave.from_date, leave.to_date)} day(s)
                        </strong>
                      </p>
                      {leave.reason && (
                        <p className="mt-1 break-words text-xs text-slate-500">
                          {leave.reason}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Process guide: small and hidden on shorter screens */}
      <aside className="hidden shrink-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 2xl:flex">
        <Users size={16} className="text-cyan-700" />
        <span className="font-semibold text-slate-700">Process:</span>
        <span>1. Submit request</span>
        <span>→</span>
        <span>2. Admin review</span>
        <span>→</span>
        <span>3. Track status</span>
      </aside>
    </div>
  );
}
