"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { Suspense } from "react";
import PasswordInput from "@/components/PasswordInput";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createBrowserSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {error && (
        <div className="rounded-lg p-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
          {error}
        </div>
      )}

      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--color-text-muted)" }}
        >
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-lg px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border-subtle)",
            color: "var(--color-text-primary)",
            "--tw-ring-color": "var(--color-brand)",
          } as React.CSSProperties}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            className="block text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-muted)" }}
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--color-brand)" }}
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
        style={{ background: "var(--color-brand)" }}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "var(--color-surface-1)" }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-black"
            style={{ background: "var(--color-brand)" }}
          >
            FS
          </div>
          <h1
            className="mt-4 text-2xl font-bold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Welcome back
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Sign in to your repair shop
          </p>
        </div>

        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <Suspense fallback={<div className="h-48" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold transition-colors hover:opacity-80"
            style={{ color: "var(--color-brand)" }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
