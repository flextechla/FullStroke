"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import Link from "next/link";

type Ticket = { id: string; invoice_number: string | null; ticket_date: string | null; customer_name: string | null; customer_email: string | null; customer_phone: string | null; customer_address: string | null; equipment_type: string | null; equipment_brand: string | null; equipment_model: string | null; equipment_serial: string | null; tax_amount: number | null; grand_total: number | null };
type PartRow = { id: string; description: string | null; quantity: number; unit_price: number; total_price: number };
type LaborRow = { id: string; description: string | null; hours: number; rate: number; total_price: number };

const KEY = "invoice_settings";
const iC = "mt-1 block w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2";
const iS: React.CSSProperties = { background: "var(--color-surface-2)", border: "1px solid var(--color-border-subtle)", color: "var(--color-text-primary)" };
const lC = "block text-xs font-semibold uppercase tracking-wider";
const lS: React.CSSProperties = { color: "var(--color-text-muted)" };

function Field({ label, value, onChange, type = "text", step, min, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; step?: string; min?: string; placeholder?: string }) {
  return (<div><label className={lC} style={lS}>{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} step={step} min={min} placeholder={placeholder} className={iC} style={iS} /></div>);
}

export default function InvoicePage() {
  const params = useParams();
  const ticketId = params.id as string;
  const supabase = createBrowserSupabaseClient();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [parts, setParts] = useState<PartRow[]>([]);
  const [labor, setLabor] = useState<LaborRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [biz, setBiz] = useState({ name: "Curt's Small Engine Repair", address: "", phone: "", email: "", terms: "Due upon receipt" });
  const [inv, setInv] = useState({ taxRate: "", notes: "", dueDate: "" });

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (s.biz) setBiz(s.biz);
      if (s.inv) setInv((p) => ({ ...p, notes: s.inv.notes || "", taxRate: s.inv.taxRate || "" }));
    } catch {}
  }, []);

  function saveSettings() {
    localStorage.setItem(KEY, JSON.stringify({ biz, inv: { taxRate: inv.taxRate, notes: inv.notes } }));
    setShowSettings(false);
  }

  useEffect(() => {
    async function load() {
      const { data: t } = await supabase.from("tickets").select("*").eq("id", ticketId).single();
      if (t) { setTicket(t); if (!inv.dueDate) setInv((p) => ({ ...p, dueDate: new Date().toISOString().split("T")[0] })); }
      const { data: p } = await supabase.from("ticket_parts").select("*").eq("ticket_id", ticketId).order("created_at");
      if (p) setParts(p);
      const { data: l } = await supabase.from("ticket_labor").select("*").eq("ticket_id", ticketId).order("created_at");
      if (l) setLabor(l);
      setLoading(false);
    }
    load();
  }, [ticketId]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p style={{ color: "var(--color-text-muted)" }}>Loading...</p></div>;
  if (!ticket) return <div className="flex min-h-screen items-center justify-center"><p style={{ color: "#ef4444" }}>Ticket not found.</p></div>;

  const pT = parts.reduce((s, p) => s + Number(p.total_price || 0), 0);
  const lT = labor.reduce((s, l) => s + Number(l.total_price || 0), 0);
  const sub = pT + lT;
  const tax = inv.taxRate ? sub * (parseFloat(inv.taxRate) / 100) : Number(ticket.tax_amount || 0);
  const total = sub + tax;
  const equip = [ticket.equipment_brand, ticket.equipment_model, ticket.equipment_type].filter(Boolean).join(" ");

  function buildText() {
    let m = `Invoice ${ticket!.invoice_number || ""} from ${biz.name}\n\nCustomer: ${ticket!.customer_name || "—"}\n`;
    if (equip) m += `Equipment: ${equip}\n`;
    if (parts.length) { m += `\nPARTS:\n`; parts.forEach((p) => { m += `  ${p.description || "Part"} - Qty ${p.quantity} × $${Number(p.unit_price || 0).toFixed(2)} = $${Number(p.total_price || 0).toFixed(2)}\n`; }); m += `  Subtotal: $${pT.toFixed(2)}\n`; }
    if (labor.length) { m += `\nLABOR:\n`; labor.forEach((l) => { m += `  ${l.description || "Labor"} - ${Number(l.hours || 0).toFixed(1)}hrs × $${Number(l.rate || 0).toFixed(2)}/hr = $${Number(l.total_price || 0).toFixed(2)}\n`; }); m += `  Subtotal: $${lT.toFixed(2)}\n`; }
    m += `\nSubtotal: $${sub.toFixed(2)}\n`;
    if (tax > 0) m += `Tax${inv.taxRate ? ` (${inv.taxRate}%)` : ""}: $${tax.toFixed(2)}\n`;
    m += `TOTAL DUE: $${total.toFixed(2)}\n\nTerms: ${biz.terms}\n`;
    if (inv.dueDate) m += `Due: ${new Date(inv.dueDate + "T12:00:00").toLocaleDateString()}\n`;
    if (inv.notes) m += `Note: ${inv.notes}\n`;
    m += `\nAccepted Payment: Cash, Zelle, PayPal, Cash App\n\nThank you for your business!`;
    return m;
  }

  const eml = ticket.customer_email ? `mailto:${ticket.customer_email}?subject=${encodeURIComponent(`Invoice ${ticket.invoice_number || ""} from ${biz.name}`)}&body=${encodeURIComponent(buildText())}` : null;
  const sms = ticket.customer_phone ? `sms:${ticket.customer_phone}?body=${encodeURIComponent(buildText())}` : null;
  const th: React.CSSProperties = { textAlign: "right", padding: "8px 0", color: "#666", fontWeight: 600 };
  const td: React.CSSProperties = { padding: "8px 0", color: "#333", textAlign: "right" };
  const hd: React.CSSProperties = { fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#999", margin: "0 0 8px" };
  const tr: React.CSSProperties = { display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "14px" };

  return (
    <>
      <div className="print:hidden mx-auto max-w-3xl px-4 pt-6 pb-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link href={`/dashboard/tickets/${ticketId}`} className="text-sm font-medium hover:opacity-80" style={{ color: "var(--color-brand)" }}>← Back to Ticket</Link>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowSettings(!showSettings)} className="rounded-lg px-4 py-2.5 text-sm font-medium" style={{ border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>⚙️ Settings</button>
            <button onClick={() => window.print()} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-black hover:brightness-110" style={{ background: "var(--color-brand)" }}>🖨️ Print / PDF</button>
            {eml ? <a href={eml} className="rounded-lg px-4 py-2.5 text-sm font-medium" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>📧 Email</a> : <span className="rounded-lg px-4 py-2.5 text-sm opacity-40" style={{ color: "var(--color-text-muted)" }}>📧 No email</span>}
            {sms ? <a href={sms} className="rounded-lg px-4 py-2.5 text-sm font-medium" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>💬 Text</a> : <span className="rounded-lg px-4 py-2.5 text-sm opacity-40" style={{ color: "var(--color-text-muted)" }}>💬 No phone</span>}
          </div>
        </div>

        {showSettings && (
          <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--color-surface-0)", border: "1px solid var(--color-border-subtle)" }}>
            <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>Business Info & Invoice Defaults (saved for reuse)</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Business Name" value={biz.name} onChange={(v) => setBiz({ ...biz, name: v })} />
              <Field label="Phone" value={biz.phone} onChange={(v) => setBiz({ ...biz, phone: v })} />
              <Field label="Email" value={biz.email} onChange={(v) => setBiz({ ...biz, email: v })} />
              <Field label="Address" value={biz.address} onChange={(v) => setBiz({ ...biz, address: v })} />
              <Field label="Payment Terms" value={biz.terms} onChange={(v) => setBiz({ ...biz, terms: v })} />
              <Field label="Tax Rate (%)" value={inv.taxRate} onChange={(v) => setInv({ ...inv, taxRate: v })} type="number" step="0.01" min="0" placeholder="e.g. 9.45" />
              <div className="sm:col-span-2"><Field label="Default Notes" value={inv.notes} onChange={(v) => setInv({ ...inv, notes: v })} placeholder="e.g. Thank you for your business!" /></div>
            </div>
            <button onClick={saveSettings} className="rounded-lg px-4 py-2 text-sm font-semibold text-black hover:brightness-110" style={{ background: "var(--color-brand)" }}>Save Settings</button>
          </div>
        )}

        <div className="flex gap-4 items-end">
          <div className="w-48"><label className={lC} style={lS}>Due Date (this invoice)</label><input type="date" value={inv.dueDate} onChange={(e) => setInv({ ...inv, dueDate: e.target.value })} className={iC} style={iS} /></div>
        </div>
      </div>

      {/* Printable Invoice */}
      <div id="invoice" style={{ maxWidth: 800, margin: "0 auto", padding: 48, fontFamily: "system-ui, -apple-system, sans-serif", color: "#111", background: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, paddingBottom: 20, borderBottom: "3px solid #111" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: "bold", margin: 0 }}>{biz.name}</h1>
            <div style={{ fontSize: 13, color: "#666", marginTop: 4, lineHeight: 1.6 }}>
              {biz.address && <div>{biz.address}</div>}{biz.phone && <div>{biz.phone}</div>}{biz.email && <div>{biz.email}</div>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: 24, fontWeight: "bold", margin: "0 0 8px" }}>INVOICE</h2>
            {ticket.invoice_number && <div style={{ fontSize: 14, color: "#666" }}>#{ticket.invoice_number}</div>}
            {ticket.ticket_date && <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>{new Date(ticket.ticket_date + "T12:00:00").toLocaleDateString()}</div>}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, gap: 32 }}>
          <div>
            <span style={hd}>Bill To</span>
            <p style={{ fontSize: 15, fontWeight: 600, margin: "4px 0 0" }}>{ticket.customer_name || "—"}</p>
            {ticket.customer_address && <p style={{ fontSize: 13, color: "#666", margin: "2px 0 0" }}>{ticket.customer_address}</p>}
            {ticket.customer_phone && <p style={{ fontSize: 13, color: "#666", margin: "2px 0 0" }}>{ticket.customer_phone}</p>}
            {ticket.customer_email && <p style={{ fontSize: 13, color: "#666", margin: "2px 0 0" }}>{ticket.customer_email}</p>}
          </div>
          <div style={{ textAlign: "right" }}>
            {inv.dueDate && <div><span style={hd}>Due Date</span><p style={{ fontSize: 14, color: "#111", margin: "4px 0 0" }}>{new Date(inv.dueDate + "T12:00:00").toLocaleDateString()}</p></div>}
            <div style={{ marginTop: 12 }}><span style={hd}>Terms</span><p style={{ fontSize: 14, color: "#111", margin: "2px 0 0" }}>{biz.terms}</p></div>
          </div>
        </div>

        {equip && (<div style={{ marginBottom: 24, padding: "12px 16px", background: "#f9f9f9", borderRadius: 6 }}><span style={{ ...hd, margin: 0 }}>Equipment</span><p style={{ fontSize: 14, color: "#111", margin: "4px 0 0" }}>{equip}{ticket.equipment_serial && ` · Serial: ${ticket.equipment_serial}`}</p></div>)}

        {parts.length > 0 && (<div style={{ marginBottom: 24 }}><h3 style={hd}>Parts</h3><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}><thead><tr style={{ borderBottom: "2px solid #e5e5e5" }}><th style={{ ...th, textAlign: "left" }}>Description</th><th style={{ ...th, width: 70 }}>Qty</th><th style={{ ...th, width: 100 }}>Unit Price</th><th style={{ ...th, width: 100 }}>Total</th></tr></thead><tbody>{parts.map((p) => (<tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}><td style={{ padding: "8px 0", color: "#111" }}>{p.description || "Part"}</td><td style={td}>{p.quantity}</td><td style={td}>${Number(p.unit_price || 0).toFixed(2)}</td><td style={{ ...td, color: "#111", fontWeight: 600 }}>${Number(p.total_price || 0).toFixed(2)}</td></tr>))}</tbody></table></div>)}

        {labor.length > 0 && (<div style={{ marginBottom: 24 }}><h3 style={hd}>Labor</h3><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}><thead><tr style={{ borderBottom: "2px solid #e5e5e5" }}><th style={{ ...th, textAlign: "left" }}>Description</th><th style={{ ...th, width: 70 }}>Hours</th><th style={{ ...th, width: 100 }}>Rate</th><th style={{ ...th, width: 100 }}>Total</th></tr></thead><tbody>{labor.map((l) => (<tr key={l.id} style={{ borderBottom: "1px solid #f0f0f0" }}><td style={{ padding: "8px 0", color: "#111" }}>{l.description || "Labor"}</td><td style={td}>{Number(l.hours || 0).toFixed(1)}</td><td style={td}>${Number(l.rate || 0).toFixed(2)}/hr</td><td style={{ ...td, color: "#111", fontWeight: 600 }}>${Number(l.total_price || 0).toFixed(2)}</td></tr>))}</tbody></table></div>)}

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 32 }}>
          <div style={{ width: 280 }}>
            <div style={tr}><span style={{ color: "#666" }}>Parts</span><span>${pT.toFixed(2)}</span></div>
            <div style={tr}><span style={{ color: "#666" }}>Labor</span><span>${lT.toFixed(2)}</span></div>
            <div style={{ ...tr, borderTop: "1px solid #e5e5e5" }}><span style={{ color: "#666" }}>Subtotal</span><span style={{ fontWeight: 600 }}>${sub.toFixed(2)}</span></div>
            {tax > 0 && <div style={tr}><span style={{ color: "#666" }}>Tax{inv.taxRate ? ` (${inv.taxRate}%)` : ""}</span><span>${tax.toFixed(2)}</span></div>}
            <div style={{ ...tr, padding: "12px 0", fontSize: 20, fontWeight: "bold", borderTop: "3px solid #111", marginTop: 4 }}><span>Total Due</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: 20 }}>
          {inv.notes && <div style={{ marginBottom: 12 }}><h3 style={{ ...hd, margin: "0 0 4px" }}>Notes</h3><p style={{ fontSize: 13, color: "#666", margin: 0 }}>{inv.notes}</p></div>}
          <h3 style={{ ...hd, margin: "0 0 4px" }}>Payment Terms</h3><p style={{ fontSize: 13, color: "#666", margin: 0 }}>{biz.terms}</p>
        </div>

        <div style={{ marginTop: 24, padding: "12px 16px", background: "#f4f4f5", borderRadius: 6 }}>
          <h3 style={{ ...hd, margin: "0 0 4px" }}>Accepted Payment Methods</h3>
          <p style={{ fontSize: 14, color: "#111", margin: 0 }}>Cash · Zelle · PayPal · Cash App</p>
        </div>

        <div style={{ marginTop: 40, textAlign: "center", fontSize: 12, color: "#aaa" }}>Thank you for your business!</div>
      </div>

      <style jsx global>{`@media print { body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .print\\:hidden { display: none !important; } #invoice { padding: 0 !important; max-width: 100% !important; margin: 0 !important; } @page { margin: 0.75in; size: letter; } }`}</style>
    </>
  );
}