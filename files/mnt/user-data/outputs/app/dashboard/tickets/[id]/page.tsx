import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ResolutionNotes from "./ResolutionNotes";
import LaborManager from "./LaborManager";
import ContactActions from "./ContactActions";

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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
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
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
        {value || "—"}
      </span>
    </div>
  );
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !ticket) {
    notFound();
  }

  const { data: ticketParts } = await supabase
    .from("ticket_parts")
    .select("*")
    .eq("ticket_id", id)
    .order("created_at");

  const { data: ticketLabor } = await supabase
    .from("ticket_labor")
    .select("*")
    .eq("ticket_id", id)
    .order("created_at");

  const partsTotal = ticketParts?.reduce((sum, p) => sum + Number(p.total_price || 0), 0) ?? 0;
  const laborTotal = ticketLabor?.reduce((sum, l) => sum + Number(l.total_price || 0), 0) ?? 0;
  const s = getStatusStyle(ticket.status);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--color-brand)" }}
        >
          ← Back to Tickets
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
              <span className="font-mono" style={{ color: "var(--color-brand)" }}>
                {ticket.invoice_number || "Ticket"}
              </span>
            </h1>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: s.bg, color: s.text }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
              {formatStatus(ticket.status)}
            </span>
          </div>
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {ticket.ticket_date ? new Date(ticket.ticket_date).toLocaleDateString() : "No date"}
          </span>
        </div>
      </div>

      {/* Contact Actions - Email & Text */}
      <SectionCard title="Contact Customer">
        <ContactActions
          ticket={{
            id: ticket.id,
            invoice_number: ticket.invoice_number,
            customer_name: ticket.customer_name,
            customer_email: ticket.customer_email,
            customer_phone: ticket.customer_phone,
            equipment_type: ticket.equipment_type,
            equipment_brand: ticket.equipment_brand,
            equipment_model: ticket.equipment_model,
            status: ticket.status,
            grand_total: ticket.grand_total,
          }}
        />
      </SectionCard>

      {/* Customer */}
      <SectionCard title="Customer">
        <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-8">
          <InfoRow label="Name" value={ticket.customer_name} />
          <InfoRow label="Phone" value={ticket.customer_phone} />
          <InfoRow label="Email" value={ticket.customer_email} />
          <InfoRow label="Address" value={ticket.customer_address} />
        </div>
      </SectionCard>

      {/* Equipment */}
      <SectionCard title="Equipment">
        <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-8">
          <InfoRow label="Type" value={ticket.equipment_type} />
          <InfoRow label="Brand" value={ticket.equipment_brand} />
          <InfoRow label="Model" value={ticket.equipment_model} />
          <InfoRow label="Year" value={ticket.equipment_year} />
          <InfoRow label="Serial #" value={ticket.equipment_serial} />
        </div>
      </SectionCard>

      {/* Problem Description */}
      <SectionCard title="Problem Description">
        <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {ticket.problem_description || "No description provided."}
        </p>
      </SectionCard>

      {/* Resolution Notes - NEW */}
      <SectionCard title="Resolution / Completion Notes">
        <ResolutionNotes ticketId={ticket.id} initialNotes={ticket.resolution_notes} />
      </SectionCard>

      {/* Services / Resolution */}
      {ticket.services && (
        <SectionCard title="Services">
          <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {Array.isArray(ticket.services) ? (
              <div className="space-y-2">
                {ticket.services.map((service: { description?: string; name?: string }, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg p-3"
                    style={{ background: "var(--color-surface-2)" }}
                  >
                    <span style={{ color: "var(--color-brand)" }}>●</span>
                    <span>{service.description || service.name || JSON.stringify(service)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="whitespace-pre-wrap">
                {typeof ticket.services === "string"
                  ? ticket.services
                  : JSON.stringify(ticket.services, null, 2)}
              </p>
            )}
          </div>
        </SectionCard>
      )}

      {/* Parts Used */}
      <SectionCard title="Parts Used">
        {ticketParts && ticketParts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                  <th className="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Part</th>
                  <th className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Qty</th>
                  <th className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Unit Price</th>
                  <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {ticketParts.map((part) => (
                  <tr key={part.id} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                    <td className="py-2.5 pr-4" style={{ color: "var(--color-text-primary)" }}>
                      {part.description || "Unnamed part"}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono" style={{ color: "var(--color-text-secondary)" }}>
                      {part.quantity}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono" style={{ color: "var(--color-text-secondary)" }}>
                      ${Number(part.unit_price || 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      ${Number(part.total_price || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid var(--color-border)" }}>
                  <td colSpan={3} className="pt-2.5 pr-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                    Parts Subtotal
                  </td>
                  <td className="pt-2.5 text-right font-mono font-bold" style={{ color: "var(--color-brand)" }}>
                    ${partsTotal.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No parts recorded.</p>
        )}
      </SectionCard>

      {/* Labor - NOW INTERACTIVE */}
      <SectionCard title="Labor">
        <LaborManager ticketId={ticket.id} initialLabor={ticketLabor || []} />
      </SectionCard>

      {/* Grand Total */}
      <section
        className="rounded-xl p-5"
        style={{
          background: "var(--color-surface-0)",
          border: "1px solid var(--color-border-subtle)",
        }}
      >
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: "var(--color-text-muted)" }}>Parts</span>
            <span className="font-mono" style={{ color: "var(--color-text-primary)" }}>${partsTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--color-text-muted)" }}>Labor</span>
            <span className="font-mono" style={{ color: "var(--color-text-primary)" }}>${laborTotal.toFixed(2)}</span>
          </div>
          {ticket.tax_amount != null && Number(ticket.tax_amount) > 0 && (
            <div className="flex justify-between">
              <span style={{ color: "var(--color-text-muted)" }}>Tax</span>
              <span className="font-mono" style={{ color: "var(--color-text-primary)" }}>
                ${Number(ticket.tax_amount).toFixed(2)}
              </span>
            </div>
          )}
          <div
            className="flex justify-between pt-3 mt-2"
            style={{ borderTop: "2px solid var(--color-border)" }}
          >
            <span className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
              Grand Total
            </span>
            <span className="font-mono text-xl font-bold" style={{ color: "var(--color-brand)" }}>
              ${Number(ticket.grand_total || partsTotal + laborTotal).toFixed(2)}
            </span>
          </div>
        </div>
      </section>

      {/* Footer meta */}
      <p className="pb-4 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
        Created {ticket.ticket_date ? new Date(ticket.ticket_date).toLocaleDateString() : "—"}
        {ticket.updated_at && ` · Updated ${new Date(ticket.updated_at).toLocaleDateString()}`}
      </p>
    </div>
  );
}
