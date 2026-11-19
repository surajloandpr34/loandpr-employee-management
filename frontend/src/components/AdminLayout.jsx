import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Users,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin-dashboard", icon: LayoutDashboard },
  { label: "Employees", path: "/employee-management", icon: Users },
  { label: "Tasks", path: "/admin-tasks", icon: ClipboardList },
  { label: "Announcements", path: "/admin-dashboard#announcements", icon: Megaphone },
  { label: "Leave Requests", path: "/admin-dashboard#pending-leaves", icon: FileText },
  { label: "Holidays", path: "/holidays", icon: CalendarDays },
];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const user = getStoredUser() || {};
  const initial = (user.full_name || "A").charAt(0).toUpperCase();

  const logout = () => {
    ["access_token", "token", "user"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    navigate("/login", { replace: true });
  };

  const goTo = (path) => {
    setOpen(false);
    const [route, hash] = path.split("#");
    navigate(route);
    if (hash) {
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 150);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1e293b] text-slate-300 transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 font-bold text-white">
            L
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">LoanDPR Creditum</p>
            <p className="text-[11px] text-slate-400">Admin Console</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="ml-auto rounded p-1 hover:bg-white/10 lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Main Menu</p>
          {NAV_ITEMS.map(({ label, path, icon: Icon }) =>
            path.includes("#") ? (
              <button
                key={label}
                type="button"
                onClick={() => goTo(path)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-white/5 hover:text-white"
              >
                <Icon size={18} />
                {label}
              </button>
            ) : (
              <NavLink
                key={label}
                to={path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                      : "hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            )
          )}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs text-slate-400">Employee Management</p>
              <p className="text-sm font-semibold text-slate-800">Admin Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{user.full_name || "Administrator"}</p>
              <p className="text-xs capitalize text-slate-400">{user.role || "admin"}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">{initial}</div>
            <button type="button" onClick={logout} title="Logout" className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
