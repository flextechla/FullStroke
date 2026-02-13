"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export default function DeleteCustomerButton({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId);

    if (error) {
      alert("Failed to delete: " + error.message);
      setLoading(false);
      setConfirming(false);
      return;
    }

    router.push("/dashboard/customers");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: "#ef4444" }}>
          Delete {customerName}?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-lg px-3 py-2 text-xs font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
          style={{ background: "#ef4444" }}
        >
          {loading ? "..." : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--color-surface-2)]"
          style={{ border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface-2)]"
      style={{
        border: "1px solid var(--color-border)",
        color: "#ef4444",
      }}
    >
      Delete
    </button>
  );
}