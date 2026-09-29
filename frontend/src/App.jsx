import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  Users,
  CalendarCheck,
  ClipboardCheck,
  TrendingUp,
  ShieldCheck,
  Clock3,
} from "lucide-react";
import { useState } from "react";

function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Employee");
  const [rememberMe, setRememberMe] = useState(true);

  const roles = [
    { name: "Employee", icon: Users },
    { name: "Manager", icon: Users },
    { name: "Admin", icon: ShieldCheck },
  ];

  const features = [
    { icon: Users, title: "Manage", subtitle: "People" },
    { icon: CalendarCheck, title: "Track", subtitle: "Attendance" },
    { icon: ClipboardCheck, title: "Track", subtitle: "Work" },
    { icon: TrendingUp, title: "Build", subtitle: "Better Teams" },
  ];

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-blue-100">

      {/* TOP BAR */}
      <header className="h-10 bg-white/80 border-b border-blue-100 px-5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>System Online</span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden sm:inline">Employee Portal</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-slate-500">
          <Clock3 size={13} />
          <span>Secure Employee Workspace</span>
        </div>
      </header>

      {/* MAIN */}
      <main className="h-[calc(100vh-40px)] flex items-center overflow-hidden">

        <div className="w-full max-w-7xl mx-auto px-5 lg:px-8 py-4">

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 xl:gap-14 items-center">

            {/* ================= LEFT ================= */}
            <section className="hidden md:block">

              {/* Logo */}
              <img
                src="/logo.png"
                alt="LoanDPR Creditum Management Pvt. Ltd."
                className="w-52 lg:w-60 h-auto object-contain object-left"
              />

              <h1 className="mt-3 text-2xl lg:text-3xl xl:text-4xl font-bold text-[#123b78] leading-tight">
                LoanDPR Creditum
                <br />
                Management Pvt. Ltd.
              </h1>

              <p className="mt-1 text-base lg:text-lg text-[#45658e]">
                Employee Management Portal
              </p>

              <div className="mt-4">
                <p className="text-base lg:text-lg font-medium text-[#345b88]">
                  Empowering our people.
                </p>
                <p className="text-base lg:text-lg font-medium text-[#345b88]">
                  Building a better tomorrow.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-4 gap-3 mt-5 max-w-xl">
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title + feature.subtitle}
                      className="text-center"
                    >
                      <div className="w-11 h-11 mx-auto rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center">
                        <Icon
                          size={21}
                          className="text-blue-600"
                          strokeWidth={1.8}
                        />
                      </div>

                      <p className="mt-1.5 text-xs font-semibold text-[#254c7b]">
                        {feature.title}
                      </p>

                      <p className="text-xs text-[#254c7b]">
                        {feature.subtitle}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Illustration */}
              <div className="relative mt-5 h-36 lg:h-40 max-w-xl rounded-3xl bg-gradient-to-t from-blue-100/80 to-transparent overflow-hidden">

                <div className="absolute left-4 bottom-0 text-4xl">
                  🌿
                </div>

                <div className="absolute right-4 bottom-0 text-4xl">
                  🌿
                </div>

                {/* People illustration */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end">

                  <div className="relative w-20 h-32">
                    <div className="absolute left-6 top-1 w-9 h-9 rounded-full bg-[#f5c7a9]" />
                    <div className="absolute left-5 top-0 w-12 h-5 rounded-t-full bg-slate-800" />
                    <div className="absolute left-3 top-9 w-16 h-20 rounded-t-[25px] bg-blue-500" />
                  </div>

                  <div className="relative w-28 h-36">
                    <div className="absolute left-9 top-0 w-10 h-10 rounded-full bg-[#efbd9f]" />
                    <div className="absolute left-7 top-0 w-14 h-5 rounded-t-full bg-slate-800" />
                    <div className="absolute left-4 top-9 w-20 h-24 rounded-t-[30px] bg-blue-700" />

                    <div className="absolute left-0 top-18 w-24 h-16">
                      <div className="w-20 h-12 bg-slate-700 rounded-md border-2 border-slate-400" />
                      <div className="w-24 h-2 bg-slate-400 rounded-full" />
                    </div>
                  </div>

                  <div className="relative w-20 h-32">
                    <div className="absolute left-5 top-2 w-9 h-9 rounded-full bg-[#efc0a4]" />
                    <div className="absolute left-3 top-0 w-13 h-6 rounded-t-full bg-slate-800" />
                    <div className="absolute left-2 top-10 w-16 h-20 rounded-t-[25px] bg-teal-500" />
                  </div>

                </div>
              </div>

            </section>


            {/* ================= RIGHT LOGIN ================= */}
            <section className="w-full max-w-md mx-auto lg:max-w-lg">

              <div className="bg-white rounded-2xl shadow-xl border border-white p-5 sm:p-6 lg:p-7">

                {/* Mobile Logo */}
                <div className="md:hidden text-center mb-4">
                  <img
                    src="/logo.png"
                    alt="Company Logo"
                    className="w-36 h-auto mx-auto"
                  />
                </div>

                {/* Heading */}
                <div className="mb-5">
                  <h2 className="text-2xl lg:text-3xl font-bold text-[#123b78]">
                    Welcome Back
                  </h2>

                  <p className="mt-1 text-sm text-[#6480a4]">
                    Sign in to your account
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert(`Login as ${role}`);
                  }}
                  className="space-y-4"
                >

                  {/* EMAIL */}
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-[#234875]">
                      Employee ID / Email
                    </label>

                    <div className="relative">
                      <Mail
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#53759f]"
                      />

                      <input
                        type="text"
                        placeholder="Enter your employee ID or email"
                        className="w-full h-11 pl-10 pr-3 rounded-lg border border-blue-100 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>


                  {/* PASSWORD */}
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-[#234875]">
                      Password
                    </label>

                    <div className="relative">
                      <Lock
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#53759f]"
                      />

                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="w-full h-11 pl-10 pr-10 rounded-lg border border-blue-100 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#53759f]"
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>


                  {/* REMEMBER */}
                  <div className="flex items-center justify-between text-xs">

                    <button
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className="flex items-center gap-2 text-slate-600"
                    >
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          rememberMe
                            ? "bg-blue-600 border-blue-600"
                            : "border-slate-300"
                        }`}
                      >
                        {rememberMe && (
                          <Check size={11} className="text-white" />
                        )}
                      </span>

                      Remember me
                    </button>

                    <button
                      type="button"
                      className="text-blue-600 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>


                  {/* LOGIN */}
                  <button
                    type="submit"
                    className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-semibold text-sm shadow-md shadow-blue-200 transition flex items-center justify-center gap-2"
                  >
                    Sign In
                    <ArrowRight size={17} />
                  </button>


                  {/* OR */}
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-xs text-slate-400">
                      OR
                    </span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>


                  {/* ROLES */}
                  <div>
                    <p className="text-xs font-semibold text-[#234875] mb-2">
                      Select Your Role
                    </p>

                    <div className="grid grid-cols-3 gap-2">

                      {roles.map((item) => {
                        const Icon = item.icon;
                        const active = role === item.name;

                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => setRole(item.name)}
                            className={`h-10 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-medium transition ${
                              active
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "border-blue-100 text-[#34577f] hover:bg-blue-50"
                            }`}
                          >
                            <Icon size={15} />
                            {item.name}
                          </button>
                        );
                      })}

                    </div>
                  </div>


                  {/* SECURITY */}
                  <div className="flex justify-center items-center gap-1.5 pt-1 text-xs text-[#6480a4]">
                    <ShieldCheck
                      size={15}
                      className="text-blue-600"
                    />
                    Your data is secure and protected
                  </div>

                </form>
              </div>

            </section>

          </div>

        </div>
      </main>
    </div>
  );
}

export default App;