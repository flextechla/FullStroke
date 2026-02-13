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

export default function NewCustomerPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not authenticated"); setLoading(false); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("workspace_id")
      .eq("id", user.id)
      .single();

    if (!profile?.workspace_id) { setError("No workspace found"); setLoading(false); return; }

    const { error: insertErr } = await supabase.from("customers").insert({
      workspace_id: profile.workspace_id,
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      address: address.trim() || null,
    });

    if (insertErr) {
      setError("Failed to create customer: " + insertErr.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/customers");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: "var(--color-brand)" }}
      >
        ← Back to Customers
      </Link>

      <h1 className="mt-3 text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
        Add Customer
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && (
          <div className="rounded-lg p-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            {error}
          </div>
        )}

        <div
          className="space-y-4 rounded-xl p-5"
          style={{ background: "var(--color-surface-0)", border: "1px solid var(--color-border-subtle)" }}
        >
          <div>
            <label className={labelClass} style={labelStyle}>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} style={inputStyle} placeholder="Customer name" />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} style={inputStyle} />
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: "var(--color-brand)" }}
          >
            {loading ? "Saving..." : "Add Customer"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-[var(--color-surface-2)]"
            style={{ border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}