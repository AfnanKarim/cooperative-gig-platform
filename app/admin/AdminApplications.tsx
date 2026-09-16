"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Application = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string;
  pin_code: string;
  service_category: string;
  skills: string | null;
  experience: string | null;
  certifications: string | null;
  availability: string | null;
  about: string | null;
  status: string;
  created_at: string;
  profile_id: string | null;
};

export default function AdminApplications({
  applications,
}: {
  applications: Application[];
}) {
  const router = useRouter();

  const [selected, setSelected] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pendingCount = applications.filter(
    (a) => a.status === "pending"
  ).length;

  const approvedCount = applications.filter(
    (a) => a.status === "approved"
  ).length;

  const rejectedCount = applications.filter(
    (a) => a.status === "rejected"
  ).length;

  async function updateStatus(status: "approved" | "rejected") {
    if (!selected) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selected.id,
          status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to update application."
        );
      }

      setSelected(null);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Overview
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Worker management
            </h1>

            <p className="mt-3 text-gray-600">
              Review worker applications and manage cooperative
              verification.
            </p>
          </div>

          <a
            href="/dashboard"
            className="w-fit rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Dashboard
          </a>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <StatCard label="Pending" value={pendingCount} />
          <StatCard label="Approved" value={approvedCount} />
          <StatCard label="Rejected" value={rejectedCount} />
        </div>

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold">
              Worker Applications
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review applications submitted through the worker
              registration form.
            </p>
          </div>

          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                No worker applications yet.
              </div>
            ) : (
              applications.map((application) => (
                <div
                  key={application.id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {application.full_name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {application.service_category} ·{" "}
                        {application.city} ·{" "}
                        {application.experience ||
                          "Experience not provided"}
                      </p>

                      <p className="mt-2 text-sm text-gray-400">
                        {application.email ||
                          application.phone ||
                          "No contact"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                          application.status === "approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : application.status === "rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {application.status}
                      </span>

                      <button
                        onClick={() => {
                          setSelected(application);
                          setError("");
                        }}
                        className="rounded-xl bg-[#07101f] px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  Worker Application
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                  {selected.full_name}
                </h2>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-full px-3 py-1 text-2xl text-gray-400 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
              <Info label="Name" value={selected.full_name} />
              <Info
                label="Service"
                value={selected.service_category}
              />
              <Info label="Email" value={selected.email} />
              <Info label="Phone" value={selected.phone} />
              <Info label="City" value={selected.city} />
              <Info label="PIN Code" value={selected.pin_code} />
              <Info
                label="Experience"
                value={selected.experience}
              />
              <Info
                label="Availability"
                value={selected.availability}
              />
              <Info label="Skills" value={selected.skills} />
              <Info
                label="Certifications"
                value={selected.certifications}
              />

              <div className="sm:col-span-2">
                <Info label="About" value={selected.about} />
              </div>

              <Info label="Status" value={selected.status} />
            </div>

            {error && (
              <div className="mx-6 mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                onClick={() => setSelected(null)}
                disabled={loading}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Close
              </button>

              {selected.status === "pending" && (
                <>
                  <button
                    onClick={() => updateStatus("rejected")}
                    disabled={loading}
                    className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Reject"}
                  </button>

                  <button
                    onClick={() => updateStatus("approved")}
                    disabled={loading}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Approve"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-4xl font-semibold">{value}</p>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm text-gray-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}