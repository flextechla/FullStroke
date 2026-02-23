"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type ServiceItem = { description?: string; name?: string };

const iC = "mt-1 block w-full rounded-lg px-3 py-2.5 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2";
const iS: React.CSSProperties = { background: "var(--color-surface-2)", border: "1px solid var(--color-border-subtle)", color: "var(--color-text-primary)" };

export default function ServicesManager({ ticketId, initialServices }: { ticketId: string; initialServices: ServiceItem[] | string | null }) {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  // Normalize to array of strings
  function toList(val: ServiceItem[] | string | null): string[] {
    if (!val) return [];
    if (typeof val === "string") return val.split("\n").map((s) => s.trim()).filter(Boolean);
    if (Array.isArray(val)) return val.map((s) => s.description || s.name || "").filter(Boolean);
    return [];
  }

  const [services, setServices] = useState<string[]>(toList(initialServices));
  const [showAdd, setShowAdd] = useState(false);
  const [newService, setNewService] = useState("");
  const [saving, setSaving] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");

  async function save(updated: string[]) {
    setSaving(true);
    const payload = updated.map((s) => ({ description: s }));
    await supabase.from("tickets").update({ services: payload }).eq("id", ticketId);
    setServices(updated);
    setSaving(false);
    router.refresh();
  }

  async function addService() {
    if (!newService.trim()) return;
    await save([...services, newService.trim()]);
    setNewService("");
    setShowAdd(false);
  }

  async function removeService(idx: number) {
    await save(services.filter((_, i) => i !== idx));
  }

  async function saveEdit() {
    if (editIdx === null || !editVal.trim()) return;
    const updated = [...services];
    updated[editIdx] = editVal.trim();
    await save(updated);
    setEditIdx(null);
    setEditVal("");
  }

  function startEdit(idx: number) {
    setEditIdx(idx);
    setEditVal(services[idx]);
  }

  return (
    <div>
      {services.length > 0 ? (
        <div className="space-y-2">
          {services.map((s, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg p-3" style={{ background: "var(--color-surface-2)" }}>
              <span style={{ color: "var(--color-brand)" }}>●</span>
              {editIdx === i ? (
                <div className="flex flex-1 gap-2">
                  <input type="text" value={editVal} onChange={(e) => setEditVal(e.target.value)} className="flex-1 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2" style={iS} autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") { setEditIdx(null); setEditVal(""); } }} />
                  <button onClick={saveEdit} disabled={saving} className="rounded px-2 py-1 text-xs font-semibold" style={{ color: "#22c55e" }}>{saving ? "..." : "✓"}</button>
                  <button onClick={() => { setEditIdx(null); setEditVal(""); }} className="rounded px-2 py-1 text-xs" style={{ color: "var(--color-text-muted)" }}>✕</button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{s}</span>
                  <button onClick={() => startEdit(i)} className="rounded p-1 text-xs hover:bg-blue-500/10" style={{ color: "#3b82f6" }} title="Edit">✏️</button>
                  <button onClick={() => removeService(i)} disabled={saving} className="rounded p-1 text-xs hover:bg-red-500/10" style={{ color: "#ef4444" }} title="Remove">{saving ? "..." : "✕"}</button>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No services recorded.</p>
      )}

      {showAdd ? (
        <div className="mt-3 flex gap-2">
          <input type="text" value={newService} onChange={(e) => setNewService(e.target.value)} className={`flex-1 ${iC}`} style={iS} placeholder="e.g. Blade sharpening, Oil change..." autoFocus onKeyDown={(e) => { if (e.key === "Enter") addService(); if (e.key === "Escape") { setShowAdd(false); setNewService(""); } }} />
          <button onClick={addService} disabled={saving || !newService.trim()} className="rounded-lg px-4 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-50" style={{ background: "var(--color-brand)" }}>{saving ? "..." : "Add"}</button>
          <button onClick={() => { setShowAdd(false); setNewService(""); }} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: "var(--color-brand)" }}>
          <span className="text-lg leading-none">+</span> Add Service
        </button>
      )}
    </div>
  );
}
