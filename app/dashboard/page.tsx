"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const API_URL = "https://veyra-backend-aydx.onrender.com";

const demand = [
  { service: "Electrical", value: 82 },
  { service: "Plumbing", value: 68 },
  { service: "Cleaning", value: 57 },
  { service: "Carpentry", value: 46 },
  { service: "Gardening", value: 38 },
];

const workers = [
  {
    name: "Rahul",
    skill: "Electrical Repair",
    jobs: 3,
    rating: 4.9,
    status: "Available",
  },
  {
    name: "Suresh",
    skill: "Carpentry",
    jobs: 2,
    rating: 4.8,
    status: "Available",
  },
  {
    name: "Neha",
    skill: "Electrical Repair",
    jobs: 4,
    rating: 4.8,
    status: "Busy",
  },
  {
    name: "Mohit",
    skill: "Carpentry",
    jobs: 1,
    rating: 4.6,
    status: "Available",
  },
  {
    name: "Anita",
    skill: "Plumbing",
    jobs: 3,
    rating: 4.7,
    status: "Available",
  },
];

type Booking = {
  id: number;
  worker_id: number;
  worker_name: string;
  service: string;
  issue: string;
  scheduled_at: string;
  status: string;
};

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [backendConnected, setBackendConnected] = useState(true);

useEffect(() => {
  async function loadBookings() {
    try {
      const response = await fetch(`${API_URL}/bookings`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load bookings");
      }

      const data = await response.json();

      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      setBackendConnected(true);
    } catch {
      setBackendConnected(false);
    } finally {
      setLoadingBookings(false);
    }
  }

  loadBookings();
}, []);

  const activeBookings = bookings.filter(
    (booking) =>
      booking.status.toLowerCase() !== "completed" &&
      booking.status.toLowerCase() !== "cancelled",
  ).length;

  const servicesToday = new Set(
    bookings.map((booking) => booking.service),
  ).size;

  const totalEstimatedActivity = useMemo(() => {
    return bookings.length;
  }, [bookings]);

  return (
    <main className="min-h-screen bg-[#f6f5f0] text-[#17251f]">
      {/* Header */}
      <header className="border-b border-[#17251f]/8 bg-[#fbfaf7]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#173c31] text-white">
              <span className="text-lg">V</span>
            </div>

            <div>
              <p className="text-xl font-semibold tracking-tight">Veyra</p>

              <p className="text-[10px] font-medium tracking-[0.18em] text-[#17251f]/40">
                STRONGER TOGETHER
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/request"
              className="text-sm font-medium text-[#17251f]/55 transition hover:text-[#17251f]"
            >
              Find a service
            </Link>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#173c31] text-sm font-semibold text-white">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Intro */}
        <section className="mb-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#477565]">
                Cooperative dashboard
              </p>

              <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#17251f] md:text-5xl">
                Good morning, Cooperative Admin.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-[#17251f]/55">
                Monitor service demand, worker opportunities, and bookings
                across your cooperative.
              </p>
            </div>

            <div className="rounded-full border border-[#17251f]/10 bg-[#fbfaf7] px-4 py-2.5 text-sm text-[#17251f]/55 shadow-sm">
              Monday · September 7, 2026
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="◎"
            value="124"
            label="Verified workers"
            detail="+8 this month"
          />

          <StatCard
            icon="□"
            value={loadingBookings ? "—" : String(activeBookings)}
            label="Active bookings"
            detail={
              loadingBookings
                ? "Loading live data..."
                : `${bookings.length} total booking${
                    bookings.length === 1 ? "" : "s"
                  }`
            }
          />

          <StatCard
            icon="✦"
            value={loadingBookings ? "—" : String(servicesToday)}
            label="Services today"
            detail={
              loadingBookings
                ? "Loading live data..."
                : totalEstimatedActivity > 0
                  ? "From live bookings"
                  : "No bookings yet"
            }
          />

          <StatCard
            icon="★"
            value="4.8"
            label="Average rating"
            detail="From 286 reviews"
          />
        </section>

        {/* Analytics */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          {/* Demand */}
          <div className="rounded-3xl border border-[#17251f]/8 bg-[#fbfaf7] p-6 shadow-[0_12px_35px_rgba(23,37,31,0.035)] md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#477565]">
                  AI forecast
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Tomorrow&apos;s expected demand
                </h2>
              </div>

              <span className="rounded-full border border-[#17251f]/8 bg-[#f1f1eb] px-3 py-1.5 text-xs font-medium text-[#17251f]/50">
                Forecast
              </span>
            </div>

            <div className="mt-8 space-y-6">
              {demand.map((item, index) => (
                <div key={item.service}>
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-sm font-medium">{item.service}</span>

                    <span className="text-sm font-medium text-[#17251f]/45">
                      {item.value}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#17251f]/7">
                    <div
                      className={`h-full rounded-full ${
                        index === 0 ? "bg-[#477565]" : "bg-[#7f9b8e]"
                      }`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-[#477565]/15 bg-[#edf3ee] px-5 py-4">
              <p className="text-sm leading-6 text-[#315a4b]">
                <span className="font-semibold">Electrical services</span>{" "}
                are expected to have the highest demand tomorrow. Consider
                keeping additional electrical workers available during the
                morning.
              </p>
            </div>
          </div>

          {/* Cooperative health */}
          <div className="relative overflow-hidden rounded-3xl bg-[#173c31] p-7 text-white shadow-[0_15px_40px_rgba(23,60,49,0.12)]">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/8" />

            <div className="absolute -right-3 top-0 h-20 w-20 rounded-full border border-white/5" />

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              Cooperative health
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Fair opportunity distribution
            </h2>

            <div className="mt-9 flex items-center gap-7">
              <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full border-[10px] border-[#91c7a8]">
                <div className="absolute inset-[-10px] rounded-full border-[10px] border-transparent border-l-[#e4c98b] border-t-[#e4c98b]" />

                <div className="text-center">
                  <p className="text-4xl font-semibold">87%</p>

                  <p className="mt-1 text-xs text-white/45">healthy</p>
                </div>
              </div>

              <div className="space-y-5">
                <HealthRow label="Balanced workload" value="91%" />
                <HealthRow label="Verified coverage" value="94%" />
                <HealthRow label="Successful matches" value="96%" />
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-5">
              <p className="text-sm leading-6 text-white/55">
                Qualified workers are being prioritized while avoiding
                excessive concentration of jobs among a few workers.
              </p>
            </div>
          </div>
        </section>

        {/* Workforce */}
        <section className="mt-6 rounded-3xl border border-[#17251f]/8 bg-[#fbfaf7] shadow-[0_12px_35px_rgba(23,37,31,0.035)]">
          <div className="flex flex-col justify-between gap-3 border-b border-[#17251f]/8 p-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#477565]">
                Workforce
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Worker availability
              </h2>
            </div>

            <span className="text-sm text-[#17251f]/40">
              5 workers shown · 124 total
            </span>
          </div>

          <div className="divide-y divide-[#17251f]/7">
            {workers.map((worker) => (
              <div
                key={worker.name}
                className="flex flex-col gap-4 p-5 transition hover:bg-[#f5f4ef] sm:flex-row sm:items-center sm:justify-between md:px-6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e7ebe5] font-semibold text-[#315a4b]">
                    {worker.name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{worker.name}</p>

                      <span className="text-xs text-[#477565]">
                        ✓ Verified
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-[#17251f]/45">
                      {worker.skill} · {worker.rating} ★
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-[#17251f]/35">Current workload</p>

                    <p className="mt-1 font-medium">
                      {worker.jobs} {worker.jobs === 1 ? "job" : "jobs"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      worker.status === "Available"
                        ? "bg-[#e7f0e9] text-[#35604d]"
                        : "bg-[#f1eee7] text-[#6a604d]"
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
        <section className="mt-6 rounded-3xl border border-[#17251f]/8 bg-[#fbfaf7] shadow-[0_12px_35px_rgba(23,37,31,0.035)]">
          <div className="flex flex-col justify-between gap-3 border-b border-[#17251f]/8 p-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#477565]">
                Today&apos;s activity
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Recent bookings
              </h2>
            </div>

            {!loadingBookings && (
              <span className="text-sm text-[#17251f]/40">
                {bookings.length} live booking
                {bookings.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {loadingBookings ? (
            <div className="p-8 text-sm text-[#17251f]/45">
              Loading live bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8">
              <p className="font-medium">No bookings yet.</p>

              <p className="mt-1 text-sm text-[#17251f]/40">
                New confirmed bookings will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#17251f]/7">
              {bookings
                .slice()
                .reverse()
                .map((booking) => (
                  <div
                    key={booking.id}
                    className="grid gap-4 p-5 md:grid-cols-[1.2fr_1fr_1fr_160px_110px] md:items-center md:px-6"
                  >
                    <div>
                      <p className="font-medium">
                        Household #{String(booking.id).padStart(3, "0")}
                      </p>

                      <p className="mt-1 text-sm text-[#17251f]/35">
                        {booking.issue}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#17251f]/35">
                        Service
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {booking.service}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#17251f]/35">
                        Worker
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {booking.worker_name}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#17251f]/35">
                        Scheduled
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {formatBookingDate(booking.scheduled_at)}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-xs font-medium ${
                        booking.status.toLowerCase() === "confirmed"
                          ? "bg-[#e7f0e9] text-[#35604d]"
                          : "bg-[#f1eee7] text-[#6a604d]"
                      }`}
                    >
                      {capitalize(booking.status)}
                    </span>
                  </div>
                ))}
            </div>
          )}

          {!backendConnected && !loadingBookings && (
            <div className="border-t border-[#17251f]/8 bg-[#f1eee7] px-6 py-4">
              <p className="text-sm text-[#6a604d]">
                Live booking data is temporarily unavailable. The rest of the
                dashboard is still available.
              </p>
            </div>
          )}
        </section>

        {/* Bottom message */}
        <section className="mt-6 border-t border-[#17251f]/8 py-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="font-semibold">
                Veyra is built around the cooperative.
              </p>

              <p className="mt-1 text-sm text-[#17251f]/40">
                Better matching for households. Fairer opportunities for
                workers.
              </p>
            </div>

            <Link
              href="/request"
              className="w-fit rounded-full bg-[#173c31] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#245443]"
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
  icon,
  value,
  label,
  detail,
}: {
  icon: string;
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="group rounded-3xl border border-[#17251f]/8 bg-[#fbfaf7] p-6 shadow-[0_10px_30px_rgba(23,37,31,0.025)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(23,37,31,0.05)]">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7eee8] text-[#35604d]">
          {icon}
        </div>

        <span className="text-xs text-[#17251f]/25">Veyra</span>
      </div>

      <p className="mt-6 text-4xl font-semibold tracking-[-0.04em]">
        {value}
      </p>

      <p className="mt-2 text-sm font-medium">{label}</p>

      <p className="mt-1 text-xs text-[#17251f]/40">{detail}</p>
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
    <div>
      <p className="text-xs text-white/45">{label}</p>

      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function formatBookingDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function capitalize(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}