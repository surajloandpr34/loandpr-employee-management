
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CalendarCheck2,
  CheckCheck,
  ClipboardList,
  Clock3,
  Home,
  LogOut,
  Menu,
  RefreshCw,
  UserRound,
  X,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
)
  .replace(/\/$/, "")
  .replace(/\/api$/, "");

const menuItems = [
  { label: "Dashboard", path: "/employee-dashboard", icon: Home },
  { label: "My Tasks", path: "/employee-tasks", icon: BriefcaseBusiness },
  { label: "Attendance", path: "/attendance", icon: CalendarCheck2 },
  { label: "Leaves", path: "/leaves", icon: ClipboardList },
  { label: "Holidays", path: "/holidays", icon: CalendarDays },
  { label: "Calendar", path: "/calendar", icon: CalendarDays },
  { label: "Announcements", path: "/announcements", icon: Bell },
  { label: "Profile", path: "/profile", icon: UserRound },
];

function getToken() {
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of [
      "access_token",
      "token",
      "authToken",
      "employeeToken",
    ]) {
      const token = storage.getItem(key);
      if (token) return token;
    }
  }
  return null;
}

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

function formatDateTime(value) {
  if (!value) return "";

  const text = String(value);
  const normalized = /[zZ]$|[+-]\d{2}:\d{2}$/.test(text)
    ? text
    : `${text.replace(" ", "T")}+05:30`;

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActivityPath(item) {
  const text = `${item.event_type || ""} ${item.title || ""}`
    .toLowerCase();

  if (text.includes("task")) return "/employee-tasks";
  if (text.includes("leave")) return "/leaves";
  if (text.includes("attendance")) return "/attendance";
  if (text.includes("announcement")) return "/announcements";

  return "/employee-dashboard";
}

function getActivityIcon(item) {
  const path = getActivityPath(item);

  if (path === "/employee-tasks") return BriefcaseBusiness;
  if (path === "/leaves") return ClipboardList;
  if (path === "/attendance") return CalendarCheck2;

  return Bell;
}

function SidebarContent({ user, closeMenu, logout }) {
  return (
    <>
      {/* BRAND */}
      <div className="flex h-[76px] shrink-0 items-center gap-3 border-b border-white/10 px-4 sm:h-[84px] sm:px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1 sm:h-12 sm:w-12">
          <img
            src="/logo.png"
            alt="LoanDPR logo"
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-white">
            Creditum
          </h1>
          <p className="text-xs text-slate-400 sm:text-sm">
            Employee Portal
          </p>
        </div>
      </div>

      {/* USER */}
      <div className="shrink-0 border-b border-white/10 p-3 sm:p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.07] p-3 sm:rounded-2xl sm:p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white sm:h-12 sm:w-12">
            {(user?.full_name || user?.name || "E")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user?.full_name || user?.name || "Employee"}
            </p>
            <p className="mt-1 truncate text-xs capitalize text-slate-400">
              {user?.role || "Employee"}
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4">
        <p className="mb-3 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Main Menu
        </p>

        {menuItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            onClick={closeMenu}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
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

      {/* LOGOUT */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={logout}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  );
}

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = readUser();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [announcements, setAnnouncements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);
  const [notificationError, setNotificationError] =
    useState("");
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const notificationRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const mobileCloseButtonRef = useRef(null);
  const previousMobileOpen = useRef(false);

  const isDashboard =
    location.pathname === "/employee-dashboard";

  const currentPage =
    menuItems.find((item) => item.path === location.pathname)
      ?.label || "Employee Workspace";

  const logout = useCallback(() => {
    for (const storage of [localStorage, sessionStorage]) {
      [
        "access_token",
        "token",
        "authToken",
        "employeeToken",
        "user",
        "currentUser",
      ].forEach((key) => storage.removeItem(key));
    }

    navigate("/login", { replace: true });
  }, [navigate]);

  const loadNotifications = useCallback(
    async (showLoader = false) => {
      const token = getToken();
      if (!token) return;

      if (showLoader) setLoadingNotifications(true);
      setNotificationError("");

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };

        const results = await Promise.allSettled([
          fetch(`${API_URL}/api/employee/announcements`, {
            headers,
          }),
          fetch(`${API_URL}/api/employee/activity?limit=20`, {
            headers,
          }),
        ]);

        const successfulResponses = results
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);

        if (
          successfulResponses.some(
            (response) => response.status === 401
          )
        ) {
          logout();
          return;
        }

        let failed = false;

        const announcementResult = results[0];

        if (
          announcementResult.status === "fulfilled" &&
          announcementResult.value.ok
        ) {
          const data = await announcementResult.value
            .json()
            .catch(() => null);

          const items = Array.isArray(data?.announcements)
            ? data.announcements
            : [];

          setAnnouncements(items);

          setUnreadCount(
            Number.isFinite(Number(data?.unread_count))
              ? Number(data.unread_count)
              : items.filter((item) => !item.is_read).length
          );
        } else {
          failed = true;
        }

        const activityResult = results[1];

        if (
          activityResult.status === "fulfilled" &&
          activityResult.value.ok
        ) {
          const data = await activityResult.value
            .json()
            .catch(() => []);

          setActivities(Array.isArray(data) ? data : []);
        } else {
          failed = true;
        }

        if (failed) {
          setNotificationError(
            "Some notification updates could not be loaded."
          );
        }
      } catch {
        setNotificationError(
          "Unable to load notifications."
        );
      } finally {
        if (showLoader) setLoadingNotifications(false);
      }
    },
    [logout]
  );

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      if (!document.hidden) {
        loadNotifications();
      }
    }, 60000);

    function handleFocus() {
      loadNotifications();
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadNotifications]);

  // Close panels when navigating.
  useEffect(() => {
    setMobileOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling while mobile menu is open.
  useEffect(() => {
    const wasOpen = previousMobileOpen.current;
    previousMobileOpen.current = mobileOpen;

    if (mobileOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      mobileCloseButtonRef.current?.focus();

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }

    if (wasOpen) {
      mobileMenuButtonRef.current?.focus();
    }
  }, [mobileOpen]);

  // Close notification panel when clicking outside.
  useEffect(() => {
    if (!notificationsOpen) return;

    function handleOutsideClick(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        notificationButtonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [notificationsOpen]);

  // Escape also closes the mobile sidebar.
  useEffect(() => {
    if (!mobileOpen) return;

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen]);

  async function markAnnouncementRead(item) {
    if (item.is_read || markingId !== null || markingAll) {
      return;
    }

    const token = getToken();

    if (!token) {
      logout();
      return;
    }

    setMarkingId(item.id);
    setNotificationError("");

    try {
      const response = await fetch(
        `${API_URL}/api/employee/announcements/${item.id}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to mark announcement as read.");
      }

      const data = await response.json().catch(() => ({}));

      setAnnouncements((previous) =>
        previous.map((announcement) =>
          announcement.id === item.id
            ? { ...announcement, is_read: true }
            : announcement
        )
      );

      if (typeof data.unread_count === "number") {
        setUnreadCount(data.unread_count);
      } else {
        setUnreadCount((previous) =>
          Math.max(0, previous - 1)
        );
      }
    } catch (error) {
      setNotificationError(
        error.message || "Unable to mark as read."
      );
    } finally {
      setMarkingId(null);
    }
  }

  async function markAllAnnouncementsRead() {
    if (markingAll || markingId !== null) return;

    const token = getToken();

    if (!token) {
      logout();
      return;
    }

    setMarkingAll(true);
    setNotificationError("");

    try {
      const unreadItems = announcements.filter(
        (item) => !item.is_read
      );

      for (const item of unreadItems) {
        const response = await fetch(
          `${API_URL}/api/employee/announcements/${item.id}/read`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.status === 401) {
          logout();
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Some announcements could not be marked as read."
          );
        }

        setAnnouncements((previous) =>
          previous.map((announcement) =>
            announcement.id === item.id
              ? { ...announcement, is_read: true }
              : announcement
          )
        );

        setUnreadCount((previous) =>
          Math.max(0, previous - 1)
        );
      }

      await loadNotifications();
    } catch (error) {
      setNotificationError(
        error.message || "Unable to mark all as read."
      );
    } finally {
      setMarkingAll(false);
    }
  }

  function openPage(path) {
    setNotificationsOpen(false);
    setMobileOpen(false);
    navigate(path);
  }

  function toggleNotifications() {
    setNotificationsOpen((previous) => !previous);

    if (!notificationsOpen) {
      loadNotifications(true);
    }
  }

  return (
    <div className="flex h-[100dvh] min-h-0 w-full overflow-hidden bg-[#f3f6fb]">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden h-full w-[260px] shrink-0 flex-col overflow-hidden bg-[#102338] lg:flex xl:w-[270px]">
        <SidebarContent
          user={user}
          closeMenu={() => setMobileOpen(false)}
          logout={logout}
        />
      </aside>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/60"
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Employee navigation"
            className="relative z-10 flex h-full w-[280px] max-w-[85vw] flex-col overflow-hidden bg-[#102338] shadow-2xl"
          >
            <button
              ref={mobileCloseButtonRef}
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 z-20 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            <SidebarContent
              user={user}
              closeMenu={() => setMobileOpen(false)}
              logout={logout}
            />
          </aside>
        </div>
      )}

      {/* MAIN */}
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* RESPONSIVE HEADER */}
        <header className="relative z-30 flex h-[64px] shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 sm:h-[76px] sm:px-5 lg:h-[84px] lg:px-7">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              ref={mobileMenuButtonRef}
              type="button"
              onClick={() => {
                setNotificationsOpen(false);
                setMobileOpen(true);
              }}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* SMALL SCREEN BRAND */}
            <div className="flex min-w-0 items-center gap-2 sm:hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white p-1">
                <img
                  src="/logo.png"
                  alt="LoanDPR"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-500">
                  Creditum
                </p>
                <h2 className="truncate text-sm font-bold text-slate-900">
                  {currentPage}
                </h2>
              </div>
            </div>

            {/* TABLET / DESKTOP TITLE */}
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-xs text-slate-400 lg:text-sm">
                Employee Management Portal
              </p>

              <h2 className="truncate text-base font-bold text-slate-900 lg:text-lg">
                {currentPage}
              </h2>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            {/* REFRESH */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              aria-label="Refresh page"
              title="Refresh page"
              className="hidden h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 sm:flex"
            >
              <RefreshCw className="h-5 w-5" />
            </button>

            {/* NOTIFICATION BELL */}
            <div ref={notificationRef} className="relative">
              <button
                ref={notificationButtonRef}
                type="button"
                aria-label={`Notifications, ${unreadCount} unread`}
                aria-expanded={notificationsOpen}
                onClick={toggleNotifications}
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition ${
                  notificationsOpen
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Bell className="h-5 w-5" />

                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* RESPONSIVE NOTIFICATION PANEL */}
              {notificationsOpen && (
                <div className="fixed inset-x-2 top-[70px] z-50 flex max-h-[calc(100dvh-82px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-[52px] sm:w-[390px] sm:max-w-[calc(100vw-24px)] sm:max-h-[min(75vh,650px)]">
                  <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900">
                        Notifications
                      </h3>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {unreadCount} unread announcement(s)
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => loadNotifications(true)}
                        disabled={loadingNotifications}
                        aria-label="Refresh notifications"
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                      >
                        <RefreshCw
                          size={17}
                          className={
                            loadingNotifications
                              ? "animate-spin"
                              : ""
                          }
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                        aria-label="Close notifications"
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    {notificationError && (
                      <div
                        role="alert"
                        className="m-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800"
                      >
                        {notificationError}
                      </div>
                    )}

                    {/* ANNOUNCEMENTS HEADER */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Announcements
                      </h4>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAnnouncementsRead}
                          disabled={markingId !== null || markingAll}
                          className="flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                        >
                          <CheckCheck size={15} />
                          {markingAll
                            ? "Saving..."
                            : "Mark All Read"}
                        </button>
                      )}
                    </div>

                    {announcements.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-slate-500">
                        No announcements available.
                      </p>
                    ) : (
                      announcements.slice(0, 8).map((item) => (
                        <div
                          key={`announcement-${item.id}`}
                          className={`border-b border-slate-100 px-4 py-3 ${
                            item.is_read
                              ? "bg-white"
                              : "bg-blue-50/70"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 rounded-lg bg-blue-100 p-2 text-blue-700">
                              <Bell size={16} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="break-words text-sm font-bold text-slate-900">
                                  {item.title}
                                </p>

                                {!item.is_read && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                )}
                              </div>

                              <p className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">
                                {item.content}
                              </p>

                              <p className="mt-2 text-[11px] text-slate-400">
                                {formatDateTime(item.created_at)}
                              </p>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                {!item.is_read && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      markAnnouncementRead(item)
                                    }
                                    disabled={
                                      markingId !== null || markingAll
                                    }
                                    className="min-h-9 rounded-lg px-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                                  >
                                    {markingId === item.id
                                      ? "Saving..."
                                      : "Mark as Read"}
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    openPage("/announcements")
                                  }
                                  className="min-h-9 rounded-lg px-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    {/* RECENT ACTIVITY */}
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Recent Activity
                      </h4>
                    </div>

                    {activities.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-slate-500">
                        No recent activity.
                      </p>
                    ) : (
                      activities.slice(0, 10).map((item, index) => {
                        const Icon = getActivityIcon(item);
                        const path = getActivityPath(item);

                        return (
                          <button
                            type="button"
                            key={`activity-${item.id ?? index}`}
                            onClick={() => openPage(path)}
                            className="flex min-h-16 w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
                          >
                            <div className="shrink-0 rounded-lg bg-slate-100 p-2 text-slate-600">
                              <Icon size={16} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="break-words text-sm font-semibold text-slate-800">
                                {item.title || "Activity Update"}
                              </p>

                              {item.description && (
                                <p className="mt-1 line-clamp-2 break-words text-xs text-slate-500">
                                  {item.description}
                                </p>
                              )}

                              <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                                <Clock3 size={12} />
                                {formatDateTime(item.created_at)}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="shrink-0 border-t border-slate-200 bg-white p-3">
                    <button
                      type="button"
                      onClick={() => openPage("/announcements")}
                      className="min-h-11 w-full rounded-xl bg-[#102338] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1b3d5c]"
                    >
                      View All Announcements
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE */}
            <div className="hidden h-9 w-px bg-slate-200 sm:block" />

            <button
              type="button"
              onClick={() => openPage("/profile")}
              aria-label="Open profile"
              className="flex min-h-11 items-center gap-2 rounded-xl px-1 transition hover:bg-slate-50 sm:gap-3 sm:px-2"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white sm:h-10 sm:w-10">
                {(user?.full_name || user?.name || "E")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="hidden min-w-0 text-left md:block">
                <p className="max-w-[145px] truncate text-sm font-semibold text-slate-800">
                  {user?.full_name || user?.name || "Employee"}
                </p>

                <p className="text-xs capitalize text-slate-400">
                  {user?.role || "Employee"}
                </p>
              </div>
            </button>
          </div>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        <main
          className={`min-h-0 min-w-0 flex-1 ${
            isDashboard ? "overflow-y-auto" : "overflow-hidden"
          }`}
        >
          <div
            className={`h-full min-h-0 min-w-0 p-3 sm:p-5 lg:p-6 ${
              isDashboard
                ? "min-h-full"
                : "overflow-hidden"
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
