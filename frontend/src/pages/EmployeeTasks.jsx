
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  Loader2,
  RefreshCw,
  Search,
  ListTodo,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const STATUSES = ["Pending", "In Progress", "Completed"];

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
}

function localToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return "Not specified";

  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

function statusStyle(status) {
  if (status === "Completed") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "In Progress") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
}

function SummaryCard({ label, value, icon: Icon, style }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${style}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function EmployeeTasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const today = localToday();

  const logout = useCallback(() => {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem("access_token");
      storage.removeItem("token");
      storage.removeItem("user");
    }

    navigate("/login", { replace: true });
  }, [navigate]);

  const loadTasks = useCallback(async (showLoader = true) => {
    const token = getToken();

    if (!token) {
      logout();
      return;
    }

    if (showLoader) setLoading(true);

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/employee/tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to view these tasks."
        );
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to load tasks.")
        );
      }

      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message || "Unable to connect to the server."
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function updateStatus(task, newStatus) {
    if (task.status === newStatus) return;
    if (updatingId !== null) return;

    const token = getToken();

    if (!token) {
      logout();
      return;
    }

    setUpdatingId(task.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/employee/tasks/${task.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Task status update nahi ho paaya."
          )
        );
      }

      setTasks((previous) =>
        previous.map((item) =>
          item.id === task.id ? data : item
        )
      );

      setSuccess(
        `"${task.title}" status changed to ${newStatus}.`
      );
    } catch (err) {
      setError(
        err.message || "Task status update failed."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const counts = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter(
        (task) => task.status === "Pending"
      ).length,
      progress: tasks.filter(
        (task) => task.status === "In Progress"
      ).length,
      completed: tasks.filter(
        (task) => task.status === "Completed"
      ).length,
      overdue: tasks.filter(
        (task) =>
          task.task_date < today &&
          task.status !== "Completed"
      ).length,
    };
  }, [tasks, today]);

  const completionRate = counts.total
    ? Math.round((counts.completed / counts.total) * 100)
    : 0;

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = tasks.filter((task) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Overdue"
          ? task.task_date < today &&
            task.status !== "Completed"
          : task.status === filter);

      const matchesSearch =
        !query ||
        `${task.title} ${task.description || ""} ${task.id}`
          .toLowerCase()
          .includes(query);

      return matchesFilter && matchesSearch;
    });

    return [...result].sort((a, b) => {
      if (sort === "oldest") {
        return (
          a.task_date.localeCompare(b.task_date) ||
          a.id - b.id
        );
      }

      if (sort === "due") {
        return (
          a.task_date.localeCompare(b.task_date) ||
          a.id - b.id
        );
      }

      return (
        b.task_date.localeCompare(a.task_date) ||
        b.id - a.id
      );
    });
  }, [tasks, filter, search, sort, today]);

  const filters = [
    { label: "All", count: counts.total },
    { label: "Pending", count: counts.pending },
    { label: "In Progress", count: counts.progress },
    { label: "Completed", count: counts.completed },
    { label: "Overdue", count: counts.overdue },
  ];

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <div className="mx-auto max-w-7xl space-y-5 pb-8">
        {/* HEADER */}
        <section className="rounded-2xl bg-gradient-to-r from-[#102338] to-[#15518a] p-5 text-white shadow-md sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">
                <ClipboardList size={16} />
                Employee Workspace
              </p>

              <h1 className="mt-2 text-2xl font-extrabold">
                My Tasks
              </h1>

              <p className="mt-2 text-sm text-slate-200">
                View assigned work, track progress and
                update task status.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccess("");
                loadTasks();
              }}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </section>

        {/* NOTICES */}
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

        {/* SUMMARY */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <SummaryCard
            label="Total Tasks"
            value={counts.total}
            icon={ClipboardList}
            style="bg-slate-100 text-slate-700"
          />

          <SummaryCard
            label="Pending"
            value={counts.pending}
            icon={Clock3}
            style="bg-amber-50 text-amber-700"
          />

          <SummaryCard
            label="In Progress"
            value={counts.progress}
            icon={ListTodo}
            style="bg-blue-50 text-blue-700"
          />

          <SummaryCard
            label="Completed"
            value={counts.completed}
            icon={CheckCircle2}
            style="bg-emerald-50 text-emerald-700"
          />
        </div>

        {/* COMPLETION PROGRESS */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900">
                Overall Task Progress
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {counts.completed} out of {counts.total} tasks
                completed
              </p>
            </div>

            <span className="text-2xl font-extrabold text-blue-700">
              {completionRate}%
            </span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-700 to-cyan-400 transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          {counts.overdue > 0 && (
            <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-red-600">
              <AlertCircle size={15} />
              {counts.overdue} overdue task(s) need attention.
            </p>
          )}
        </section>

        {/* FILTERS */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by task title or description..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm outline-none focus:border-blue-500 lg:w-48"
              >
                <option value="newest">Newest Date First</option>
                <option value="oldest">Oldest Date First</option>
                <option value="due">Due Date First</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setFilter(item.label)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  filter === item.label
                    ? "bg-blue-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item.label} ({item.count})
              </button>
            ))}
          </div>
        </section>

        {/* TASK LIST */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Assigned Tasks
            </h2>

            <span className="text-xs text-slate-500">
              {filteredTasks.length} showing
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border bg-white">
              <Loader2
                size={23}
                className="animate-spin text-blue-700"
              />
              <span className="text-sm text-slate-500">
                Loading your tasks...
              </span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
              <ClipboardList
                size={42}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-bold text-slate-800">
                No tasks found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {tasks.length === 0
                  ? "Admin ne abhi aapko koi task assign nahi kiya hai."
                  : "Try changing your search or filter."}
              </p>

              {tasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setFilter("All");
                    setSearch("");
                  }}
                  className="mt-4 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isCompleted = task.status === "Completed";
              const isOverdue =
                task.task_date < today && !isCompleted;

              const isToday = task.task_date === today;
              const isUpdating = updatingId === task.id;

              return (
                <article
                  key={task.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${statusStyle(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>

                        {isOverdue && (
                          <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                            Overdue
                          </span>
                        )}

                        {isToday && !isCompleted && (
                          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                            Due Today
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 break-words text-base font-bold text-slate-900 sm:text-lg">
                        {task.title}
                      </h3>

                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                        {task.description?.trim() ||
                          "No additional instructions provided."}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={15} />
                          Task Date: {formatDate(task.task_date)}
                        </span>

                        <span className="text-slate-400">
                          Task #{task.id}
                        </span>
                      </div>
                    </div>

                    <div className="w-full shrink-0 rounded-xl bg-slate-50 p-3 lg:w-52">
                      <label
                        htmlFor={`task-status-${task.id}`}
                        className="mb-2 block text-xs font-semibold text-slate-600"
                      >
                        Update Task Status
                      </label>

                      <div className="relative">
                        <select
                          id={`task-status-${task.id}`}
                          value={task.status}
                          disabled={updatingId !== null}
                          onChange={(event) =>
                            updateStatus(task, event.target.value)
                          }
                          className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 disabled:opacity-50"
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        {isUpdating ? (
                          <Loader2
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-700"
                          />
                        ) : (
                          <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                        )}
                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Status change automatically saves to the database.
                      </p>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
