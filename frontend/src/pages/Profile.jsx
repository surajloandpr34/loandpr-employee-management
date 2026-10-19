
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
  Mail,
  Phone,
  Save,
  UserRound,
  RefreshCw,
  BriefcaseBusiness,
  Hash,
  ShieldCheck,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token")
  );
}

const emptyProfile = {
  full_name: "",
  email: "",
  mobile: "",
  date_of_birth: "",
  employee_id: "",
  department: "",
  role: "",
};

export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/employee/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Profile load nahi ho paayi.");
      }

      setProfile({
        full_name: data.full_name || "",
        email: data.email || "",
        mobile: data.mobile || "",
        date_of_birth: data.date_of_birth || "",
        employee_id: data.employee_id || "",
        department: data.department || "",
        role: data.role || "",
      });
    } catch (err) {
      setError(err.message || "Server se connect nahi ho paaya.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/employee/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: profile.full_name.trim(),
          email: profile.email.trim(),
          mobile: profile.mobile.trim() || null,
          date_of_birth: profile.date_of_birth || null,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Profile save nahi ho paayi.");
      }

      setProfile({
        full_name: data.full_name || "",
        email: data.email || "",
        mobile: data.mobile || "",
        date_of_birth: data.date_of_birth || "",
        employee_id: data.employee_id || "",
        department: data.department || "",
        role: data.role || "",
      });

      setSuccess("Profile successfully update ho gayi.");
    } catch (err) {
      setError(err.message || "Profile save karte waqt error aaya.");
    } finally {
      setSaving(false);
    }
  }

  const fieldClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const readOnlyClass =
    "w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500";

  if (loading) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center gap-3 bg-slate-50 text-sm text-slate-500">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden bg-slate-50 p-3 text-slate-900 sm:p-4">
      <header className="flex shrink-0 items-center gap-3 rounded-xl bg-gradient-to-r from-[#071a36] to-[#0b3158] px-4 py-3 text-white shadow-sm">
        <div className="rounded-lg bg-white/10 p-2">
          <UserRound className="h-5 w-5 text-cyan-200" />
        </div>

        <div className="min-w-0">
          <h1 className="text-lg font-bold sm:text-xl">My Profile</h1>
          <p className="text-[11px] text-slate-300 sm:text-xs">
            Personal information and account details
          </p>
        </div>

        <button
          type="button"
          onClick={loadProfile}
          disabled={saving}
          className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reload</span>
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex shrink-0 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <main className="min-h-0 flex-1 overflow-hidden">
        <div className="grid h-full min-h-0 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[minmax(220px,0.75fr)_minmax(0,1.5fr)]">
          {/* Employee information card */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex shrink-0 flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <UserRound className="h-8 w-8" />
              </div>

              <h2 className="mt-3 break-words text-base font-bold text-slate-900">
                {profile.full_name || "Employee"}
              </h2>

              <p className="mt-1 break-all text-xs text-slate-500">
                {profile.email || "Email not added"}
              </p>

              <span className="mt-2 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold capitalize text-blue-700">
                {profile.role || "Employee"}
              </span>
            </div>

            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-hidden border-t border-slate-100 pt-4">
              <div className="flex items-start gap-2">
                <Hash className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400">Employee ID</p>
                  <p className="break-words text-xs font-semibold text-slate-800">
                    {profile.employee_id || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400">Department</p>
                  <p className="break-words text-xs font-semibold text-slate-800">
                    {profile.department || "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400">Account role</p>
                  <p className="break-words text-xs font-semibold capitalize text-slate-800">
                    {profile.role || "employee"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400">Date of birth</p>
                  <p className="text-xs font-semibold text-slate-800">
                    {profile.date_of_birth || "Not added"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Editable personal details */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 shrink-0">
              <h2 className="text-base font-bold text-slate-900">
                Personal Information
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Update your details and save your changes.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-x-4 gap-y-3 overflow-hidden sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="full_name"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Full name
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="full_name"
                      name="full_name"
                      value={profile.full_name}
                      onChange={handleChange}
                      required
                      minLength={2}
                      maxLength={150}
                      autoComplete="name"
                      className={`${fieldClass} pl-9`}
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleChange}
                      required
                      maxLength={255}
                      autoComplete="email"
                      className={`${fieldClass} pl-9`}
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="mobile"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Mobile number
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={profile.mobile}
                      onChange={handleChange}
                      maxLength={20}
                      autoComplete="tel"
                      className={`${fieldClass} pl-9`}
                      placeholder="Enter mobile number"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="date_of_birth"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Date of birth
                  </label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={profile.date_of_birth || ""}
                      onChange={handleChange}
                      max={new Date().toLocaleDateString("en-CA")}
                      className={`${fieldClass} pl-9`}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Used for birthday greetings.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="employee_id"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Employee ID
                  </label>
                  <input
                    id="employee_id"
                    value={profile.employee_id}
                    readOnly
                    className={readOnlyClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Department
                  </label>
                  <input
                    id="department"
                    value={profile.department || "Not assigned"}
                    readOnly
                    className={readOnlyClass}
                  />
                </div>
              </div>

              <div className="mt-3 flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={loadProfile}
                  disabled={saving || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
