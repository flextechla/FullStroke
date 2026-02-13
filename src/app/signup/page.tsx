"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import Link from "next/link";

const inputClass =
  "mt-1 block w-full rounded-lg px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2";

const inputStyle = {
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border-subtle)",
  color: "var(--color-text-primary)",
  "--tw-ring-color": "var(--color-brand)",
} as React.CSSProperties;

const labelClass = "block text-xs font-semibold uppercase tracking-wider";
const labelStyle = { color: "var(--color-text-muted)" };

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createBrowserSupabaseClient();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      setError(authError?.message || "Signup failed");
      setLoading(false);
      return;
    }

    const userId = authData.user.id;

    // 2. Create workspace
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: workspace, error: wsError } = await supabase
      .from("workspaces")
      .insert({ name: shopName.trim(), invite_code: inviteCode })
      .select("id")
      .single();

    if (wsError || !workspace) {
      setError("Failed to create workspace: " + (wsError?.message || ""));
      setLoading(false);
      return;
    }

    // 3. Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      workspace_id: workspace.id,
      full_name: fullName.trim(),
      role: "owner",
    });

    if (profileError) {
      setError("Failed to create profile: " + profileError.message);
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
            Create your shop
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Get started with FullStroke in seconds
          </p>
        </div>

        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="rounded-lg p-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                {error}
              </div>
            )}

            <div>
              <label className={labelClass} style={labelStyle}>Your Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className={inputClass}
                style={inputStyle}
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Shop Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                className={inputClass}
                style={inputStyle}
                placeholder="Smith's Small Engine Repair"
              />
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                style={inputStyle}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: "var(--color-brand)" }}
            >
              {loading ? "Creating your shop..." : "Create Shop"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold transition-colors hover:opacity-80"
            style={{ color: "var(--color-brand)" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}