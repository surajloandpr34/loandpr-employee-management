
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Gift,
  ImagePlus,
  LogOut,
  Megaphone,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Trash2,
  Users,
  X,
} from "lucide-react";

import EmployeeManagement from "./EmployeeManagement";

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

function today() {
  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function niceDate(value) {
  if (!value) return "—";

  return new Date(
    `${String(value).slice(0, 10)}T12:00:00`
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function newTask() {
  return {
    employee_id: "",
    title: "",
    description: "",
    task_date: today(),
    status: "Pending",
  };
}

function newEvent(day = today()) {
  return {
    event_date: day,
    title: "",
    description: "",
    category: "Meeting",
    start_time: "",
  };
}

function newHoliday(day = today()) {
  return {
    holiday_date: day,
    name: "",
    description: "",
  };
}

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
}

const eventColors = {
  Meeting: "bg-blue-100 text-blue-800",
  Training: "bg-violet-100 text-violet-800",
  Deadline: "bg-rose-100 text-rose-800",
  "Office Event": "bg-amber-100 text-amber-800",
  Reminder: "bg-cyan-100 text-cyan-800",
};

function Panel({ title, action, children }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <h2 className="font-bold text-slate-900">
          {title}
        </h2>
        {action}
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}

function Stat({ title, value, Icon, color }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">
          {title}
        </span>

        <span className={`rounded-2xl p-3 ${color}`}>
          <Icon size={21} />
        </span>
      </div>

      <p className="mt-3 text-3xl font-extrabold">
        {value ?? 0}
      </p>
    </div>
  );
}

function exportExcel(rows, filename) {
  if (!rows.length) {
    alert("No report data available.");
    return;
  }

  const escape = (v) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const columns = Object.keys(rows[0]);

  const html = `
    <html>
      <head><meta charset="utf-8"></head>
      <body>
        <table border="1">
          <tr>
            ${columns.map((c) => `<th>${escape(c)}</th>`).join("")}
          </tr>
          ${rows.map((row) => `
            <tr>
              ${columns.map((c) => `<td>${escape(row[c])}</td>`).join("")}
            </tr>
          `).join("")}
        </table>
      </body>
    </html>
  `;

  const url = URL.createObjectURL(
    new Blob([html], {
      type: "application/vnd.ms-excel;charset=utf-8",
    })
  );

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const photoInput = useRef(null);

  const [data, setData] = useState(null);
  const [holidays, setHolidays] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");

  const [month, setMonth] = useState(today().slice(0, 7));
  const [selectedDay, setSelectedDay] = useState(today());

  const [event, setEvent] = useState(newEvent);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);

  const [holiday, setHoliday] = useState(newHoliday);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [showHolidayForm, setShowHolidayForm] = useState(false);

  const [task, setTask] = useState(newTask);
  const [editingTask, setEditingTask] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [readingPhoto, setReadingPhoto] = useState(false);

  const logout = useCallback(() => {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem("access_token");
      storage.removeItem("token");
      storage.removeItem("user");
    }

    navigate("/login", { replace: true });
  }, [navigate]);

  const request = useCallback(
    async (path, options = {}) => {
      const token = getToken();

      if (!token) {
        logout();
        throw new Error("Please log in again.");
      }

      const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          ...(options.body
            ? { "Content-Type": "application/json" }
            : {}),
          ...options.headers,
        },
      });

      const result = await response
        .json()
        .catch(() => ({}));

      if (response.status === 401) {
        logout();
        throw new Error("Session expired.");
      }

      if (!response.ok) {
        throw new Error(
          typeof result.detail === "string"
            ? result.detail
            : Array.isArray(result.detail)
            ? result.detail.map((x) => x.msg).join(", ")
            : "Request failed."
        );
      }

      return result;
    },
    [logout]
  );

  const reload = useCallback(async () => {
    setLoading(true);

    try {
      const [overview, holidayList] = await Promise.all([
        request("/admin/insights/overview"),
        request("/admin/holidays"),
      ]);

      setData(overview);

      setHolidays(
        Array.isArray(holidayList)
          ? holidayList.filter((h) => h.is_active)
          : []
      );

      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function perform(action, message) {
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      await action();
      await reload();
      setSuccess(message);
    } catch (err) {
      setError(err.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  function openNewEvent(day) {
    setSelectedDay(day);
    setEvent(newEvent(day));
    setEditingEvent(null);
    setShowHolidayForm(false);
    setShowEventForm(true);
  }

  function openEditEvent(item) {
    setSelectedDay(item.date);

    setEvent({
      event_date: item.date,
      title: item.title,
      description: item.description || "",
      category: item.category,
      start_time: item.start_time || "",
    });

    setEditingEvent(item.id);
    setShowHolidayForm(false);
    setShowEventForm(true);
  }

  function openNewHoliday(day) {
    setSelectedDay(day);
    setHoliday(newHoliday(day));
    setEditingHoliday(null);
    setShowEventForm(false);
    setShowHolidayForm(true);
  }

  function openEditHoliday(item) {
    setSelectedDay(item.holiday_date);
    setMonth(item.holiday_date.slice(0, 7));

    setHoliday({
      holiday_date: item.holiday_date,
      name: item.name,
      description: item.description || "",
    });

    setEditingHoliday(item.id);
    setShowEventForm(false);
    setShowHolidayForm(true);
  }

  function moveMonth(delta) {
    const [year, monthNumber] = month
      .split("-")
      .map(Number);

    const date = new Date(
      year,
      monthNumber - 1 + delta,
      1
    );

    setMonth(
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`
    );
  }

  function choosePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (
      !allowed.includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setError(
        "JPG, PNG, WebP ya GIF allowed hai, max 2 MB."
      );
      e.target.value = "";
      return;
    }

    setReadingPhoto(true);

    const reader = new FileReader();

    reader.onload = () => {
      setPhoto(String(reader.result));
      setPhotoName(file.name);
      setReadingPhoto(false);
      setError("");
    };

    reader.onerror = () => {
      setReadingPhoto(false);
      setError("Photo read nahi ho paayi.");
    };

    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPhoto("");
    setPhotoName("");

    if (photoInput.current) {
      photoInput.current.value = "";
    }
  }

  const stats = data?.stats || {};
  const employees = data?.employees || [];
  const attendance = data?.attendance || [];
  const weekly = data?.weekly || [];
  const leaves = data?.leaves || [];
  const calendarLeaves = data?.calendar_leaves || [];
  const events = data?.calendar_events || [];
  const tasks = data?.tasks || [];
  const performance = data?.performance || [];
  const birthdays = data?.birthdays || [];
  const activity = data?.activity || [];
  const announcements = data?.announcements || [];

  const maxPresent = Math.max(
    1,
    ...weekly.map((item) => item.present)
  );

  const filteredAttendance = attendance.filter((a) =>
    `${a.name} ${a.employee_code} ${a.department}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const [year, monthNumber] = month
    .split("-")
    .map(Number);

  const firstDay = new Date(
    year,
    monthNumber - 1,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    monthNumber,
    0
  ).getDate();

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) =>
        `${month}-${String(i + 1).padStart(2, "0")}`
    ),
  ];

  const dayEvents = events.filter(
    (item) => item.date === selectedDay
  );

  const dayHolidays = holidays.filter(
    (item) => item.holiday_date === selectedDay
  );

  const dayLeaves = calendarLeaves.filter(
    (item) =>
      item.from_date <= selectedDay &&
      item.to_date >= selectedDay
  );

  const attendanceReport = attendance.map((a) => ({
    Name: a.name,
    "Employee ID": a.employee_code,
    Department: a.department,
    Status: a.status,
    "Check In": a.check_in || "",
    "Check Out": a.check_out || "",
  }));

  const performanceReport = performance.map((p) => ({
    Employee: p.name,
    Department: p.department,
    Assigned: p.assigned,
    Completed: p.completed,
    Pending: p.pending,
    "Completion %": p.completion_rate,
  }));

  const tabs = [
    ["overview", "Overview"],
    ["employees", "Employees"],
    ["attendance", "Attendance"],
    ["calendar", "Calendar"],
    ["tasks", "Tasks"],
    ["announcements", "Announcements"],
    ["performance", "Performance"],
    ["reports", "Reports"],
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-900">
      {/* HEADER */}
      <header className="bg-[#081b3b] text-white print:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <Activity
                size={25}
                className="text-cyan-300"
              />
            </div>

            <div>
              <h1 className="text-xl font-extrabold">
                LoanDPR{" "}
                <span className="text-cyan-300">
                  Command Center
                </span>
              </h1>

              <p className="text-xs text-slate-300">
                Creditum Management Pvt. Ltd. · Admin Workspace
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={reload}
              disabled={loading}
              className="rounded-xl border border-white/20 p-3"
              title="Refresh"
            >
              <RefreshCw
                size={18}
                className={
                  loading ? "animate-spin" : ""
                }
              />
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6">
        {/* WELCOME */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0c2d61] via-[#1553a2] to-[#2563eb] p-6 text-white shadow-lg print:hidden">
          <p className="text-sm text-blue-100">
            Admin Workspace
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Manage your team with clarity
          </h2>

          <p className="mt-1 text-sm text-blue-100">
            Employees, attendance, holidays, events,
            tasks and company updates.
          </p>

          <p className="mt-3 text-sm font-semibold">
            {niceDate(data?.today || today())}
          </p>
        </div>

        {/* TABS */}
        <nav className="flex flex-wrap gap-2 print:hidden">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                tab === id
                  ? "bg-[#0b2c60] text-white shadow-md"
                  : "border bg-white text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {error && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        {loading && (
          <p className="text-sm text-slate-500">
            Loading latest data...
          </p>
        )}

        {/* EMPLOYEES — FULL ADMIN CONTROL */}
        {tab === "employees" && (
          <div className="space-y-5">
            <div className="rounded-3xl bg-gradient-to-r from-blue-800 to-indigo-700 p-6 text-white shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    Employee Management
                  </h2>

                  <p className="mt-2 text-sm text-blue-100">
                    Add employees, edit their details,
                    activate or deactivate accounts,
                    and reset passwords.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/15 p-4">
                  <Users size={30} />
                </div>
              </div>
            </div>

            {/* Reuses the existing working employee-management page */}
            <EmployeeManagement />
          </div>
        )}

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Stat
                title="Active Employees"
                value={stats.active_employees}
                Icon={Users}
                color="bg-blue-50 text-blue-700"
              />

              <Stat
                title="Present Today"
                value={stats.present_today}
                Icon={CheckCircle2}
                color="bg-emerald-50 text-emerald-700"
              />

              <Stat
                title="Not Checked In"
                value={stats.not_checked_in}
                Icon={Activity}
                color="bg-amber-50 text-amber-700"
              />

              <Stat
                title="Pending Leaves"
                value={stats.pending_leaves}
                Icon={CalendarDays}
                color="bg-violet-50 text-violet-700"
              />

              <Stat
                title="Pending Tasks"
                value={stats.pending_tasks}
                Icon={ClipboardList}
                color="bg-rose-50 text-rose-700"
              />

              <Stat
                title="Birthdays Today"
                value={birthdays.length}
                Icon={Gift}
                color="bg-pink-50 text-pink-700"
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Panel title="Attendance · Last 7 Days">
                <div className="flex h-56 items-end gap-3 border-b pb-3">
                  {weekly.map((item) => (
                    <div
                      key={item.date}
                      className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-xs font-bold">
                        {item.present}
                      </span>

                      <div
                        className="w-full max-w-16 rounded-t-xl bg-gradient-to-t from-blue-800 to-cyan-400"
                        style={{
                          height: `${Math.max(
                            4,
                            (item.present / maxPresent) * 150
                          )}px`,
                        }}
                      />

                      <span className="text-[10px] text-slate-500">
                        {item.date.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Upcoming Schedule">
                <div className="space-y-2">
                  {events
                    .filter((e) => e.date >= today())
                    .slice(0, 4)
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setMonth(item.date.slice(0, 7));
                          setSelectedDay(item.date);
                          setTab("calendar");
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-left"
                      >
                        <span>
                          <strong className="text-sm">
                            {item.title}
                          </strong>

                          <span className="block text-xs text-slate-500">
                            {niceDate(item.date)}{" "}
                            {item.start_time}
                          </span>
                        </span>

                        <span
                          className={`rounded-lg px-2 py-1 text-xs ${
                            eventColors[item.category] ||
                            "bg-slate-100"
                          }`}
                        >
                          {item.category}
                        </span>
                      </button>
                    ))}

                  {holidays
                    .filter(
                      (h) => h.holiday_date >= today()
                    )
                    .slice(0, 3)
                    .map((h) => (
                      <button
                        key={`holiday-${h.id}`}
                        onClick={() => {
                          setMonth(
                            h.holiday_date.slice(0, 7)
                          );
                          setSelectedDay(h.holiday_date);
                          setTab("calendar");
                        }}
                        className="flex w-full items-center justify-between rounded-xl bg-purple-50 p-3 text-left"
                      >
                        <span>
                          <strong className="text-sm text-purple-800">
                            {h.name}
                          </strong>

                          <span className="block text-xs text-purple-600">
                            {niceDate(h.holiday_date)}
                          </span>
                        </span>

                        <Gift
                          size={18}
                          className="text-purple-600"
                        />
                      </button>
                    ))}

                  {!events.some(
                    (e) => e.date >= today()
                  ) &&
                    !holidays.some(
                      (h) => h.holiday_date >= today()
                    ) && (
                      <p className="text-sm text-slate-500">
                        No upcoming events or holidays.
                      </p>
                    )}
                </div>
              </Panel>
            </div>

            <Panel title="Quick Actions">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setTab("employees")}
                  className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white"
                >
                  <Users size={18} />
                  Manage Employees
                </button>

                <button
                  onClick={() => {
                    setTab("calendar");
                    openNewHoliday(today());
                  }}
                  className="rounded-xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white"
                >
                  + Add Holiday
                </button>

                <button
                  onClick={() => {
                    setTab("calendar");
                    openNewEvent(today());
                  }}
                  className="rounded-xl border px-4 py-3"
                >
                  Schedule Event
                </button>

                <button
                  onClick={() => setTab("tasks")}
                  className="rounded-xl border px-4 py-3"
                >
                  Assign Task
                </button>

                <button
                  onClick={() =>
                    setTab("announcements")
                  }
                  className="rounded-xl border px-4 py-3"
                >
                  Create Announcement
                </button>
              </div>
            </Panel>

            <div className="grid gap-5 lg:grid-cols-2">
              <Panel title="Notifications & Birthdays">
                <p className="rounded-xl bg-amber-50 p-3 text-sm">
                  {leaves.length} pending leave requests
                </p>

                <p className="mt-2 rounded-xl bg-blue-50 p-3 text-sm">
                  {stats.pending_tasks || 0} pending tasks
                </p>

                {birthdays.map((person) => (
                  <p
                    key={person.id}
                    className="mt-2 rounded-xl bg-pink-50 p-3 text-sm"
                  >
                    🎂 Happy Birthday, {person.name}!
                  </p>
                ))}
              </Panel>

              <Panel title="Recent Activity">
                <div className="space-y-3">
                  {activity.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="border-b pb-2"
                    >
                      <p className="text-sm font-semibold">
                        {item.title}
                      </p>

                      <p className="text-xs text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  ))}

                  {!activity.length && (
                    <p className="text-sm text-slate-500">
                      No recent activity.
                    </p>
                  )}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {/* CALENDAR */}
        {tab === "calendar" && (
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <Panel
              title="Office Calendar"
              action={
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveMonth(-1)}
                    className="rounded-lg border p-2"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span className="min-w-28 text-center text-sm font-semibold">
                    {new Date(
                      year,
                      monthNumber - 1,
                      1
                    ).toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>

                  <button
                    onClick={() => moveMonth(1)}
                    className="rounded-lg border p-2"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              }
            >
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    openNewEvent(selectedDay)
                  }
                  className="flex items-center gap-1 rounded-xl bg-blue-700 px-3 py-2 text-xs font-semibold text-white"
                >
                  <Plus size={15} />
                  Add Event
                </button>

                <button
                  onClick={() =>
                    openNewHoliday(selectedDay)
                  }
                  className="flex items-center gap-1 rounded-xl bg-purple-700 px-3 py-2 text-xs font-semibold text-white"
                >
                  <Plus size={15} />
                  Add Holiday
                </button>
              </div>

              <p className="mb-4 text-sm text-slate-500">
                Date select karo, phir event ya holiday
                add karo.
              </p>

              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500">
                {[
                  "Sun", "Mon", "Tue", "Wed",
                  "Thu", "Fri", "Sat",
                ].map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const scheduled = day
                    ? events.filter(
                        (e) => e.date === day
                      )
                    : [];

                  const holidayList = day
                    ? holidays.filter(
                        (h) =>
                          h.holiday_date === day
                      )
                    : [];

                  const onLeave = day
                    ? calendarLeaves.filter(
                        (l) =>
                          l.from_date <= day &&
                          l.to_date >= day
                      )
                    : [];

                  return (
                    <button
                      key={
                        day || `blank-${index}`
                      }
                      type="button"
                      disabled={!day}
                      onClick={() => {
                        setSelectedDay(day);
                        setShowEventForm(false);
                        setShowHolidayForm(false);
                      }}
                      className={`min-h-20 overflow-hidden rounded-xl border p-1 text-left transition sm:min-h-28 sm:p-2 ${
                        day === selectedDay
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : holidayList.length
                          ? "border-purple-200 bg-purple-50"
                          : day
                          ? "bg-white hover:border-blue-300 hover:bg-slate-50"
                          : "border-transparent bg-transparent"
                      }`}
                    >
                      {day && (
                        <>
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              day === today()
                                ? "bg-blue-700 text-white"
                                : "text-slate-700"
                            }`}
                          >
                            {Number(
                              day.slice(-2)
                            )}
                          </span>

                          {scheduled
                            .slice(0, 2)
                            .map((item) => (
                              <span
                                key={item.id}
                                className={`mt-1 block truncate rounded px-1 py-0.5 text-[10px] ${
                                  eventColors[
                                    item.category
                                  ] ||
                                  "bg-slate-100"
                                }`}
                              >
                                {item.title}
                              </span>
                            ))}

                          {holidayList.map(
                            (h) => (
                              <span
                                key={h.id}
                                className="mt-1 block truncate rounded bg-purple-200 px-1 py-0.5 text-[10px] font-semibold text-purple-800"
                              >
                                {h.name}
                              </span>
                            )
                          )}

                          {onLeave.length > 0 && (
                            <span className="mt-1 block truncate rounded bg-green-100 px-1 text-[10px] text-green-700">
                              {onLeave.length} on leave
                            </span>
                          )}

                          {scheduled.length > 2 && (
                            <span className="text-[10px] text-slate-500">
                              +
                              {scheduled.length - 2} more
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(eventColors).map(
                  ([name, color]) => (
                    <span
                      key={name}
                      className={`rounded-full px-3 py-1 text-xs ${color}`}
                    >
                      {name}
                    </span>
                  )
                )}

                <span className="rounded-full bg-purple-200 px-3 py-1 text-xs text-purple-800">
                  Company Holiday
                </span>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">
                  Employee Leave
                </span>
              </div>
            </Panel>

            <div className="space-y-5">
              <Panel
                title={niceDate(selectedDay)}
                action={
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        openNewEvent(selectedDay)
                      }
                      className="flex items-center gap-1 rounded-xl bg-blue-700 px-3 py-2 text-xs font-semibold text-white"
                    >
                      <Plus size={15} />
                      Event
                    </button>

                    <button
                      onClick={() =>
                        openNewHoliday(selectedDay)
                      }
                      className="flex items-center gap-1 rounded-xl bg-purple-700 px-3 py-2 text-xs font-semibold text-white"
                    >
                      <Plus size={15} />
                      Holiday
                    </button>
                  </div>
                }
              >
                <div className="space-y-3">
                  {dayHolidays.map((h) => (
                    <div
                      key={h.id}
                      className="rounded-xl border border-purple-200 bg-purple-50 p-4"
                    >
                      <div className="flex items-center gap-2">
                        <Gift
                          size={18}
                          className="text-purple-700"
                        />

                        <span className="text-xs font-bold uppercase text-purple-700">
                          Company Holiday
                        </span>
                      </div>

                      <h3 className="mt-2 font-bold text-purple-900">
                        {h.name}
                      </h3>

                      {h.description && (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-purple-700">
                          {h.description}
                        </p>
                      )}

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() =>
                            openEditHoliday(h)
                          }
                          className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-purple-700"
                        >
                          <Pencil size={14} />
                          Edit Holiday
                        </button>

                        <button
                          disabled={busy}
                          onClick={() => {
                            if (
                              !window.confirm(
                                `Delete holiday "${h.name}"?`
                              )
                            ) {
                              return;
                            }

                            perform(
                              () =>
                                request(
                                  `/admin/holidays/${h.id}`,
                                  {
                                    method: "DELETE",
                                  }
                                ),
                              "Holiday removed successfully."
                            );
                          }}
                          className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {dayEvents.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border p-3"
                    >
                      <span
                        className={`rounded-lg px-2 py-1 text-xs ${
                          eventColors[
                            item.category
                          ] || "bg-slate-100"
                        }`}
                      >
                        {item.category}
                      </span>

                      <p className="mt-2 font-semibold">
                        {item.title}
                      </p>

                      {item.start_time && (
                        <p className="text-xs text-slate-500">
                          Time: {item.start_time}
                        </p>
                      )}

                      {item.description && (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() =>
                            openEditEvent(item)
                          }
                          className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          disabled={busy}
                          onClick={() => {
                            if (
                              !window.confirm(
                                "Delete this event?"
                              )
                            ) {
                              return;
                            }

                            perform(
                              () =>
                                request(
                                  `/admin/insights/calendar-events/${item.id}`,
                                  {
                                    method: "DELETE",
                                  }
                                ),
                              "Event deleted."
                            );
                          }}
                          className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {dayLeaves.map((l) => (
                    <div
                      key={l.id}
                      className="rounded-xl bg-green-50 p-3"
                    >
                      <p className="text-sm text-green-800">
                        On leave:{" "}
                        {l.employee_name}
                      </p>
                    </div>
                  ))}

                  {!dayHolidays.length &&
                    !dayEvents.length &&
                    !dayLeaves.length && (
                      <p className="text-sm text-slate-500">
                        No events or holidays on this date.
                      </p>
                    )}
                </div>
              </Panel>

              {/* HOLIDAY FORM */}
              {showHolidayForm && (
                <Panel
                  title={
                    editingHoliday
                      ? "Edit Holiday"
                      : "Add Company Holiday"
                  }
                  action={
                    <button
                      onClick={() =>
                        setShowHolidayForm(false)
                      }
                    >
                      <X size={18} />
                    </button>
                  }
                >
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();

                      perform(async () => {
                        await request(
                          editingHoliday
                            ? `/admin/holidays/${editingHoliday}`
                            : "/admin/holidays",
                          {
                            method: editingHoliday
                              ? "PUT"
                              : "POST",
                            body: JSON.stringify({
                              holiday_date:
                                holiday.holiday_date,
                              name:
                                holiday.name.trim(),
                              description:
                                holiday.description.trim() ||
                                null,
                            }),
                          }
                        );

                        setShowHolidayForm(false);
                        setEditingHoliday(null);
                        setSelectedDay(
                          holiday.holiday_date
                        );
                        setMonth(
                          holiday.holiday_date.slice(
                            0,
                            7
                          )
                        );
                      },
                      editingHoliday
                        ? "Holiday updated successfully."
                        : "Holiday added successfully."
                      );
                    }}
                  >
                    <div className="rounded-xl bg-purple-50 p-3 text-sm text-purple-800">
                      Holiday save hone ke baad
                      employee holiday list mein bhi
                      update dikhega.
                    </div>

                    <label className="block text-sm font-semibold">
                      Holiday Date
                    </label>

                    <input
                      type="date"
                      required
                      value={
                        holiday.holiday_date
                      }
                      onChange={(e) =>
                        setHoliday({
                          ...holiday,
                          holiday_date:
                            e.target.value,
                        })
                      }
                      className="w-full rounded-xl border p-3"
                    />

                    <label className="block text-sm font-semibold">
                      Holiday Name
                    </label>

                    <input
                      required
                      maxLength={150}
                      value={holiday.name}
                      onChange={(e) =>
                        setHoliday({
                          ...holiday,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g. Diwali, Independence Day"
                      className="w-full rounded-xl border p-3"
                    />

                    <label className="block text-sm font-semibold">
                      Description (Optional)
                    </label>

                    <textarea
                      rows={3}
                      maxLength={2000}
                      value={
                        holiday.description
                      }
                      onChange={(e) =>
                        setHoliday({
                          ...holiday,
                          description:
                            e.target.value,
                        })
                      }
                      placeholder="Holiday details..."
                      className="w-full rounded-xl border p-3"
                    />

                    <div className="flex gap-2">
                      <button
                        disabled={busy}
                        className="flex-1 rounded-xl bg-purple-700 px-4 py-3 font-semibold text-white disabled:opacity-50"
                      >
                        {editingHoliday
                          ? "Save Holiday Changes"
                          : "Add Holiday"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowHolidayForm(false)
                        }
                        className="rounded-xl border px-4 py-3"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </Panel>
              )}

              {/* EVENT FORM */}
              {showEventForm && (
                <Panel
                  title={
                    editingEvent
                      ? "Edit Event"
                      : "Add Calendar Event"
                  }
                  action={
                    <button
                      onClick={() =>
                        setShowEventForm(false)
                      }
                    >
                      <X size={18} />
                    </button>
                  }
                >
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();

                      perform(async () => {
                        await request(
                          editingEvent
                            ? `/admin/insights/calendar-events/${editingEvent}`
                            : "/admin/insights/calendar-events",
                          {
                            method: editingEvent
                              ? "PUT"
                              : "POST",
                            body: JSON.stringify(
                              event
                            ),
                          }
                        );

                        setShowEventForm(false);
                        setEditingEvent(null);
                        setSelectedDay(
                          event.event_date
                        );
                        setMonth(
                          event.event_date.slice(
                            0,
                            7
                          )
                        );
                      },
                      editingEvent
                        ? "Event updated."
                        : "Event added."
                      );
                    }}
                  >
                    <label className="block text-sm font-semibold">
                      Event Date
                    </label>

                    <input
                      type="date"
                      required
                      value={event.event_date}
                      onChange={(e) =>
                        setEvent({
                          ...event,
                          event_date:
                            e.target.value,
                        })
                      }
                      className="w-full rounded-xl border p-3"
                    />

                    <label className="block text-sm font-semibold">
                      Event Title
                    </label>

                    <input
                      required
                      minLength={2}
                      maxLength={180}
                      value={event.title}
                      onChange={(e) =>
                        setEvent({
                          ...event,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g. Monthly Team Meeting"
                      className="w-full rounded-xl border p-3"
                    />

                    <label className="block text-sm font-semibold">
                      Category
                    </label>

                    <select
                      value={event.category}
                      onChange={(e) =>
                        setEvent({
                          ...event,
                          category:
                            e.target.value,
                        })
                      }
                      className="w-full rounded-xl border p-3"
                    >
                      {Object.keys(
                        eventColors
                      ).map((category) => (
                        <option key={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <label className="block text-sm font-semibold">
                      Time (Optional)
                    </label>

                    <input
                      type="time"
                      value={event.start_time}
                      onChange={(e) =>
                        setEvent({
                          ...event,
                          start_time:
                            e.target.value,
                        })
                      }
                      className="w-full rounded-xl border p-3"
                    />

                    <label className="block text-sm font-semibold">
                      Description
                    </label>

                    <textarea
                      rows={3}
                      maxLength={2000}
                      value={event.description}
                      onChange={(e) =>
                        setEvent({
                          ...event,
                          description:
                            e.target.value,
                        })
                      }
                      placeholder="Meeting agenda or event details..."
                      className="w-full rounded-xl border p-3"
                    />

                    <button
                      disabled={busy}
                      className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-50"
                    >
                      {editingEvent
                        ? "Save Changes"
                        : "Add to Calendar"}
                    </button>
                  </form>
                </Panel>
              )}

              {/* LEAVE APPROVAL */}
              <Panel title="Pending Leave Approvals">
                <div className="space-y-3">
                  {leaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="rounded-xl border p-3"
                    >
                      <p className="font-semibold">
                        {leave.employee_name} ·{" "}
                        {leave.leave_type}
                      </p>

                      <p className="text-xs text-slate-500">
                        {niceDate(
                          leave.from_date
                        )}{" "}
                        –{" "}
                        {niceDate(
                          leave.to_date
                        )}
                      </p>

                      <p className="my-2 text-sm">
                        {leave.reason}
                      </p>

                      <div className="flex gap-2">
                        {[
                          "Approved",
                          "Rejected",
                        ].map((status) => (
                          <button
                            key={status}
                            disabled={busy}
                            onClick={() => {
                              if (
                                !window.confirm(
                                  `Leave ${status}?`
                                )
                              ) {
                                return;
                              }

                              perform(
                                () =>
                                  request(
                                    `/admin/leaves/${leave.id}/status`,
                                    {
                                      method: "PUT",
                                      body: JSON.stringify({
                                        status,
                                      }),
                                    }
                                  ),
                                `Leave ${status.toLowerCase()}.`
                              );
                            }}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${
                              status === "Approved"
                                ? "bg-emerald-600"
                                : "bg-red-600"
                            }`}
                          >
                            {status === "Approved"
                              ? "Approve"
                              : "Reject"}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {!leaves.length && (
                    <p className="text-sm text-slate-500">
                      No pending leaves.
                    </p>
                  )}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {/* ATTENDANCE */}
        {tab === "attendance" && (
          <Panel
            title="Live Attendance"
            action={
              <button
                onClick={() =>
                  exportExcel(
                    attendanceReport,
                    "LoanDPR_Attendance.xls"
                  )
                }
                className="rounded-xl bg-emerald-700 px-4 py-2 text-sm text-white"
              >
                Export Excel
              </button>
            }
          >
            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search employee name, ID or department..."
              className="mb-4 w-full rounded-xl border p-3"
            />

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Employee",
                      "ID",
                      "Department",
                      "Status",
                      "Check In",
                      "Check Out",
                    ].map((h) => (
                      <th
                        key={h}
                        className="p-3"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredAttendance.map(
                    (a) => (
                      <tr
                        key={a.id}
                        className="border-t"
                      >
                        <td className="p-3 font-semibold">
                          {a.name}
                        </td>

                        <td className="p-3">
                          {a.employee_code}
                        </td>

                        <td className="p-3">
                          {a.department || "—"}
                        </td>

                        <td className="p-3">
                          {a.status}
                        </td>

                        <td className="p-3">
                          {a.check_in
                            ? new Date(
                                a.check_in
                              ).toLocaleTimeString(
                                "en-IN"
                              )
                            : "—"}
                        </td>

                        <td className="p-3">
                          {a.check_out
                            ? new Date(
                                a.check_out
                              ).toLocaleTimeString(
                                "en-IN"
                              )
                            : "—"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {/* TASKS */}
        {tab === "tasks" && (
          <div className="space-y-5">
            <Panel
              title={
                editingTask
                  ? "Edit Task"
                  : "Assign New Task"
              }
            >
              <form
                className="grid gap-3 md:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();

                  perform(async () => {
                    await request(
                      editingTask
                        ? `/admin/insights/tasks/${editingTask}`
                        : "/admin/insights/tasks",
                      {
                        method: editingTask
                          ? "PUT"
                          : "POST",
                        body: JSON.stringify({
                          ...task,
                          employee_id: Number(
                            task.employee_id
                          ),
                        }),
                      }
                    );

                    setTask(newTask());
                    setEditingTask(null);
                  },
                  editingTask
                    ? "Task updated."
                    : "Task assigned."
                  );
                }}
              >
                <select
                  required
                  value={task.employee_id}
                  onChange={(e) =>
                    setTask({
                      ...task,
                      employee_id:
                        e.target.value,
                    })
                  }
                  className="rounded-xl border p-3"
                >
                  <option value="">
                    Select Employee
                  </option>

                  {employees.map((e) => (
                    <option
                      key={e.id}
                      value={e.id}
                    >
                      {e.name} (
                      {e.employee_code})
                    </option>
                  ))}
                </select>

                <input
                  required
                  minLength={2}
                  maxLength={255}
                  placeholder="Task title"
                  value={task.title}
                  onChange={(e) =>
                    setTask({
                      ...task,
                      title: e.target.value,
                    })
                  }
                  className="rounded-xl border p-3"
                />

                <input
                  type="date"
                  required
                  value={task.task_date}
                  onChange={(e) =>
                    setTask({
                      ...task,
                      task_date:
                        e.target.value,
                    })
                  }
                  className="rounded-xl border p-3"
                />

                <select
                  value={task.status}
                  disabled={!editingTask}
                  onChange={(e) =>
                    setTask({
                      ...task,
                      status: e.target.value,
                    })
                  }
                  className="rounded-xl border p-3"
                >
                  {[
                    "Pending",
                    "In Progress",
                    "Completed",
                  ].map((s) => (
                    <option key={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <textarea
                  placeholder="Task description"
                  maxLength={2000}
                  value={task.description}
                  onChange={(e) =>
                    setTask({
                      ...task,
                      description:
                        e.target.value,
                    })
                  }
                  className="rounded-xl border p-3 md:col-span-2"
                />

                <div className="flex gap-2">
                  <button
                    disabled={busy}
                    className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white"
                  >
                    {editingTask
                      ? "Save Task"
                      : "Assign Task"}
                  </button>

                  {editingTask && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTask(null);
                        setTask(newTask());
                      }}
                      className="rounded-xl border px-4"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </Panel>

            <Panel title="Task List">
              <div className="space-y-3">
                {tasks.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {item.title}
                      </p>

                      <p className="text-sm text-slate-500">
                        {item.employee_name} ·{" "}
                        {niceDate(
                          item.task_date
                        )}{" "}
                        · {item.status}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingTask(
                          item.id
                        );

                        setTask({
                          employee_id:
                            String(
                              item.employee_id
                            ),
                          title: item.title,
                          description:
                            item.description ||
                            "",
                          task_date:
                            item.task_date,
                          status: item.status,
                        });

                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                      className="rounded-lg border px-4 py-2"
                    >
                      Edit
                    </button>
                  </div>
                ))}

                {!tasks.length && (
                  <p className="text-sm text-slate-500">
                    No tasks.
                  </p>
                )}
              </div>
            </Panel>
          </div>
        )}

        {/* ANNOUNCEMENTS */}
        {tab === "announcements" && (
          <div className="space-y-5">
            <Panel title="Create Announcement with Photo">
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();

                  if (readingPhoto) return;

                  perform(async () => {
                    await request(
                      "/admin/announcements",
                      {
                        method: "POST",
                        body: JSON.stringify({
                          title:
                            title.trim(),
                          content:
                            content.trim(),
                          image_data:
                            photo || null,
                        }),
                      }
                    );

                    setTitle("");
                    setContent("");
                    removePhoto();
                  }, "Announcement published.");
                }}
              >
                <input
                  required
                  minLength={2}
                  maxLength={200}
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Announcement title"
                  className="w-full rounded-xl border p-3"
                />

                <textarea
                  required
                  rows={4}
                  maxLength={10000}
                  value={content}
                  onChange={(e) =>
                    setContent(
                      e.target.value
                    )
                  }
                  placeholder="Announcement message"
                  className="w-full rounded-xl border p-3"
                />

                <label className="flex items-center gap-2 font-semibold">
                  <ImagePlus size={18} />
                  Photo (optional, max 2 MB)
                </label>

                <input
                  ref={photoInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={choosePhoto}
                  className="block w-full text-sm"
                />

                {photo && (
                  <div className="rounded-xl border p-3">
                    <img
                      src={photo}
                      alt="Announcement preview"
                      className="max-h-64 w-full object-contain"
                    />

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm">
                        {photoName}
                      </span>

                      <button
                        type="button"
                        onClick={removePhoto}
                        className="flex items-center gap-2 text-red-600"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                <button
                  disabled={
                    busy || readingPhoto
                  }
                  className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                  <Megaphone
                    size={17}
                    className="mr-2 inline"
                  />
                  Publish Announcement
                </button>
              </form>
            </Panel>

            <Panel title="Manage Announcements">
              <div className="space-y-3">
                {announcements.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border p-4"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <h3 className="font-bold">
                            {item.title}
                          </h3>

                          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                            {item.content}
                          </p>
                        </div>

                        <span className="text-xs">
                          {item.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      {item.image_data && (
                        <img
                          src={
                            item.image_data
                          }
                          alt="Announcement attachment"
                          className="mt-3 max-h-52 rounded-lg object-contain"
                        />
                      )}

                      {item.is_active && (
                        <button
                          disabled={busy}
                          onClick={() => {
                            if (
                              !window.confirm(
                                "Deactivate announcement?"
                              )
                            ) {
                              return;
                            }

                            perform(
                              () =>
                                request(
                                  `/admin/announcements/${item.id}`,
                                  {
                                    method:
                                      "DELETE",
                                  }
                                ),
                              "Announcement deactivated."
                            );
                          }}
                          className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  )
                )}

                {!announcements.length && (
                  <p className="text-sm text-slate-500">
                    No announcements.
                  </p>
                )}
              </div>
            </Panel>
          </div>
        )}

        {/* PERFORMANCE */}
        {tab === "performance" && (
          <Panel
            title="Employee Performance"
            action={
              <button
                onClick={() =>
                  exportExcel(
                    performanceReport,
                    "LoanDPR_Performance.xls"
                  )
                }
                className="rounded-xl bg-emerald-700 px-4 py-2 text-sm text-white"
              >
                Export Excel
              </button>
            }
          >
            <div className="space-y-4">
              {performance.map(
                (person) => (
                  <div
                    key={
                      person.employee_id
                    }
                    className="rounded-xl border p-4"
                  >
                    <div className="mb-2 flex flex-wrap justify-between gap-2">
                      <strong>
                        {person.name}
                      </strong>

                      <span className="text-sm text-slate-500">
                        {person.completed}/
                        {person.assigned}{" "}
                        completed (
                        {person.completion_rate}
                        %)
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-700 to-cyan-400"
                        style={{
                          width: `${person.completion_rate}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {person.department ||
                        "No department"}{" "}
                      · {person.pending}{" "}
                      pending
                    </p>
                  </div>
                )
              )}

              {!performance.length && (
                <p className="text-sm text-slate-500">
                  No performance data.
                </p>
              )}
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Score is based on task completion only.
            </p>
          </Panel>
        )}

        {/* REPORTS */}
        {tab === "reports" && (
          <div className="space-y-5">
            <Panel title="Export Reports">
              <div className="flex flex-wrap gap-3 print:hidden">
                <button
                  onClick={() =>
                    exportExcel(
                      attendanceReport,
                      "LoanDPR_Attendance.xls"
                    )
                  }
                  className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-white"
                >
                  <Download size={17} />
                  Attendance Excel
                </button>

                <button
                  onClick={() =>
                    exportExcel(
                      performanceReport,
                      "LoanDPR_Performance.xls"
                    )
                  }
                  className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-white"
                >
                  <Download size={17} />
                  Performance Excel
                </button>

                <button
                  onClick={() =>
                    window.print()
                  }
                  className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-white"
                >
                  <Printer size={17} />
                  Print / Save PDF
                </button>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                Excel-compatible .xls export.
                PDF ke liye print dialog
                mein Save as PDF select karo.
              </p>
            </Panel>

            <Panel title="Attendance Report">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      {[
                        "Employee",
                        "Employee ID",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="border-b p-3"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {attendance.map((a) => (
                      <tr key={a.id}>
                        <td className="border-b p-3">
                          {a.name}
                        </td>

                        <td className="border-b p-3">
                          {a.employee_code}
                        </td>

                        <td className="border-b p-3">
                          {a.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title="Performance Report">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      {[
                        "Employee",
                        "Assigned",
                        "Completed",
                        "Completion %",
                      ].map((h) => (
                        <th
                          key={h}
                          className="border-b p-3"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {performance.map(
                      (p) => (
                        <tr
                          key={
                            p.employee_id
                          }
                        >
                          <td className="border-b p-3">
                            {p.name}
                          </td>

                          <td className="border-b p-3">
                            {p.assigned}
                          </td>

                          <td className="border-b p-3">
                            {p.completed}
                          </td>

                          <td className="border-b p-3">
                            {p.completion_rate}
                            %
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        )}
      </main>
    </div>
  );
}
