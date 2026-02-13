import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function PartsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: parts, error } = await supabase
    .from("parts")
    .select("*")
    .order("name");

  if (error) {
    return (
      <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
        Failed to load parts: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            Parts
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {parts?.length ?? 0} parts in inventory
          </p>
        </div>
        <Link
          href="/dashboard/parts/new"
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:brightness-110"
          style={{ background: "var(--color-brand)" }}
        >
          <span className="text-lg leading-none">+</span>
          Add Part
        </Link>
      </div>

      {/* Mobile card list */}
      <div className="mt-6 space-y-3 lg:hidden">
        {parts && parts.length > 0 ? (
          parts.map((part) => {
            const lowStock = Number(part.quantity || 0) <= Number(part.reorder_point || 0);
            return (
              <Link
                key={part.id}
                href={`/dashboard/parts/${part.id}`}
                className="block rounded-xl p-4 transition-colors hover:bg-[var(--color-surface-2)]"
                style={{
                  background: "var(--color-surface-0)",
                  border: "1px solid var(--color-border-subtle)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      {part.name}
                    </p>
                    {part.part_number && (
                      <p className="mt-0.5 font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
                        #{part.part_number}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-sm font-semibold" style={{ color: "var(--color-brand)" }}>
                    ${Number(part.price || 0).toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs">
                  <span style={{ color: "var(--color-text-muted)" }}>
                    Qty:{" "}
                    <span
                      className="font-semibold"
                      style={{ color: lowStock ? "#ef4444" : "var(--color-text-primary)" }}
                    >
                      {part.quantity ?? 0}
                    </span>
                  </span>
                  {part.reorder_point != null && (
                    <span style={{ color: "var(--color-text-muted)" }}>
                      Reorder at: {part.reorder_point}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: "var(--color-surface-0)", border: "2px dashed var(--color-border)" }}
          >
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No parts yet.</p>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="mt-6 hidden lg:block">
        <div
          className="overflow-hidden rounded-xl"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                {["Part Name", "Part #", "Qty", "Reorder At", "Price"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider ${i >= 2 ? "text-right" : ""}`}
                    style={{ color: "var(--color-text-muted)", background: "var(--color-surface-2)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parts && parts.length > 0 ? (
                parts.map((part) => {
                  const lowStock = Number(part.quantity || 0) <= Number(part.reorder_point || 0);
                  return (
                    <tr
                      key={part.id}
                      className="transition-colors hover:bg-[var(--color-surface-2)]"
                      style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/dashboard/parts/${part.id}`}
                          className="font-medium hover:underline"
                          style={{ color: "var(--color-brand)" }}
                        >
                          {part.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {part.part_number || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs font-semibold"
                          style={{
                            background: lowStock ? "rgba(239,68,68,0.1)" : "var(--color-surface-3)",
                            color: lowStock ? "#ef4444" : "var(--color-text-primary)",
                          }}
                        >
                          {lowStock && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#ef4444" }} />}
                          {part.quantity ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono" style={{ color: "var(--color-text-muted)" }}>
                        {part.reorder_point ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-semibold" style={{ color: "var(--color-brand)" }}>
                        ${Number(part.price || 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center" style={{ color: "var(--color-text-muted)" }}>
                    No parts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}