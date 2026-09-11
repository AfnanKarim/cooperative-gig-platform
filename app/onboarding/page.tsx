"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();

  // Keep one Supabase browser client instance instead of creating
  // a new client on every render.
  const supabase = useMemo(() => createClient(), []);

  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [address, setAddress] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("User loading error:", userError.message);
        }

        if (!user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, city, pin_code, address, onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error(
            "Profile loading error:",
            profileError.message
          );
        }

        if (!isMounted) return;

        if (profile) {
          setFullName(profile.full_name ?? "");
          setCity(profile.city ?? "");
          setPinCode(profile.pin_code ?? "");
          setAddress(profile.address ?? "");

          // If the user has already completed onboarding,
          // don't make them fill it out again.
          if (profile.onboarding_completed) {
            router.replace("/");
            return;
          }
        } else if (user.user_metadata?.full_name) {
          setFullName(user.user_metadata.full_name);
        }

        setIsLoading(false);
      } catch (error) {
        console.error(
          "Account loading error:",
          error instanceof Error ? error.message : String(error)
        );

        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load your account."
          );
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    const name = fullName.trim();
    const cityName = city.trim();
    const pin = pinCode.trim();
    const localAddress = address.trim();

    if (!name || !cityName || !pin || !localAddress) {
      setErrorMessage("Please complete all fields.");
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      setErrorMessage("Please enter a valid 6-digit PIN code.");
      return;
    }

    setIsSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      /*
       * role is included here because your profiles table currently
       * requires the role column.
       *
       * New users are customers by default.
       */
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name: name,
            city: cityName,
            pin_code: pin,
            address: localAddress,
            role: "customer",
            onboarding_completed: true,
          },
          {
            onConflict: "id",
          }
        );

      if (profileError) {
        throw new Error(profileError.message);
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't save your details. Please try again.";

      console.error("Onboarding error:", message);

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />
          <p className="text-sm text-slate-500">
            Loading your account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 sm:px-10 lg:px-12">
        <div className="grid w-full gap-16 lg:grid-cols-[0.85fr_1fr] lg:items-center">

          {/* Left side */}
          <section className="max-w-lg">
            <div className="mb-10 text-2xl font-semibold tracking-tight">
              Veyra
            </div>

            <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              One last step
            </p>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Tell us about you.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-slate-500">
              Add your location details so Veyra can understand your
              area and connect you with relevant local services.
            </p>

            <div className="mt-10 border-l-2 border-slate-950 pl-5">
              <p className="text-sm font-medium text-slate-800">
                Your information stays connected to your Veyra account.
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                You can update these details later from your profile.
              </p>
            </div>
          </section>

          {/* Form */}
          <section className="w-full max-w-xl lg:ml-auto">
            <form
              onSubmit={handleSubmit}
              className="space-y-6 border border-slate-200 p-6 sm:p-8"
            >
              {/* Full name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Full name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Your full name"
                  required
                  className="h-12 w-full border border-slate-300 bg-white px-4 text-base outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                />
              </div>

              {/* City + PIN */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(event) =>
                      setCity(event.target.value)
                    }
                    placeholder="e.g. Delhi"
                    required
                    className="h-12 w-full border border-slate-300 bg-white px-4 text-base outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pinCode"
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    PIN code
                  </label>

                  <input
                    id="pinCode"
                    name="pinCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={pinCode}
                    onChange={(event) =>
                      setPinCode(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    placeholder="6-digit PIN"
                    maxLength={6}
                    required
                    className="h-12 w-full border border-slate-300 bg-white px-4 text-base outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Local area / address
                </label>

                <textarea
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  placeholder="House number, street, locality..."
                  rows={4}
                  required
                  className="w-full resize-none border border-slate-300 bg-white px-4 py-3 text-base outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                />
              </div>

              {/* Error */}
              {errorMessage && (
                <div
                  role="alert"
                  className="border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSaving}
                className="h-12 w-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : "Continue to Veyra"}
              </button>

              <p className="text-center text-xs leading-5 text-slate-400">
                You can update these details later.
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}