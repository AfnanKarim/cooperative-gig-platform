"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  pinCode: string;
  serviceCategory: string;
  experience: string;
  certifications: string;
  availability: string;
  about: string;
};

const initialFormValues: FormValues = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  pinCode: "",
  serviceCategory: "",
  experience: "",
  certifications: "",
  availability: "",
  about: "",
};

export default function BecomeWorkerPage() {
  const [formValues, setFormValues] =
    useState<FormValues>(initialFormValues);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");

    const fullName = formValues.fullName.trim();
    const email = formValues.email.trim();
    const phone = formValues.phone.trim();
    const city = formValues.city.trim();
    const pinCode = formValues.pinCode.trim();
    const serviceCategory =
      formValues.serviceCategory.trim();
    const experience = formValues.experience.trim();
    const certifications =
      formValues.certifications.trim();
    const availability =
      formValues.availability.trim();
    const about = formValues.about.trim();

    if (!fullName) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!phone) {
      setError("Please enter your phone number.");
      return;
    }

    if (!city) {
      setError("Please enter your city.");
      return;
    }

    if (!/^\d{6}$/.test(pinCode)) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    if (!serviceCategory) {
      setError("Please enter your service or skill.");
      return;
    }

    if (!experience) {
      setError("Please enter your years of experience.");
      return;
    }

    if (!availability) {
      setError("Please enter your availability.");
      return;
    }

    if (!about) {
      setError("Please tell us about your experience.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Get the currently logged-in user.
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(
          "Please log in before submitting a worker application."
        );
        return;
      }

      const { error: insertError } = await supabase
        .from("worker_applications")
        .insert({
          profile_id: user.id,
          full_name: fullName,
          email,
          phone,
          city,
          pin_code: pinCode,
          service_category: serviceCategory,
          skills: serviceCategory,
          experience,
          certifications: certifications || null,
          availability,
          about,
          status: "pending",
        });

      if (insertError) {
        console.error(
          "Worker application submission failed:",
          {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code,
          }
        );

        setError(
          insertError.message ||
            "We could not submit your application. Please try again."
        );

        return;
      }

      setFormValues(initialFormValues);
      setSubmitted(true);
    } catch (unexpectedError) {
      console.error(
        "Unexpected worker application error:",
        unexpectedError
      );

      setError(
        "Something went wrong while submitting your application. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
              Your details have been saved successfully. Your
              application is now pending cooperative review.
            </p>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
              Once your identity and professional details are
              confirmed by the cooperative, you will receive a
              confirmation email.
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
            Share your professional details and become part of
            Veyra&apos;s local cooperative worker network.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Full Name
              </label>

              <input
                id="fullName"
                required
                type="text"
                name="fullName"
                value={formValues.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Email
              </label>

              <input
                id="email"
                required
                type="email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Phone Number
              </label>

              <input
                id="phone"
                required
                type="tel"
                name="phone"
                value={formValues.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                autoComplete="tel"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                City
              </label>

              <input
                id="city"
                required
                type="text"
                name="city"
                value={formValues.city}
                onChange={handleChange}
                placeholder="e.g. Kolkata"
                autoComplete="address-level2"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label
                htmlFor="pinCode"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                PIN Code
              </label>

              <input
                id="pinCode"
                required
                type="text"
                name="pinCode"
                value={formValues.pinCode}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                placeholder="6-digit PIN"
                autoComplete="postal-code"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label
                htmlFor="serviceCategory"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Service / Skill
              </label>

              <input
                id="serviceCategory"
                required
                type="text"
                name="serviceCategory"
                value={formValues.serviceCategory}
                onChange={handleChange}
                placeholder="e.g. Electrical Repair"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="experience"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Years of Experience
              </label>

              <input
                id="experience"
                required
                type="text"
                name="experience"
                value={formValues.experience}
                onChange={handleChange}
                placeholder="e.g. 5 years"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="certifications"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Certifications / Training
            </label>

            <textarea
              id="certifications"
              name="certifications"
              value={formValues.certifications}
              onChange={handleChange}
              rows={3}
              placeholder="Mention relevant certifications, training, or qualifications"
              className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="availability"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Availability
            </label>

            <input
              id="availability"
              required
              type="text"
              name="availability"
              value={formValues.availability}
              onChange={handleChange}
              placeholder="e.g. Monday–Saturday, 9 AM–6 PM"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="about"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Tell us about your experience
            </label>

            <textarea
              id="about"
              required
              name="about"
              value={formValues.about}
              onChange={handleChange}
              rows={5}
              placeholder="Briefly describe your work experience and the services you provide"
              className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-600"
            >
              {error}
            </div>
          )}

          <div className="mt-8 flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
            <div className="mt-0.5 text-emerald-600">
              ✓
            </div>

            <p className="text-sm leading-6 text-gray-600">
              Your application will remain pending until the
              cooperative reviews and confirms your details.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-full bg-[#07101f] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#142033] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Submitting Application..."
              : "Submit Worker Application"}
          </button>
        </form>
      </div>
    </main>
  );
}