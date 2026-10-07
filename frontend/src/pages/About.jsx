import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

function About() {
  return (
    <main className="pt-[78px]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">
            About LoanDPR
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Your Business,
            <span className="block text-cyan-400">
              Our Expertise
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            LoanDPR Creditum Management Pvt. Ltd. provides professional
            financial documentation and business support services designed
            around the requirements of businesses and entrepreneurs.
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-600">
              Who We Are
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
              Supporting Businesses with Professional Documentation
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              Our services focus on financial documentation, project
              reports, CMA data, tax-related documentation, business
              registrations and government scheme application support.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              We aim to simplify documentation requirements so business
              owners can focus more on managing and growing their
              businesses.
            </p>

            <div className="mt-7 space-y-3">
              {[
                "Professional approach",
                "Structured documentation",
                "Business-focused support",
                "Transparent communication",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2
                    size={19}
                    className="text-cyan-600"
                  />

                  <span className="font-medium text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-cyan-50 p-7">
              <Target className="text-cyan-700" size={34} />

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Our Mission
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                To provide businesses with professional, structured and
                reliable documentation support.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-7">
              <Users className="text-cyan-400" size={34} />

              <h3 className="mt-5 text-xl font-bold text-white">
                Client Focus
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Understanding business requirements and providing
                practical documentation support.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-100 p-7">
              <ShieldCheck className="text-slate-700" size={34} />

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Trust & Confidentiality
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Responsible handling of business and financial
                information.
              </p>
            </div>

            <div className="rounded-2xl bg-cyan-600 p-7">
              <ArrowRight className="text-white" size={34} />

              <h3 className="mt-5 text-xl font-bold text-white">
                Business Support
              </h3>

              <p className="mt-3 text-sm leading-7 text-cyan-50">
                Helping businesses navigate their documentation
                requirements.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;