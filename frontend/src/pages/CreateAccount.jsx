import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function CreateAccount() {
  const [accountType, setAccountType] = useState("employee");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAccountType = (type) => {
    setAccountType(type);

    setFormData({
      fullName: "",
      employeeId: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Password and Confirm Password do not match.");
      return;
    }

    alert(
      `${accountType === "admin" ? "Admin" : "Employee"} account creation is currently in demo mode. Backend registration will be connected next.`,
    );
  };

  return (
    <main className="relative mt-[88px] min-h-[calc(100vh-88px)] overflow-hidden bg-slate-950">
      {/* ================= BACKGROUND ================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-cyan-500/10 blur-3xl" />

        <div
          className="absolute -bottom-40 -right-40 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-600/10 blur-3xl"
          style={{ animationDelay: "2s" }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(6,182,212,0.08),transparent_30%),radial-gradient(circle_at_80%_50%,rgba(37,99,235,0.08),transparent_30%)]" />
      </div>

      {/* ================= MAIN ================= */}
      <div className="relative flex min-h-[calc(100vh-88px)] items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/10 bg-white shadow-2xl shadow-black/40 lg:grid-cols-[1.1fr_0.9fr]">

          {/* ================= LEFT SIDE ================= */}
          <section className="relative hidden min-h-[720px] overflow-hidden bg-slate-950 lg:flex">
            <div className="absolute -left-24 top-20 h-72 w-72 rounded-full border border-cyan-400/10" />

            <div className="absolute -left-16 top-28 h-56 w-56 rounded-full border border-cyan-400/10" />

            <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />

            <div className="relative flex w-full flex-col justify-between p-12 xl:p-16">

              {/* LOGO */}
              <div>
                <Link to="/" className="inline-block">
                  <img
                    src="/logo.png"
                    alt="LoanDPR Creditum Management"
                    className="h-28 w-auto object-contain transition duration-500 hover:scale-105 xl:h-32"
                  />
                </Link>

                <div className="mt-14 max-w-lg">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                    Creditum Management
                  </p>

                  <h1 className="mt-5 text-5xl font-bold leading-tight text-white xl:text-6xl">
                    Join the
                    <span className="block text-cyan-400">
                      Workspace
                    </span>
                  </h1>

                  <p className="mt-6 max-w-md text-base leading-8 text-slate-400">
                    Create your account to access your Creditum Workspace
                    and manage your day-to-day work efficiently.
                  </p>
                </div>
              </div>

              {/* BOTTOM */}
              <div>
                <div className="mb-8 h-px w-full bg-white/10" />

                <div className="flex items-center gap-7">
                  <div>
                    <p className="text-xl font-bold text-white">
                      Secure
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Protected Access
                    </p>
                  </div>

                  <div className="h-10 w-px bg-white/10" />

                  <div>
                    <p className="text-xl font-bold text-white">
                      Simple
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Easy Registration
                    </p>
                  </div>

                  <div className="h-10 w-px bg-white/10" />

                  <div>
                    <p className="text-xl font-bold text-white">
                      Smart
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Organized Work
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= RIGHT SIDE ================= */}
          <section className="flex min-h-[720px] items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-12">
            <div className="w-full max-w-md">

              {/* MOBILE LOGO */}
              <div className="mb-7 text-center lg:hidden">
                <Link to="/">
                  <img
                    src="/logo.png"
                    alt="LoanDPR Creditum Management"
                    className="mx-auto h-20 w-auto object-contain"
                  />
                </Link>
              </div>

              {/* HEADING */}
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
                  Account Registration
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-950">
                  Create Account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create your account to get started.
                </p>
              </div>

              {/* ACCOUNT TYPE */}
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Account Type
                </p>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => handleAccountType("employee")}
                    className={`rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      accountType === "employee"
                        ? "bg-white text-cyan-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Employee
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAccountType("admin")}
                    className={`rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      accountType === "admin"
                        ? "bg-white text-cyan-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="mt-5 space-y-4"
              >
                {/* FULL NAME */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                    />
                  </div>
                </div>

                {/* EMPLOYEE ID */}
                <div>
                  <label
                    htmlFor="employeeId"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    {accountType === "admin"
                      ? "Admin ID"
                      : "Employee ID"}
                  </label>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="employeeId"
                      name="employeeId"
                      type="text"
                      required
                      value={formData.employeeId}
                      onChange={handleChange}
                      placeholder={
                        accountType === "admin"
                          ? "Enter admin ID"
                          : "Enter employee ID"
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                    />
                  </div>
                </div>

                {/* EMAIL + MOBILE */}
                <div className="grid gap-4 sm:grid-cols-2">

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email address"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="mobile"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Mobile
                    </label>

                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        required
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="Mobile number"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                      />
                    </div>
                  </div>

                </div>

                {/* PASSWORD */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) => !previous,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* CREATE BUTTON */}
                <button
                  type="submit"
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-600/20 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                >
                  Create Account

                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </form>

              {/* LOGIN LINK */}
              <div className="mt-6 border-t border-slate-200 pt-5 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?
                </p>

                <Link
                  to="/login"
                  className="mt-1 inline-block text-sm font-bold text-cyan-600 transition hover:text-cyan-700"
                >
                  Sign In
                </Link>
              </div>

              {/* BACK */}
              <div className="mt-5 text-center">
                <Link
                  to="/"
                  className="text-sm font-medium text-slate-400 transition hover:text-cyan-600"
                >
                  ← Back to Website
                </Link>
              </div>

            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default CreateAccount;