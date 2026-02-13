import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function CustomersPage() {
  const supabase = await createServerSupabaseClient();

  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .order("name");

  if (error) {
    return (
      <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
        Failed to load customers: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            Customers
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {customers?.length ?? 0} customers
          </p>
        </div>
        <Link
          href="/dashboard/customers/new"
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:brightness-110"
          style={{ background: "var(--color-brand)" }}
        >
          <span className="text-lg leading-none">+</span>
          Add Customer
        </Link>
      </div>

      {/* Mobile card list */}
      <div className="mt-6 space-y-3 lg:hidden">
        {customers && customers.length > 0 ? (
          customers.map((customer) => (
            <Link
              key={customer.id}
              href={`/dashboard/customers/${customer.id}`}
              className="block rounded-xl p-4 transition-colors hover:bg-[var(--color-surface-2)]"
              style={{
                background: "var(--color-surface-0)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {customer.name}
              </p>
              <div className="mt-2 space-y-1">
                {customer.phone && (
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    <span style={{ color: "var(--color-text-muted)" }}>Phone: </span>
                    {customer.phone}
                  </p>
                )}
                {customer.email && (
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    <span style={{ color: "var(--color-text-muted)" }}>Email: </span>
                    {customer.email}
                  </p>
                )}
                {customer.address && (
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {customer.address}
                  </p>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: "var(--color-surface-0)", border: "2px dashed var(--color-border)" }}
          >
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No customers yet.</p>
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
                {["Name", "Phone", "Email", "Address"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)", background: "var(--color-surface-2)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers && customers.length > 0 ? (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition-colors hover:bg-[var(--color-surface-2)]"
                    style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/dashboard/customers/${customer.id}`}
                        className="font-medium hover:underline"
                        style={{ color: "var(--color-brand)" }}
                      >
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "var(--color-text-secondary)" }}>
                      {customer.phone || "—"}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "var(--color-text-secondary)" }}>
                      {customer.email || "—"}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "var(--color-text-secondary)" }}>
                      {customer.address || "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center" style={{ color: "var(--color-text-muted)" }}>
                    No customers yet.
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
