import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import DeletePartButton from "./DeletePartButton";

export default async function PartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: part, error } = await supabase
    .from("parts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !part) {
    notFound();
  }

  // Get tickets that used this part
  const { data: usages } = await supabase
    .from("ticket_parts")
    .select("*, tickets(id, invoice_number, customer_name, ticket_date)")
    .eq("part_id", id)
    .order("created_at", { ascending: false });

  const lowStock = Number(part.quantity || 0) <= Number(part.reorder_point || 0);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/parts"
          className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--color-brand)" }}
        >
          ← Back to Parts
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
              {part.name}
            </h1>
            {part.part_number && (
              <p className="mt-0.5 font-mono text-sm" style={{ color: "var(--color-text-muted)" }}>
                #{part.part_number}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/parts/${id}/edit`}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-black transition-all hover:brightness-110"
              style={{ background: "var(--color-brand)" }}
            >
              Edit
            </Link>
            <DeletePartButton partId={id} partName={part.name} />
          </div>
        </div>
      </div>

      {/* Details */}
      <section
        className="rounded-xl p-5"
        style={{
          background: "var(--color-surface-0)",
          border: "1px solid var(--color-border-subtle)",
        }}
      >
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Part Details
        </h2>
        <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-8">
          <div className="flex justify-between py-1.5">
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Price</span>
            <span className="font-mono text-sm font-semibold" style={{ color: "var(--color-brand)" }}>
              ${Number(part.price || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Quantity</span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-sm font-semibold"
              style={{
                background: lowStock ? "rgba(239,68,68,0.1)" : "var(--color-surface-3)",
                color: lowStock ? "#ef4444" : "var(--color-text-primary)",
              }}
            >
              {lowStock && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#ef4444" }} />}
              {part.quantity ?? 0}
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Reorder Point</span>
            <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
              {part.reorder_point ?? "Not set"}
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Part Number</span>
            <span className="font-mono text-sm" style={{ color: "var(--color-text-primary)" }}>
              {part.part_number || "—"}
            </span>
          </div>
        </div>
      </section>

      {/* Low stock warning */}
      {lowStock && (
        <section
          className="rounded-xl p-4"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#ef4444" }}>
            ⚠ Low Stock — quantity ({part.quantity ?? 0}) is at or below reorder point ({part.reorder_point})
          </p>
        </section>
      )}

      {/* Usage history */}
      <section
        className="rounded-xl p-5"
        style={{
          background: "var(--color-surface-0)",
          border: "1px solid var(--color-border-subtle)",
        }}
      >
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Usage History ({usages?.length ?? 0})
        </h2>

        {usages && usages.length > 0 ? (
          <div className="space-y-2">
            {usages.map((usage) => {
              const ticket = usage.tickets as { id: string; invoice_number: string; customer_name: string; ticket_date: string } | null;
              return (
                <Link
                  key={usage.id}
                  href={ticket ? `/dashboard/tickets/${ticket.id}` : "#"}
                  className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-[var(--color-surface-2)]"
                  style={{ border: "1px solid var(--color-border-subtle)" }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-medium" style={{ color: "var(--color-brand)" }}>
                        {ticket?.invoice_number || "—"}
                      </span>
                      <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                        {ticket?.customer_name || "Unknown"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      Qty: {usage.quantity} × ${Number(usage.unit_price || 0).toFixed(2)}
                      {ticket?.ticket_date && ` · ${new Date(ticket.ticket_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span className="ml-3 font-mono text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    ${Number(usage.total_price || 0).toFixed(2)}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            This part hasn&apos;t been used on any tickets yet.
          </p>
        )}
      </section>

      {part.created_at && (
        <p className="pb-4 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
          Added {new Date(part.created_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}