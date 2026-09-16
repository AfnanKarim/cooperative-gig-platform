import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();

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
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid application ID or status." },
        { status: 400 }
      );
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY is missing." },
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

    const { data: application, error: applicationError } =
      await adminSupabase
        .from("worker_applications")
        .select("*")
        .eq("id", id)
        .single();

    if (applicationError) {
      console.error("Application lookup error:", applicationError);

      return NextResponse.json(
        { error: applicationError.message },
        { status: 400 }
      );
    }

    if (status === "rejected") {
      const { error } = await adminSupabase
        .from("worker_applications")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        status: "rejected",
      });
    }

    if (!application.profile_id) {
      return NextResponse.json(
        { error: "Application has no profile connection." },
        { status: 400 }
      );
    }

    const { data: service, error: serviceError } =
      await adminSupabase
        .from("services")
        .select("id")
        .eq("name", application.service_category)
        .single();

    if (serviceError || !service) {
      return NextResponse.json(
        {
          error: `No matching service found for "${application.service_category}".`,
        },
        { status: 400 }
      );
    }

    const experienceMatch = String(
      application.experience || ""
    ).match(/\d+/);

    const experienceYears = experienceMatch
      ? Number(experienceMatch[0])
      : 0;

    const { data: existingWorker, error: workerLookupError } =
      await adminSupabase
        .from("workers")
        .select("id")
        .eq("profile_id", application.profile_id)
        .eq("service_id", service.id)
        .maybeSingle();

    if (workerLookupError) {
      return NextResponse.json(
        { error: workerLookupError.message },
        { status: 400 }
      );
    }

    if (!existingWorker) {
      const { error: workerError } = await adminSupabase
        .from("workers")
        .insert({
          profile_id: application.profile_id,
          service_id: service.id,
          experience_years: experienceYears,
          is_verified: true,
        });

      if (workerError) {
        return NextResponse.json(
          { error: workerError.message },
          { status: 400 }
        );
      }
    } else {
      const { error: workerError } = await adminSupabase
        .from("workers")
        .update({
          experience_years: experienceYears,
          is_verified: true,
        })
        .eq("id", existingWorker.id);

      if (workerError) {
        return NextResponse.json(
          { error: workerError.message },
          { status: 400 }
        );
      }
    }

    const { error: updateError } = await adminSupabase
      .from("worker_applications")
      .update({ status: "approved" })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "approved",
    });
  } catch (error) {
    console.error("Admin application API error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}