"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type PartRow = { id: string; description: string | null; quantity: number; unit_price: number; total_price: number };
type InvPart = { id: string; name: string; description: string | null; price: number | null; stock: number | null };

const iC = "mt-1 block w-full rounded-lg px-3 py-2.5 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2";
const iS: React.CSSProperties = { background: "var(--color-surface-2)", border: "1px solid var(--color-border-subtle)", color: "var(--color-text-primary)" };
const lC = "block text-xs font-semibold uppercase tracking-wider";
const lS: React.CSSProperties = { color: "var(--color-text-muted)" };

export default function PartsManager({ ticketId, initialParts }: { ticketId: string; initialParts: PartRow[] }) {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  // Inventory lookup
  const [suggestions, setSuggestions] = useState<InvPart[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedInvId, setSelectedInvId] = useState<string | null>(null);
  const [notInInventory, setNotInInventory] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const lineTotal = (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);
  const partsTotal = initialParts.reduce((sum, p) => sum + Number(p.total_price || 0), 0);

  function handleDescriptionChange(val: string) {
    setDescription(val);
    setSelectedInvId(null);
    setNotInInventory(false);
    setSearchDone(false);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    searchTimeout.current = setTimeout(async () => {
      const { data } = await supabase.from("parts").select("id, name, description, price, stock").ilike("name", `%${val.trim()}%`).limit(8);
      if (data && data.length > 0) { setSuggestions(data); setShowSuggestions(true); setNotInInventory(false); }
      else { setSuggestions([]); setShowSuggestions(false); setNotInInventory(true); }
      setSearchDone(true);
    }, 300);
  }

  function pickSuggestion(part: InvPart) {
    setDescription(part.name);
    setUnitPrice(part.price != null ? String(part.price) : "");
    if (!quantity) setQuantity("1");
    setSelectedInvId(part.id);
    setNotInInventory(false);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowSuggestions(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function startEdit(part: PartRow) { setEditingId(part.id); setDescription(part.description || ""); setQuantity(String(part.quantity || "")); setUnitPrice(String(part.unit_price || "")); setSelectedInvId(null); setNotInInventory(false); setSearchDone(false); setShowForm(true); }
  function startAdd() { setEditingId(null); setDescription(""); setQuantity(""); setUnitPrice(""); setSelectedInvId(null); setNotInInventory(false); setSearchDone(false); setShowForm(true); }
  function cancelForm() { setShowForm(false); setEditingId(null); setDescription(""); setQuantity(""); setUnitPrice(""); setSelectedInvId(null); setNotInInventory(false); setSearchDone(false); setSuggestions([]); setShowSuggestions(false); }

  async function handleSave() {
    if (!description.trim()) return;
    setSaving(true);
    const qty = parseFloat(quantity) || 1;
    const price = parseFloat(unitPrice) || 0;
    const row = { description: description.trim(), quantity: qty, unit_price: price, total_price: qty * price };

    if (editingId) {
      await supabase.from("ticket_parts").update(row).eq("id", editingId);
    } else {
      await supabase.from("ticket_parts").insert({ ...row, ticket_id: ticketId });
    }

    if (selectedInvId && !editingId) {
      const { data: current } = await supabase.from("parts").select("stock").eq("id", selectedInvId).single();
      if (current) await supabase.from("parts").update({ stock: Math.max(0, (current.stock || 0) - qty) }).eq("id", selectedInvId);
    }

    setSaving(false);
    cancelForm();
    router.refresh();
  }

  async function handleDelete(partId: string) { setDeleting(partId); await supabase.from("ticket_parts").delete().eq("id", partId); setDeleting(null); router.refresh(); }

  return (
    <div>
      {initialParts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
              <th className="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider" style={lS}>Part</th>
              <th className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wider" style={lS}>Qty</th>
              <th className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wider" style={lS}>Unit Price</th>
              <th className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wider" style={lS}>Total</th>
              <th className="pb-2 w-16"></th>
            </tr></thead>
            <tbody>{initialParts.map((part) => (
              <tr key={part.id} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                <td className="py-2.5 pr-4" style={{ color: "var(--color-text-primary)" }}>{part.description || "Unnamed part"}</td>
                <td className="py-2.5 pr-4 text-right font-mono" style={{ color: "var(--color-text-secondary)" }}>{part.quantity}</td>
                <td className="py-2.5 pr-4 text-right font-mono" style={{ color: "var(--color-text-secondary)" }}>${Number(part.unit_price || 0).toFixed(2)}</td>
                <td className="py-2.5 pr-4 text-right font-mono font-semibold" style={{ color: "var(--color-text-primary)" }}>${Number(part.total_price || 0).toFixed(2)}</td>
                <td className="py-2.5 text-right"><div className="flex items-center justify-end gap-1">
                  <button onClick={() => startEdit(part)} className="rounded p-1 text-xs hover:bg-blue-500/10" style={{ color: "#3b82f6" }} title="Edit">✏️</button>
                  <button onClick={() => handleDelete(part.id)} disabled={deleting === part.id} className="rounded p-1 text-xs hover:bg-red-500/10" style={{ color: "#ef4444" }} title="Remove">{deleting === part.id ? "..." : "✕"}</button>
                </div></td>
              </tr>
            ))}</tbody>
            <tfoot><tr style={{ borderTop: "2px solid var(--color-border)" }}>
              <td colSpan={3} className="pt-2.5 pr-4 text-right text-xs font-semibold uppercase tracking-wider" style={lS}>Parts Subtotal</td>
              <td className="pt-2.5 pr-4 text-right font-mono font-bold" style={{ color: "var(--color-brand)" }}>${partsTotal.toFixed(2)}</td>
              <td></td>
            </tr></tfoot>
          </table>
        </div>
      ) : (
        <p className="text-sm" style={lS}>No parts recorded.</p>
      )}

      {showForm ? (
        <div className="mt-3 space-y-3 rounded-lg p-3" style={{ background: "var(--color-surface-2)" }}>
          <div ref={wrapperRef} className="relative">
            <label className={lC} style={lS}>Part Name (type to search inventory)</label>
            <input type="text" value={description} onChange={(e) => handleDescriptionChange(e.target.value)} className={iC} style={iS} placeholder="Start typing to search parts..." autoFocus />
            {selectedInvId && <span className="mt-1 inline-block text-xs font-medium" style={{ color: "#22c55e" }}>✓ From inventory — price auto-filled</span>}

            {/* Not in inventory warning */}
            {notInInventory && searchDone && description.trim().length >= 2 && !selectedInvId && (
              <div className="mt-2 rounded-lg p-3" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <p className="text-sm font-medium" style={{ color: "#f59e0b" }}>⚠️ &quot;{description.trim()}&quot; not found in inventory</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => router.push("/dashboard/parts/new")}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-black hover:brightness-110"
                    style={{ background: "#f59e0b" }}
                  >
                    Add to Inventory
                  </button>
                  <button
                    onClick={() => { setNotInInventory(false); setSearchDone(false); }}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium"
                    style={{ color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}
                  >
                    Enter Manually
                  </button>
                </div>
              </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg shadow-lg overflow-hidden" style={{ background: "var(--color-surface-0)", border: "1px solid var(--color-border-subtle)" }}>
                {suggestions.map((s) => (
                  <button key={s.id} onClick={() => pickSuggestion(s)} className="flex w-full items-center justify-between px-3 py-2.5 text-sm text-left transition-colors hover:bg-[var(--color-surface-2)]" style={{ color: "var(--color-text-primary)" }}>
                    <div>
                      <span className="font-medium">{s.name}</span>
                      {s.description && <span className="ml-2 text-xs" style={{ color: "var(--color-text-muted)" }}>{s.description}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {s.stock != null && <span>{s.stock} in stock</span>}
                      {s.price != null && <span className="font-mono font-semibold" style={{ color: "var(--color-brand)" }}>${s.price.toFixed(2)}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={lC} style={lS}>Quantity</label><input type="number" step="1" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={iC} style={iS} placeholder="1" /></div>
            <div><label className={lC} style={lS}>Unit Price ($)</label><input type="number" step="0.01" min="0" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} className={iC} style={iS} placeholder="0.00" /></div>
            <div><label className={lC} style={lS}>Total</label><div className="mt-1 flex h-[42px] items-center rounded-lg px-3 font-mono text-sm font-semibold" style={{ background: "var(--color-surface-0)", color: "var(--color-brand)" }}>${lineTotal.toFixed(2)}</div></div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !description.trim()} className="rounded-lg px-4 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-50" style={{ background: "var(--color-brand)" }}>{saving ? "Saving..." : editingId ? "Update" : "Add"}</button>
            <button onClick={cancelForm} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-[var(--color-surface-2)]" style={{ color: "var(--color-text-secondary)" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={startAdd} className="mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: "var(--color-brand)" }}>
          <span className="text-lg leading-none">+</span> Add Part
        </button>
      )}
    </div>
  );
}
