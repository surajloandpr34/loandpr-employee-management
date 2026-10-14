
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
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
      const response = await fetch(
        `${API_URL}/api/employee/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Profile load nahi ho paayi."
        );
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
      setError(
        err.message || "Server se connect nahi ho paaya."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));

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
      const response = await fetch(
        `${API_URL}/api/employee/profile`,
        {
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
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Profile save nahi ho paayi."
        );
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
      setError(
        err.message || "Profile save karte waqt error aaya."
      );
    } finally {
      setSaving(false);
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  const readOnlyClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-slate-50 text-slate-500">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-5 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("/employee-dashboard")}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <UserRound className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              My Profile
            </h1>
            <p className="text-sm text-slate-500">
              View and update your personal information
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.5fr]">
          <section className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <UserRound className="h-11 w-11" />
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                {profile.full_name || "Employee"}
              </h2>

              <p className="mt-1 break-all text-sm text-slate-500">
                {profile.email}
              </p>

              <span className="mt-3 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                {profile.role || "Employee"}
              </span>
            </div>

            <div className="mt-7 space-y-4 border-t border-slate-100 pt-5">
              <div className="flex items-start gap-3">
                <Hash className="mt-0.5 h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Employee ID</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {profile.employee_id || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BriefcaseBusiness className="mt-0.5 h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Department</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {profile.department || "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Account role</p>
                  <p className="mt-1 font-semibold capitalize text-slate-800">
                    {profile.role || "employee"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Personal Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Update your details and save your changes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="full_name"
                  className="text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="full_name"
                    name="full_name"
                    value={profile.full_name}
                    onChange={handleChange}
                    required
                    minLength={2}
                    maxLength={150}
                    autoComplete="name"
                    className={`${fieldClass} pl-11`}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    required
                    maxLength={255}
                    autoComplete="email"
                    className={`${fieldClass} pl-11`}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="mobile"
                  className="text-sm font-semibold text-slate-700"
                >
                  Mobile number
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    value={profile.mobile}
                    onChange={handleChange}
                    maxLength={20}
                    autoComplete="tel"
                    className={`${fieldClass} pl-11`}
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="date_of_birth"
                  className="text-sm font-semibold text-slate-700"
                >
                  Date of birth
                </label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={profile.date_of_birth || ""}
                    onChange={handleChange}
                    max={new Date().toLocaleDateString("en-CA")}
                    className={`${fieldClass} pl-11`}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Your birthday can be used for company birthday greetings.
                </p>
              </div>

              <div>
                <label
                  htmlFor="employee_id"
                  className="text-sm font-semibold text-slate-700"
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
                  className="text-sm font-semibold text-slate-700"
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

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={loadProfile}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset changes
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
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
