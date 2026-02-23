"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type LaborRow = { id: string; description: string | null; hours: number; rate: number; total_price: number };

const iC = "mt-1 block w-full rounded-lg px-3 py-2.5 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2";
const iS: React.CSSProperties = { background: "var(--color-surface-2)", border: "1px solid var(--color-border-subtle)", color: "var(--color-text-primary)" };
const lC = "block text-xs font-semibold uppercase tracking-wider";
const lS: React.CSSProperties = { color: "var(--color-text-muted)" };

export default function LaborManager({ ticketId, initialLabor }: { ticketId: string; initialLabor: LaborRow[] }) {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [rate, setRate] = useState("");
  const [flatRate, setFlatRate] = useState("");
  const [isFlat, setIsFlat] = useState(false);

  const lineTotal = isFlat ? (parseFloat(flatRate) || 0) : (parseFloat(hours) || 0) * (parseFloat(rate) || 0);
  const laborTotal = initialLabor.reduce((sum, l) => sum + Number(l.total_price || 0), 0);

  function startEdit(labor: LaborRow) {
    setEditingId(labor.id);
    setDescription(labor.description || "");
    const wasFlat = (labor.hours === 0 || labor.hours === 1) && labor.rate === labor.total_price;
    setIsFlat(wasFlat);
    if (wasFlat) { setFlatRate(String(labor.total_price || "")); setHours(""); setRate(""); }
    else { setHours(String(labor.hours || "")); setRate(String(labor.rate || "")); setFlatRate(""); }
    setShowForm(true);
  }

  function startAdd() { setEditingId(null); setDescription(""); setHours(""); setRate(""); setFlatRate(""); setIsFlat(false); setShowForm(true); }
  function cancelForm() { setShowForm(false); setEditingId(null); setDescription(""); setHours(""); setRate(""); setFlatRate(""); setIsFlat(false); }
  function toggleMode(flat: boolean) { setIsFlat(flat); if (flat) { setHours(""); setRate(""); } else { setFlatRate(""); } }

  async function handleSave() {
    if (!description.trim()) return;
    setSaving(true);
    const total = isFlat ? (parseFloat(flatRate) || 0) : (parseFloat(hours) || 0) * (parseFloat(rate) || 0);
    const row = { description: description.trim(), hours: isFlat ? 1 : (parseFloat(hours) || 0), rate: isFlat ? total : (parseFloat(rate) || 0), total_price: total };
    if (editingId) { await supabase.from("ticket_labor").update(row).eq("id", editingId); }
    else { await supabase.from("ticket_labor").insert({ ...row, ticket_id: ticketId }); }
    setSaving(false); cancelForm(); router.refresh();
  }

  async function handleDelete(laborId: string) { setDeleting(laborId); await supabase.from("ticket_labor").delete().eq("id", laborId); setDeleting(null); router.refresh(); }

  return (
    <div>
      {initialLabor.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
              <th className="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider" style={lS}>Description</th>
              <th className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wider" style={lS}>Hours</th>
              <th className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wider" style={lS}>Rate</th>
              <th className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wider" style={lS}>Total</th>
              <th className="pb-2 w-16"></th>
            </tr></thead>
            <tbody>{initialLabor.map((labor) => {
              const wasFlat = (labor.hours === 0 || labor.hours === 1) && labor.rate === labor.total_price;
              return (
                <tr key={labor.id} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                  <td className="py-2.5 pr-4" style={{ color: "var(--color-text-primary)" }}>{labor.description || "Labor"}{wasFlat && <span className="ml-2 text-[10px] font-semibold rounded px-1.5 py-0.5" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>FLAT</span>}</td>
                  <td className="py-2.5 pr-4 text-right font-mono" style={{ color: "var(--color-text-secondary)" }}>{wasFlat ? "—" : Number(labor.hours || 0).toFixed(1)}</td>
                  <td className="py-2.5 pr-4 text-right font-mono" style={{ color: "var(--color-text-secondary)" }}>{wasFlat ? "—" : `$${Number(labor.rate || 0).toFixed(2)}/hr`}</td>
                  <td className="py-2.5 pr-4 text-right font-mono font-semibold" style={{ color: "var(--color-text-primary)" }}>${Number(labor.total_price || 0).toFixed(2)}</td>
                  <td className="py-2.5 text-right"><div className="flex items-center justify-end gap-1">
                    <button onClick={() => startEdit(labor)} className="rounded p-1 text-xs hover:bg-blue-500/10" style={{ color: "#3b82f6" }} title="Edit">✏️</button>
                    <button onClick={() => handleDelete(labor.id)} disabled={deleting === labor.id} className="rounded p-1 text-xs hover:bg-red-500/10" style={{ color: "#ef4444" }} title="Remove">{deleting === labor.id ? "..." : "✕"}</button>
                  </div></td>
                </tr>
              );
            })}</tbody>
            <tfoot><tr style={{ borderTop: "2px solid var(--color-border)" }}>
              <td colSpan={3} className="pt-2.5 pr-4 text-right text-xs font-semibold uppercase tracking-wider" style={lS}>Labor Subtotal</td>
              <td className="pt-2.5 pr-4 text-right font-mono font-bold" style={{ color: "var(--color-brand)" }}>${laborTotal.toFixed(2)}</td>
              <td></td>
            </tr></tfoot>
          </table>
        </div>
      ) : (
        <p className="text-sm" style={lS}>No labor recorded.</p>
      )}

      {showForm ? (
        <div className="mt-3 space-y-3 rounded-lg p-3" style={{ background: "var(--color-surface-2)" }}>
          <div>
            <label className={lC} style={lS}>Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={iC} style={iS} placeholder="e.g. Engine tune-up" autoFocus />
          </div>
          <div className="flex gap-1 rounded-lg p-1" style={{ background: "var(--color-surface-0)", border: "1px solid var(--color-border-subtle)" }}>
            <button onClick={() => toggleMode(false)} className="flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors" style={!isFlat ? { background: "var(--color-brand)", color: "#000" } : { color: "var(--color-text-muted)" }}>Hourly Rate</button>
            <button onClick={() => toggleMode(true)} className="flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors" style={isFlat ? { background: "#8b5cf6", color: "#fff" } : { color: "var(--color-text-muted)" }}>Flat Rate</button>
          </div>
          {isFlat ? (
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lC} style={lS}>Flat Rate ($)</label><input type="number" step="0.01" min="0" value={flatRate} onChange={(e) => setFlatRate(e.target.value)} className={iC} style={iS} placeholder="0.00" /></div>
              <div><label className={lC} style={lS}>Total</label><div className="mt-1 flex h-[42px] items-center rounded-lg px-3 font-mono text-sm font-semibold" style={{ background: "var(--color-surface-0)", color: "var(--color-brand)" }}>${lineTotal.toFixed(2)}</div></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div><label className={lC} style={lS}>Hours</label><input type="number" step="0.25" min="0" value={hours} onChange={(e) => setHours(e.target.value)} className={iC} style={iS} placeholder="0" /></div>
              <div><label className={lC} style={lS}>Rate ($/hr)</label><input type="number" step="0.01" min="0" value={rate} onChange={(e) => setRate(e.target.value)} className={iC} style={iS} placeholder="0.00" /></div>
              <div><label className={lC} style={lS}>Total</label><div className="mt-1 flex h-[42px] items-center rounded-lg px-3 font-mono text-sm font-semibold" style={{ background: "var(--color-surface-0)", color: "var(--color-brand)" }}>${lineTotal.toFixed(2)}</div></div>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !description.trim()} className="rounded-lg px-4 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-50" style={{ background: "var(--color-brand)" }}>{saving ? "Saving..." : editingId ? "Update" : "Add"}</button>
            <button onClick={cancelForm} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-[var(--color-surface-2)]" style={{ color: "var(--color-text-secondary)" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={startAdd} className="mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: "var(--color-brand)" }}>
          <span className="text-lg leading-none">+</span> Add Labor
        </button>
      )}
    </div>
  );
}
