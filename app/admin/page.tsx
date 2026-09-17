import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminApplications from "./AdminApplications";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();

  // Authenticated Supabase client.
  // This client is used only to identify the currently
  // logged-in user and verify their role.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        // This page is a Server Component.
        // Server Components cannot modify cookies while rendering.
        // Authentication cookie updates should happen through
        // the authentication flow / proxy / route handler.
        setAll() {},
      },
    }
  );

  // Get the currently authenticated user.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // No valid session -> send the user to login.
  if (userError || !user) {
    redirect("/login");
  }

  // Read the user's profile and role.
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  // Only an authenticated admin can access this page.
  if (profileError || !profile || profile.role !== "admin") {
    redirect("/");
  }

  // The service-role key is server-only.
  // It must never use a NEXT_PUBLIC_ variable.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing from the server environment."
    );
  }

  // Server-only Supabase client.
  // This client is used to read worker applications
  // without exposing the service-role key to the browser.
  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Load all worker applications.
  const {
    data: applications,
    error: applicationsError,
  } = await adminSupabase
    .from("worker_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (applicationsError) {
    console.error(
      "Admin applications error:",
      JSON.stringify(
        {
          message: applicationsError.message,
          details: applicationsError.details,
          hint: applicationsError.hint,
          code: applicationsError.code,
        },
        null,
        2
      )
    );

    throw new Error("Unable to load worker applications.");
  }

  const applicationList = applications ?? [];

  const pendingCount = applicationList.filter(
    (application) => application.status === "pending"
  ).length;

  const approvedCount = applicationList.filter(
    (application) => application.status === "approved"
  ).length;

  const rejectedCount = applicationList.filter(
    (application) => application.status === "rejected"
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f8f6] text-[#07101f]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-2xl font-semibold tracking-tight">
              Veyra
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Cooperative Admin Panel
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium">
              {profile.full_name || "Admin"}
            </p>

            <p className="text-xs uppercase tracking-wider text-emerald-600">
              Administrator
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Page heading */}
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Overview
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Worker management
          </h1>

          <p className="mt-3 text-gray-600">
            Review worker applications and manage cooperative verification.
          </p>
        </section>

        {/* Application statistics */}
        <section className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Pending</p>

            <p className="mt-2 text-4xl font-semibold">
              {pendingCount}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Applications awaiting review
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Approved</p>

            <p className="mt-2 text-4xl font-semibold">
              {approvedCount}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Verified worker applications
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Rejected</p>

            <p className="mt-2 text-4xl font-semibold">
              {rejectedCount}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Applications not accepted
            </p>
          </div>
        </section>

        {/* Worker applications */}
        <section className="mt-10">
          <AdminApplications applications={applicationList} />
        </section>
      </div>
    </main>
  );
}