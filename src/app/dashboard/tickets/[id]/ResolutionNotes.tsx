"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export default function ResolutionNotes({
  ticketId,
  initialNotes,
}: {
  ticketId: string;
  initialNotes: string | null;
}) {
  const supabase = createBrowserSupabaseClient();
  const [notes, setNotes] = useState(initialNotes || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from("tickets")
      .update({ resolution_notes: notes.trim() || null })
      .eq("id", ticketId);

    setSaving(false);

    if (!error) {
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (!editing) {
    return (
      <div>
        {notes ? (
          <p
            className="whitespace-pre-wrap text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {notes}
          </p>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            No resolution notes yet.
          </p>
        )}
        <button
          onClick={() => setEditing(true)}
          className="mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--color-brand)" }}
        >
          ✏️ {notes ? "Edit" : "Add"} Resolution Notes
        </button>
        {saved && (
          <span className="ml-2 text-xs font-medium" style={{ color: "#22c55e" }}>
            ✓ Saved
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        className="block w-full rounded-lg px-3 py-2.5 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2"
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border-subtle)",
          color: "var(--color-text-primary)",
        }}
        placeholder="Describe what was done, the resolution, findings..."
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
          style={{ background: "var(--color-brand)" }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => {
            setNotes(initialNotes || "");
            setEditing(false);
          }}
          className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface-2)]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}