import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Factory,
  HandCoins,
  Leaf,
  Milk,
  Package,
  ShoppingBag,
  Wheat,
} from "lucide-react";
import { Link } from "react-router-dom";

function Industries() {
  const industries = [
    {
      icon: Factory,
      title: "Manufacturing",
      description:
        "Documentation and financial support for manufacturing businesses and industrial projects.",
    },
    {
      icon: Milk,
      title: "Dairy",
      description:
        "Business documentation support for dairy farms, processing units, and related businesses.",
    },
    {
      icon: HandCoins,
      title: "Poultry",
      description:
        "Financial documentation support for poultry farms and poultry-related business projects.",
    },
    {
      icon: ShoppingBag,
      title: "Retail",
      description:
        "Support for retailers in organizing business information and financial documentation.",
    },
    {
      icon: Building2,
      title: "Trading",
      description:
        "Documentation solutions for trading businesses and working capital requirements.",
    },
    {
      icon: Wheat,
      title: "Agriculture",
      description:
        "Business and financial documentation support for agriculture-related activities.",
    },
    {
      icon: Package,
      title: "Food Processing",
      description:
        "Documentation support for food processing units and growing food businesses.",
    },
    {
      icon: Leaf,
      title: "Service Businesses",
      description:
        "Professional documentation support for service-based businesses and entrepreneurs.",
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
              <Building2 size={16} />
              Industries We Support
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Supporting Businesses
              <span className="block text-cyan-600">
                Across Industries
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Every business has different financial and documentation
              requirements. Our solutions are designed to support businesses
              across different sectors and stages of growth.
            </p>

          </div>

        </div>
      </section>


      {/* INDUSTRIES */}
      <section className="bg-white py-20">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
              Our Expertise
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
              Business Sectors We Work With
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Explore the sectors where our financial documentation and
              business support solutions can be applied.
            </p>

          </div>


          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {industries.map((industry, index) => {
              const Icon = industry.icon;

              return (
                <div
                  key={industry.title}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl"
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
                    {industry.title}
                  </h3>

                  <p className="mt-3 min-h-[90px] text-sm leading-7 text-slate-600">
                    {industry.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-cyan-600">

                    <span>Learn More</span>

                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />

                  </div>

                </div>
              );
            })}

          </div>

        </div>
      </section>


      {/* BUSINESS APPROACH */}
      <section className="bg-slate-50 py-20">

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">

          <div>

            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
              Business-Focused Approach
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
              Documentation that understands your business
            </h2>

            <p className="mt-5 max-w-xl leading-8 text-slate-600">
              Different industries require different types of financial
              information and documentation. Our approach focuses on
              understanding the nature of your business before preparing
              the required documentation.
            </p>


            <div className="mt-8 space-y-4">

              {[
                "Industry-specific documentation approach",
                "Clear and organized financial information",
                "Professional documentation support",
                "Support for growing businesses",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3"
                >

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
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-lg">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <Building2 size={24} />
                </div>

                <div>
                  <p className="font-semibold text-slate-950">
                    Business Profile
                  </p>

                  <p className="text-xs text-slate-500">
                    Industry Overview
                  </p>
                </div>

              </div>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                Organized
              </span>

            </div>


            <div className="mt-7 space-y-3">

              {[
                "Manufacturing",
                "Retail & Trading",
                "Agriculture",
                "Service Businesses",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-4"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-cyan-600 shadow-sm">
                      {index + 1}
                    </div>

                    <span className="text-sm font-medium text-slate-700">
                      {item}
                    </span>

                  </div>

                  <CheckCircle2
                    size={18}
                    className="text-green-500"
                  />

                </div>
              ))}

            </div>


            <div className="mt-5 rounded-xl bg-cyan-50 p-4">

              <p className="text-sm font-semibold text-cyan-800">
                Professional Documentation Support
              </p>

              <p className="mt-1 text-xs leading-5 text-cyan-700">
                Organized around your business requirements.
              </p>

            </div>

          </div>

        </div>
      </section>


      {/* CTA */}
      <section className="bg-white px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-7xl rounded-3xl bg-slate-950 px-8 py-12 sm:px-12">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
                Have a Business Requirement?
              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-bold text-white sm:text-4xl">
                Let's discuss your business documentation needs
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                Connect with our team to discuss the documentation and
                financial support required for your business.
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

export default Industries;