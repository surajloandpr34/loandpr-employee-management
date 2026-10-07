import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="bg-white text-slate-900">

      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-cyan-50">

        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-100/50 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-blue-100/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-14 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">

          {/* LEFT CONTENT */}
          <div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700">
              <CheckCircle2 size={17} />

              <span>
                Professional Financial Support
              </span>
            </div>

            <h1 className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-[62px]">
              Financial Documentation

              <span className="block text-cyan-600">
                Made Simple & Reliable
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              LoanDPR provides professional financial documentation and
              business support solutions designed to help businesses prepare
              accurate reports and move forward with confidence.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Get Consultation

                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/services"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-800 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                View Services
              </Link>

            </div>

            <div className="mt-10 grid max-w-xl grid-cols-1 gap-5 sm:grid-cols-3">

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <FileText size={21} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Accurate
                  </p>

                  <p className="text-xs text-slate-500">
                    Documentation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Secure
                  </p>

                  <p className="text-xs text-slate-500">
                    Information
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <TrendingUp size={21} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Business
                  </p>

                  <p className="text-xs text-slate-500">
                    Focused
                  </p>
                </div>
              </div>

            </div>

          </div>


          {/* HERO IMAGE */}
          <div className="relative mx-auto w-full max-w-2xl">

            <div className="absolute inset-10 rounded-[40px] bg-cyan-200/30 blur-3xl" />

            <div className="relative overflow-hidden rounded-[30px] border border-white bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">

              <img
                src="/business-hero.png"
                alt="Financial documentation and business report"
                className="block h-auto w-full object-cover"
              />

            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          STATS SECTION
      ========================================================= */}
      <section className="border-y border-slate-100 bg-white">

        <div className="mx-auto grid max-w-7xl grid-cols-1 px-6 sm:grid-cols-3 lg:px-8">

          <div className="flex items-center justify-center gap-4 border-b border-slate-100 py-7 sm:border-b-0 sm:border-r">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <FileText size={22} />
            </div>

            <div>
              <p className="text-2xl font-bold">
                3Lakhs+
              </p>

              <p className="text-sm text-slate-500">
                Reports
              </p>
            </div>

          </div>


          <div className="flex items-center justify-center gap-4 border-b border-slate-100 py-7 sm:border-b-0 sm:border-r">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <p className="text-2xl font-bold">
                10000+
              </p>

              <p className="text-sm text-slate-500">
                Clients
              </p>
            </div>

          </div>


          <div className="flex items-center justify-center gap-4 py-7">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <TrendingUp size={22} />
            </div>

            <div>
              <p className="text-2xl font-bold">
                15+
              </p>

              <p className="text-sm text-slate-500">
                Experience
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          FOUNDER SECTION - COMPACT VERSION
      ========================================================= */}
      <section className="bg-slate-50 py-16 sm:py-20">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          {/* Section Heading */}
          <div className="mb-9">

            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-600">
              Leadership
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Meet Our Founder
            </h2>

          </div>


          {/* Founder Card */}
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">

            <div className="grid lg:grid-cols-[360px_1fr]">

              {/* =================================================
                  FOUNDER IMAGE
              ================================================= */}
              <div className="relative h-[380px] bg-slate-100 sm:h-[440px] lg:h-[430px]">

                <img
                  src="/founder.png"
                  alt="CA Pradip Lad - Founder of LoanDPR"
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />

              </div>


              {/* =================================================
                  FOUNDER INFORMATION
              ================================================= */}
              <div className="flex items-center p-7 sm:p-9 lg:p-10">

                <div className="w-full">

                  {/* Label */}
                  <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-700">
                    <CheckCircle2 size={15} />

                    Our Visionary Founder
                  </div>


                  {/* Name */}
                  <h3 className="mt-5 text-3xl font-bold text-slate-950 sm:text-4xl">
                    CA Pradip Lad
                  </h3>


                  {/* Title */}
                  <p className="mt-2 text-base font-medium text-cyan-600">
                    Founder & Chartered Accountant
                  </p>


                  {/* Description */}
                  <p className="mt-5 max-w-3xl text-[15px] leading-7 text-slate-600 sm:text-base">
                    CA Pradip Lad is the driving force behind LoanDPR,
                    bringing over 15+ years of expertise as a Chartered
                    Accountant with a clear mission to simplify funding and
                    financial documentation for businesses.
                  </p>

                  <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600 sm:text-base">
                    His experience in credit assessment, strategic planning,
                    and project report preparation helps businesses navigate
                    their financial requirements with clarity and confidence.
                  </p>


                  {/* Small Stats */}
                  <div className="mt-7 flex flex-wrap gap-3">

                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-3">

                      <p className="text-xl font-bold text-slate-950">
                        15+
                      </p>

                      <p className="text-xs text-slate-500">
                        Years Experience
                      </p>

                    </div>


                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-3">

                      <p className="text-xl font-bold text-slate-950">
                        CA
                      </p>

                      <p className="text-xs text-slate-500">
                        Professional
                      </p>

                    </div>


                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-3">

                      <p className="text-xl font-bold text-slate-950">
                        MSME
                      </p>

                      <p className="text-xs text-slate-500">
                        Business Focus
                      </p>

                    </div>

                  </div>


                  {/* Bottom Line */}
                  <div className="mt-7 flex items-center gap-3">

                    <div className="h-px w-10 bg-cyan-500" />

                    <p className="text-sm font-medium text-slate-500">
                      Simplifying financial documentation for businesses.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          SERVICES SECTION
      ========================================================= */}
      <section className="bg-white py-20 sm:py-24">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">
              Our Services
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Business Documentation Solutions
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Professional support for your financial documentation and
              business requirements.
            </p>

          </div>


          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {/* SERVICE 1 */}
            <div className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-cyan-100 hover:shadow-xl">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 transition group-hover:bg-cyan-600 group-hover:text-white">
                <FileText size={23} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-950">
                Project Report
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Structured project reports prepared for business and
                financial requirements.
              </p>

              <Link
                to="/services"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-700"
              >
                Learn More
                <ArrowRight size={16} />
              </Link>

            </div>


            {/* SERVICE 2 */}
            <div className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-cyan-100 hover:shadow-xl">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 transition group-hover:bg-cyan-600 group-hover:text-white">
                <BarChart3 size={23} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-950">
                CMA Data
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Financial data preparation with clear and organized
                business projections.
              </p>

              <Link
                to="/services"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-700"
              >
                Learn More
                <ArrowRight size={16} />
              </Link>

            </div>


            {/* SERVICE 3 */}
            <div className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-cyan-100 hover:shadow-xl">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 transition group-hover:bg-cyan-600 group-hover:text-white">
                <ShieldCheck size={23} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-950">
                Business Support
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Professional documentation support for growing businesses.
              </p>

              <Link
                to="/services"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-700"
              >
                Learn More
                <ArrowRight size={16} />
              </Link>

            </div>

          </div>


          <div className="mt-10 text-center">

            <Link
              to="/services"
              className="inline-flex items-center gap-2 font-semibold text-cyan-600 hover:text-cyan-700"
            >
              Explore All Services
              <ArrowRight size={18} />
            </Link>

          </div>

        </div>

      </section>


      {/* =========================================================
          CTA SECTION
      ========================================================= */}
      <section className="px-6 pb-20 lg:px-8">

        <div className="mx-auto max-w-7xl rounded-[30px] bg-slate-950 px-8 py-12 sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-14">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-400">
              Let's Work Together
            </p>

            <h2 className="mt-3 max-w-2xl text-3xl font-bold text-white sm:text-4xl">
              Need professional financial documentation?
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              Connect with our team to discuss your business documentation
              requirements.
            </p>

          </div>


          <Link
            to="/contact"
            className="mt-8 inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-50 lg:mt-0"
          >
            Contact Us

            <ArrowRight size={18} />
          </Link>

        </div>

      </section>

    </main>
  );
}

export default Home;