"use client";

type Ticket = {
  id: string;
  invoice_number: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  equipment_type: string | null;
  equipment_brand: string | null;
  equipment_model: string | null;
  status: string;
  grand_total: number | null;
};

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ContactActions({ ticket }: { ticket: Ticket }) {
  const equipment = [ticket.equipment_brand, ticket.equipment_model, ticket.equipment_type]
    .filter(Boolean)
    .join(" ");

  const subject = encodeURIComponent(
    `Update on your repair ${ticket.invoice_number || ""}`.trim()
  );

  const emailBody = encodeURIComponent(
    `Hi ${ticket.customer_name || "there"},\n\nHere's an update on your repair order${ticket.invoice_number ? ` (${ticket.invoice_number})` : ""}${equipment ? ` for your ${equipment}` : ""}.\n\nCurrent status: ${formatStatus(ticket.status)}\n${ticket.grand_total != null ? `Current total: $${Number(ticket.grand_total).toFixed(2)}\n` : ""}\nPlease let us know if you have any questions.\n\nThank you!`
  );

  const smsBody = encodeURIComponent(
    `Hi ${ticket.customer_name || ""}! Update on your repair${ticket.invoice_number ? ` ${ticket.invoice_number}` : ""}: Status is "${formatStatus(ticket.status)}".${ticket.grand_total != null ? ` Total: $${Number(ticket.grand_total).toFixed(2)}.` : ""} Questions? Reply to this message.`
  );

  const mailtoLink = ticket.customer_email
    ? `mailto:${ticket.customer_email}?subject=${subject}&body=${emailBody}`
    : null;

  const smsLink = ticket.customer_phone
    ? `sms:${ticket.customer_phone}?body=${smsBody}`
    : null;

  return (
    <div className="flex flex-wrap gap-2">
      {mailtoLink ? (
        <a
          href={mailtoLink}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:brightness-110"
          style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}
        >
          📧 Email Customer
        </a>
      ) : (
        <span
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium opacity-40"
          style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)" }}
        >
          📧 No email on file
        </span>
      )}

      {smsLink ? (
        <a
          href={smsLink}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:brightness-110"
          style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}
        >
          💬 Text Customer
        </a>
      ) : (
        <span
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium opacity-40"
          style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)" }}
        >
          💬 No phone on file
        </span>
      )}

      {ticket.customer_phone && (
        <a
          href={`tel:${ticket.customer_phone}`}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:brightness-110"
          style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}
        >
          📞 Call Customer
        </a>
      )}
    </div>
  );
}