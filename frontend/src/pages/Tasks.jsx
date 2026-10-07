import {
  CheckCircle2,
  Clock3,
  Search,
  RefreshCw,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function getAuth() {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  const userData =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  let user = null;

  try {
    user = userData
      ? JSON.parse(userData)
      : null;
  } catch {
    user = null;
  }

  return {
    token,
    user,
  };
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function formatAssignedTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}


function getDateOnly(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);

  const [activeFilter, setActiveFilter] =
    useState("Today");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [updatingTaskId, setUpdatingTaskId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  // ============================================================
  // LOAD TASKS
  // ============================================================

  const loadTasks = async () => {
    const { token } = getAuth();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/employee/tasks`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem(
          "access_token"
        );
        localStorage.removeItem("user");

        sessionStorage.removeItem(
          "access_token"
        );
        sessionStorage.removeItem("user");

        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to load tasks."
        );
      }

      setTasks(data);
    } catch (err) {
      console.error(
        "Task loading error:",
        err
      );

      setError(
        err.message ||
          "Unable to connect to backend."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadTasks();
  }, []);


  // ============================================================
  // UPDATE STATUS
  // ============================================================

  const handleStatusChange = async (
    taskId,
    status
  ) => {
    const { token } = getAuth();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setUpdatingTaskId(taskId);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/employee/tasks/${taskId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem(
          "access_token"
        );
        localStorage.removeItem("user");

        sessionStorage.removeItem(
          "access_token"
        );
        sessionStorage.removeItem("user");

        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to update task."
        );
      }

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === taskId
            ? data
            : task
        )
      );

      setMessage(
        "Task status updated successfully."
      );
    } catch (err) {
      console.error(
        "Task status error:",
        err
      );

      setError(
        err.message ||
          "Unable to update task."
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };


  // ============================================================
  // DATE FILTER
  // ============================================================

  const filteredByDate = useMemo(() => {
    const now = new Date();

    const today = getDateOnly(now);

    if (activeFilter === "Today") {
      return tasks.filter(
        (task) =>
          task.task_date === today
      );
    }

    if (activeFilter === "This Week") {
      const currentDay =
        now.getDay();

      const mondayOffset =
        currentDay === 0
          ? -6
          : 1 - currentDay;

      const weekStart =
        new Date(now);

      weekStart.setDate(
        now.getDate() + mondayOffset
      );

      weekStart.setHours(
        0,
        0,
        0,
        0
      );

      const weekEnd =
        new Date(weekStart);

      weekEnd.setDate(
        weekStart.getDate() + 6
      );

      weekEnd.setHours(
        23,
        59,
        59,
        999
      );

      return tasks.filter((task) => {
        const taskDate = new Date(
          `${task.task_date}T00:00:00`
        );

        return (
          taskDate >= weekStart &&
          taskDate <= weekEnd
        );
      });
    }

    if (activeFilter === "This Month") {
      const month =
        now.getMonth();

      const year =
        now.getFullYear();

      return tasks.filter((task) => {
        const taskDate = new Date(
          `${task.task_date}T00:00:00`
        );

        return (
          taskDate.getMonth() === month &&
          taskDate.getFullYear() === year
        );
      });
    }

    return tasks;
  }, [tasks, activeFilter]);


  // ============================================================
  // SEARCH
  // ============================================================

  const filteredTasks = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    if (!searchValue) {
      return filteredByDate;
    }

    return filteredByDate.filter(
      (task) =>
        task.title
          .toLowerCase()
          .includes(searchValue) ||
        (task.description || "")
          .toLowerCase()
          .includes(searchValue)
    );
  }, [filteredByDate, search]);


  // ============================================================
  // REAL COUNTS
  // ============================================================

  const completedCount =
    filteredByDate.filter(
      (task) =>
        task.status === "Completed"
    ).length;

  const inProgressCount =
    filteredByDate.filter(
      (task) =>
        task.status === "In Progress"
    ).length;

  const pendingCount =
    filteredByDate.filter(
      (task) =>
        task.status === "Pending"
    ).length;


  // ============================================================
  // STATUS STYLE
  // ============================================================

  const getStatusClasses = (
    status
  ) => {
    if (status === "Completed") {
      return "bg-emerald-50 text-emerald-600";
    }

    if (status === "In Progress") {
      return "bg-blue-50 text-blue-600";
    }

    return "bg-orange-50 text-orange-600";
  };


  const { user } = getAuth();


  return (
    <main className="min-h-screen bg-slate-100">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-slate-200 bg-slate-950 text-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

          <div className="flex items-center gap-4">

            <Link
              to="/employee-dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-cyan-500 hover:text-white"
            >
              ←
            </Link>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Employee Workspace
              </p>

              <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                Daily Work
              </h1>
            </div>

          </div>


          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-semibold">
                {user?.full_name ||
                  "Employee"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {user?.employee_id || "—"}
              </p>

            </div>

            <img
              src="/logo.png"
              alt="LoanDPR Creditum Management"
              className="hidden h-11 w-auto object-contain md:block"
            />

          </div>

        </div>

      </header>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-7">


        {/* PAGE HEADER */}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <h1 className="text-2xl font-bold text-slate-900">
              My Tasks
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View your assigned daily work and
              update task progress.
            </p>

          </div>


          <button
            type="button"
            onClick={loadTasks}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>


        {/* MESSAGES */}

        {message && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}


        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}


        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <div className="mb-5 grid gap-4 sm:grid-cols-3">

          {/* COMPLETED */}

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={20} />
              </div>

              <div>

                <p className="text-xs text-slate-400">
                  Completed
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {completedCount}
                </p>

              </div>

            </div>

          </div>


          {/* IN PROGRESS */}

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Clock3 size={20} />
              </div>

              <div>

                <p className="text-xs text-slate-400">
                  In Progress
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {inProgressCount}
                </p>

              </div>

            </div>

          </div>


          {/* PENDING */}

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                <Clock3 size={20} />
              </div>

              <div>

                <p className="text-xs text-slate-400">
                  Pending
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {pendingCount}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            TASK CARD
        ===================================================== */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">


          {/* FILTER HEADER */}

          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">


            {/* FILTER */}

            <div className="flex rounded-lg bg-slate-100 p-1">

              {[
                "Today",
                "This Week",
                "This Month",
              ].map((filter) => (

                <button
                  key={filter}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      filter
                    )
                  }
                  className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                    activeFilter === filter
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {filter}
                </button>

              ))}

            </div>


            {/* SEARCH */}

            <div className="relative w-full lg:w-64">

              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search task..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>


          {/* =====================================================
              TABLE
          ===================================================== */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50">

                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Date
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Assigned
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Task
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {loading ? (

                  <tr>

                    <td
                      colSpan="4"
                      className="px-5 py-12 text-center"
                    >

                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                      <p className="mt-3 text-sm text-slate-500">
                        Loading tasks...
                      </p>

                    </td>

                  </tr>

                ) : filteredTasks.length ===
                  0 ? (

                  <tr>

                    <td
                      colSpan="4"
                      className="px-5 py-12 text-center"
                    >

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Search size={20} />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        No tasks found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        No assigned tasks are available
                        for this view.
                      </p>

                    </td>

                  </tr>

                ) : (

                  filteredTasks.map(
                    (task) => (

                      <tr
                        key={task.id}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                          {formatDate(
                            task.task_date
                          )}
                        </td>


                        <td className="px-5 py-4 text-xs text-slate-500">
                          {formatAssignedTime(
                            task.created_at
                          )}
                        </td>


                        <td className="px-5 py-4">

                          <p className="text-xs font-semibold text-slate-800">
                            {task.title}
                          </p>

                          {task.description && (
                            <p className="mt-1 max-w-md text-xs text-slate-400">
                              {task.description}
                            </p>
                          )}

                        </td>


                        <td className="px-5 py-4">

                          <select
                            value={task.status}
                            disabled={
                              updatingTaskId ===
                              task.id
                            }
                            onChange={(
                              event
                            ) =>
                              handleStatusChange(
                                task.id,
                                event.target.value
                              )
                            }
                            className={`rounded-md border-0 px-2.5 py-1.5 text-[10px] font-bold outline-none ${getStatusClasses(
                              task.status
                            )}`}
                          >

                            <option value="Completed">
                              Completed
                            </option>

                            <option value="In Progress">
                              In Progress
                            </option>

                            <option value="Pending">
                              Pending
                            </option>

                          </select>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* FOOT NOTE */}

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">

          <Clock3 size={14} />

          Showing{" "}
          {filteredTasks.length}{" "}
          task
          {filteredTasks.length !== 1
            ? "s"
            : ""}{" "}
          in{" "}
          {activeFilter.toLowerCase()}{" "}
          view.

        </div>

      </div>

    </main>
  );
}


export default Tasks;