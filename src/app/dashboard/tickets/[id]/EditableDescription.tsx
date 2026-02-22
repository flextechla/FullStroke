"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export default function EditableDescription({
  ticketId,
  initialDescription,
}: {
  ticketId: string;
  initialDescription: string | null;
}) {
  const supabase = createBrowserSupabaseClient();
  const [text, setText] = useState(initialDescription || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from("tickets")
      .update({ problem_description: text.trim() || null })
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
        <p
          className="whitespace-pre-wrap text-sm leading-relaxed"
          style={{ color: text ? "var(--color-text-secondary)" : "var(--color-text-muted)" }}
        >
          {text || "No description provided."}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--color-brand)" }}
          >
            ✏️ Edit Description
          </button>
          {saved && (
            <span className="text-xs font-medium" style={{ color: "#22c55e" }}>
              ✓ Saved
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="block w-full rounded-lg px-3 py-2.5 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2"
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border-subtle)",
          color: "var(--color-text-primary)",
        }}
        placeholder="Describe the issue..."
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
            setText(initialDescription || "");
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