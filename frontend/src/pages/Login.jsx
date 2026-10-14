
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  Settings,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function Login() {
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState("employee");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!loginId.trim() || !password) {
      setError("Please enter your login ID and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login_id: loginId.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Invalid login credentials.");
      }

      const user = data.user;

      if (!user || !data.access_token) {
        throw new Error("Login response is incomplete. Please contact admin.");
      }

      if (loginType === "employee" && user.role !== "employee") {
        throw new Error(
          "This is not an Employee account. Select Admin / Manager login."
        );
      }

      if (
        loginType === "admin" &&
        !["admin", "manager"].includes(user.role)
      ) {
        throw new Error(
          "This is not an Admin / Manager account. Select Employee login."
        );
      }

      const activeStorage = rememberMe
        ? window.localStorage
        : window.sessionStorage;

      const otherStorage = rememberMe
        ? window.sessionStorage
        : window.localStorage;

      activeStorage.setItem("access_token", data.access_token);
      activeStorage.setItem("user", JSON.stringify(user));

      otherStorage.removeItem("access_token");
      otherStorage.removeItem("user");

      if (["admin", "manager"].includes(user.role)) {
        navigate("/admin-dashboard");
      } else {
        navigate("/employee-dashboard");
      }
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          min-height: 100%;
          margin: 0;
        }

        body {
          overflow: hidden;
        }

        .login-screen {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;

          background-color: #dceeff;
          background-image:
            linear-gradient(
              115deg,
              rgba(220, 239, 255, 0.10),
              rgba(241, 248, 255, 0.18)
            ),
            url("/login-bg.png");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .login-card {
          width: min(1120px, 100%);
          height: min(690px, calc(100dvh - 40px));
          min-height: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.88);
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 25px 75px rgba(14, 43, 78, 0.25);
        }

        .login-visual {
          position: relative;
          isolation: isolate;
          min-height: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(28px, 3.8vw, 48px);
          color: white;
          background: #06264d;
        }

        .login-visual::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          background-image: url("/login-bg.png");
          background-size: cover;
          background-position: left center;
          background-repeat: no-repeat;
          transform: scale(1.02);
        }

        .login-visual::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background:
            linear-gradient(
              145deg,
              rgba(2, 25, 59, 0.96) 0%,
              rgba(4, 49, 96, 0.82) 52%,
              rgba(0, 91, 160, 0.44) 100%
            );
        }

        .login-form-panel {
          position: relative;
          min-width: 0;
          min-height: 0;
          overflow-y: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(24px, 3.4vw, 46px);
          background: rgba(249, 252, 255, 0.94);
          scrollbar-width: thin;
          scrollbar-color: #b9d5f5 transparent;
        }

        .login-form-inner {
          width: 100%;
          max-width: 410px;
          margin: auto;
        }

        .login-input {
          width: 100%;
          height: 50px;
          padding: 0 44px;
          border: 1px solid #cbdcf1;
          border-radius: 11px;
          background: rgba(230, 241, 255, 0.90);
          color: #10233d;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .login-input:focus {
          border-color: #3785e9;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.13);
        }

        .login-submit {
          width: 100%;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(100deg, #0756c9, #0875ee);
          color: white;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 5px 12px rgba(0, 87, 200, 0.20);
          transition: filter 0.2s, transform 0.2s;
        }

        .login-submit:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }

        .login-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .login-mobile-logo {
          display: none;
        }

        @media (max-height: 700px) and (min-width: 701px) {
          .login-card {
            height: calc(100dvh - 28px);
          }

          .login-visual {
            padding: 26px 34px;
          }

          .login-logo {
            width: 165px !important;
          }

          .login-welcome {
            margin-top: 24px !important;
          }

          .login-welcome h1 {
            margin-top: 12px !important;
            font-size: 32px !important;
          }

          .login-welcome p {
            margin-top: 10px !important;
            line-height: 1.5 !important;
          }

          .login-form-panel {
            padding: 20px 32px;
          }

          .login-tabs {
            margin-top: 18px !important;
          }

          .login-form {
            margin-top: 18px !important;
            gap: 12px !important;
          }

          .login-support {
            margin-top: 13px !important;
            padding-top: 10px !important;
          }
        }

        @media (max-width: 700px) {
          .login-screen {
            padding: 10px;
          }

          .login-card {
            width: 100%;
            height: calc(100dvh - 20px);
            grid-template-columns: 1fr;
            border-radius: 20px;
          }

          .login-visual {
            display: none;
          }

          .login-form-panel {
            padding: 22px;
          }

          .login-mobile-logo {
            display: block;
            margin-bottom: 20px;
          }
        }

        @media (max-height: 620px) {
          .login-screen {
            padding: 8px;
          }

          .login-card {
            height: calc(100dvh - 16px);
          }

          .login-form-panel {
            padding-top: 12px;
            padding-bottom: 12px;
          }

          .login-mobile-logo {
            margin-bottom: 10px;
          }
        }
      `}</style>

      <div className="login-card">
        {/* Left side: corporate background and welcome text */}
        <section className="login-visual">
          <div>
            <div className="inline-flex rounded-xl bg-white p-2.5 shadow-xl">
              <img
                src="/logo.png"
                alt="LoanDPR Creditum Management"
                className="login-logo h-auto w-48 object-contain"
              />
            </div>

            <div className="login-welcome mt-14 max-w-md">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-300">
                Employee Management System
              </p>

              <h1 className="mt-5 text-4xl font-extrabold leading-tight">
                Welcome to your
                <span className="mt-1 block text-sky-300">
                  employee portal
                </span>
              </h1>

              <p className="mt-5 text-sm leading-7 text-blue-50 sm:text-base">
                Securely manage attendance, daily work, tasks, leaves,
                holidays and employee information from one place.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md">
            <ShieldCheck className="h-6 w-6 shrink-0 text-sky-300" />
            <div>
              <p className="text-sm font-semibold">
                Secure company access
              </p>
              <p className="mt-1 text-xs text-blue-100">
                Your workplace, all in one place
              </p>
            </div>
          </div>
        </section>

        {/* Right side: sign-in form */}
        <section className="login-form-panel">
          <div className="login-form-inner">
            <div className="login-mobile-logo">
              <img
                src="/logo.png"
                alt="LoanDPR Creditum Management"
                className="h-auto w-40 object-contain"
              />
            </div>

            <p className="text-sm font-bold text-blue-700">
              LoanDPR Creditum Management Pvt. Ltd.
            </p>

            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Sign in
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Access your company account securely.
            </p>

            {/* Login type selector */}
            <div className="login-tabs mt-7 grid grid-cols-2 rounded-xl bg-slate-100/90 p-1">
              <button
                type="button"
                onClick={() => {
                  setLoginType("employee");
                  setError("");
                }}
                className={`flex items-center justify-center gap-2 rounded-lg px-2 py-3 text-sm font-semibold transition ${
                  loginType === "employee"
                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <UserRound className="h-4 w-4" />
                Employee Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginType("admin");
                  setError("");
                }}
                className={`flex items-center justify-center gap-2 rounded-lg px-2 py-3 text-sm font-semibold transition ${
                  loginType === "admin"
                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Settings className="h-4 w-4" />
                Admin / Manager
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="login-form mt-6 flex flex-col gap-4"
            >
              <div>
                <label
                  htmlFor="loginId"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  {loginType === "employee"
                    ? "Employee ID or Email"
                    : "Admin ID or Email"}
                </label>

                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="loginId"
                    type="text"
                    value={loginId}
                    onChange={(event) => setLoginId(event.target.value)}
                    placeholder={
                      loginType === "employee"
                        ? "Enter Employee ID or Email"
                        : "Enter Admin ID or Email"
                    }
                    autoComplete="username"
                    required
                    className="login-input"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
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
                  <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="login-input"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 py-0.5">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded accent-blue-600"
                />
                <span className="text-sm text-slate-600">
                  Remember me on this device
                </span>
              </label>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="login-submit"
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>

            <div className="login-support mt-5 flex items-start gap-3 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <p>
                For account access issues, contact your company administrator.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
