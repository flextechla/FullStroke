"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createBrowserSupabaseClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

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
            Reset your password
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            We&apos;ll send you a link to reset it
          </p>
        </div>

        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-2xl" style={{ background: "rgba(34,197,94,0.1)" }}>
                ✓
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                Check your email
              </p>
              <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                We sent a password reset link to <strong style={{ color: "var(--color-text-primary)" }}>{email}</strong>. Click the link in the email to set a new password.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block text-sm font-semibold transition-colors hover:opacity-80"
                style={{ color: "var(--color-brand)" }}
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  Email address
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

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: "var(--color-brand)" }}
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        {!sent && (
          <p className="mt-6 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold transition-colors hover:opacity-80"
              style={{ color: "var(--color-brand)" }}
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
