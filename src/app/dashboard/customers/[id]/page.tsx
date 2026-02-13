import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import DeleteCustomerButton from "./DeleteCustomerButton";

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

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !customer) {
    notFound();
  }

  // Get tickets for this customer
  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, invoice_number, status, ticket_date, equipment_type, equipment_brand, grand_total, problem_description")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--color-brand)" }}
        >
          ← Back to Customers
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            {customer.name}
          </h1>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/customers/${id}/edit`}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-black transition-all hover:brightness-110"
              style={{ background: "var(--color-brand)" }}
            >
              Edit
            </Link>
            <DeleteCustomerButton customerId={id} customerName={customer.name} />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <section
        className="rounded-xl p-5"
        style={{
          background: "var(--color-surface-0)",
          border: "1px solid var(--color-border-subtle)",
        }}
      >
        <h2
          className="mb-3 text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--color-text-muted)" }}
        >
          Contact Information
        </h2>
        <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-8">
          <div className="flex justify-between py-1.5">
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Phone</span>
            {customer.phone ? (
              <a href={`tel:${customer.phone}`} className="text-sm font-medium hover:underline" style={{ color: "var(--color-brand)" }}>
                {customer.phone}
              </a>
            ) : (
              <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>—</span>
            )}
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Email</span>
            {customer.email ? (
              <a href={`mailto:${customer.email}`} className="text-sm font-medium hover:underline" style={{ color: "var(--color-brand)" }}>
                {customer.email}
              </a>
            ) : (
              <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>—</span>
            )}
          </div>
          <div className="flex justify-between py-1.5 sm:col-span-2">
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Address</span>
            <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
              {customer.address || "—"}
            </span>
          </div>
        </div>
      </section>

      {/* Ticket History */}
      <section
        className="rounded-xl p-5"
        style={{
          background: "var(--color-surface-0)",
          border: "1px solid var(--color-border-subtle)",
        }}
      >
        <h2
          className="mb-3 text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--color-text-muted)" }}
        >
          Ticket History ({tickets?.length ?? 0})
        </h2>

        {tickets && tickets.length > 0 ? (
          <div className="space-y-2">
            {tickets.map((ticket) => {
              const s = STATUS_STYLES[ticket.status] || STATUS_STYLES.intake;
              return (
                <Link
                  key={ticket.id}
                  href={`/dashboard/tickets/${ticket.id}`}
                  className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-[var(--color-surface-2)]"
                  style={{ border: "1px solid var(--color-border-subtle)" }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-medium" style={{ color: "var(--color-brand)" }}>
                        {ticket.invoice_number || "—"}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: s.bg, color: s.text }}
                      >
                        <span className="h-1 w-1 rounded-full" style={{ background: s.dot }} />
                        {formatStatus(ticket.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {[ticket.equipment_brand, ticket.equipment_type].filter(Boolean).join(" ") || "No equipment info"}
                      {ticket.ticket_date && ` · ${new Date(ticket.ticket_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  {ticket.grand_total != null && (
                    <span className="ml-3 font-mono text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      ${Number(ticket.grand_total).toFixed(2)}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            No tickets for this customer yet.
          </p>
        )}
      </section>

      {/* Created date */}
      {customer.created_at && (
        <p className="pb-4 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
          Customer since {new Date(customer.created_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}