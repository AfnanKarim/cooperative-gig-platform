import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();

    // Normal authenticated client.
    // Used only to identify and verify the logged-in admin.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify admin role.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get application ID.
    const { id } = await params;

    // Read request body safely.
    let body: { status?: string };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const status = body.status;

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400 }
      );
    }

    // Server-only admin client.
    // This bypasses RLS and NEVER reaches the browser.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Server configuration is missing." },
        { status: 500 }
      );
    }

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

    // Find the application.
    const {
      data: application,
      error: applicationError,
    } = await adminSupabase
      .from("worker_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (applicationError || !application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // REJECT APPLICATION
    // -----------------------------------------

    if (status === "rejected") {
      const { error: rejectError } = await adminSupabase
        .from("worker_applications")
        .update({ status: "rejected" })
        .eq("id", id);

      if (rejectError) {
        console.error("Reject application error:", rejectError);

        return NextResponse.json(
          { error: rejectError.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        status: "rejected",
      });
    }

    // -----------------------------------------
    // APPROVE APPLICATION
    // -----------------------------------------

    if (!application.profile_id) {
      return NextResponse.json(
        {
          error:
            "This application is missing its profile connection.",
        },
        { status: 400 }
      );
    }

    // Find matching service.
    const {
      data: service,
      error: serviceError,
    } = await adminSupabase
      .from("services")
      .select("id")
      .ilike("name", application.service_category)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        {
          error: `No matching service found for "${application.service_category}".`,
        },
        { status: 400 }
      );
    }

    // Extract number of years from experience text.
    const experienceMatch = String(
      application.experience || ""
    ).match(/\d+/);

    const experienceYears = experienceMatch
      ? Number(experienceMatch[0])
      : 0;

    // Check whether this worker already exists.
    const {
      data: existingWorker,
      error: existingWorkerError,
    } = await adminSupabase
      .from("workers")
      .select("id")
      .eq("profile_id", application.profile_id)
      .eq("service_id", service.id)
      .maybeSingle();

    if (existingWorkerError) {
      console.error(
        "Existing worker lookup error:",
        existingWorkerError
      );

      return NextResponse.json(
        { error: existingWorkerError.message },
        { status: 400 }
      );
    }

    let worker;

    // Create verified worker if one doesn't exist.
    if (!existingWorker) {
      const {
        data: newWorker,
        error: workerError,
      } = await adminSupabase
        .from("workers")
        .insert({
          profile_id: application.profile_id,
          service_id: service.id,
          experience_years: experienceYears,
          is_verified: true,
        })
        .select()
        .single();

      if (workerError) {
        console.error("Create worker error:", workerError);

        return NextResponse.json(
          { error: workerError.message },
          { status: 400 }
        );
      }

      worker = newWorker;
    } else {
      // If worker already exists, simply verify/update it.
      const {
        data: updatedWorker,
        error: workerError,
      } = await adminSupabase
        .from("workers")
        .update({
          experience_years: experienceYears,
          is_verified: true,
        })
        .eq("id", existingWorker.id)
        .select()
        .single();

      if (workerError) {
        console.error("Update worker error:", workerError);

        return NextResponse.json(
          { error: workerError.message },
          { status: 400 }
        );
      }

      worker = updatedWorker;
    }

    // Mark the application as approved.
    const { error: updateError } = await adminSupabase
      .from("worker_applications")
      .update({ status: "approved" })
      .eq("id", id);

    if (updateError) {
      console.error(
        "Approve application update error:",
        updateError
      );

      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "approved",
      worker,
    });
  } catch (error) {
    console.error("Admin application API error:", error);

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      { status: 500 }
    );
  }
}