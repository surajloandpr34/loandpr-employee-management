
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Clock,
  LoaderCircle,
  Megaphone,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token")
  );
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
        }
      );

      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Announcements load nahi ho paaye.");
      }

      const data = await response.json();

      setAnnouncements(data.announcements || []);
      setUnreadCount(Number(data.unread_count || 0));
    } catch (err) {
      setError(
        err.message || "Server se connect nahi ho paaya."
      );
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
        }
      );

      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Announcement read mark nahi hua."
        );
      }

      setAnnouncements((current) =>
        current.map((item) =>
          item.id === announcement.id
            ? { ...item, is_read: true }
            : item
        )
      );

      setUnreadCount(Number(data.unread_count || 0));
      setSuccess("Announcement read mark ho gaya.");
    } catch (err) {
      setError(
        err.message || "Announcement update nahi ho paaya."
      );
    } finally {
      setReadingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/employee-dashboard")}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Megaphone className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Announcements
              </h1>
              <p className="text-sm text-slate-500">
                Company updates and important notices
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadAnnouncements}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="mb-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">
                  Total announcements
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {announcements.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">
                  Unread announcements
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {unreadCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Megaphone className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-800">
              No announcements yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Company announcements yahan dikhengi.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <article
                key={announcement.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition sm:p-6 ${
                  !announcement.is_read
                    ? "border-blue-200 ring-1 ring-blue-100"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      announcement.is_read
                        ? "bg-slate-100 text-slate-500"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <Megaphone className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {announcement.title}
                      </h2>

                      {!announcement.is_read && (
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                      {announcement.content}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <p className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="h-4 w-4" />
                        {formatDate(announcement.created_at)}
                      </p>

                      {announcement.is_read ? (
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
                          <CheckCheck className="h-4 w-4" />
                          Read
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markAsRead(announcement)}
                          disabled={readingId !== null}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {readingId === announcement.id ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCheck className="h-4 w-4" />
                          )}
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
