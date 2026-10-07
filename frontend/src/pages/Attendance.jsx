import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  Timer,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

const getAuth = () => {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  const userData =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  let user = null;

  try {
    user = userData
      ? JSON.parse(userData)
      : null;
  } catch {
    user = null;
  }

  return {
    token,
    user,
  };
};

const getToday = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(
    2,
    "0"
  );
  const day = String(now.getDate()).padStart(
    2,
    "0"
  );

  return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatTime = (time) => {
  if (!time) {
    return "--";
  }

  const date = new Date(time);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calculateWorkingHours = (
  checkIn,
  checkOut
) => {
  if (!checkIn) {
    return "00:00";
  }

  const start = new Date(checkIn);

  const end = checkOut
    ? new Date(checkOut)
    : new Date();

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return "00:00";
  }

  const difference = Math.max(
    0,
    end.getTime() - start.getTime()
  );

  const hours = Math.floor(
    difference / (1000 * 60 * 60)
  );

  const minutes = Math.floor(
    (difference % (1000 * 60 * 60)) /
      (1000 * 60)
  );

  return `${String(hours).padStart(
    2,
    "0"
  )}:${String(minutes).padStart(2, "0")}`;
};

function Attendance() {
  const navigate = useNavigate();

  const [attendanceRecords, setAttendanceRecords] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] =
    useState("");

  const today = getToday();

  const { user } = getAuth();

  /*
   * GET ATTENDANCE FROM BACKEND
   */
  const loadAttendance = async () => {
    const { token } = getAuth();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/employee/attendance`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem(
          "access_token"
        );
        localStorage.removeItem("user");

        sessionStorage.removeItem(
          "access_token"
        );
        sessionStorage.removeItem("user");

        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to load attendance."
        );
      }

      setAttendanceRecords(data);
    } catch (err) {
      console.error(
        "Attendance loading error:",
        err
      );

      setError(
        err.message ||
          "Unable to connect to backend."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * LOAD ATTENDANCE ON PAGE OPEN
   */
  useEffect(() => {
    loadAttendance();
  }, []);

  /*
   * TODAY'S RECORD
   */
  const todayAttendance = useMemo(() => {
    return (
      attendanceRecords.find(
        (record) =>
          record.attendance_date === today
      ) || null
    );
  }, [attendanceRecords, today]);

  /*
   * CHECK IN
   */
  const handleCheckIn = async () => {
    const { token } = getAuth();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/employee/attendance/check-in`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem(
          "access_token"
        );
        localStorage.removeItem("user");

        sessionStorage.removeItem(
          "access_token"
        );
        sessionStorage.removeItem("user");

        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to check in."
        );
      }

      setMessage(
        "Attendance check-in recorded successfully."
      );

      await loadAttendance();
    } catch (err) {
      console.error(
        "Check-in error:",
        err
      );

      setError(
        err.message ||
          "Unable to check in."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * CHECK OUT
   */
  const handleCheckOut = async () => {
    const { token } = getAuth();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/employee/attendance/check-out`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem(
          "access_token"
        );
        localStorage.removeItem("user");

        sessionStorage.removeItem(
          "access_token"
        );
        sessionStorage.removeItem("user");

        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to check out."
        );
      }

      setMessage(
        "Attendance check-out recorded successfully."
      );

      await loadAttendance();
    } catch (err) {
      console.error(
        "Check-out error:",
        err
      );

      setError(
        err.message ||
          "Unable to check out."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const hasCheckedIn =
    Boolean(todayAttendance?.check_in);

  const hasCheckedOut =
    Boolean(todayAttendance?.check_out);

  const currentStatus =
    todayAttendance?.status ||
    "Not Checked In";

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ================= HEADER ================= */}

      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

          <div className="flex items-center gap-4">

            <Link
              to="/employee-dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-cyan-500 hover:text-white"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Employee Workspace
              </p>

              <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                Attendance
              </h1>
            </div>

          </div>

          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-white">
              {user?.full_name || "Employee"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {user?.employee_id || "—"}
            </p>
          </div>

          <img
            src="/logo.png"
            alt="LoanDPR Creditum Management"
            className="hidden h-12 w-auto object-contain md:block"
          />

        </div>
      </header>

      {/* ================= CONTENT ================= */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* DATE */}

        <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <CalendarDays size={24} />
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Today's Date
              </p>

              <p className="mt-1 font-semibold text-white">
                {formatDate(today)}
              </p>
            </div>

          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3">
            <p className="text-xs text-cyan-300">
              Current Status
            </p>

            <p className="mt-1 font-bold text-cyan-400">
              {currentStatus}
            </p>
          </div>

        </div>

        {/* MESSAGES */}

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm font-medium text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-300">
            {error}
          </div>
        )}

        {/* ================= STATS ================= */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* CHECK IN */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Check In
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatTime(
                    todayAttendance?.check_in
                  )}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <LogIn size={21} />
              </div>

            </div>

          </div>

          {/* CHECK OUT */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Check Out
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatTime(
                    todayAttendance?.check_out
                  )}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                <LogOut size={21} />
              </div>

            </div>

          </div>

          {/* WORKING HOURS */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Working Hours
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {calculateWorkingHours(
                    todayAttendance?.check_in,
                    todayAttendance?.check_out
                  )}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Timer size={21} />
              </div>

            </div>

          </div>

          {/* STATUS */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Attendance
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {currentStatus}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <CheckCircle2 size={21} />
              </div>

            </div>

          </div>

        </div>

        {/* ================= ATTENDANCE ACTION ================= */}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">

          {/* ACTION CARD */}

          <div className="rounded-3xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl shadow-black/20 sm:p-8">

            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
                  Today's Attendance
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Mark Your Attendance
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Start your working day by checking
                  in. Remember to check out when you
                  finish your work.
                </p>
              </div>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <Clock3 size={30} />
              </div>

            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">

              {/* CHECK IN BUTTON */}

              <button
                type="button"
                onClick={handleCheckIn}
                disabled={
                  hasCheckedIn ||
                  actionLoading ||
                  loading
                }
                className={`flex items-center justify-center gap-3 rounded-xl px-5 py-4 font-semibold transition ${
                  hasCheckedIn ||
                  actionLoading ||
                  loading
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <LogIn size={20} />

                {actionLoading
                  ? "Processing..."
                  : hasCheckedIn
                  ? "Checked In"
                  : "Check In"}
              </button>

              {/* CHECK OUT BUTTON */}

              <button
                type="button"
                onClick={handleCheckOut}
                disabled={
                  !hasCheckedIn ||
                  hasCheckedOut ||
                  actionLoading ||
                  loading
                }
                className={`flex items-center justify-center gap-3 rounded-xl px-5 py-4 font-semibold transition ${
                  !hasCheckedIn ||
                  hasCheckedOut ||
                  actionLoading ||
                  loading
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "bg-slate-950 text-white hover:bg-cyan-600"
                }`}
              >
                <LogOut size={20} />

                {actionLoading
                  ? "Processing..."
                  : hasCheckedOut
                  ? "Checked Out"
                  : "Check Out"}
              </button>

            </div>

          </div>

          {/* WORK STATUS */}

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500 to-blue-600 p-7 shadow-2xl shadow-cyan-900/20">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <CheckCircle2 size={24} />
            </div>

            <h3 className="mt-7 text-2xl font-bold">
              Attendance Status
            </h3>

            <p className="mt-3 text-sm leading-6 text-cyan-50">
              Your attendance information for today
              is shown here. Keep your check-in and
              check-out records updated.
            </p>

            <div className="mt-7 rounded-2xl bg-white/10 p-5 backdrop-blur-sm">

              <p className="text-sm text-cyan-100">
                Current Status
              </p>

              <p className="mt-2 text-3xl font-bold">
                {currentStatus}
              </p>

              {todayAttendance?.check_in && (
                <p className="mt-2 text-sm text-cyan-100">
                  Started at{" "}
                  {formatTime(
                    todayAttendance.check_in
                  )}
                </p>
              )}

            </div>

          </div>

        </div>

        {/* ================= HISTORY ================= */}

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900">

          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
                Attendance Records
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Attendance History
              </h2>
            </div>

            <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
              {attendanceRecords.length} Records
            </span>

          </div>

          {loading ? (
            <div className="px-6 py-12 text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600" />

              <p className="mt-4 text-sm text-slate-500">
                Loading attendance records...
              </p>

            </div>
          ) : attendanceRecords.length ===
            0 ? (
            <div className="px-6 py-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <CalendarDays size={24} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No attendance history
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Completed attendance records will
                appear here.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px] text-left">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Check In
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Check Out
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Working Hours
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {attendanceRecords.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                          {formatDate(
                            item.attendance_date
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatTime(
                            item.check_in
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatTime(
                            item.check_out
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          {calculateWorkingHours(
                            item.check_in,
                            item.check_out
                          )}
                        </td>

                        <td className="px-6 py-4">

                          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            {item.status}
                          </span>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </section>

    </main>
  );
}

export default Attendance;