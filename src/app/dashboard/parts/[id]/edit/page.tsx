"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditPartPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createBrowserSupabaseClient();

  const [name, setName] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("parts")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("Part not found");
        setFetching(false);
        return;
      }

      setName(data.name || "");
      setPartNumber(data.part_number || "");
      setPrice(data.price != null ? String(data.price) : "");
      setQuantity(data.quantity != null ? String(data.quantity) : "");
      setReorderPoint(data.reorder_point != null ? String(data.reorder_point) : "");
      setFetching(false);
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: updateErr } = await supabase
      .from("parts")
      .update({
        name: name.trim(),
        part_number: partNumber.trim() || null,
        price: price ? parseFloat(price) : null,
        quantity: quantity ? parseInt(quantity) : 0,
        reorder_point: reorderPoint ? parseInt(reorderPoint) : null,
      })
      .eq("id", id);

    if (updateErr) {
      setError("Failed to update: " + updateErr.message);
      setLoading(false);
      return;
    }

    router.push(`/dashboard/parts/${id}`);
    router.refresh();
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href={`/dashboard/parts/${id}`}
        className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: "var(--color-brand)" }}
      >
        ← Back to Part
      </Link>

      <h1 className="mt-3 text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
        Edit Part
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
            <label className={labelClass} style={labelStyle}>Part Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Part Number</label>
            <input type="text" value={partNumber} onChange={(e) => setPartNumber(e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass} style={labelStyle}>Price ($)</label>
              <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Quantity</label>
              <input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Reorder At</label>
              <input type="number" min="0" value={reorderPoint} onChange={(e) => setReorderPoint(e.target.value)} className={inputClass} style={inputStyle} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: "var(--color-brand)" }}
          >
            {loading ? "Saving..." : "Save Changes"}
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