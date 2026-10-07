import {
  Bell,
  CalendarDays,
  ClipboardList,
  Clock3,
  FileText,
  Home,
  LogOut,
  Menu,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function PortalLayout({ children, userType = "Employee" }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const employeeMenu = [
    {
      label: "Dashboard",
      icon: Home,
      path: "/employee-dashboard",
    },
    {
      label: "My Tasks",
      icon: ClipboardList,
      path: "/tasks",
    },
    {
      label: "Attendance",
      icon: Clock3,
      path: "/attendance",
    },
    {
      label: "Leaves",
      icon: FileText,
      path: "/leaves",
    },
    {
      label: "Holidays",
      icon: CalendarDays,
      path: "/holidays",
    },
    {
      label: "Calendar",
      icon: CalendarDays,
      path: "/calendar",
    },
    {
      label: "Announcements",
      icon: Bell,
      path: "/announcements",
    },
    {
      label: "Profile",
      icon: UserRound,
      path: "/profile",
    },
  ];

  const adminMenu = [
    {
      label: "Dashboard",
      icon: Home,
      path: "/admin-dashboard",
    },
    {
      label: "Employees",
      icon: UsersRound,
      path: "/employees",
    },
    {
      label: "Attendance",
      icon: Clock3,
      path: "/attendance",
    },
    {
      label: "Tasks",
      icon: ClipboardList,
      path: "/tasks",
    },
    {
      label: "Leaves",
      icon: FileText,
      path: "/leaves",
    },
    {
      label: "Holidays",
      icon: CalendarDays,
      path: "/holidays",
    },
    {
      label: "Departments",
      icon: UsersRound,
      path: "/departments",
    },
    {
      label: "Announcements",
      icon: Bell,
      path: "/announcements",
    },
  ];

  const menuItems =
    userType === "Admin" ? adminMenu : employeeMenu;

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800">

      {/* ================= MOBILE OVERLAY ================= */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-col bg-[#102033] text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* LOGO */}

        <div className="flex h-[72px] items-center border-b border-white/10 px-5">

          <Link
            to={
              userType === "Admin"
                ? "/admin-dashboard"
                : "/employee-dashboard"
            }
            className="flex items-center gap-3"
            onClick={() => setSidebarOpen(false)}
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">

              <img
                src="/logo.png"
                alt="LoanDPR Creditum Management"
                className="h-7 w-auto object-contain"
              />

            </div>

            <div>
              <p className="text-sm font-bold tracking-tight">
                Creditum
              </p>

              <p className="text-[10px] text-slate-400">
                Employee Portal
              </p>
            </div>

          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>

        </div>

        {/* USER */}

        <div className="border-b border-white/10 px-4 py-4">

          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
              S
            </div>

            <div className="min-w-0">

              <p className="truncate text-xs font-semibold text-white">
                Suraj Jadhav
              </p>

              <p className="mt-0.5 text-[10px] text-slate-400">
                {userType}
              </p>

            </div>

          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 overflow-y-auto px-3 py-4">

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Main Menu
          </p>

          <div className="space-y-1">

            {menuItems.map((item) => {

              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >

                  <Icon size={17} />

                  <span>{item.label}</span>

                </Link>
              );
            })}

          </div>

        </nav>

        {/* LOGOUT */}

        <div className="border-t border-white/10 p-3">

          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={17} />
            Logout
          </Link>

        </div>

      </aside>

      {/* ================= MAIN AREA ================= */}

      <div className="min-h-screen lg:pl-[250px]">

        {/* TOP HEADER */}

        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div className="hidden sm:block">

              <p className="text-xs text-slate-400">
                Employee Management Portal
              </p>

              <p className="text-sm font-semibold text-slate-800">
                {userType} Workspace
              </p>

            </div>

          </div>

          <div className="flex items-center gap-4">

            {/* NOTIFICATION */}

            <button
              type="button"
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >

              <Bell size={19} />

              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />

            </button>

            {/* PROFILE */}

            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                S
              </div>

              <div className="hidden sm:block">

                <p className="text-xs font-semibold text-slate-800">
                  Suraj Jadhav
                </p>

                <p className="text-[10px] text-slate-400">
                  {userType}
                </p>

              </div>

            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}

        <main className="min-h-[calc(100vh-72px)]">
          {children}
        </main>

      </div>

    </div>
  );
}

export default PortalLayout;