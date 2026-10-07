import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function getStoredAuth() {
  const localToken = localStorage.getItem("access_token");
  const sessionToken = sessionStorage.getItem("access_token");

  const token = localToken || sessionToken;

  const localUser = localStorage.getItem("user");
  const sessionUser = sessionStorage.getItem("user");

  const userString = localUser || sessionUser;

  let user = null;

  try {
    user = userString ? JSON.parse(userString) : null;
  } catch {
    user = null;
  }

  return {
    token,
    user,
  };
}

function AdminTasks() {
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [form, setForm] = useState({
    employee_id: "",
    title: "",
    description: "",
    task_date: "",
    status: "Pending",
  });

  // ============================================================
  // AUTH CHECK
  // ============================================================

  useEffect(() => {
    const auth = getStoredAuth();

    if (!auth.token || !auth.user) {
      navigate("/login", { replace: true });
      return;
    }

    setToken(auth.token);
    setCurrentUser(auth.user);

    if (
      auth.user.role !== "admin" &&
      auth.user.role !== "manager"
    ) {
      navigate("/employee-dashboard", { replace: true });
      return;
    }
  }, [navigate]);

  // ============================================================
  // API HEADERS
  // ============================================================

  const authHeaders = useMemo(() => {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [token]);

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    if (!token || !currentUser) {
      return;
    }

    if (
      currentUser.role !== "admin" &&
      currentUser.role !== "manager"
    ) {
      return;
    }

    loadData();
  }, [token, currentUser]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [employeesResponse, tasksResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/admin/employees`, {
            headers: authHeaders,
          }),

          fetch(`${API_URL}/api/admin/tasks`, {
            headers: authHeaders,
          }),
        ]);

      if (
        employeesResponse.status === 401 ||
        employeesResponse.status === 403 ||
        tasksResponse.status === 401 ||
        tasksResponse.status === 403
      ) {
        handleLogout();
        return;
      }

      if (!employeesResponse.ok) {
        const data = await employeesResponse.json().catch(() => ({}));

        throw new Error(
          data.detail || "Unable to load employees."
        );
      }

      if (!tasksResponse.ok) {
        const data = await tasksResponse.json().catch(() => ({}));

        throw new Error(
          data.detail || "Unable to load tasks."
        );
      }

      const employeeData = await employeesResponse.json();
      const taskData = await tasksResponse.json();

      setEmployees(employeeData);
      setTasks(taskData);
    } catch (err) {
      setError(
        err.message || "Something went wrong while loading data."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");

    navigate("/login", { replace: true });
  }

  // ============================================================
  // FORM
  // ============================================================

  function resetForm() {
    setForm({
      employee_id: "",
      title: "",
      description: "",
      task_date: "",
      status: "Pending",
    });

    setEditingTask(null);
  }

  function openCreateModal() {
    resetForm();
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(task) {
    setEditingTask(task);

    setForm({
      employee_id: String(task.employee_id || ""),
      title: task.title || "",
      description: task.description || "",
      task_date: task.task_date || "",
      status: task.status || "Pending",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setShowModal(false);
    resetForm();
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ============================================================
  // CREATE / UPDATE TASK
  // ============================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.employee_id) {
      setError("Please select an employee.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter task title.");
      return;
    }

    if (!form.task_date) {
      setError("Please select task date.");
      return;
    }

    try {
      setSaving(true);

      let response;

      if (editingTask) {
        response = await fetch(
          `${API_URL}/api/admin/tasks/${editingTask.id}`,
          {
            method: "PUT",
            headers: authHeaders,
            body: JSON.stringify({
              title: form.title.trim(),
              description:
                form.description.trim() || null,
              task_date: form.task_date,
              status: form.status,
            }),
          }
        );
      } else {
        response = await fetch(
          `${API_URL}/api/admin/tasks`,
          {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({
              employee_id: Number(form.employee_id),
              title: form.title.trim(),
              description:
                form.description.trim() || null,
              task_date: form.task_date,
            }),
          }
        );
      }

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (response.status === 403) {
        setError("You do not have permission to manage tasks.");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to save task."
        );
      }

      setSuccess(
        editingTask
          ? "Task updated successfully."
          : "Task assigned successfully."
      );

      setShowModal(false);
      resetForm();

      await loadData();
    } catch (err) {
      setError(
        err.message || "Unable to save task."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // DELETE TASK
  // ============================================================

  async function handleDelete(taskId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/admin/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (response.status === 403) {
        setError("You do not have permission to delete tasks.");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to delete task."
        );
      }

      setSuccess("Task deleted successfully.");

      await loadData();
    } catch (err) {
      setError(
        err.message || "Unable to delete task."
      );
    }
  }

  // ============================================================
  // EMPLOYEE NAME
  // ============================================================

  function getEmployeeName(employeeId) {
    const employee = employees.find(
      (item) => item.id === employeeId
    );

    if (!employee) {
      return "Employee";
    }

    return employee.full_name;
  }

  // ============================================================
  // FILTER
  // ============================================================

  const filteredTasks = tasks.filter((task) => {
    const employeeName = getEmployeeName(
      task.employee_id
    ).toLowerCase();

    const title = (task.title || "").toLowerCase();

    const searchValue = search
      .trim()
      .toLowerCase();

    if (!searchValue) {
      return true;
    }

    return (
      employeeName.includes(searchValue) ||
      title.includes(searchValue) ||
      (task.status || "")
        .toLowerCase()
        .includes(searchValue)
    );
  });

  // ============================================================
  // STATS
  // ============================================================

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const progressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white pt-[88px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading Task Management...</span>
        </div>
      </div>
    );
  }

  // ============================================================
  // UNAUTHORIZED
  // ============================================================

  if (
    currentUser &&
    currentUser.role !== "admin" &&
    currentUser.role !== "manager"
  ) {
    return (
      <div className="min-h-screen bg-slate-950 text-white pt-[88px] flex items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-red-500/20 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">
            Access Denied
          </h1>

          <p className="mt-3 text-slate-400">
            Task Management is available only for
            Admin and Manager accounts.
          </p>

          <button
            onClick={() =>
              navigate("/employee-dashboard")
            }
            className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950"
          >
            Go to Employee Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-[88px]">

      {/* HEADER */}

      <div className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-8">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-medium text-cyan-400">
                {currentUser?.role === "admin"
                  ? "Admin Panel"
                  : "Manager Panel"}
              </p>

              <h1 className="mt-1 text-3xl font-bold">
                Task Management
              </h1>

              <p className="mt-2 text-slate-400">
                Assign and manage employee tasks using
                real database records.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              <Plus className="h-5 w-5" />
              Assign New Task
            </button>

          </div>

        </div>
      </div>


      {/* CONTENT */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* ALERTS */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
            {success}
          </div>
        )}


        {/* STATS */}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Total Tasks
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalTasks}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-400">
              {pendingTasks}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-400">
              {progressTasks}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {completedTasks}
            </p>
          </div>

        </div>


        {/* TASK TABLE */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          <div className="flex flex-col gap-4 border-b border-slate-800 p-5 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-semibold">
                Employee Tasks
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {tasks.length} task
                {tasks.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="relative w-full md:w-80">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search tasks..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
              />

            </div>

          </div>


          {filteredTasks.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <CheckCircle2 className="mx-auto h-12 w-12 text-slate-700" />

              <h3 className="mt-4 text-lg font-semibold">
                No tasks found
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                There are no task records matching your
                search.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead>
                  <tr className="border-b border-slate-800 text-left text-sm text-slate-400">

                    <th className="px-6 py-4 font-medium">
                      Employee
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Task
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Date
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right font-medium">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredTasks.map((task) => (

                    <tr
                      key={task.id}
                      className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40"
                    >

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
                            <UserRound className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="font-medium">
                              {getEmployeeName(
                                task.employee_id
                              )}
                            </p>

                            <p className="text-xs text-slate-500">
                              Employee ID:{" "}
                              {task.employee_id}
                            </p>
                          </div>

                        </div>

                      </td>


                      <td className="max-w-xs px-6 py-4">

                        <p className="font-medium">
                          {task.title}
                        </p>

                        {task.description && (
                          <p className="mt-1 truncate text-sm text-slate-500">
                            {task.description}
                          </p>
                        )}

                      </td>


                      <td className="px-6 py-4 text-sm text-slate-300">
                        {task.task_date}
                      </td>


                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            task.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : task.status === "In Progress"
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {task.status}
                        </span>

                      </td>


                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openEditModal(task)
                            }
                            className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
                            title="Edit task"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(task.id)
                            }
                            className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-red-500 hover:text-red-400"
                            title="Delete task"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </main>


      {/* ========================================================
          CREATE / EDIT MODAL
      ========================================================= */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

              <div>
                <h2 className="text-xl font-semibold">
                  {editingTask
                    ? "Edit Task"
                    : "Assign New Task"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {editingTask
                    ? "Update the task details."
                    : "Assign a task to an employee."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* EMPLOYEE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Employee
                </label>

                <select
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleInputChange}
                  disabled={Boolean(editingTask)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    Select employee
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {employee.full_name} —{" "}
                      {employee.employee_id}
                    </option>
                  ))}
                </select>

              </div>


              {/* TITLE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Task Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  placeholder="Enter task title"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                />
              </div>


              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter task description"
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                />
              </div>


              {/* DATE + STATUS */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Task Date
                  </label>

                  <input
                    type="date"
                    name="task_date"
                    value={form.task_date}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  />
                </div>


                {editingTask && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Status
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                    >
                      <option value="Pending">
                        Pending
                      </option>

                      <option value="In Progress">
                        In Progress
                      </option>

                      <option value="Completed">
                        Completed
                      </option>
                    </select>
                  </div>
                )}

              </div>


              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {editingTask
                    ? "Update Task"
                    : "Assign Task"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminTasks;