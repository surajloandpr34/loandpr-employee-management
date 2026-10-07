import {
  ArrowRight,
  BarChart3,
  Building2,
  Calculator,
  CheckCircle2,
  FileBarChart,
  FileText,
  Landmark,
  ReceiptText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

function Services() {
  const services = [
    {
      icon: FileBarChart,
      title: "Project Report (DPR)",
      description:
        "Professionally structured project reports prepared to present your business plan, financial requirements, and project details clearly.",
      tag: "Business Documentation",
    },
    {
      icon: BarChart3,
      title: "CMA Data Preparation",
      description:
        "Organized financial data and projections designed to present business performance and future financial requirements.",
      tag: "Financial Planning",
    },
    {
      icon: ReceiptText,
      title: "GST Services",
      description:
        "Support for GST-related registration and return requirements with properly organized business information.",
      tag: "Tax Support",
    },
    {
      icon: Calculator,
      title: "Income Tax Services",
      description:
        "Professional support for income tax documentation and return-related requirements.",
      tag: "Tax Support",
    },
    {
      icon: Building2,
      title: "Business Registration",
      description:
        "Documentation support for businesses looking to establish and organize their business registration requirements.",
      tag: "Business Setup",
    },
    {
      icon: Landmark,
      title: "Government Scheme Support",
      description:
        "Documentation and application support for eligible business and government scheme requirements.",
      tag: "Business Support",
    },
  ];

  const benefits = [
    "Professionally structured documentation",
    "Clear and organized financial information",
    "Business-focused approach",
    "Confidential handling of information",
    "Timely documentation support",
    "Dedicated professional assistance",
  ];

  return (
    <main className="bg-white text-slate-900">

      {/* =========================================================
          PAGE HERO
      ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-cyan-50">

        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[380px] w-[380px] rounded-full bg-blue-100/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8">

          <div className="max-w-3xl">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
              <Sparkles size={16} />

              Professional Services
            </div>

            {/* Heading */}
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Financial & Business
              <span className="block text-cyan-600">
                Documentation Services
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Practical documentation and business support solutions designed
              to help businesses organize their financial information and
              move forward with confidence.
            </p>

          </div>

        </div>
      </section>


      {/* =========================================================
          SERVICES GRID
      ========================================================= */}
      <section className="bg-white py-20 sm:py-24">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          {/* Section heading */}
          <div className="max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-600">
              What We Provide
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Solutions for Your Business Requirements
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Our services are focused on making financial and business
              documentation more organized, clear, and professional.
            </p>

          </div>


          {/* Cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {services.map((service, index) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.title}
                  className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-100 hover:shadow-[0_20px_50px_rgba(15,23,42,0.09)]"
                >

                  {/* Top number */}
                  <div className="absolute right-6 top-6 text-sm font-semibold text-slate-200">
                    0{index + 1}
                  </div>


                  {/* Icon */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 transition duration-300 group-hover:bg-cyan-600 group-hover:text-white">
                    <Icon size={26} strokeWidth={1.8} />
                  </div>


                  {/* Tag */}
                  <div className="mt-6 inline-flex rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                    {service.tag}
                  </div>


                  {/* Title */}
                  <h3 className="mt-4 text-xl font-bold text-slate-950">
                    {service.title}
                  </h3>


                  {/* Description */}
                  <p className="mt-3 min-h-[96px] text-sm leading-7 text-slate-600">
                    {service.description}
                  </p>


                  {/* Bottom */}
                  <div className="mt-6 border-t border-slate-100 pt-5">

                    <Link
                      to="/contact"
                      className="group/link inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 transition hover:text-cyan-700"
                    >
                      Discuss Your Requirement

                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover/link:translate-x-1"
                      />
                    </Link>

                  </div>

                </div>
              );
            })}

          </div>

        </div>
      </section>


      {/* =========================================================
          WHY OUR SERVICES
      ========================================================= */}
      <section className="bg-slate-50 py-20 sm:py-24">

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">

          {/* LEFT */}
          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-600">
              Why Choose Our Support
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Documentation that keeps your business moving
            </h2>

            <p className="mt-5 max-w-xl leading-8 text-slate-600">
              Good documentation should be clear, organized, and easy to
              understand. Our approach focuses on helping businesses prepare
              their information in a professional manner.
            </p>


            {/* Benefits */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">

              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-3"
                >

                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
                    <CheckCircle2 size={16} />
                  </div>

                  <p className="text-sm font-medium leading-6 text-slate-700">
                    {benefit}
                  </p>

                </div>
              ))}

            </div>

          </div>


          {/* RIGHT CARD */}
          <div className="relative">

            {/* Glow */}
            <div className="absolute inset-8 rounded-[40px] bg-cyan-100/60 blur-3xl" />

            <div className="relative rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-9">

              {/* Card heading */}
              <div className="flex items-start justify-between gap-4">

                <div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <ShieldCheck size={24} />
                  </div>

                  <h3 className="mt-5 text-2xl font-bold text-slate-950">
                    Professional Support
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Organized documentation designed around your business
                    requirements.
                  </p>

                </div>

                <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                  Reliable
                </div>

              </div>


              {/* Document preview */}
              <div className="mt-8 rounded-2xl bg-slate-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-cyan-600 shadow-sm">
                    <FileText size={20} />
                  </div>

                  <div className="flex-1">

                    <div className="h-2.5 w-32 rounded-full bg-slate-200" />

                    <div className="mt-2 h-2 w-20 rounded-full bg-slate-100" />

                  </div>

                  <CheckCircle2
                    size={20}
                    className="text-green-500"
                  />

                </div>


                <div className="mt-6 space-y-3">

                  <div className="h-2.5 w-full rounded-full bg-white" />

                  <div className="h-2.5 w-[88%] rounded-full bg-white" />

                  <div className="h-2.5 w-[72%] rounded-full bg-white" />

                  <div className="h-2.5 w-[92%] rounded-full bg-white" />

                </div>

              </div>


              {/* Bottom status */}
              <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">

                <div className="flex items-center gap-2">

                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />

                  <span className="text-sm font-medium text-slate-700">
                    Documentation Ready
                  </span>

                </div>

                <span className="text-xs text-slate-400">
                  Professional
                </span>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          CTA SECTION
      ========================================================= */}
      <section className="bg-white px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-slate-950 px-8 py-12 sm:px-12 lg:px-14">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-400">
                Need Assistance?
              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-bold text-white sm:text-4xl">
                Let's discuss your documentation requirements
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                Get in touch with our team for professional financial and
                business documentation support.
              </p>

            </div>


            <Link
              to="/contact"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-50"
            >
              Get Consultation

              <ArrowRight size={18} />
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Services;