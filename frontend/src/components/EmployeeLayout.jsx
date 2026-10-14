
import { useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CalendarCheck2,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/employee-dashboard", icon: Home },
  { label: "My Tasks", path: "/tasks", icon: BriefcaseBusiness },
  { label: "Attendance", path: "/attendance", icon: CalendarCheck2 },
  { label: "Leaves", path: "/leaves", icon: ClipboardList },
  { label: "Holidays", path: "/holidays", icon: CalendarDays },
  { label: "Calendar", path: "/calendar", icon: CalendarDays },
  { label: "Announcements", path: "/announcements", icon: Bell },
  { label: "Profile", path: "/profile", icon: UserRound },
];

function readUser() {
  try {
    return JSON.parse(
      localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      "null"
    );
  } catch {
    return null;
  }
}

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const user = readUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  function SidebarContent() {
    return (
      <>
        <div className="flex h-[84px] items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-1">
            <img
              src="/logo.png"
              alt="LoanDPR logo"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Creditum</h1>
            <p className="text-sm text-slate-400">Employee Portal</p>
          </div>
        </div>

        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.07] p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
              {(user?.full_name || user?.name || "E").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">
                {user?.full_name || user?.name || "Employee"}
              </p>
              <p className="mt-1 text-sm capitalize text-slate-400">
                {user?.role || "Employee"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Main Menu
          </p>

          {menuItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f6fb]">
      {/* Desktop sidebar stays in place */}
      <aside className="hidden w-[270px] shrink-0 flex-col bg-[#102338] lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <aside className="flex w-[280px] max-w-[85vw] flex-col bg-[#102338] shadow-2xl">
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="flex-1 bg-black/50"
          />
        </div>
      )}

      {/* Only this right side changes between routes */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-[84px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-400">
                Employee Management Portal
              </p>
              <h2 className="truncate text-lg font-bold text-slate-900">
                Employee Workspace
              </h2>
            </div>
          </div>

          <div className="ml-3 flex shrink-0 items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              aria-label="Refresh page"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <CalendarDays className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/announcements")}
              aria-label="Announcements"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <Bell className="h-5 w-5" />
            </button>

            <div className="hidden h-9 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                {(user?.full_name || user?.name || "E").charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="max-w-[160px] truncate text-sm font-semibold text-slate-800">
                  {user?.full_name || user?.name || "Employee"}
                </p>
                <p className="text-xs capitalize text-slate-400">
                  {user?.role || "Employee"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="min-h-full p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
