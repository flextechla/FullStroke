"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import Link from "next/link";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

const inputClass =
  "mt-1 block w-full rounded-lg px-3 py-2.5 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2";

const inputStyle = {
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border-subtle)",
  color: "var(--color-text-primary)",
  "--tw-ring-color": "var(--color-brand)",
} as React.CSSProperties;

const labelClass = "block text-xs font-semibold uppercase tracking-wider";
const labelStyle = { color: "var(--color-text-muted)" };

export default function NewTicketPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [equipmentBrand, setEquipmentBrand] = useState("");
  const [equipmentModel, setEquipmentModel] = useState("");
  const [equipmentSerial, setEquipmentSerial] = useState("");
  const [equipmentYear, setEquipmentYear] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [status, setStatus] = useState("intake");

  useEffect(() => {
    async function fetchCustomers() {
      const { data } = await supabase
        .from("customers")
        .select("id, name, email, phone, address")
        .order("name");
      if (data) setCustomers(data);
    }
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function selectCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
    setCustomerEmail(customer.email || "");
    setCustomerPhone(customer.phone || "");
    setCustomerAddress(customer.address || "");
    setSearchTerm(customer.name);
    setShowDropdown(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("workspace_id")
      .eq("id", user.id)
      .single();

    if (!profile?.workspace_id) {
      setError("No workspace found");
      setLoading(false);
      return;
    }

    let customerId = selectedCustomer?.id;

    if (!customerId && customerName.trim()) {
      const { data: newCustomer, error: custErr } = await supabase
        .from("customers")
        .insert({
          workspace_id: profile.workspace_id,
          name: customerName.trim(),
          email: customerEmail.trim() || null,
          phone: customerPhone.trim() || null,
          address: customerAddress.trim() || null,
        })
        .select("id")
        .single();

      if (custErr || !newCustomer) {
        setError("Failed to create customer: " + (custErr?.message || ""));
        setLoading(false);
        return;
      }
      customerId = newCustomer.id;
    }

    const invoiceNumber = `FS-${Date.now().toString(36).toUpperCase()}`;

    const { error: ticketErr } = await supabase.from("tickets").insert({
      workspace_id: profile.workspace_id,
      invoice_number: invoiceNumber,
      ticket_date: new Date().toISOString().split("T")[0],
      status,
      customer_id: customerId || null,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim() || null,
      customer_phone: customerPhone.trim() || null,
      customer_address: customerAddress.trim() || null,
      equipment_type: equipmentType.trim() || null,
      equipment_brand: equipmentBrand.trim() || null,
      equipment_model: equipmentModel.trim() || null,
      equipment_serial: equipmentSerial.trim() || null,
      equipment_year: equipmentYear.trim() || null,
      problem_description: problemDescription.trim() || null,
      created_by: user.id,
    });

    if (ticketErr) {
      setError("Failed to create ticket: " + ticketErr.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/tickets");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard/tickets"
        className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: "var(--color-brand)" }}
      >
        ← Back to Tickets
      </Link>

      <h1 className="mt-3 text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
        New Ticket
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
        Create a new repair order.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && (
          <div className="rounded-lg p-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            {error}
          </div>
        )}

        {/* Customer */}
        <fieldset
          className="space-y-4 rounded-xl p-5"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <legend
            className="px-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-muted)" }}
          >
            Customer
          </legend>

          <div className="relative">
            <label className={labelClass} style={labelStyle}>
              Search or enter new customer
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCustomerName(e.target.value);
                setSelectedCustomer(null);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className={inputClass}
              style={inputStyle}
              placeholder="Start typing a customer name..."
              required
            />
            {showDropdown && searchTerm && filteredCustomers.length > 0 && (
              <ul
                className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg shadow-lg"
                style={{
                  background: "var(--color-surface-0)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {filteredCustomers.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => selectCustomer(c)}
                      className="flex w-full flex-col px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-surface-2)]"
                    >
                      <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {c.name}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {[c.phone, c.email].filter(Boolean).join(" · ")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} style={labelStyle}>Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Phone</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Address</label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </fieldset>

        {/* Equipment */}
        <fieldset
          className="space-y-4 rounded-xl p-5"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <legend
            className="px-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-muted)" }}
          >
            Equipment
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} style={labelStyle}>Type</label>
              <input
                type="text"
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="Lawn Mower, Chainsaw..."
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Brand</label>
              <input
                type="text"
                value={equipmentBrand}
                onChange={(e) => setEquipmentBrand(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="Honda, Stihl..."
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Model</label>
              <input
                type="text"
                value={equipmentModel}
                onChange={(e) => setEquipmentModel(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Year</label>
              <input
                type="text"
                value={equipmentYear}
                onChange={(e) => setEquipmentYear(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Serial Number</label>
            <input
              type="text"
              value={equipmentSerial}
              onChange={(e) => setEquipmentSerial(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </fieldset>

        {/* Service Details */}
        <fieldset
          className="space-y-4 rounded-xl p-5"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <legend
            className="px-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-muted)" }}
          >
            Service Details
          </legend>

          <div>
            <label className={labelClass} style={labelStyle}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
              style={inputStyle}
            >
              <option value="intake">Intake</option>
              <option value="diagnosing">Diagnosing</option>
              <option value="waiting_parts">Waiting on Parts</option>
              <option value="in_progress">In Progress</option>
              <option value="ready">Ready for Pickup</option>
              <option value="picked_up">Picked Up</option>
              <option value="invoiced">Invoiced</option>
            </select>
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Problem Description</label>
            <textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              rows={4}
              className={inputClass}
              style={inputStyle}
              placeholder="Describe the issue..."
            />
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: "var(--color-brand)" }}
          >
            {loading ? "Creating..." : "Create Ticket"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-[var(--color-surface-2)]"
            style={{
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}