import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  intake:        { bg: "rgba(59,130,246,0.1)",  text: "#3b82f6", dot: "#3b82f6" },
  diagnosing:    { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b", dot: "#f59e0b" },
  waiting_parts: { bg: "rgba(249,115,22,0.1)",  text: "#f97316", dot: "#f97316" },
  in_progress:   { bg: "rgba(168,85,247,0.1)",  text: "#a855f7", dot: "#a855f7" },
  ready:         { bg: "rgba(34,197,94,0.1)",   text: "#22c55e", dot: "#22c55e" },
  picked_up:     { bg: "rgba(113,113,122,0.1)", text: "#71717a", dot: "#71717a" },
  invoiced:      { bg: "rgba(16,185,129,0.1)",  text: "#10b981", dot: "#10b981" },
  cancelled:     { bg: "rgba(239,68,68,0.1)",   text: "#ef4444", dot: "#ef4444" },
};

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getStatusStyle(status: string) {
  return STATUS_STYLES[status] || STATUS_STYLES.intake;
}

export default async function TicketsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
        Failed to load tickets: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            Tickets
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {tickets?.length ?? 0} repair orders
          </p>
        </div>
        <Link
          href="/dashboard/tickets/new"
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:brightness-110"
          style={{ background: "var(--color-brand)" }}
        >
          <span className="text-lg leading-none">+</span>
          New Ticket
        </Link>
      </div>

      {/* Mobile card list */}
      <div className="mt-6 space-y-3 lg:hidden">
        {tickets && tickets.length > 0 ? (
          tickets.map((ticket) => {
            const s = getStatusStyle(ticket.status);
            return (
              <Link
                key={ticket.id}
                href={`/dashboard/tickets/${ticket.id}`}
                className="block rounded-xl p-4 transition-colors hover:bg-[var(--color-surface-2)]"
                style={{
                  background: "var(--color-surface-0)",
                  border: "1px solid var(--color-border-subtle)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-xs font-medium" style={{ color: "var(--color-brand)" }}>
                      {ticket.invoice_number || "—"}
                    </span>
                    <p className="mt-1 truncate text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      {ticket.customer_name || "No customer"}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {[ticket.equipment_brand, ticket.equipment_model, ticket.equipment_type]
                        .filter(Boolean)
                        .join(" ") || "No equipment info"}
                    </p>
                  </div>
                  <span
                    className="ml-2 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ background: s.bg, color: s.text }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
                    {formatStatus(ticket.status)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {ticket.problem_description || "No description"}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {ticket.ticket_date
                      ? new Date(ticket.ticket_date).toLocaleDateString()
                      : "No date"}
                  </span>
                  {ticket.grand_total != null && (
                    <span className="font-mono text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      ${Number(ticket.grand_total).toFixed(2)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: "var(--color-surface-0)",
              border: "2px dashed var(--color-border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No tickets yet.</p>
            <Link
              href="/dashboard/tickets/new"
              className="mt-2 inline-block text-sm font-semibold"
              style={{ color: "var(--color-brand)" }}
            >
              Create your first ticket →
            </Link>
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
                {["Invoice", "Customer", "Equipment", "Status", "Date", "Total"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider ${i === 5 ? "text-right" : ""}`}
                    style={{ color: "var(--color-text-muted)", background: "var(--color-surface-2)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets && tickets.length > 0 ? (
                tickets.map((ticket) => {
                  const s = getStatusStyle(ticket.status);
                  return (
                    <tr
                      key={ticket.id}
                      className="transition-colors hover:bg-[var(--color-surface-2)]"
                      style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/dashboard/tickets/${ticket.id}`}
                          className="font-mono text-xs font-semibold hover:underline"
                          style={{ color: "var(--color-brand)" }}
                        >
                          {ticket.invoice_number || "—"}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {ticket.customer_name || "—"}
                      </td>
                      <td className="px-5 py-3.5" style={{ color: "var(--color-text-secondary)" }}>
                        {[ticket.equipment_brand, ticket.equipment_model, ticket.equipment_type]
                          .filter(Boolean)
                          .join(" ") || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                          style={{ background: s.bg, color: s.text }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
                          {formatStatus(ticket.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5" style={{ color: "var(--color-text-muted)" }}>
                        {ticket.ticket_date
                          ? new Date(ticket.ticket_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        {ticket.grand_total != null
                          ? `$${Number(ticket.grand_total).toFixed(2)}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center" style={{ color: "var(--color-text-muted)" }}>
                    No tickets yet.{" "}
                    <Link href="/dashboard/tickets/new" className="font-semibold" style={{ color: "var(--color-brand)" }}>
                      Create one →
                    </Link>
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