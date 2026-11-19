
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

const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

function getToken() {
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of [
      "token",
      "access_token",
      "authToken",
      "employeeToken",
    ]) {
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
      try {
        const value = storage.getItem(key);
        if (!value) continue;
        const parsed = JSON.parse(value);
        const token = parsed?.access_token || parsed?.token;
        if (token) return token;
      } catch {
        // Ignore invalid stored JSON.
      }
    }
  }

  return null;
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

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
        `${API_URL}/employee/announcements`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Announcements load nahi ho paaye."
        );
      }

      setAnnouncements(
        Array.isArray(data.announcements)
          ? data.announcements
          : []
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
        `${API_URL}/employee/announcements/${announcement.id}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Announcement read mark nahi hua."
        );
      }

      setAnnouncements((current) =>
        current.map((item) =>
          item.id === announcement.id
            ? { ...item, is_read: true }
            : item
        )
      );

      setUnreadCount((current) =>
        Number.isFinite(Number(data?.unread_count))
          ? Number(data.unread_count)
          : Math.max(0, current - 1)
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
      <header className="flex shrink-0 items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-[#071a36] to-[#0b3158] px-4 py-3 text-white shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-lg bg-white/10 p-2">
            <Megaphone className="h-5 w-5 text-cyan-200" />
          </div>
          <div>
            <h1 className="text-lg font-bold sm:text-xl">
              Announcements
            </h1>
            <p className="text-xs text-slate-300">
              Company updates and important notices
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadAnnouncements}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </header>

      <section className="grid shrink-0 grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Bell size={19} />
          </div>
          <div>
            <p className="text-xs text-slate-500">
              Total announcements
            </p>
            <p className="text-xl font-bold">
              {announcements.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm">
          <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
            <Megaphone size={19} />
          </div>
          <div>
            <p className="text-xs text-slate-500">
              Unread announcements
            </p>
            <p className="text-xl font-bold">{unreadCount}</p>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-700"
        >
          {success}
        </div>
      )}

      <main className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center gap-2 rounded-xl bg-white text-sm text-slate-500">
            <LoaderCircle className="animate-spin" size={20} />
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed bg-white p-8 text-center">
            <Megaphone size={36} className="text-slate-300" />
            <h2 className="mt-3 font-semibold">
              No announcements yet
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Company announcements yahan dikhengi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {announcements.map((announcement) => (
              <article
                key={announcement.id}
                className={`flex flex-col overflow-hidden rounded-xl border bg-white p-4 shadow-sm ${
                  announcement.is_read
                    ? "border-slate-200"
                    : "border-blue-200 ring-1 ring-blue-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`rounded-lg p-2 ${
                      announcement.is_read
                        ? "bg-slate-100 text-slate-500"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <Megaphone size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words text-sm font-bold">
                        {announcement.title}
                      </h2>

                      {!announcement.is_read && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={13} />
                      {formatDate(announcement.created_at)}
                    </p>
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                  {announcement.content}
                </p>

                {announcement.image_data && (
                  <div className="mt-3">
                    <a
                      href={announcement.image_data}
                      target="_blank"
                      rel="noreferrer"
                      title="View full photo"
                      className="block"
                    >
                      <img
                        src={announcement.image_data}
                        alt={`${announcement.title} attachment`}
                        className="max-h-72 w-full rounded-xl border border-slate-200 bg-slate-50 object-contain"
                        loading="lazy"
                      />
                    </a>
                    <p className="mt-1 text-xs text-blue-600">
                      Click photo to view full size
                    </p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-end border-t pt-3">
                  {announcement.is_read ? (
                    <span className="flex items-center gap-2 text-xs font-semibold text-green-600">
                      <CheckCheck size={17} />
                      Read
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markAsRead(announcement)}
                      disabled={readingId !== null}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {readingId === announcement.id ? (
                        <LoaderCircle
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <CheckCheck size={16} />
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
