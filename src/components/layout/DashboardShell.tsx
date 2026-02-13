"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/dashboard/tickets", label: "Tickets", icon: "🔧" },
  { href: "/dashboard/customers", label: "Customers", icon: "👥" },
  { href: "/dashboard/parts", label: "Parts", icon: "⚙️" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚡" },
];

export default function DashboardShell({
  shopName,
  userName,
  userRole,
  children,
}: {
  shopName: string;
  userName: string;
  userRole: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen" style={{ background: "var(--color-surface-1)" }}>
      {/* ── Desktop sidebar ────────────────────────────────── */}
      <aside
        className="hidden lg:flex lg:w-64 lg:flex-col"
        style={{
          background: "var(--color-surface-0)",
          borderRight: "1px solid var(--color-border-subtle)",
        }}
      >
        {/* Logo / Shop name */}
        <div
          className="flex h-16 items-center gap-3 px-5"
          style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-black"
            style={{ background: "var(--color-brand)" }}
          >
            FS
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {shopName}
            </p>
            <p
              className="text-[11px] capitalize"
              style={{ color: "var(--color-text-muted)" }}
            >
              {userRole}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                style={{
                  background: isActive ? "var(--color-brand-soft)" : "transparent",
                  color: isActive ? "var(--color-brand)" : "var(--color-text-secondary)",
                  borderLeft: isActive ? "3px solid var(--color-brand)" : "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--color-surface-2)";
                    e.currentTarget.style.color = "var(--color-text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--color-text-secondary)";
                  }
                }}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div className="p-4" style={{ borderTop: "1px solid var(--color-border-subtle)" }}>
          <div className="mb-3 flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
              style={{
                background: "var(--color-surface-3)",
                color: "var(--color-text-secondary)",
              }}
            >
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                {userName}
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Signed in
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full rounded-lg px-3 py-2 text-xs font-medium transition-all"
            style={{
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-surface-2)";
              e.currentTarget.style.borderColor = "var(--color-brand)";
              e.currentTarget.style.color = "var(--color-brand)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.color = "var(--color-text-secondary)";
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content area ──────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header
          className="flex h-14 items-center justify-between px-4 lg:hidden"
          style={{
            background: "var(--color-surface-0)",
            borderBottom: "1px solid var(--color-border-subtle)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-black"
              style={{ background: "var(--color-brand)" }}
            >
              FS
            </div>
            <h1
              className="truncate text-sm font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {shopName}
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs font-medium"
            style={{ color: "var(--color-text-muted)" }}
          >
            Sign out
          </button>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8"
          style={{ background: "var(--color-surface-1)" }}
        >
          {children}
        </main>
      </div>

      {/* ── Mobile bottom tab bar ──────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around lg:hidden"
        style={{
          background: "var(--color-surface-0)",
          borderTop: "1px solid var(--color-border-subtle)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-all"
              style={{
                color: isActive ? "var(--color-brand)" : "var(--color-text-muted)",
                borderTop: isActive ? "2px solid var(--color-brand)" : "2px solid transparent",
              }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}