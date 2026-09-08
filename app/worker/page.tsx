"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function BecomeWorkerPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f7f8f6] px-6 py-16">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
              ✓
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Veyra Worker Network
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#07101f] sm:text-4xl">
              Application submitted
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-gray-600">
              Your details have been saved successfully. Your application is
              now pending cooperative review.
            </p>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
              Once your identity and professional details are confirmed by the
              cooperative, you will receive a confirmation email.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex rounded-full bg-[#07101f] px-7 py-3.5 font-semibold text-white transition hover:bg-[#142033]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f6] px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          ← Back to Veyra
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Join Veyra
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#07101f] sm:text-5xl">
            Become a worker
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Share your professional details and become part of Veyra's local
            cooperative worker network.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Full Name
              </label>
              <input
                required
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Email
              </label>
              <input
                required
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Phone Number
              </label>
              <input
                required
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Location
              </label>
              <input
                required
                type="text"
                name="location"
                placeholder="City / Local area"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Service / Skill
              </label>
              <input
                required
                type="text"
                name="skill"
                placeholder="e.g. Electrical Repair"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Years of Experience
              </label>
              <input
                required
                type="text"
                name="experience"
                placeholder="e.g. 5 years"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Certifications / Training
            </label>
            <textarea
              name="certifications"
              rows={3}
              placeholder="Mention relevant certifications, training, or qualifications"
              className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Availability
            </label>
            <input
              required
              type="text"
              name="availability"
              placeholder="e.g. Monday–Saturday, 9 AM–6 PM"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Tell us about your experience
            </label>
            <textarea
              required
              name="about"
              rows={5}
              placeholder="Briefly describe your work experience and the services you provide"
              className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
            />
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
            <div className="mt-0.5 text-emerald-600">✓</div>
            <p className="text-sm leading-6 text-gray-600">
              Your application will remain pending until the cooperative
              reviews and confirms your details.
            </p>
          </div>

          <button
            type="submit"
            className="mt-8 w-full rounded-full bg-[#07101f] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#142033]"
          >
            Submit Worker Application
          </button>
        </form>
      </div>
    </main>
  );
}