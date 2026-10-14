import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [developmentToken, setDevelopmentToken] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setDevelopmentToken("");

    if (!email.trim()) {
      setError("Please enter your registered email.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to process password reset request."
        );
      }

      setMessage(
        data.message ||
          "Password reset instructions have been generated."
      );

      if (data.development_reset_token) {
        setDevelopmentToken(
          data.development_reset_token
        );
      }
    } catch (error) {
      setError(
        error.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 sm:p-10 shadow-2xl border border-slate-200">
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="LoanDPR Creditum Management"
            className="w-48 h-auto object-contain"
          />
        </div>

        <div className="mt-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <Mail className="h-7 w-7 text-blue-700" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Forgot Password?
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your registered company email address
            to start the password reset process.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Registered Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@company.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              autoComplete="email"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{message}</span>
              </div>
            </div>
          )}

          {developmentToken && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Local Development Reset Token
              </p>

              <p className="mt-2 break-all rounded-lg bg-white p-3 font-mono text-xs text-slate-700 border border-amber-200">
                {developmentToken}
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/reset-password?token=${encodeURIComponent(
                      developmentToken
                    )}&email=${encodeURIComponent(
                      email
                    )}`
                  )
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700"
              >
                Continue to Reset Password
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#0b1f3a] px-5 py-3.5 font-semibold text-white transition hover:bg-[#12345f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Processing..."
              : "Send Reset Instructions"}
          </button>
        </form>

        <Link
          to="/login"
          className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;