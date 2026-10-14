import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function Login() {
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState("employee");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!loginId.trim()) {
      setError("Please enter your Employee ID or Email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            login_id: loginId.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Invalid login credentials."
        );
      }

      const user = data.user;

      // Employee login tab
      if (
        loginType === "employee" &&
        user.role !== "employee"
      ) {
        throw new Error(
          "This account is not an Employee account. Please use Admin / Manager login."
        );
      }

      // Admin / Manager login tab
      if (
        loginType === "admin" &&
        !["admin", "manager"].includes(user.role)
      ) {
        throw new Error(
          "This account is not an Admin / Manager account. Please use Employee login."
        );
      }

      const storage = rememberMe
        ? window.localStorage
        : window.sessionStorage;

      storage.setItem(
        "access_token",
        data.access_token
      );

      storage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Remove stale session from other storage.
      const otherStorage = rememberMe
        ? window.sessionStorage
        : window.localStorage;

      otherStorage.removeItem("access_token");
      otherStorage.removeItem("user");

      if (
        user.role === "admin" ||
        user.role === "manager"
      ) {
        navigate("/admin-dashboard");
      } else {
        navigate("/employee-dashboard");
      }
    } catch (error) {
      setError(
        error.message ||
          "Something went wrong while logging in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
        <div className="grid lg:grid-cols-2">
          {/* Left Side */}
          <div className="hidden lg:flex bg-[#0b1f3a] text-white p-12 flex-col justify-between">
            <div>
              <img
                src="/logo.png"
                alt="LoanDPR Creditum Management"
                className="w-48 h-auto object-contain"
              />

              <div className="mt-16">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                  Employee Management System
                </p>

                <h1 className="mt-5 text-4xl font-bold leading-tight">
                  Welcome to your
                  <span className="block text-blue-300">
                    employee portal
                  </span>
                </h1>

                <p className="mt-6 max-w-md text-slate-300 leading-7">
                  Securely manage attendance, daily work,
                  tasks, leaves, holidays and employee
                  information from one place.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-300">
              <ShieldCheck className="w-5 h-5 text-blue-300" />
              Secure company access
            </div>
          </div>

          {/* Right Side */}
          <div className="p-6 sm:p-10 lg:p-12">
            <div className="lg:hidden mb-8">
              <img
                src="/logo.png"
                alt="LoanDPR Creditum Management"
                className="w-44 h-auto object-contain"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-700">
                LoanDPR Creditum Management Pvt. Ltd.
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Sign in
              </h2>

              <p className="mt-2 text-slate-500">
                Access your company account securely.
              </p>
            </div>

            {/* Login Type */}
            <div className="mt-8 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setLoginType("employee");
                  setError("");
                }}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  loginType === "employee"
                    ? "bg-white text-[#0b1f3a] shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Employee Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginType("admin");
                  setError("");
                }}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  loginType === "admin"
                    ? "bg-white text-[#0b1f3a] shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Admin / Manager
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              {/* Login ID */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Employee ID or Email
                </label>

                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                  <input
                    type="text"
                    value={loginId}
                    onChange={(event) =>
                      setLoginId(event.target.value)
                    }
                    placeholder={
                      loginType === "employee"
                        ? "Enter Employee ID or Email"
                        : "Enter Admin ID or Email"
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-12 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                />

                <span className="text-sm text-slate-600">
                  Remember me on this device
                </span>
              </label>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b1f3a] px-5 py-3.5 font-semibold text-white transition hover:bg-[#12345f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-3 text-xs text-slate-400">
              <Mail className="w-4 h-4" />
              For account access issues, contact your
              company administrator.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;