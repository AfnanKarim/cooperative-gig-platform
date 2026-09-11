"use client";

import { useEffect, useMemo, useState } from "react";
import MapWrapper from "./components/MapWrapper";
import VeyraMatching from "./components/VeyraMatching";
import { createClient } from "./lib/supabase/client";

const services = [
  {
    icon: "⚡",
    title: "Electrical",
    description: "Repairs, wiring & installations",
  },
  {
    icon: "🔧",
    title: "Plumbing",
    description: "Leaks, pipes & fittings",
  },
  {
    icon: "🪚",
    title: "Carpentry",
    description: "Furniture & woodwork",
  },
  {
    icon: "🧹",
    title: "Cleaning",
    description: "Home & community cleaning",
  },
  {
    icon: "🌱",
    title: "Gardening",
    description: "Garden & maintenance",
  },
  {
    icon: "🛠️",
    title: "General Repairs",
    description: "Everyday household fixes",
  },
];

const steps = [
  {
    number: "01",
    title: "Describe your problem",
    description: "Tell Veyra what you need in your own words.",
  },
  {
    number: "02",
    title: "Veyra understands",
    description:
      "AI identifies the service, issue and urgency from your request.",
  },
  {
    number: "03",
    title: "Fair matching",
    description:
      "Qualified workers are ranked using skill, availability and fairness.",
  },
  {
    number: "04",
    title: "Book & get it done",
    description:
      "Choose a suitable worker and schedule the service.",
  },
];

export default function Home() {
  const supabase = useMemo(() => createClient(), []);

  const [firstName, setFirstName] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (isMounted) {
            setFirstName(null);
            setIsLoadingProfile(false);
          }
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Homepage profile error:", error.message);
        }

        if (!isMounted) return;

        const profileName = profile?.full_name?.trim();

        if (profileName) {
          setFirstName(profileName.split(/\s+/)[0]);
        } else {
          const metadataName =
            typeof user.user_metadata?.full_name === "string"
              ? user.user_metadata.full_name.trim()
              : "";

          setFirstName(
            metadataName ? metadataName.split(/\s+/)[0] : null
          );
        }
      } catch (error) {
        console.error(
          "Homepage account error:",
          error instanceof Error ? error.message : String(error)
        );
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const isLoggedIn = Boolean(firstName);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <a
            href="/"
            className="text-4xl font-black tracking-tight text-slate-950"
          >
            Veyra<span className="text-emerald-600">.</span>
          </a>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a
              href="#services"
              className="transition-colors hover:text-slate-950"
            >
              Services
            </a>

            <a
              href="#how-it-works"
              className="transition-colors hover:text-slate-950"
            >
              How it works
            </a>

            <a
              href="#cooperative"
              className="transition-colors hover:text-slate-950"
            >
              Cooperative
            </a>

            <a
              href="/dashboard"
              className="transition-colors hover:text-emerald-600"
            >
              Dashboard
            </a>
          </div>

          {/* Main actions */}
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              Log in
            </a>

            <a
              href="/request"
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Find a Service
            </a>
          </div>
        </div>
      </nav>

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="overflow-hidden border-b border-slate-100">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-16 md:grid-cols-2 md:gap-20 md:py-24">
          {/* Hero copy */}
          <div>
            {/* Personalized greeting */}
            {isLoggedIn ? (
              <div className="mb-6">
                <p className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  Hi {firstName} 👋
                </p>

                <h1 className="mt-3 max-w-3xl text-5xl font-bold leading-[1.04] tracking-tight text-slate-950 md:text-6xl lg:text-7xl">
                  What service do
                  <br />
                  <span className="text-emerald-600">
                    you need today?
                  </span>
                </h1>

                <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
                  Tell Veyra what you need in your own words. Our AI
                  understands the problem and connects you with suitable
                  local workers through fair, intelligent matching.
                </p>
              </div>
            ) : (
              <>
                {/* Status badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  Trusted local services · Powered by cooperation
                </div>

                {/* Original public heading */}
                <h1 className="max-w-3xl text-5xl font-bold leading-[1.04] tracking-tight text-slate-950 md:text-6xl lg:text-7xl">
                  Get the right help.
                  <br />
                  <span className="text-emerald-600">
                    Support local workers.
                  </span>
                </h1>

                <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
                  Find verified local professionals for everyday services.
                  Veyra understands what you need and connects you with
                  suitable workers through fair, intelligent matching.
                </p>
              </>
            )}

            {/* CTA buttons */}
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="/request"
                className="rounded-full bg-emerald-600 px-7 py-3.5 font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
              >
                Find a Service →
              </a>

              <a
                href="/worker"
                className="rounded-full border border-slate-200 bg-white px-7 py-3.5 font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                Become a Worker
              </a>
            </div>

            {/* Small trust indicators */}
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                Verified workers
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                Fair opportunities
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                Intelligent matching
              </div>
            </div>
          </div>

          {/* =====================================================
              MAP VISUAL
          ===================================================== */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-2xl shadow-slate-200/70">
              <MapWrapper />
              <VeyraMatching />
            </div>

            {/* Floating matching status */}
            <div className="absolute bottom-5 left-5 right-5 z-[1000]">
              <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400">
                    VEYRA MATCHING
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Finding the best local worker
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                  Live
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SERVICES
      ========================================================= */}
      <section id="services" className="bg-slate-50 px-6 py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-bold tracking-[0.15em] text-emerald-600">
              SERVICES
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              What do you need help with?
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-500">
              From everyday repairs to household maintenance, find
              verified workers for the job.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <a
                key={service.title}
                href="/request"
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl transition-colors group-hover:bg-emerald-50">
                    {service.icon}
                  </div>

                  <span className="text-xl text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-emerald-600">
                    →
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold text-slate-950">
                  {service.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {service.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-6 py-20 md:py-24"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-bold tracking-[0.15em] text-emerald-600">
            HOW IT WORKS
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Simple for customers. Fair for workers.
          </h2>

          <p className="mt-4 leading-7 text-slate-500">
            Veyra brings the entire service journey into one simple
            experience.
          </p>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="text-sm font-bold text-emerald-600">
                {step.number}
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-950">
                {step.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {step.description}
              </p>

              {step.number !== "04" && (
                <div className="mt-7 hidden h-px bg-slate-200 md:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          COOPERATIVE DIFFERENCE
      ========================================================= */}
      <section
        id="cooperative"
        className="bg-slate-950 px-6 py-20 text-white md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <p className="text-sm font-bold tracking-[0.15em] text-emerald-400">
                THE COOPERATIVE DIFFERENCE
              </p>

              <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
                Technology that works for the whole community.
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Veyra helps cooperatives connect households with
                verified workers while distributing opportunities
                fairly and using demand insights to plan their
                workforce.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    ✓
                  </span>

                  <div>
                    <p className="font-semibold">Verified workers</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Skills and profiles can be verified.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    ↗
                  </span>

                  <div>
                    <p className="font-semibold">Fair opportunities</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Matching considers workload, not just ratings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    ◌
                  </span>

                  <div>
                    <p className="font-semibold">
                      Smarter workforce planning
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Demand insights help cooperatives plan ahead.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="bg-slate-950 px-6 pb-10 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-slate-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-bold text-white">
              Veyra<span className="text-emerald-500">.</span>
            </p>

            <p className="mt-1 text-sm">
              Fair work. Trusted services.
            </p>
          </div>

          <p className="text-sm">© 2026 Veyra</p>
        </div>
      </footer>
    </main>
  );
}