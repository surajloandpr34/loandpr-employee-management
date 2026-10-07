import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

function WhyChooseUs() {
  const reasons = [
    {
      icon: Users,
      title: "Experienced Professionals",
      description:
        "Get professional support from a team focused on financial documentation and business requirements.",
    },
    {
      icon: FileCheck2,
      title: "Accurate Documentation",
      description:
        "We focus on clear, organized, and requirement-oriented financial documentation.",
    },
    {
      icon: Clock3,
      title: "Timely Support",
      description:
        "Our process is structured to help keep documentation work organized and moving on time.",
    },
    {
      icon: LockKeyhole,
      title: "Confidentiality",
      description:
        "Business and financial information is handled with professional care and confidentiality.",
    },
    {
      icon: MessageCircle,
      title: "Clear Communication",
      description:
        "We aim to keep communication simple, transparent, and easy to understand.",
    },
    {
      icon: ShieldCheck,
      title: "Business-Focused Approach",
      description:
        "Our support is designed around your business requirements rather than a one-size-fits-all approach.",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-cyan-50">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-cyan-100 opacity-50 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-100 opacity-40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
              <ShieldCheck size={16} />
              Why Choose LoanDPR
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Professional Support
              <span className="block text-cyan-600">
                for Your Business
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              We focus on professional documentation, clear communication,
              and business-oriented support to help you manage your financial
              requirements more effectively.
            </p>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
              Our Approach
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
              Support built around your business requirements
            </h2>

            <p className="mt-5 max-w-xl leading-8 text-slate-600">
              Financial documentation can be different for every business.
              We focus on understanding the requirement and organizing the
              relevant information in a professional manner.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Requirement-focused documentation",
                "Professional communication",
                "Organized financial information",
                "Business-oriented support",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2
                    size={21}
                    className="shrink-0 text-cyan-600"
                  />

                  <p className="text-sm font-medium text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
            <div className="rounded-3xl bg-slate-950 p-7 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 text-white">
                  <ShieldCheck size={28} />
                </div>

                <div>
                  <p className="text-lg font-bold text-white">
                    Professional Standards
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Focused on quality and clarity
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                {[
                  "Clear Documentation",
                  "Organized Information",
                  "Professional Support",
                  "Confidential Handling",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-xs font-bold text-cyan-300">
                        {index + 1}
                      </div>

                      <span className="text-sm font-medium text-slate-200">
                        {item}
                      </span>
                    </div>

                    <CheckCircle2
                      size={18}
                      className="text-cyan-400"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-cyan-500 p-5">
                <p className="font-semibold text-white">
                  Business-Focused Support
                </p>

                <p className="mt-1 text-sm leading-6 text-cyan-50">
                  Our approach is centered around understanding your
                  documentation and financial requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REASONS */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
              Why Work With Us
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
              What you can expect from our support
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Our services are structured around professionalism,
              documentation quality, and clear communication.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;

              return (
                <div
                  key={reason.title}
                  className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 transition group-hover:bg-cyan-600 group-hover:text-white">
                      <Icon size={26} />
                    </div>

                    <span className="text-sm font-bold text-slate-200">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-950">
                    {reason.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">
                    {reason.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
                  Simple & Professional
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                  A straightforward approach to documentation
                </h2>

                <p className="mt-5 leading-8 text-slate-600">
                  We keep the process focused on understanding your
                  requirement, organizing information, preparing documentation,
                  and providing the required support.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    number: "01",
                    title: "Understand",
                    text: "Understand your business and documentation requirement.",
                  },
                  {
                    number: "02",
                    title: "Organize",
                    text: "Organize the relevant business and financial information.",
                  },
                  {
                    number: "03",
                    title: "Prepare",
                    text: "Prepare documentation based on the applicable requirement.",
                  },
                  {
                    number: "04",
                    title: "Support",
                    text: "Provide professional support throughout the process.",
                  },
                ].map((step) => (
                  <div
                    key={step.number}
                    className="rounded-2xl bg-slate-50 p-5"
                  >
                    <div className="text-sm font-bold text-cyan-600">
                      {step.number}
                    </div>

                    <h3 className="mt-3 font-bold text-slate-950">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-6 pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl bg-slate-950 px-8 py-12 sm:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
                Need Professional Support?
              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-bold text-white sm:text-4xl">
                Let's discuss your business requirements
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                Connect with our team to discuss your financial documentation
                and business support requirements.
              </p>
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-50"
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

export default WhyChooseUs;