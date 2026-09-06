"use client";

import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

const examples = [
  "My ceiling fan has stopped working and makes a strange noise.",
  "There is a water leak under my kitchen sink.",
  "I need help assembling a wooden study table.",
];

type AnalysisResult = {
  service: string;
  issue: string;
  urgency: string;
  required_skill: string;
};

type Worker = {
  id: number;
  name: string;
  skill: string;
  rating: number;
  distance_km: number;
  available: boolean;
  workload: number;
  experience_years: number;
  verified: boolean;
  match_score: number;
};

type Booking = {
  id: number;
  worker_id: number;
  worker_name: string;
  service: string;
  issue: string;
  scheduled_at: string;
  status: string;
};

export default function RequestPage() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeRequest = async () => {
    if (!description.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);
    setWorkers([]);
    setSelectedWorker(null);
    setBooking(null);

    try {
      const analyzeResponse = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description.trim(),
        }),
      });

      if (!analyzeResponse.ok) {
        throw new Error("Failed to analyze request");
      }

      const analysisData: AnalysisResult = await analyzeResponse.json();

      setResult(analysisData);

      const matchResponse = await fetch(`${API_URL}/match-workers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(analysisData),
      });

      if (!matchResponse.ok) {
        throw new Error("Failed to find workers");
      }

      const matchData = await matchResponse.json();

      setWorkers(matchData.workers ?? []);
    } catch (err) {
      console.error(err);

      setError(
        "We couldn't connect to the service. Make sure the Veyra backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setBooking(null);
    setError("");

    setTimeout(() => {
      document
        .getElementById("booking-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const confirmBooking = async () => {
    if (!selectedWorker || !result || !scheduledAt) {
      return;
    }

    setBookingLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          worker_id: selectedWorker.id,
          service: result.service,
          issue: result.issue,
          scheduled_at: new Date(scheduledAt).toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || "Failed to create booking");
      }

      const data = await response.json();

      setBooking(data.booking);
      setScheduledAt("");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "We couldn't confirm your booking."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8faf9] text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <a
            href="/"
            className="text-2xl font-bold tracking-tight text-slate-950"
          >
            Veyra<span className="text-emerald-600">.</span>
          </a>

          <a
            href="/"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            ← Back to home
          </a>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-4xl px-6 py-14 md:py-20">
        {/* Intro */}
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            FIND A SERVICE
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            What can we help you with?
          </h1>

          <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg">
            Describe what you need in your own words. Veyra will identify
            the right type of service and help you find a suitable local
            worker.
          </p>
        </div>

        {/* Request card */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_40px_rgba(15,23,42,0.06)]">
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <label
                  htmlFor="description"
                  className="text-sm font-semibold text-slate-900"
                >
                  Describe your problem
                </label>

                <p className="mt-1.5 text-sm text-slate-500">
                  The more context you give us, the better we can match you.
                </p>
              </div>

              <span className="hidden text-xs text-slate-400 sm:block">
                {description.length}/500
              </span>
            </div>

            <textarea
              id="description"
              value={description}
              maxLength={500}
              onChange={(e) => {
                setDescription(e.target.value);
                setResult(null);
                setWorkers([]);
                setSelectedWorker(null);
                setBooking(null);
                setError("");
              }}
              placeholder="Example: My ceiling fan has stopped working and makes a strange noise..."
              className="mt-5 min-h-52 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
            />

            {/* Examples */}
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Try an example
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => {
                      setDescription(example);
                      setResult(null);
                      setWorkers([]);
                      setSelectedWorker(null);
                      setBooking(null);
                      setError("");
                    }}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-left text-xs font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                ✦
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Smart service matching
                </p>

                <p className="text-xs text-slate-500">
                  We&apos;ll identify the service and required skills.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={!description.trim() || loading}
              onClick={analyzeRequest}
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "Finding the right workers..." : "Analyze request →"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Analysis Result */}
        {result && (
          <div className="mt-8 rounded-3xl border border-emerald-100 bg-white p-6 shadow-[0_8px_40px_rgba(15,23,42,0.05)] md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                ✓
              </div>

              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  REQUEST ANALYZED
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  We understand what you need
                </h2>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Service
                </p>

                <p className="mt-2 text-lg font-bold text-slate-950">
                  {result.service}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Issue
                </p>

                <p className="mt-2 text-lg font-bold text-slate-950">
                  {result.issue}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Urgency
                </p>

                <p className="mt-2 text-lg font-bold text-slate-950">
                  {result.urgency}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Required skill
                </p>

                <p className="mt-2 text-lg font-bold text-slate-950">
                  {result.required_skill}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Matched Workers */}
        {workers.length > 0 && (
          <div className="mt-8">
            <div className="mb-5">
              <p className="text-sm font-semibold text-emerald-700">
                FAIR WORKER MATCHING
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                Recommended workers
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Ranked using skill, distance, availability, rating, and
                workload fairness.
              </p>
            </div>

            <div className="space-y-4">
              {workers.map((worker, index) => (
                <div
                  key={worker.id}
                  className={`rounded-3xl border bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition md:p-6 ${
                    selectedWorker?.id === worker.id
                      ? "border-emerald-400 ring-2 ring-emerald-50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-700">
                        {worker.name.charAt(0)}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-950">
                            {worker.name}
                          </h3>

                          {index === 0 && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              Best match
                            </span>
                          )}

                          {worker.verified && (
                            <span className="text-xs font-medium text-slate-500">
                              ✓ Verified
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {worker.skill} · {worker.experience_years} years
                          experience
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-2xl font-bold text-slate-950">
                        {Math.round(worker.match_score * 100)}%
                      </p>

                      <p className="text-xs font-medium text-slate-400">
                        match score
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Rating</p>

                      <p className="mt-1 font-semibold text-slate-800">
                        ★ {worker.rating}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Distance</p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {worker.distance_km} km
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Availability</p>

                      <p
                        className={`mt-1 font-semibold ${
                          worker.available
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        {worker.available ? "Available" : "Busy"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">
                        Current workload
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {worker.workload} jobs
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!worker.available}
                    onClick={() => selectWorker(worker)}
                    className="mt-5 w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {selectedWorker?.id === worker.id
                      ? "Worker selected"
                      : worker.available
                        ? `Select ${worker.name}`
                        : "Currently unavailable"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Panel */}
        {selectedWorker && result && !booking && (
          <div
            id="booking-panel"
            className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_40px_rgba(15,23,42,0.06)] md:p-8"
          >
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                BOOK YOUR WORKER
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                Schedule your service
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You selected{" "}
                <span className="font-semibold text-slate-800">
                  {selectedWorker.name}
                </span>{" "}
                for your {result.service.toLowerCase()} request.
              </p>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedWorker.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedWorker.skill} · ★ {selectedWorker.rating}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  {Math.round(selectedWorker.match_score * 100)}% match
                </span>
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="scheduled-at"
                className="text-sm font-semibold text-slate-900"
              >
                Choose date and time
              </label>

              <p className="mt-1.5 text-sm text-slate-500">
                Select when you would like the worker to visit.
              </p>

              <input
                id="scheduled-at"
                type="datetime-local"
                value={scheduledAt}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setSelectedWorker(null)}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Choose another worker
              </button>

              <button
                type="button"
                disabled={!scheduledAt || bookingLoading}
                onClick={confirmBooking}
                className="flex-1 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {bookingLoading ? "Confirming booking..." : "Confirm booking"}
              </button>
            </div>
          </div>
        )}

        {/* Booking Confirmation */}
        {booking && (
          <div className="mt-8 rounded-3xl border border-emerald-200 bg-white p-6 shadow-[0_8px_40px_rgba(15,23,42,0.06)] md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-700">
                ✓
              </div>

              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  BOOKING CONFIRMED
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  Your service is scheduled
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {booking.worker_name} has been selected for your{" "}
                  {booking.service.toLowerCase()} service.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Worker
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {booking.worker_name}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Service
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {booking.service}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Scheduled for
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {new Date(booking.scheduled_at).toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Status
                </p>

                <p className="mt-1 font-semibold capitalize text-emerald-600">
                  {booking.status}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setBooking(null);
                setSelectedWorker(null);
              }}
              className="mt-6 w-full rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Book another service
            </button>
          </div>
        )}

        {/* Trust note */}
        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Your request is used only to understand the service you need.
        </p>
      </section>
    </main>
  );
}