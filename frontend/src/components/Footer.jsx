import {
  ArrowUpRight,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Industries", path: "/industries" },
    { name: "Why Choose Us", path: "/why-choose-us" },
    { name: "Contact", path: "/contact" },
  ];

  const services = [
    "Project Report (DPR)",
    "CMA Data Preparation",
    "GST Services",
    "Income Tax Services",
    "Business Registration",
    "Government Scheme Support",
  ];

  return (
    <footer className="bg-slate-950 text-white">
      {/* MAIN FOOTER */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.8fr_1fr_1fr]">
          {/* COMPANY */}
          <div>
            <Link to="/" className="inline-flex items-center">
              <img
                src="/logo.png"
                alt="Creditum Management"
                className="h-14 w-auto object-contain"
              />
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
              Professional financial documentation and business support
              solutions designed around your business requirements.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="tel:+918830320788"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-slate-300 transition hover:bg-cyan-600 hover:text-white"
                aria-label="Call us"
              >
                <Phone size={18} />
              </a>

              <a
                href="mailto:creditummanagement@gmail.com"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-slate-300 transition hover:bg-cyan-600 hover:text-white"
                aria-label="Email us"
              >
                <Mail size={18} />
              </a>

              <a
                href="https://wa.me/918830320788"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-slate-300 transition hover:bg-cyan-600 hover:text-white"
                aria-label="WhatsApp us"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">
              Quick Links
            </h3>

            <div className="mt-6 space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-sm text-slate-400 transition hover:text-cyan-400"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* SERVICES */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">
              Services
            </h3>

            <div className="mt-6 space-y-3">
              {services.map((service) => (
                <Link
                  key={service}
                  to="/services"
                  className="group flex items-start gap-2 text-sm text-slate-400 transition hover:text-cyan-400"
                >
                  <ArrowUpRight
                    size={15}
                    className="mt-0.5 shrink-0 opacity-60 transition group-hover:opacity-100"
                  />

                  <span>{service}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">
              Contact Us
            </h3>

            <div className="mt-6 space-y-5">
              <a
                href="tel:+918830320788"
                className="flex gap-3 text-sm text-slate-400 transition hover:text-cyan-400"
              >
                <Phone
                  size={18}
                  className="mt-0.5 shrink-0 text-cyan-500"
                />

                <span>
                  <span className="block text-xs text-slate-500">
                    Phone
                  </span>

                  <span className="mt-1 block font-medium text-slate-300">
                    +91 8830320788
                  </span>
                </span>
              </a>

              <a
                href="mailto:creditummanagement@gmail.com"
                className="flex gap-3 text-sm text-slate-400 transition hover:text-cyan-400"
              >
                <Mail
                  size={18}
                  className="mt-0.5 shrink-0 text-cyan-500"
                />

                <span>
                  <span className="block text-xs text-slate-500">
                    Email
                  </span>

                  <span className="mt-1 block break-all font-medium text-slate-300">
                    creditummanagement@gmail.com
                  </span>
                </span>
              </a>

              <a
                href="https://wa.me/918830320788"
                target="_blank"
                rel="noreferrer"
                className="flex gap-3 text-sm text-slate-400 transition hover:text-cyan-400"
              >
                <MessageCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-cyan-500"
                />

                <span>
                  <span className="block text-xs text-slate-500">
                    WhatsApp
                  </span>

                  <span className="mt-1 block font-medium text-slate-300">
                    +91 8830320788
                  </span>
                </span>
              </a>
            </div>

            {/* EMPLOYEE LOGIN */}
            <Link
              to="/login"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Employee Login
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-8">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Creditum Management. All rights
            reserved.
          </p>

          <div className="flex items-center justify-center gap-5 text-xs text-slate-500">
            <span>Professional Financial Support</span>

            <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:block" />

            <Link
              to="/login"
              className="transition hover:text-cyan-400"
            >
              Employee Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;