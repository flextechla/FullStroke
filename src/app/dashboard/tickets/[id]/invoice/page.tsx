"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import Link from "next/link";

type Ticket = {
  id: string;
  invoice_number: string | null;
  ticket_date: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  equipment_type: string | null;
  equipment_brand: string | null;
  equipment_model: string | null;
  equipment_serial: string | null;
  tax_amount: number | null;
  grand_total: number | null;
};

type PartRow = {
  id: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type LaborRow = {
  id: string;
  description: string | null;
  hours: number;
  rate: number;
  total_price: number;
};

export default function InvoicePage() {
  const params = useParams();
  const ticketId = params.id as string;
  const supabase = createBrowserSupabaseClient();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [parts, setParts] = useState<PartRow[]>([]);
  const [labor, setLabor] = useState<LaborRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Editable fields with localStorage persistence
  const [businessName, setBusinessName] = useState("Curt's Small Engine Repair");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Due upon receipt");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState("");

  const [showSettings, setShowSettings] = useState(false);

  // Load saved business info from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("invoice_business_info");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.businessName) setBusinessName(parsed.businessName);
        if (parsed.businessAddress) setBusinessAddress(parsed.businessAddress);
        if (parsed.businessPhone) setBusinessPhone(parsed.businessPhone);
        if (parsed.businessEmail) setBusinessEmail(parsed.businessEmail);
        if (parsed.paymentTerms) setPaymentTerms(parsed.paymentTerms);
      } catch {}
    }
  }, []);

  // Save business info to localStorage when it changes
  function saveBusinessInfo() {
    localStorage.setItem(
      "invoice_business_info",
      JSON.stringify({ businessName, businessAddress, businessPhone, businessEmail, paymentTerms })
    );
    setShowSettings(false);
  }

  // Fetch ticket data
  useEffect(() => {
    async function fetchData() {
      const { data: t } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", ticketId)
        .single();

      if (t) {
        setTicket(t);
        // Set due date to today by default
        if (!dueDate) {
          setDueDate(new Date().toISOString().split("T")[0]);
        }
      }

      const { data: p } = await supabase
        .from("ticket_parts")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at");
      if (p) setParts(p);

      const { data: l } = await supabase
        .from("ticket_labor")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at");
      if (l) setLabor(l);

      setLoading(false);
    }
    fetchData();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p style={{ color: "var(--color-text-muted)" }}>Loading invoice...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p style={{ color: "#ef4444" }}>Ticket not found.</p>
      </div>
    );
  }

  const partsTotal = parts.reduce((sum, p) => sum + Number(p.total_price || 0), 0);
  const laborTotal = labor.reduce((sum, l) => sum + Number(l.total_price || 0), 0);
  const subtotal = partsTotal + laborTotal;
  const tax = taxRate ? subtotal * (parseFloat(taxRate) / 100) : Number(ticket.tax_amount || 0);
  const grandTotal = subtotal + tax;

  const equipment = [ticket.equipment_brand, ticket.equipment_model, ticket.equipment_type]
    .filter(Boolean)
    .join(" ");

  function handlePrint() {
    window.print();
  }

  function buildInvoiceText() {
    let msg = `Invoice ${ticket!.invoice_number || ""} from ${businessName}\n\n`;
    msg += `Customer: ${ticket!.customer_name || "—"}\n`;
    if (equipment) msg += `Equipment: ${equipment}\n`;
    msg += `\n`;

    if (parts.length > 0) {
      msg += `PARTS:\n`;
      parts.forEach((p) => {
        msg += `  ${p.description || "Part"} - Qty ${p.quantity} × $${Number(p.unit_price || 0).toFixed(2)} = $${Number(p.total_price || 0).toFixed(2)}\n`;
      });
      msg += `  Parts Subtotal: $${partsTotal.toFixed(2)}\n\n`;
    }

    if (labor.length > 0) {
      msg += `LABOR:\n`;
      labor.forEach((l) => {
        msg += `  ${l.description || "Labor"} - ${Number(l.hours || 0).toFixed(1)}hrs × $${Number(l.rate || 0).toFixed(2)}/hr = $${Number(l.total_price || 0).toFixed(2)}\n`;
      });
      msg += `  Labor Subtotal: $${laborTotal.toFixed(2)}\n\n`;
    }

    msg += `Subtotal: $${subtotal.toFixed(2)}\n`;
    if (tax > 0) msg += `Tax${taxRate ? ` (${taxRate}%)` : ""}: $${tax.toFixed(2)}\n`;
    msg += `TOTAL DUE: $${grandTotal.toFixed(2)}\n\n`;
    msg += `Terms: ${paymentTerms}\n`;
    if (dueDate) msg += `Due Date: ${new Date(dueDate + "T12:00:00").toLocaleDateString()}\n`;
    if (notes) msg += `\nNote: ${notes}\n`;
    msg += `\nThank you for your business!`;

    return msg;
  }

  function getEmailLink() {
    if (!ticket?.customer_email) return null;
    const subject = encodeURIComponent(`Invoice ${ticket.invoice_number || ""} from ${businessName}`);
    const body = encodeURIComponent(buildInvoiceText());
    return `mailto:${ticket.customer_email}?subject=${subject}&body=${body}`;
  }

  function getSmsLink() {
    if (!ticket?.customer_phone) return null;
    const body = encodeURIComponent(buildInvoiceText());
    return `sms:${ticket.customer_phone}?body=${body}`;
  }

  const emailLink = getEmailLink();
  const smsLink = getSmsLink();

  return (
    <>
      {/* Controls - hidden when printing */}
      <div className="print:hidden mx-auto max-w-3xl px-4 pt-6 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <Link
            href={`/dashboard/tickets/${ticketId}`}
            className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--color-brand)" }}
          >
            ← Back to Ticket
          </Link>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
              }}
            >
              ⚙️ Edit Business Info
            </button>
            <button
              onClick={handlePrint}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition-all hover:brightness-110"
              style={{ background: "var(--color-brand)" }}
            >
              🖨️ Print / Save PDF
            </button>
            {emailLink ? (
              <a
                href={emailLink}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:brightness-110"
                style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}
              >
                📧 Email Invoice
              </a>
            ) : (
              <span
                className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium opacity-40"
                style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)" }}
              >
                📧 No email on file
              </span>
            )}
            {smsLink ? (
              <a
                href={smsLink}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:brightness-110"
                style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}
              >
                💬 Text Invoice
              </a>
            ) : (
              <span
                className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium opacity-40"
                style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)" }}
              >
                💬 No phone on file
              </span>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div
            className="rounded-xl p-5 space-y-4"
            style={{
              background: "var(--color-surface-0)",
              border: "1px solid var(--color-border-subtle)",
            }}
          >
            <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
              Business Information (saved for future invoices)
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="mt-1 block w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border-subtle)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                  Business Phone
                </label>
                <input
                  type="text"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  className="mt-1 block w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border-subtle)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                  Business Email
                </label>
                <input
                  type="text"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border-subtle)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                  Business Address
                </label>
                <input
                  type="text"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="mt-1 block w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border-subtle)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="mt-1 block w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border-subtle)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
            </div>
            <button
              onClick={saveBusinessInfo}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-black transition-all hover:brightness-110"
              style={{ background: "var(--color-brand)" }}
            >
              Save Business Info
            </button>
          </div>
        )}

        {/* Invoice-specific overrides */}
        <div
          className="rounded-xl p-5 space-y-4"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
            Invoice Options
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border-subtle)",
                  color: "var(--color-text-primary)",
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder={ticket.tax_amount ? String(ticket.tax_amount) : "0"}
                className="mt-1 block w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border-subtle)",
                  color: "var(--color-text-primary)",
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Thank you for your business!"
                className="mt-1 block w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border-subtle)",
                  color: "var(--color-text-primary)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========== PRINTABLE INVOICE ========== */}
      <div
        className="mx-auto max-w-3xl bg-white text-black"
        style={{ padding: "40px", fontFamily: "Arial, Helvetica, sans-serif" }}
        id="invoice"
      >
        {/* Invoice Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0, color: "#111" }}>
              {businessName}
            </h1>
            {businessAddress && (
              <p style={{ fontSize: "13px", color: "#666", margin: "4px 0 0" }}>{businessAddress}</p>
            )}
            {businessPhone && (
              <p style={{ fontSize: "13px", color: "#666", margin: "2px 0 0" }}>{businessPhone}</p>
            )}
            {businessEmail && (
              <p style={{ fontSize: "13px", color: "#666", margin: "2px 0 0" }}>{businessEmail}</p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: "#333", letterSpacing: "2px" }}>
              INVOICE
            </h2>
            <p style={{ fontSize: "14px", color: "#666", margin: "4px 0 0" }}>
              #{ticket.invoice_number || "—"}
            </p>
          </div>
        </div>

        {/* Dates & Customer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", gap: "24px" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#999", margin: "0 0 8px" }}>
              Bill To
            </h3>
            <p style={{ fontSize: "15px", fontWeight: "600", margin: "0 0 2px", color: "#111" }}>
              {ticket.customer_name || "—"}
            </p>
            {ticket.customer_address && (
              <p style={{ fontSize: "13px", color: "#666", margin: "2px 0 0" }}>{ticket.customer_address}</p>
            )}
            {ticket.customer_phone && (
              <p style={{ fontSize: "13px", color: "#666", margin: "2px 0 0" }}>{ticket.customer_phone}</p>
            )}
            {ticket.customer_email && (
              <p style={{ fontSize: "13px", color: "#666", margin: "2px 0 0" }}>{ticket.customer_email}</p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#999" }}>
                Invoice Date
              </span>
              <p style={{ fontSize: "14px", color: "#111", margin: "2px 0 0" }}>
                {ticket.ticket_date ? new Date(ticket.ticket_date).toLocaleDateString() : new Date().toLocaleDateString()}
              </p>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#999" }}>
                Due Date
              </span>
              <p style={{ fontSize: "14px", color: "#111", margin: "2px 0 0" }}>
                {dueDate ? new Date(dueDate + "T12:00:00").toLocaleDateString() : "Upon receipt"}
              </p>
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#999" }}>
                Terms
              </span>
              <p style={{ fontSize: "14px", color: "#111", margin: "2px 0 0" }}>
                {paymentTerms}
              </p>
            </div>
          </div>
        </div>

        {/* Equipment */}
        {equipment && (
          <div style={{ marginBottom: "24px", padding: "12px 16px", background: "#f9f9f9", borderRadius: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#999" }}>
              Equipment
            </span>
            <p style={{ fontSize: "14px", color: "#111", margin: "4px 0 0" }}>
              {equipment}
              {ticket.equipment_serial && ` · Serial: ${ticket.equipment_serial}`}
            </p>
          </div>
        )}

        {/* Parts Table */}
        {parts.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#999", margin: "0 0 8px" }}>
              Parts
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e5e5" }}>
                  <th style={{ textAlign: "left", padding: "8px 0", color: "#666", fontWeight: "600" }}>Description</th>
                  <th style={{ textAlign: "right", padding: "8px 0", color: "#666", fontWeight: "600", width: "70px" }}>Qty</th>
                  <th style={{ textAlign: "right", padding: "8px 0", color: "#666", fontWeight: "600", width: "100px" }}>Unit Price</th>
                  <th style={{ textAlign: "right", padding: "8px 0", color: "#666", fontWeight: "600", width: "100px" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => (
                  <tr key={part.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "8px 0", color: "#111" }}>{part.description || "Part"}</td>
                    <td style={{ padding: "8px 0", color: "#333", textAlign: "right" }}>{part.quantity}</td>
                    <td style={{ padding: "8px 0", color: "#333", textAlign: "right" }}>${Number(part.unit_price || 0).toFixed(2)}</td>
                    <td style={{ padding: "8px 0", color: "#111", textAlign: "right", fontWeight: "600" }}>${Number(part.total_price || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Labor Table */}
        {labor.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#999", margin: "0 0 8px" }}>
              Labor
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e5e5" }}>
                  <th style={{ textAlign: "left", padding: "8px 0", color: "#666", fontWeight: "600" }}>Description</th>
                  <th style={{ textAlign: "right", padding: "8px 0", color: "#666", fontWeight: "600", width: "70px" }}>Hours</th>
                  <th style={{ textAlign: "right", padding: "8px 0", color: "#666", fontWeight: "600", width: "100px" }}>Rate</th>
                  <th style={{ textAlign: "right", padding: "8px 0", color: "#666", fontWeight: "600", width: "100px" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {labor.map((l) => (
                  <tr key={l.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "8px 0", color: "#111" }}>{l.description || "Labor"}</td>
                    <td style={{ padding: "8px 0", color: "#333", textAlign: "right" }}>{Number(l.hours || 0).toFixed(1)}</td>
                    <td style={{ padding: "8px 0", color: "#333", textAlign: "right" }}>${Number(l.rate || 0).toFixed(2)}/hr</td>
                    <td style={{ padding: "8px 0", color: "#111", textAlign: "right", fontWeight: "600" }}>${Number(l.total_price || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
          <div style={{ width: "280px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "14px" }}>
              <span style={{ color: "#666" }}>Parts Subtotal</span>
              <span style={{ color: "#111" }}>${partsTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "14px" }}>
              <span style={{ color: "#666" }}>Labor Subtotal</span>
              <span style={{ color: "#111" }}>${laborTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "14px", borderTop: "1px solid #e5e5e5" }}>
              <span style={{ color: "#666" }}>Subtotal</span>
              <span style={{ color: "#111", fontWeight: "600" }}>${subtotal.toFixed(2)}</span>
            </div>
            {tax > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "14px" }}>
                <span style={{ color: "#666" }}>Tax{taxRate ? ` (${taxRate}%)` : ""}</span>
                <span style={{ color: "#111" }}>${tax.toFixed(2)}</span>
              </div>
            )}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0",
              fontSize: "20px",
              fontWeight: "bold",
              borderTop: "3px solid #111",
              marginTop: "4px",
            }}>
              <span>Total Due</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: "20px" }}>
          {notes && (
            <div style={{ marginBottom: "12px" }}>
              <h3 style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#999", margin: "0 0 4px" }}>
                Notes
              </h3>
              <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>{notes}</p>
            </div>
          )}
          <div>
            <h3 style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#999", margin: "0 0 4px" }}>
              Payment Terms
            </h3>
            <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>{paymentTerms}</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "40px", textAlign: "center", fontSize: "12px", color: "#aaa" }}>
          Thank you for your business!
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          #invoice {
            padding: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          @page {
            margin: 0.75in;
            size: letter;
          }
        }
      `}</style>
    </>
  );
}