
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Send,
  XCircle,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
)
  .replace(/\/$/, "")
  .replace(/\/api$/, "");

const EMPTY_FORM = {
  from_date: "",
  to_date: "",
  leave_type: "",
  reason: "",
};

const LEAVE_TYPES = [
  "Casual Leave",
  "Sick Leave",
  "Emergency Leave",
  "Personal Leave",
  "Other",
];

function getToken() {
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of ["access_token", "token", "authToken"]) {
      const value = storage.getItem(key);
      if (value) return value;
    }
  }
  return null;
}

function clearAuth() {
  for (const storage of [localStorage, sessionStorage]) {
    [
      "access_token",
      "token",
      "authToken",
      "user",
      "currentUser",
    ].forEach((key) => storage.removeItem(key));
  }
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateDays(fromDate, toDate) {
  if (!fromDate || !toDate || fromDate > toDate) return 0;

  const start = Date.parse(`${fromDate}T00:00:00Z`);
  const end = Date.parse(`${toDate}T00:00:00Z`);

  if (Number.isNaN(start) || Number.isNaN(end)) return 0;

  return Math.floor((end - start) / 86400000) + 1;
}

function getErrorMessage(data, fallback) {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return (
      data.detail
        .map((item) => item.msg)
        .filter(Boolean)
        .join(", ") || fallback
    );
  }

  return fallback;
}

function getStatusStyle(status) {
  if (status === "Approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Rejected") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "Cancelled") {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function StatusIcon({ status }) {
  if (status === "Approved") {
    return <CheckCircle2 size={14} />;
  }

  if (status === "Rejected") {
    return <XCircle size={14} />;
  }

  return <Clock3 size={14} />;
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function Leaves() {
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const logout = useCallback(() => {
    clearAuth();
    navigate("/login", { replace: true });
  }, [navigate]);

  const loadLeaves = useCallback(
    async (showLoading = true) => {
      const token = getToken();

      if (!token) {
        logout();
        return false;
      }

      if (showLoading) setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/api/employee/leaves`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.status === 401) {
          logout();
          return false;
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(data, "Unable to load leave requests.")
          );
        }

        if (!Array.isArray(data)) {
          throw new Error(
            "Invalid leave data received from server."
          );
        }

        setLeaves(data);
        return true;
      } catch (err) {
        setError(
          err.message || "Unable to load leave information."
        );
        return false;
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [logout]
  );

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => {
      const next = {
        ...previous,
        [name]: value,
      };

      if (
        name === "from_date" &&
        next.to_date &&
        value > next.to_date
      ) {
        next.to_date = value;
      }

      return next;
    });

    setError("");
    setSuccess("");
  }

  const requestedDays = calculateDays(
    form.from_date,
    form.to_date
  );

  const overlappingRequests = useMemo(() => {
    if (!form.from_date || !form.to_date) return [];

    return leaves.filter((leave) => {
      if (
        leave.status !== "Pending" &&
        leave.status !== "Approved"
      ) {
        return false;
      }

      return (
        leave.from_date <= form.to_date &&
        leave.to_date >= form.from_date
      );
    });
  }, [leaves, form.from_date, form.to_date]);

  const statistics = useMemo(
    () => ({
      total: leaves.length,
      pending: leaves.filter(
        (leave) => leave.status === "Pending"
      ).length,
      approved: leaves.filter(
        (leave) => leave.status === "Approved"
      ).length,
      rejected: leaves.filter(
        (leave) => leave.status === "Rejected"
      ).length,
    }),
    [leaves]
  );

  const filteredLeaves = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leaves
      .filter((leave) => {
        const matchesStatus =
          filter === "All" || leave.status === filter;

        const searchableText = [
          leave.leave_type,
          leave.reason,
          leave.from_date,
          leave.to_date,
          leave.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          matchesStatus &&
          (!query || searchableText.includes(query))
        );
      })
      .sort((a, b) =>
        String(b.from_date).localeCompare(
          String(a.from_date)
        )
      );
  }, [leaves, filter, search]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.from_date || !form.to_date) {
      setError("Please select both leave dates.");
      return;
    }

    if (form.from_date > form.to_date) {
      setError("From Date cannot be after To Date.");
      return;
    }

    if (!form.leave_type.trim()) {
      setError("Please select a leave type.");
      return;
    }

    if (form.reason.length > 2000) {
      setError("Reason cannot exceed 2000 characters.");
      return;
    }

    if (overlappingRequests.length > 0) {
      setError(
        "Selected dates overlap an existing Pending or Approved leave request."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      logout();
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_URL}/api/employee/leaves`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
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

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Unable to submit leave request."
          )
        );
      }

      setForm(EMPTY_FORM);

      const refreshed = await loadLeaves(false);

      setSuccess(
        refreshed
          ? "Leave request submitted successfully. Waiting for admin approval."
          : "Leave request submitted. Refresh the page to check its status."
      );
    } catch (err) {
      setError(err.message || "Leave request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const statCards = [
    {
      label: "Total Requests",
      value: statistics.total,
      icon: FileText,
      color: "bg-slate-100 text-slate-700",
    },
    {
      label: "Pending",
      value: statistics.pending,
      icon: Clock3,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Approved",
      value: statistics.approved,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Rejected",
      value: statistics.rejected,
      icon: XCircle,
      color: "bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <div className="mx-auto max-w-7xl space-y-4 pb-8 text-slate-900">
        {/* HEADER */}
        <header className="rounded-2xl bg-gradient-to-r from-[#102338] to-[#164e78] p-5 text-white shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                <CalendarDays size={16} />
                Employee Portal
              </p>

              <h1 className="mt-2 text-2xl font-extrabold">
                Leave Management
              </h1>

              <p className="mt-1 text-sm text-slate-200">
                Apply for leave and track approval status.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccess("");
                loadLeaves();
              }}
              disabled={loading || submitting}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </header>

        {/* MESSAGES */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        {/* APPLY + HISTORY */}
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* APPLY FORM */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">
              Apply for Leave
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Fill in your leave details below.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
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
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
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
                    min={form.from_date || undefined}
                    required
                    value={form.to_date}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {requestedDays > 0 && (
                <div className="rounded-xl bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
                  Requested Duration:{" "}
                  <strong>{requestedDays} day(s)</strong>

                  <p className="mt-1 text-xs text-cyan-700">
                    Calendar days including weekends and holidays.
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="leave_type"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Leave Type
                </label>

                <div className="relative">
                  <select
                    id="leave_type"
                    name="leave_type"
                    required
                    value={form.leave_type}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 py-3 pr-10 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Select Leave Type
                    </option>

                    {LEAVE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
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
                  rows={4}
                  maxLength={2000}
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="Explain the reason for your leave..."
                  className="w-full resize-y rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {form.reason.length}/2000
                </p>
              </div>

              {overlappingRequests.length > 0 && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                  <AlertCircle size={17} className="shrink-0" />
                  <span>
                    You already have a Pending or Approved leave
                    request overlapping these dates.
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  submitting ||
                  loading ||
                  overlappingRequests.length > 0
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#102338] px-4 py-3 text-sm font-bold text-white hover:bg-[#1b3d5c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    Submit Leave Request
                  </>
                )}
              </button>

              <p className="text-xs leading-5 text-slate-500">
                Your request will remain Pending until reviewed
                by an admin or manager.
              </p>
            </form>
          </section>

          {/* LEAVE HISTORY */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold">
                Leave History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                View and track all your leave requests.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search leaves..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  aria-label="Filter leave status"
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
                <Loader2 size={20} className="animate-spin" />
                Loading leave history...
              </div>
            ) : filteredLeaves.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <CalendarDays
                  size={36}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-semibold text-slate-700">
                  No leave requests found
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {leaves.length === 0
                    ? "Your submitted requests will appear here."
                    : "Try changing the search or status filter."}
                </p>

                {leaves.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilter("All");
                      setSearch("");
                    }}
                    className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="max-h-[600px] space-y-3 overflow-y-auto p-4">
                {filteredLeaves.map((leave, index) => (
                  <article
                    key={
                      leave.id ??
                      `${leave.from_date}-${index}`
                    }
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-slate-50"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="break-words font-bold text-slate-900">
                          {leave.leave_type || "Leave"}
                        </h3>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <CalendarDays size={14} />
                          {formatDate(leave.from_date)}
                          {" – "}
                          {formatDate(leave.to_date)}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                          leave.status
                        )}`}
                      >
                        <StatusIcon status={leave.status} />
                        {leave.status || "Pending"}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                        {calculateDays(
                          leave.from_date,
                          leave.to_date
                        )}{" "}
                        day(s)
                      </span>

                      {leave.id && (
                        <span className="text-xs text-slate-400">
                          Request #{leave.id}
                        </span>
                      )}
                    </div>

                    {leave.reason && (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-500">
                          Reason
                        </p>

                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
                          {leave.reason}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}

            <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">
              Showing {filteredLeaves.length} of{" "}
              {leaves.length} requests
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
