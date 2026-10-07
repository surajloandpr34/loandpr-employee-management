import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function Login() {
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState("employee");

  const [form, setForm] = useState({
    login_id: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  function handleLoginTypeChange(type) {
    setLoginType(type);
    setError("");

    setForm({
      login_id: "",
      password: "",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.login_id.trim()) {
      setError(
        loginType === "employee"
          ? "Please enter your Employee ID or Email."
          : "Please enter your Admin / Manager ID or Email."
      );

      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            login_id: form.login_id.trim(),
            password: form.password,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Invalid login credentials."
        );
      }

      const token = data.access_token;
      const user = data.user;

      if (!token || !user) {
        throw new Error(
          "Login response is incomplete."
        );
      }

      // ========================================================
      // CLEAR PREVIOUS SESSION
      // ========================================================

      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("user");


      // ========================================================
      // VERIFY SELECTED LOGIN TYPE
      //
      // Employee tab -> employee only
      // Admin tab    -> admin / manager only
      // ========================================================

      if (
        loginType === "employee" &&
        user.role !== "employee"
      ) {
        throw new Error(
          "This account is not an Employee account. Please use Admin / Manager Login."
        );
      }

      if (
        loginType === "admin" &&
        user.role !== "admin" &&
        user.role !== "manager"
      ) {
        throw new Error(
          "This account does not have Admin / Manager access."
        );
      }


      // ========================================================
      // SAVE AUTHENTICATION
      // ========================================================

      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      storage.setItem(
        "access_token",
        token
      );

      storage.setItem(
        "user",
        JSON.stringify(user)
      );


      // ========================================================
      // REDIRECT
      // ========================================================

      if (
        user.role === "admin" ||
        user.role === "manager"
      ) {
        navigate(
          "/admin-dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      if (user.role === "employee") {
        navigate(
          "/employee-dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      throw new Error(
        "Your account does not have a valid access role."
      );

    } catch (err) {
      setError(
        err.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-[88px]">

      {/* ======================================================
          TOP BACK BAR
      ======================================================= */}

      <div className="border-b border-slate-800 bg-slate-950">

        <div className="mx-auto max-w-7xl px-6 py-5">

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-cyan-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Website
          </Link>

        </div>

      </div>


      {/* ======================================================
          LOGIN SECTION
      ======================================================= */}

      <main className="relative overflow-hidden">

        {/* BACKGROUND DECORATION */}

        <div className="pointer-events-none absolute left-[-180px] top-[-180px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="pointer-events-none absolute bottom-[-200px] right-[-150px] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />


        <div className="relative mx-auto grid min-h-[calc(100vh-160px)] max-w-7xl items-center gap-12 px-6 py-14 lg:grid-cols-2">


          {/* ==================================================
              LEFT BRAND SECTION
          =================================================== */}

          <section className="hidden lg:block">

            <div className="max-w-xl">

              {/* BRAND */}

              <div className="mb-8 inline-flex items-center gap-4">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 shadow-xl">

                  <img
                    src="/logo.png"
                    alt="LoanDPR Creditum Management"
                    className="h-12 w-auto object-contain"
                  />

                </div>

                <div>

                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
                    Creditum Management
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    LoanDPR Creditum Management Pvt. Ltd.
                  </p>

                </div>

              </div>


              {/* HEADING */}

              <h1 className="text-5xl font-bold leading-tight text-white">
                Secure Employee
                <span className="block text-cyan-400">
                  Management Portal
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                Access your employee workspace, attendance,
                daily work, leave management and other
                company services through one secure portal.
              </p>


              {/* FEATURES */}

              <div className="mt-10 space-y-4">

                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      Secure Access
                    </p>

                    <p className="text-sm text-slate-500">
                      Protected account-based authentication
                    </p>
                  </div>

                </div>


                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      Employee Workspace
                    </p>

                    <p className="text-sm text-slate-500">
                      Attendance, work and leave management
                    </p>
                  </div>

                </div>


                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      Role-Based Access
                    </p>

                    <p className="text-sm text-slate-500">
                      Employee, Manager and Admin permissions
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* ==================================================
              LOGIN CARD
          =================================================== */}

          <section className="mx-auto w-full max-w-[500px]">

            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-black/30 backdrop-blur md:p-8">


              {/* CARD HEADER */}

              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">

                  {loginType === "employee" ? (
                    <UserRound className="h-7 w-7" />
                  ) : (
                    <ShieldCheck className="h-7 w-7" />
                  )}

                </div>


                <h2 className="mt-5 text-2xl font-bold text-white">
                  Welcome Back
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Sign in to your company portal
                </p>

              </div>


              {/* =================================================
                  LOGIN TYPE SWITCH
              ================================================== */}

              <div className="mt-7 rounded-2xl border border-slate-800 bg-slate-950 p-1.5">

                <div className="grid grid-cols-2 gap-1">

                  <button
                    type="button"
                    onClick={() =>
                      handleLoginTypeChange(
                        "employee"
                      )
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      loginType === "employee"
                        ? "bg-cyan-500 text-slate-950 shadow-lg"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <UserRound className="h-4 w-4" />

                    Employee Login
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      handleLoginTypeChange(
                        "admin"
                      )
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      loginType === "admin"
                        ? "bg-cyan-500 text-slate-950 shadow-lg"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />

                    Admin / Manager
                  </button>

                </div>

              </div>


              {/* SELECTED ROLE TEXT */}

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">

                <Building2 className="h-5 w-5 text-cyan-400" />

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Signing in as
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-white">
                    {loginType === "employee"
                      ? "Employee"
                      : "Administrator / Manager"}
                  </p>

                </div>

              </div>


              {/* ERROR */}

              {error && (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300">
                  {error}
                </div>
              )}


              {/* =================================================
                  LOGIN FORM
              ================================================== */}

              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-5"
              >

                {/* LOGIN ID */}

                <div>

                  <label
                    htmlFor="login_id"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    {loginType === "employee"
                      ? "Employee ID or Email"
                      : "Admin / Manager ID or Email"}
                  </label>

                  <input
                    id="login_id"
                    name="login_id"
                    type="text"
                    value={form.login_id}
                    onChange={handleChange}
                    placeholder={
                      loginType === "employee"
                        ? "Enter Employee ID or Email"
                        : "Enter Admin / Manager ID or Email"
                    }
                    autoComplete="username"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
                  />

                </div>


                {/* PASSWORD */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>

                  </div>

                </div>


                {/* REMEMBER */}

                <div className="flex items-center justify-between">

                  <label className="flex cursor-pointer items-center gap-2">

                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) =>
                        setRememberMe(
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                    />

                    <span className="text-sm text-slate-400">
                      Remember me
                    </span>

                  </label>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <LockKeyhole className="h-3.5 w-3.5" />
                    Secure Login
                  </div>

                </div>


                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3.5 font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading && (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}

                  {loading
                    ? "Authenticating..."
                    : loginType === "employee"
                    ? "Login to Employee Portal"
                    : "Login to Admin Portal"}

                </button>

              </form>


              {/* BOTTOM INFO */}

              <div className="mt-7 border-t border-slate-800 pt-5 text-center">

                <p className="text-xs leading-5 text-slate-500">
                  Account credentials are provided and
                  managed by authorized company personnel.
                </p>

                <Link
                  to="/contact"
                  className="mt-2 inline-block text-sm font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Contact Administration
                </Link>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default Login;