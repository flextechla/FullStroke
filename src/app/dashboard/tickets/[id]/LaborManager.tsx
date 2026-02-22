"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type LaborRow = {
  id: string;
  description: string | null;
  hours: number;
  rate: number;
  total_price: number;
};

export default function LaborManager({
  ticketId,
  initialLabor,
}: {
  ticketId: string;
  initialLabor: LaborRow[];
}) {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [rate, setRate] = useState("");

  const lineTotal = (parseFloat(hours) || 0) * (parseFloat(rate) || 0);
  const laborTotal = initialLabor.reduce((sum, l) => sum + Number(l.total_price || 0), 0);

  const inputClass =
    "mt-1 block w-full rounded-lg px-3 py-2.5 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2";
  const inputStyle = {
    background: "var(--color-surface-2)",
    border: "1px solid var(--color-border-subtle)",
    color: "var(--color-text-primary)",
  } as React.CSSProperties;

  function startEdit(labor: LaborRow) {
    setEditingId(labor.id);
    setDescription(labor.description || "");
    setHours(String(labor.hours || ""));
    setRate(String(labor.rate || ""));
    setShowForm(true);
  }

  function startAdd() {
    setEditingId(null);
    setDescription("");
    setHours("");
    setRate("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setDescription("");
    setHours("");
    setRate("");
  }

  async function handleSave() {
    if (!description.trim()) return;
    setSaving(true);

    const row = {
      description: description.trim(),
      hours: parseFloat(hours) || 0,
      rate: parseFloat(rate) || 0,
      total_price: lineTotal,
    };

    if (editingId) {
      await supabase.from("ticket_labor").update(row).eq("id", editingId);
    } else {
      await supabase.from("ticket_labor").insert({ ...row, ticket_id: ticketId });
    }

    setSaving(false);
    cancelForm();
    router.refresh();
  }

  async function handleDelete(laborId: string) {
    setDeleting(laborId);
    await supabase.from("ticket_labor").delete().eq("id", laborId);
    setDeleting(null);
    router.refresh();
  }

  return (
    <div>
      {initialLabor.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                <th className="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Description</th>
                <th className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Hours</th>
                <th className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Rate</th>
                <th className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Total</th>
                <th className="pb-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {initialLabor.map((labor) => (
                <tr key={labor.id} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                  <td className="py-2.5 pr-4" style={{ color: "var(--color-text-primary)" }}>
                    {labor.description || "Labor"}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono" style={{ color: "var(--color-text-secondary)" }}>
                    {Number(labor.hours || 0).toFixed(1)}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono" style={{ color: "var(--color-text-secondary)" }}>
                    ${Number(labor.rate || 0).toFixed(2)}/hr
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    ${Number(labor.total_price || 0).toFixed(2)}
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(labor)}
                        className="rounded p-1 text-xs transition-colors hover:bg-blue-500/10"
                        style={{ color: "#3b82f6" }}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(labor.id)}
                        disabled={deleting === labor.id}
                        className="rounded p-1 text-xs transition-colors hover:bg-red-500/10"
                        style={{ color: "#ef4444" }}
                        title="Remove"
                      >
                        {deleting === labor.id ? "..." : "✕"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid var(--color-border)" }}>
                <td colSpan={3} className="pt-2.5 pr-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                  Labor Subtotal
                </td>
                <td className="pt-2.5 pr-4 text-right font-mono font-bold" style={{ color: "var(--color-brand)" }}>
                  ${laborTotal.toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No labor recorded.</p>
      )}

      {showForm ? (
        <div
          className="mt-3 space-y-3 rounded-lg p-3"
          style={{ background: "var(--color-surface-2)" }}
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              style={inputStyle}
              placeholder="e.g. Engine tune-up"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                Hours
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                Rate ($/hr)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                Total
              </label>
              <div
                className="mt-1 flex h-[42px] items-center rounded-lg px-3 font-mono text-sm font-semibold"
                style={{ background: "var(--color-surface-0)", color: "var(--color-brand)" }}
              >
                ${lineTotal.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !description.trim()}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: "var(--color-brand)" }}
            >
              {saving ? "Saving..." : editingId ? "Update" : "Add"}
            </button>
            <button
              onClick={cancelForm}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface-2)]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startAdd}
          className="mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--color-brand)" }}
        >
          <span className="text-lg leading-none">+</span>
          Add Labor
        </button>
      )}
    </div>
  );
}