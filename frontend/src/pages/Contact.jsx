import {
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = encodeURIComponent(
      `Business Enquiry - ${formData.name}`,
    );

    const body = encodeURIComponent(
      `Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}
Service: ${formData.service}

Message:
${formData.message}`,
    );

    window.location.href = `mailto:creditummanagement@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-cyan-50">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-cyan-100 opacity-50 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-100 opacity-40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
              <MessageCircle size={16} />
              Get In Touch
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Let's Discuss
              <span className="block text-cyan-600">
                Your Business Requirement
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Have a financial documentation or business support requirement?
              Connect with our team and share your requirement with us.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          {/* LEFT */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
              Contact Information
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
              We are here to help
            </h2>

            <p className="mt-5 max-w-xl leading-8 text-slate-600">
              Reach out to us for your business documentation and financial
              support requirements. Our team will help you understand the next
              steps.
            </p>

            {/* PHONE */}
            <a
              href="tel:+918830320788"
              className="mt-8 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Phone size={23} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Phone
                </p>

                <p className="mt-1 font-bold text-slate-950">
                  +91 8830320788
                </p>
              </div>
            </a>

            {/* EMAIL */}
            <a
              href="mailto:creditummanagement@gmail.com"
              className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Mail size={23} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-500">
                  Email
                </p>

                <p className="mt-1 break-all font-bold text-slate-950">
                  creditummanagement@gmail.com
                </p>
              </div>
            </a>

            {/* WHATSAPP */}
            <a
              href="https://wa.me/918830320788"
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <MessageCircle size={23} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  WhatsApp
                </p>

                <p className="mt-1 font-bold text-slate-950">
                  Chat With Us
                </p>
              </div>
            </a>

            {/* AVAILABILITY */}
            <div className="mt-4 flex items-center gap-4 rounded-2xl bg-slate-50 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
                <Clock3 size={23} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Business Enquiries
                </p>

                <p className="mt-1 font-bold text-slate-950">
                  Contact our team for assistance
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
                Send Enquiry
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
                Tell us about your requirement
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Fill in the details below. Your email application will open
                with the enquiry information ready to send.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* NAME + PHONE */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              {/* SERVICE */}
              <div>
                <label
                  htmlFor="service"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Service Required
                </label>

                <select
                  id="service"
                  name="service"
                  required
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                >
                  <option value="">Select a service</option>
                  <option value="Project Report (DPR)">
                    Project Report (DPR)
                  </option>
                  <option value="CMA Data Preparation">
                    CMA Data Preparation
                  </option>
                  <option value="GST Services">GST Services</option>
                  <option value="Income Tax Services">
                    Income Tax Services
                  </option>
                  <option value="Business Registration">
                    Business Registration
                  </option>
                  <option value="Government Scheme Support">
                    Government Scheme Support
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* MESSAGE */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Your Requirement
                </label>

                <textarea
                  id="message"
                  name="message"
                  required
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your business requirement..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3.5 font-semibold text-white transition hover:bg-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-100"
              >
                Send Enquiry
                <Send size={18} />
              </button>

              <p className="text-center text-xs leading-5 text-slate-500">
                Your enquiry will be prepared in your email application.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* QUICK CONTACT CTA */}
      <section className="bg-slate-50 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-slate-950 px-8 py-12 sm:px-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
                  Prefer Direct Contact?
                </p>

                <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                  Talk to our team directly
                </h2>

                <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                  Call us or connect with us on WhatsApp to discuss your
                  business requirement.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="tel:+918830320788"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-50"
                >
                  <Phone size={18} />
                  Call Now
                </a>

                <a
                  href="https://wa.me/918830320788"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 font-semibold text-white transition hover:bg-white/20"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Contact;