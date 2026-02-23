"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

const STATUSES = [
  { value: "intake", label: "Intake", color: "#3b82f6" },
  { value: "diagnosing", label: "Diagnosing", color: "#f59e0b" },
  { value: "waiting_parts", label: "Waiting Parts", color: "#f97316" },
  { value: "in_progress", label: "In Progress", color: "#a855f7" },
  { value: "ready", label: "Ready", color: "#22c55e" },
  { value: "picked_up", label: "Picked Up", color: "#71717a" },
  { value: "invoiced", label: "Invoiced", color: "#10b981" },
  { value: "cancelled", label: "Cancelled", color: "#ef4444" },
];

export default function StatusChanger({ ticketId, currentStatus }: { ticketId: string; currentStatus: string }) {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function changeStatus(newStatus: string) {
    if (newStatus === currentStatus) return;
    setSaving(true);
    await supabase.from("tickets").update({ status: newStatus }).eq("id", ticketId);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUSES.map((s) => {
        const active = s.value === currentStatus;
        return (
          <button
            key={s.value}
            onClick={() => changeStatus(s.value)}
            disabled={saving}
            className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50"
            style={active
              ? { background: s.color, color: "#fff", boxShadow: `0 0 0 2px ${s.color}40` }
              : { background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }
            }
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
