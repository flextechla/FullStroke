"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const supabase = createBrowserSupabaseClient();

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
            Set new password
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Enter your new password below
          </p>
        </div>

        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
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
                New Password
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-text-muted)" }}
              >
                Confirm New Password
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                placeholder="Re-enter your password"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: "var(--color-brand)" }}
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link
            href="/login"
            className="font-semibold transition-colors hover:opacity-80"
            style={{ color: "var(--color-brand)" }}
          >
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
