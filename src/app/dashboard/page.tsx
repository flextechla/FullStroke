import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const [ticketRes, customerRes, partRes] = await Promise.all([
    supabase.from("tickets").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("parts").select("id", { count: "exact", head: true }),
  ]);

  const { data: recentTickets } = await supabase
    .from("tickets")
    .select("id, invoice_number, customer_name, status, ticket_date, equipment_type, equipment_brand")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Total Tickets", count: ticketRes.count ?? 0, icon: "🔧", accent: "#f59e0b" },
    { label: "Customers", count: customerRes.count ?? 0, icon: "👥", accent: "#3b82f6" },
    { label: "Parts in Stock", count: partRes.count ?? 0, icon: "⚙️", accent: "#22c55e" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Welcome back. Here&apos;s your shop at a glance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-xl p-5"
            style={{
              background: "var(--color-surface-0)",
              border: "1px solid var(--color-border-subtle)",
            }}
          >
            <div
              className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
              style={{ background: stat.accent }}
            />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                  {stat.count}
                </p>
              </div>
              <span className="text-3xl opacity-40">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="mt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Recent Tickets
        </h2>
        <div
          className="overflow-hidden rounded-xl"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          {recentTickets && recentTickets.length > 0 ? (
            <div>
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/dashboard/tickets/${ticket.id}`}
                  className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--color-surface-2)]"
                  style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-medium" style={{ color: "var(--color-brand)" }}>
                        {ticket.invoice_number || "—"}
                      </span>
                      <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {ticket.customer_name || "No customer"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {[ticket.equipment_brand, ticket.equipment_type]
                        .filter(Boolean)
                        .join(" ") || "No equipment info"}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize"
                      style={{
                        background: "var(--color-surface-3)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {ticket.status?.replace(/_/g, " ") || "intake"}
                    </span>
                    <p className="mt-1 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                      {ticket.ticket_date
                        ? new Date(ticket.ticket_date).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                No tickets yet. Create your first one to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}