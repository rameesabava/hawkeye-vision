"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(user.role === "admin" ? "/admin" : redirect);
    }
  }, [user, authLoading, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.warning("Please enter both email and password.");
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const user = await login(email.trim(), password);

      toast.success(`Logged in successfully! Welcome back, ${user.username}.`);
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push(redirect);
      }
    } catch (err: unknown) {
      const error = err as Error;
      const msg = error.message || "Invalid email or password. Please try again.";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_20px_50px_rgba(8,31,77,0.12)]">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left Pane: Rich Hawkeye Deep Blue */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#081F4D] via-[#0A2660] to-[#1E40AF] p-8 text-white sm:p-10 lg:p-12">
          {/* Decorative ambient background glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-blue-600/30 blur-3xl"
          />

          <div className="relative z-10">
            {/* Logo container */}
          <div className="inline-flex items-center rounded-2xl bg-white px-5 py-3 shadow-lg shadow-black/20">
  <span className="relative block h-14 w-52 sm:h-16 sm:w-60">
    <Image
      src="/logo.png"
      alt="Hawkeye Vision"
      fill
      priority
      sizes="(min-width: 640px) 240px, 208px"
      className="object-contain"
    />
  </span>
</div>

            <h2 className="mt-8 text-2xl font-bold tracking-tight sm:text-3xl">
              Surveillance & IT Solutions
            </h2>
            <p className="mt-2 text-sm text-blue-100/80 leading-relaxed">
              Wholesale distributor for leading security brands across Kerala and India.
            </p>

            {/* Feature list */}
            <div className="mt-8 space-y-3.5 text-xs text-blue-100/90">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-sky-300">
                  ✓
                </div>
                <span>Genuine Hikvision, CP Plus, Dahua & TP-Link systems</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-sky-300">
                  ✓
                </div>
                <span>Direct wholesale pricing and fast dispatch from Kochi</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-sky-300">
                  ✓
                </div>
                <span>Live order status tracking & dedicated support</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-10 border-t border-white/15 pt-4 text-[11px] text-blue-200/70">
            © {new Date().getFullYear()} Hawkeye Vision. All rights reserved.
          </div>
        </div>

        {/* Right Pane: Clean White Form */}
        <div className="flex flex-col justify-center bg-white p-8 sm:p-10 lg:p-12">
          <div>
            <div className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#081F4D]">
              Account Login
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              Enter your credentials to access your customer or admin account.
            </p>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-neutral-200 bg-slate-50/50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 transition focus:border-[#081F4D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
                >
                  Password
                </label>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-slate-50/50 py-3 pl-4 pr-11 text-sm text-neutral-900 placeholder-neutral-400 transition focus:border-[#081F4D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 transition hover:text-[#081F4D]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-[#081F4D] py-3.5 text-center text-sm font-semibold text-white shadow-md shadow-blue-950/20 transition hover:bg-[#0c2e73] hover:shadow-lg disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In to Account"}
            </button>
          </form>

          <div className="mt-8 border-t border-neutral-100 pt-6 text-center text-xs text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link
              href={`/register?redirect=${encodeURIComponent(redirect)}`}
              className="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50/60 to-slate-200 px-4 pt-28 pb-20 sm:px-6">
      <Suspense fallback={<div className="text-sm text-neutral-500">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
