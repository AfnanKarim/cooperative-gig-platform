"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          throw error;
        }

        router.push("/");
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        router.push("/onboarding");
        router.refresh();
        return;
      }

      setSuccessMessage(
        "Account created. Check your email to confirm your account."
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to continue with Google. Please try again.";

      setErrorMessage(message);
      setIsSubmitting(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left panel */}
        <section className="hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div>
            <div className="text-2xl font-semibold tracking-tight text-white">
              Veyra
            </div>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
              Fair work. Trusted services. Powered by cooperation.
            </p>
          </div>

          <div className="max-w-lg">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              Cooperative services
            </p>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
              Local services,
              <br />
              matched fairly.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
              Find trusted workers, get intelligent service matching, and help
              build a fairer local work ecosystem.
            </p>
          </div>

          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Veyra
          </p>
        </section>

        {/* Authentication panel */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-10 lg:hidden">
              <div className="text-2xl font-semibold tracking-tight">
                Veyra
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-3xl font-semibold tracking-tight">
                {isLogin ? "Welcome back" : "Create your account"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isLogin
                  ? "Sign in to continue to Veyra."
                  : "Join Veyra and get started with local services."}
              </p>
            </div>

            {/* Mode switch */}
            <div className="mb-7 grid grid-cols-2 border-b border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`border-b-2 py-3 text-sm font-medium transition ${
                  isLogin
                    ? "border-slate-950 text-slate-950"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`border-b-2 py-3 text-sm font-medium transition ${
                  !isLogin
                    ? "border-slate-950 text-slate-950"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                Create account
              </button>
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-3 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.22Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.54 13.83A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.83V7.64H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.36l3.24-2.53Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.14c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.1 14.63 2.25 12 2.25A9.75 9.75 0 0 0 3.3 7.64l3.24 2.53c.77-2.31 2.92-4.03 5.46-4.03Z"
                />
              </svg>

              Continue with Google
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                or
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Email/password form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-12 w-full border border-slate-300 bg-white px-4 text-base outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={
                    isLogin ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  minLength={6}
                  required
                  className="h-12 w-full border border-slate-300 bg-white px-4 text-base outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                />
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div
                  role="status"
                  className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                >
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Please wait..."
                  : isLogin
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>

            {/* Terms */}
            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              By continuing, you agree to use Veyra responsibly and provide
              accurate account information.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}