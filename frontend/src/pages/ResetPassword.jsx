import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(
    location.search
  );

  const initialToken =
    queryParams.get("token") || "";

  const initialEmail =
    queryParams.get("email") || "";

  const [email, setEmail] =
    useState(initialEmail);

  const [resetToken, setResetToken] =
    useState(initialToken);

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  useEffect(() => {
    if (initialToken) {
      setResetToken(initialToken);
    }

    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialToken, initialEmail]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError(
        "Please enter your registered email."
      );
      return;
    }

    if (!resetToken.trim()) {
      setError(
        "Please enter your password reset token."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            reset_token: resetToken.trim(),
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to reset password."
        );
      }

      setSuccess(true);
    } catch (error) {
      setError(
        error.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 sm:p-10 text-center shadow-2xl border border-slate-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Password Reset Successful
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your password has been changed successfully.
            You can now sign in using your new password.
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-7 w-full rounded-xl bg-[#0b1f3a] px-5 py-3.5 font-semibold text-white hover:bg-[#12345f]"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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
            <KeyRound className="h-7 w-7 text-blue-700" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Reset Password
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your reset token and choose a new
            password.
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
              className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Reset Token
            </label>

            <textarea
              value={resetToken}
              onChange={(event) =>
                setResetToken(event.target.value)
              }
              placeholder="Paste your reset token"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              New Password
            </label>

            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 pr-12 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                autoComplete="new-password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Confirm New Password
            </label>

            <div className="relative">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 pr-12 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                autoComplete="new-password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#0b1f3a] px-5 py-3.5 font-semibold text-white hover:bg-[#12345f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Resetting Password..."
              : "Reset Password"}
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

export default ResetPassword;