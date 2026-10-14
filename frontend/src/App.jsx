import { useLocation } from "react-router-dom";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTasks from "./pages/AdminTasks";
import Attendance from "./pages/Attendance";
import Calendar from "./pages/Calendar";
import Contact from "./pages/Contact";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeManagement from "./pages/EmployeeManagement";
import ForgotPassword from "./pages/ForgotPassword";
import Holidays from "./pages/Holidays";
import Home from "./pages/Home";
import Industries from "./pages/Industries";
import Leaves from "./pages/Leaves";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Services from "./pages/Services";
import WhyChooseUs from "./pages/WhyChooseUs";

const INTERNAL_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/employee-dashboard",
  "/admin-dashboard",
  "/employee-management",
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
    location.pathname
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
        <Route path="/why-choose-us" element={<WhyChooseUs />} />
        <Route path="/contact" element={<Contact />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Employee Portal */}
        <Route
          path="/employee-dashboard"
          element={<EmployeeDashboard />}
        />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leaves" element={<Leaves />} />
        <Route path="/holidays" element={<Holidays />} />
        <Route path="/calendar" element={<Calendar />} />

        {/* Admin Portal */}
        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />
        <Route
          path="/employee-management"
          element={<EmployeeManagement />}
        />
        <Route path="/tasks" element={<AdminTasks />} />
        <Route path="/admin-tasks" element={<AdminTasks />} />
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