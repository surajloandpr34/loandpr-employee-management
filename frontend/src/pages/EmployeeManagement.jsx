import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Edit,
  LoaderCircle,
  LockKeyhole,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  UserX,
  X,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const EMPTY_FORM = {
  full_name: "",
  employee_id: "",
  email: "",
  mobile: "",
  department: "",
  password: "",
};

function getStoredAuth() {
  for (const storage of [localStorage, sessionStorage]) {
    const token = storage.getItem("access_token");
    const userText = storage.getItem("user");

    if (token) {
      let user = null;

      try {
        user = userText ? JSON.parse(userText) : null;
      } catch {
        user = null;
      }

      return { token, user };
    }
  }

  return { token: null, user: null };
}

function getErrorMessage(data, fallback) {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item.msg).join(", ");
  }

  return fallback;
}

export default function EmployeeManagement() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [passwordEmployee, setPasswordEmployee] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const [auth, setAuth] = useState(() => getStoredAuth());

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");

    navigate("/login", { replace: true });
  }, [navigate]);

  const loadEmployees = useCallback(async () => {
    const currentAuth = getStoredAuth();
    setAuth(currentAuth);

    if (!currentAuth.token) {
      handleUnauthorized();
      return;
    }

    if (currentAuth.user?.role !== "admin") {
      setError("Employee management access sirf Admin ke liye hai.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/employees`,
        {
          headers: {
            Authorization: `Bearer ${currentAuth.token}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 403) {
        setError("Aapke account ko employee management ki permission nahi hai.");
        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Employees load nahi ho paaye.")
        );
      }

      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Server se connection nahi ho paaya.");
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  function openAddForm() {
    setEditingEmployee(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(employee) {
    setEditingEmployee(employee);

    setForm({
      full_name: employee.full_name || "",
      employee_id: employee.employee_id || "",
      email: employee.email || "",
      mobile: employee.mobile || "",
      department: employee.department || "",
      password: "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingEmployee(null);
    setForm(EMPTY_FORM);
  }

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const currentAuth = getStoredAuth();

    if (!currentAuth.token) {
      handleUnauthorized();
      return;
    }

    if (form.full_name.trim().length < 2) {
      setError("Full name kam se kam 2 characters ka hona chahiye.");
      return;
    }

    if (!editingEmployee && form.password.length < 8) {
      setError("Password kam se kam 8 characters ka hona chahiye.");
      return;
    }

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim() || null,
      department: form.department.trim() || null,
    };

    let endpoint = `${API_URL}/api/admin/employees`;
    let method = "POST";

    if (editingEmployee) {
      endpoint = `${endpoint}/${editingEmployee.id}`;
      method = "PUT";
    } else {
      payload.employee_id = form.employee_id.trim();
      payload.password = form.password;
    }

    setSaving(true);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${currentAuth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            editingEmployee
              ? "Employee update nahi ho paaya."
              : "Employee create nahi ho paaya."
          )
        );
      }

      closeForm();

      setSuccess(
        editingEmployee
          ? "Employee details update ho gayi hain."
          : "Naya employee successfully create ho gaya hai."
      );

      await loadEmployees();
    } catch (err) {
      setError(err.message || "Request complete nahi ho paayi.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleEmployeeStatus(employee) {
    const action = employee.is_active ? "deactivate" : "activate";

    if (
      !window.confirm(
        `Kya aap ${employee.full_name} ka account ${action} karna chahte hain?`
      )
    ) {
      return;
    }

    const currentAuth = getStoredAuth();

    if (!currentAuth.token) {
      handleUnauthorized();
      return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/api/admin/employees/${employee.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${currentAuth.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_active: !employee.is_active,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Employee status update nahi ho paaya.")
        );
      }

      setSuccess(
        `${employee.full_name} ka account ${action} ho gaya.`
      );

      await loadEmployees();
    } catch (err) {
      setError(err.message || "Status update nahi ho paaya.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordUpdate(event) {
    event.preventDefault();

    if (newPassword.length < 8) {
      setError("Naya password kam se kam 8 characters ka hona chahiye.");
      return;
    }

    const currentAuth = getStoredAuth();

    if (!currentAuth.token) {
      handleUnauthorized();
      return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/api/admin/employees/${passwordEmployee.id}/password`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${currentAuth.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Password update nahi ho paaya.")
        );
      }

      const employeeName = passwordEmployee.full_name;

      setPasswordEmployee(null);
      setNewPassword("");
      setSuccess(`${employeeName} ka password update ho gaya.`);
    } catch (err) {
      setError(err.message || "Password update nahi ho paaya.");
    } finally {
      setSaving(false);
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return [
      employee.full_name,
      employee.employee_id,
      employee.email,
      employee.department,
      employee.mobile,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );
  });

  const activeCount = employees.filter(
    (employee) => employee.is_active
  ).length;

  const inactiveCount = employees.length - activeCount;

  if (auth.user && auth.user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-red-500" />

          <h1 className="text-xl font-bold text-slate-900">
            Access Restricted
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Employee management page sirf Admin ke liye hai.
          </p>

          <button
            onClick={() => navigate("/admin-dashboard")}
            className="mt-6 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Dashboard par jaayein
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Back to admin dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Employee Management
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                LoanDPR Creditum Management Pvt. Ltd.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadEmployees}
              disabled={loading || saving}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>{error}</p>
            <button
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <p>{success}</p>
            <button
              onClick={() => setSuccess("")}
              aria-label="Dismiss success"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Employees"
            value={employees.length}
            icon={<BriefcaseBusiness className="h-5 w-5" />}
            color="blue"
          />

          <StatCard
            title="Active Employees"
            value={activeCount}
            icon={<UserCheck className="h-5 w-5" />}
            color="green"
          />

          <StatCard
            title="Inactive Employees"
            value={inactiveCount}
            icon={<UserX className="h-5 w-5" />}
            color="orange"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Employee Directory
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Employee records aur account status manage karein.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, ID, email search karein"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">
              <LoaderCircle className="h-6 w-6 animate-spin" />
              Employees load ho rahe hain...
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <UserRound className="mb-3 h-10 w-10 text-slate-300" />

              <h3 className="font-semibold text-slate-800">
                {search
                  ? "Koi matching employee nahi mila"
                  : "Abhi koi employee nahi hai"}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? "Search text badal kar dobara try karein."
                  : "Add Employee button se pehla employee create karein."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Employee",
                        "Employee ID",
                        "Department",
                        "Contact",
                        "Status",
                        "Actions",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700">
                              {(employee.full_name || "E")
                                .trim()
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {employee.full_name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {employee.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {employee.employee_id}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {employee.department || "Not assigned"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {employee.mobile || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              employee.is_active
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                employee.is_active
                                  ? "bg-green-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {employee.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <ActionButton
                              title="Edit employee"
                              onClick={() => openEditForm(employee)}
                            >
                              <Edit className="h-4 w-4" />
                            </ActionButton>

                            <ActionButton
                              title="Update password"
                              onClick={() => {
                                setError("");
                                setNewPassword("");
                                setPasswordEmployee(employee);
                              }}
                            >
                              <LockKeyhole className="h-4 w-4" />
                            </ActionButton>

                            <ActionButton
                              title={
                                employee.is_active
                                  ? "Deactivate employee"
                                  : "Activate employee"
                              }
                              onClick={() =>
                                toggleEmployeeStatus(employee)
                              }
                              disabled={saving}
                            >
                              {employee.is_active ? (
                                <UserX className="h-4 w-4 text-red-600" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-700" />
                              )}
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
                Showing {filteredEmployees.length} of {employees.length} employees
              </div>
            </>
          )}
        </section>
      </main>

      {showForm && (
        <Modal
          title={editingEmployee ? "Edit Employee" : "Add New Employee"}
          onClose={closeForm}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Full Name" required>
              <input
                name="full_name"
                value={form.full_name}
                onChange={updateForm}
                required
                minLength={2}
                maxLength={150}
                autoComplete="name"
                className={inputClass}
                placeholder="Employee ka full name"
              />
            </FormField>

            {!editingEmployee && (
              <FormField label="Employee ID" required>
                <input
                  name="employee_id"
                  value={form.employee_id}
                  onChange={updateForm}
                  required
                  minLength={2}
                  maxLength={50}
                  className={inputClass}
                  placeholder="Example: EMP001"
                />
              </FormField>
            )}

            <FormField label="Email Address" required>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateForm}
                required
                maxLength={255}
                autoComplete="email"
                className={inputClass}
                placeholder="employee@company.com"
              />
            </FormField>

            <FormField label="Mobile Number">
              <input
                name="mobile"
                value={form.mobile}
                onChange={updateForm}
                maxLength={20}
                autoComplete="tel"
                className={inputClass}
                placeholder="Mobile number"
              />
            </FormField>

            <FormField label="Department">
              <input
                name="department"
                value={form.department}
                onChange={updateForm}
                maxLength={100}
                className={inputClass}
                placeholder="Example: Accounts"
              />
            </FormField>

            {!editingEmployee && (
              <FormField label="Initial Password" required>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={updateForm}
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  className={inputClass}
                  placeholder="Minimum 8 characters"
                />
              </FormField>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {saving && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                {editingEmployee ? "Save Changes" : "Create Employee"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {passwordEmployee && (
        <Modal
          title="Update Employee Password"
          onClose={() => {
            if (!saving) {
              setPasswordEmployee(null);
              setNewPassword("");
            }
          }}
        >
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                {passwordEmployee.full_name}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Employee ID: {passwordEmployee.employee_id}
              </p>
            </div>

            <FormField label="New Password" required>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                className={inputClass}
                placeholder="Minimum 8 characters"
              />
            </FormField>

            <p className="text-xs leading-5 text-slate-500">
              Naya password employee ko securely communicate karein.
              Password ko chat ya public document mein share na karein.
            </p>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setPasswordEmployee(null);
                  setNewPassword("");
                }}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {saving && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                Update Password
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`rounded-xl p-2.5 ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function ActionButton({ title, onClick, disabled, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}