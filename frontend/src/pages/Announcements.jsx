
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Clock,
  LoaderCircle,
  Megaphone,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function getToken() {
  const storages = [localStorage, sessionStorage];

  for (const storage of storages) {
    for (const key of ["token", "access_token", "authToken", "employeeToken"]) {
      const token = storage.getItem(key);
      if (token) return token;
    }

    for (const key of [
      "employeeAuth",
      "auth",
      "employee_auth",
      "userAuth",
      "sessionAuth",
    ]) {
      const value = storage.getItem(key);
      if (!value) continue;

      try {
        const parsed = JSON.parse(value);
        const token = parsed?.access_token || parsed?.token;
        if (token) return token;
      } catch {
        // Ignore invalid JSON.
      }
    }
  }

  return null;
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Announcements() {
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [readingId, setReadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAnnouncements = useCallback(async () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/employee/announcements`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Announcements load nahi ho paaye.",
        );
      }

      setAnnouncements(
        Array.isArray(data.announcements) ? data.announcements : [],
      );
      setUnreadCount(Number(data.unread_count || 0));
    } catch (err) {
      setError(err.message || "Server se connect nahi ho paaya.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  async function markAsRead(announcement) {
    if (announcement.is_read || readingId !== null) return;

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    setReadingId(announcement.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/employee/announcements/${announcement.id}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Announcement read mark nahi hua.",
        );
      }

      setAnnouncements((current) =>
        current.map((item) =>
          item.id === announcement.id
            ? { ...item, is_read: true }
            : item,
        ),
      );

      setUnreadCount(
        Number.isFinite(Number(data?.unread_count))
          ? Number(data.unread_count)
          : Math.max(0, unreadCount - 1),
      );

      setSuccess("Announcement read mark ho gaya.");
    } catch (err) {
      setError(err.message || "Announcement update nahi ho paaya.");
    } finally {
      setReadingId(null);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden bg-slate-50 p-3 text-slate-900 sm:p-4">
      {/* Compact heading */}
      <header className="flex shrink-0 items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-[#071a36] to-[#0b3158] px-4 py-3 text-white shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-lg bg-white/10 p-2">
            <Megaphone className="h-5 w-5 text-cyan-200" />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-bold sm:text-xl">
              Announcements
            </h1>
            <p className="text-[11px] text-slate-300 sm:text-xs">
              Company updates and important notices
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadAnnouncements}
          disabled={loading}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      {/* Summary cards */}
      <section className="grid shrink-0 grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Bell className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 sm:text-xs">
              Total announcements
            </p>
            <p className="text-xl font-bold text-slate-900">
              {announcements.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
            <Megaphone className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 sm:text-xs">
              Unread announcements
            </p>
            <p className="text-xl font-bold text-slate-900">
              {unreadCount}
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700"
        >
          {success}
        </div>
      )}

      {/* Announcement list uses remaining space; no scrolling */}
      <main className="min-h-0 flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center">
            <Megaphone className="h-8 w-8 text-slate-300" />
            <h2 className="mt-3 text-sm font-semibold text-slate-800">
              No announcements yet
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Company announcements yahan dikhengi.
            </p>
          </div>
        ) : (
          <div
            className={`grid h-full min-h-0 gap-3 overflow-hidden ${
              announcements.length === 1
                ? "grid-cols-1"
                : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            {announcements.map((announcement) => (
              <article
                key={announcement.id}
                className={`flex min-h-0 flex-col overflow-hidden rounded-xl border bg-white p-3 shadow-sm sm:p-4 ${
                  !announcement.is_read
                    ? "border-blue-200 ring-1 ring-blue-100"
                    : "border-slate-200"
                }`}
              >
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="flex items-start gap-2">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        announcement.is_read
                          ? "bg-slate-100 text-slate-500"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <Megaphone className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="break-words text-sm font-bold text-slate-900">
                          {announcement.title}
                        </h2>

                        {!announcement.is_read && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-semibold text-blue-700">
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="h-3 w-3 shrink-0" />
                        {formatDate(announcement.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 min-h-0 flex-1 overflow-hidden">
                    <p className="whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">
                      {announcement.content}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex shrink-0 items-center justify-end border-t border-slate-100 pt-2">
                  {announcement.is_read ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <CheckCheck className="h-3.5 w-3.5" />
                      Read
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markAsRead(announcement)}
                      disabled={readingId !== null}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {readingId === announcement.id ? (
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCheck className="h-3.5 w-3.5" />
                      )}
                      Mark as read
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
