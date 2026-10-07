import { useLocation } from "react-router-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTasks from "./pages/AdminTasks";
import Calendar from "./pages/Calendar";
import Contact from "./pages/Contact";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Holidays from "./pages/Holidays";
import Home from "./pages/Home";
import Industries from "./pages/Industries";
import Login from "./pages/Login";
import Services from "./pages/Services";
import WhyChooseUs from "./pages/WhyChooseUs";

const INTERNAL_ROUTES = [
  "/login",
  "/employee-dashboard",
  "/admin-dashboard",
  "/tasks",
  "/admin-tasks",
  "/attendance",
  "/leaves",
  "/holidays",
  "/calendar",
  "/announcements",
  "/profile",
];

function AppLayout() {
  const location = useLocation();

  const isInternalPage = INTERNAL_ROUTES.includes(
    location.pathname,
  );

  return (
    <div className="min-h-screen bg-white">
      {!isInternalPage && <Navbar />}

      <Routes>
        {/* Public Website */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/industries" element={<Industries />} />
        <Route
          path="/why-choose-us"
          element={<WhyChooseUs />}
        />
        <Route path="/contact" element={<Contact />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />

        {/* Employee Portal */}
        <Route
          path="/employee-dashboard"
          element={<EmployeeDashboard />}
        />

        <Route path="/holidays" element={<Holidays />} />

        <Route path="/calendar" element={<Calendar />} />

        {/* Existing Internal Pages */}
        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/tasks"
          element={<AdminTasks />}
        />

        <Route
          path="/admin-tasks"
          element={<AdminTasks />}
        />
      </Routes>

      {!isInternalPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;