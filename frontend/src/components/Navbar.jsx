import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  function closeMobileMenu() {
    setMobileOpen(false);
    setServicesOpen(false);
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white">

      <div className="mx-auto flex h-[88px] max-w-[1400px] items-center justify-between px-5 md:px-8">

        {/* ====================================================
            LOGO
        ===================================================== */}

        <Link
          to="/"
          onClick={closeMobileMenu}
          className="flex items-center"
        >
          <img
            src="/logo.png"
            alt="LoanDPR Creditum Management"
            className="h-[62px] w-auto object-contain"
          />
        </Link>


        {/* ====================================================
            DESKTOP NAVIGATION
        ===================================================== */}

        <nav className="hidden items-center gap-7 lg:flex">

          <Link
            to="/"
            className="text-[16px] font-medium text-slate-700 transition hover:text-cyan-600"
          >
            Home
          </Link>

          <Link
            to="/about"
            className="text-[16px] font-medium text-slate-700 transition hover:text-cyan-600"
          >
            About Us
          </Link>


          {/* SERVICES */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setServicesOpen(
                  (previous) => !previous
                )
              }
              className="flex items-center gap-1 text-[16px] font-medium text-slate-700 transition hover:text-cyan-600"
            >
              Services

              <ChevronDown
                className={`h-4 w-4 transition ${
                  servicesOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {servicesOpen && (
              <div className="absolute left-0 top-full mt-3 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">

                <Link
                  to="/services"
                  onClick={() =>
                    setServicesOpen(false)
                  }
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-cyan-600"
                >
                  All Services
                </Link>

              </div>
            )}

          </div>


          <Link
            to="/industries"
            className="text-[16px] font-medium text-slate-700 transition hover:text-cyan-600"
          >
            Industries
          </Link>

          <Link
            to="/why-choose-us"
            className="text-[16px] font-medium text-slate-700 transition hover:text-cyan-600"
          >
            Why Choose Us
          </Link>

          <Link
            to="/contact"
            className="text-[16px] font-medium text-slate-700 transition hover:text-cyan-600"
          >
            Contact
          </Link>

        </nav>


        {/* ====================================================
            DESKTOP ACTIONS
        ===================================================== */}

        <div className="hidden items-center gap-4 lg:flex">

          <Link
            to="/login"
            className="rounded-xl border border-slate-300 px-5 py-3 text-[16px] font-semibold text-slate-800 transition hover:border-cyan-500 hover:text-cyan-600"
          >
            Employee Login
          </Link>

          <Link
            to="/contact"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[16px] font-semibold text-white transition hover:bg-slate-800"
          >
            Get Consultation

            <ArrowRight className="h-4 w-4" />
          </Link>

        </div>


        {/* ====================================================
            MOBILE MENU BUTTON
        ===================================================== */}

        <button
          type="button"
          onClick={() =>
            setMobileOpen(
              (previous) => !previous
            )
          }
          className="rounded-lg p-2 text-slate-700 lg:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <X className="h-7 w-7" />
          ) : (
            <Menu className="h-7 w-7" />
          )}
        </button>

      </div>


      {/* ======================================================
          MOBILE NAVIGATION
      ======================================================= */}

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">

          <nav className="mx-auto max-w-7xl px-5 py-5">

            <div className="flex flex-col gap-1">

              <Link
                to="/"
                onClick={closeMobileMenu}
                className="rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
              >
                Home
              </Link>

              <Link
                to="/about"
                onClick={closeMobileMenu}
                className="rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
              >
                About Us
              </Link>

              <Link
                to="/services"
                onClick={closeMobileMenu}
                className="rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
              >
                Services
              </Link>

              <Link
                to="/industries"
                onClick={closeMobileMenu}
                className="rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
              >
                Industries
              </Link>

              <Link
                to="/why-choose-us"
                onClick={closeMobileMenu}
                className="rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
              >
                Why Choose Us
              </Link>

              <Link
                to="/contact"
                onClick={closeMobileMenu}
                className="rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
              >
                Contact
              </Link>


              {/* EMPLOYEE LOGIN */}

              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="mt-3 rounded-xl border border-slate-300 px-4 py-3 text-center font-semibold text-slate-800"
              >
                Employee Login
              </Link>


              {/* CONSULTATION */}

              <Link
                to="/contact"
                onClick={closeMobileMenu}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
              >
                Get Consultation

                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

          </nav>

        </div>
      )}

    </header>
  );
}

export default Navbar;