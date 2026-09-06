"use client";

import Link from "next/link";

const demand = [
  { service: "Electrical", value: 82 },
  { service: "Plumbing", value: 68 },
  { service: "Cleaning", value: 57 },
  { service: "Carpentry", value: 46 },
  { service: "Gardening", value: 38 },
];

const workers = [
  { name: "Rahul", skill: "Electrical Repair", jobs: 3, rating: 4.9, status: "Available" },
  { name: "Suresh", skill: "Carpentry", jobs: 2, rating: 4.8, status: "Available" },
  { name: "Neha", skill: "Electrical Repair", jobs: 4, rating: 4.8, status: "Busy" },
  { name: "Mohit", skill: "Carpentry", jobs: 1, rating: 4.6, status: "Available" },
  { name: "Anita", skill: "Plumbing", jobs: 3, rating: 4.7, status: "Available" },
];

const bookings = [
  {
    customer: "Household #104",
    service: "Electrical",
    worker: "Rahul",
    time: "10:30 AM",
    status: "Confirmed",
  },
  {
    customer: "Household #087",
    service: "Carpentry",
    worker: "Suresh",
    time: "12:00 PM",
    status: "Confirmed",
  },
  {
    customer: "Household #121",
    service: "Plumbing",
    worker: "Anita",
    time: "2:30 PM",
    status: "Pending",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#171717]">
      {/* Header */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-semibold tracking-tight">
            Veyra
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/request"
              className="text-sm font-medium text-black/60 transition hover:text-black"
            >
              Find a service
            </Link>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Intro */}
        <section className="mb-10">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-black/45">
            Cooperative dashboard
          </p>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Good morning, Cooperative Admin.
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-black/55">
                Monitor service demand, worker opportunities, and bookings
                across your cooperative.
              </p>
            </div>

            <div className="text-sm text-black/45">
              Monday · September 7, 2026
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            value="124"
            label="Verified workers"
            detail="+8 this month"
          />

          <StatCard
            value="38"
            label="Active bookings"
            detail="12 scheduled today"
          />

          <StatCard
            value="17"
            label="Services today"
            detail="Across 6 categories"
          />

          <StatCard
            value="4.8"
            label="Average rating"
            detail="From 286 reviews"
          />
        </section>

        {/* Main analytics */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          {/* Demand */}
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-black/45">
                  Demand forecast
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                  Tomorrow&apos;s expected demand
                </h2>
              </div>

              <span className="rounded-full bg-[#f1f1ed] px-3 py-1.5 text-xs font-medium text-black/60">
                AI forecast
              </span>
            </div>

            <div className="mt-8 space-y-5">
              {demand.map((item) => (
                <div key={item.service}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">{item.service}</span>
                    <span className="text-black/45">{item.value}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-black/8">
                    <div
                      className="h-full rounded-full bg-black transition-all"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-black/8 pt-5">
              <p className="text-sm leading-6 text-black/50">
                Electrical services are expected to have the highest demand
                tomorrow. Consider keeping additional electrical workers
                available during the morning.
              </p>
            </div>
          </div>

          {/* Cooperative health */}
          <div className="rounded-2xl bg-[#171717] p-6 text-white">
            <p className="text-sm font-medium text-white/45">
              Cooperative health
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Fair opportunity distribution
            </h2>

            <div className="mt-8">
              <div className="flex items-end justify-between">
                <span className="text-5xl font-semibold">87%</span>
                <span className="text-sm text-white/45">healthy</span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[87%] rounded-full bg-white" />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <HealthRow label="Workers with balanced workload" value="91%" />
              <HealthRow label="Verified worker coverage" value="94%" />
              <HealthRow label="Bookings matched successfully" value="96%" />
            </div>

            <div className="mt-8 border-t border-white/10 pt-5">
              <p className="text-sm leading-6 text-white/55">
                Your matching system is prioritizing qualified workers while
                avoiding excessive concentration of jobs among a few workers.
              </p>
            </div>
          </div>
        </section>

        {/* Workers */}
        <section className="mt-6 rounded-2xl border border-black/10 bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-black/8 p-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-black/45">
                Workforce
              </p>

              <h2 className="mt-1 text-2xl font-semibold">
                Worker availability
              </h2>
            </div>

            <span className="text-sm text-black/45">
              5 workers shown · 124 total
            </span>
          </div>

          <div className="divide-y divide-black/8">
            {workers.map((worker) => (
              <div
                key={worker.name}
                className="flex flex-col gap-4 p-5 transition hover:bg-black/[0.015] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ededeb] font-semibold">
                    {worker.name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{worker.name}</p>

                      <span className="text-xs text-black/35">
                        ✓ Verified
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-black/45">
                      {worker.skill} · {worker.rating} ★
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-black/35">Current workload</p>
                    <p className="mt-1 font-medium">
                      {worker.jobs} {worker.jobs === 1 ? "job" : "jobs"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      worker.status === "Available"
                        ? "bg-[#edf3ed] text-[#35523b]"
                        : "bg-[#f1f1ed] text-black/55"
                    }`}
                  >
                    {worker.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bookings */}
        <section className="mt-6 rounded-2xl border border-black/10 bg-white">
          <div className="border-b border-black/8 p-6">
            <p className="text-sm font-medium text-black/45">
              Today&apos;s activity
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Recent bookings
            </h2>
          </div>

          <div className="divide-y divide-black/8">
            {bookings.map((booking) => (
              <div
                key={`${booking.customer}-${booking.time}`}
                className="grid gap-3 p-5 md:grid-cols-[1.2fr_1fr_1fr_120px_110px] md:items-center"
              >
                <div>
                  <p className="font-medium">{booking.customer}</p>
                  <p className="mt-1 text-sm text-black/40">
                    Household request
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-black/35">
                    Service
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {booking.service}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-black/35">
                    Worker
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {booking.worker}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-black/35">
                    Time
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {booking.time}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1.5 text-xs font-medium ${
                    booking.status === "Confirmed"
                      ? "bg-[#edf3ed] text-[#35523b]"
                      : "bg-[#f4f0e7] text-[#685b3d]"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom message */}
        <section className="mt-6 border-t border-black/10 py-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="font-semibold">
                Veyra is built around the cooperative.
              </p>

              <p className="mt-1 text-sm text-black/45">
                Better matching for households. Fairer opportunities for
                workers.
              </p>
            </div>

            <Link
              href="/request"
              className="w-fit rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/80"
            >
              Find a service →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6">
      <p className="text-4xl font-semibold tracking-tight">{value}</p>

      <p className="mt-2 text-sm font-medium">{label}</p>

      <p className="mt-1 text-xs text-black/40">{detail}</p>
    </div>
  );
}

function HealthRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-white/60">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}