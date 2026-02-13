import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, workspaces(*)")
    .eq("id", user?.id || "")
    .single();

  const workspace = profile?.workspaces as { name: string; invite_code: string } | null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
        Settings
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
        Manage your shop and account.
      </p>

      <div className="mt-6 space-y-4">
        {/* Shop Info */}
        <section
          className="rounded-xl p-5"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Shop Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Shop Name</span>
              <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                {workspace?.name || "—"}
              </span>
            </div>
            <div className="flex justify-between" style={{ borderTop: "1px solid var(--color-border-subtle)", paddingTop: "0.75rem" }}>
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Invite Code</span>
              <span className="font-mono text-sm font-semibold" style={{ color: "var(--color-brand)" }}>
                {workspace?.invite_code || "—"}
              </span>
            </div>
          </div>
        </section>

        {/* Account */}
        <section
          className="rounded-xl p-5"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Account
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Name</span>
              <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                {profile?.full_name || "—"}
              </span>
            </div>
            <div className="flex justify-between" style={{ borderTop: "1px solid var(--color-border-subtle)", paddingTop: "0.75rem" }}>
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Email</span>
              <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                {user?.email || "—"}
              </span>
            </div>
            <div className="flex justify-between" style={{ borderTop: "1px solid var(--color-border-subtle)", paddingTop: "0.75rem" }}>
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Role</span>
              <span className="text-sm font-medium capitalize" style={{ color: "var(--color-text-primary)" }}>
                {profile?.role || "—"}
              </span>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section
          className="rounded-xl p-5"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Appearance
          </h2>
          <ThemeToggle />
        </section>

        {/* Invite teammates */}
        <section
          className="rounded-xl p-5"
          style={{
            background: "var(--color-brand-soft)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--color-brand)" }}>
            Invite teammates
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Share your invite code{" "}
            <span className="font-mono font-semibold" style={{ color: "var(--color-brand)" }}>
              {workspace?.invite_code || "—"}
            </span>{" "}
            with other techs to let them join your shop. They&apos;ll use this code during signup.
          </p>
        </section>

        {/* Help & Support */}
        <section
          className="rounded-xl p-5"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Help &amp; Support
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>Contact Support</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Get help with your account or report an issue</p>
              </div>
              <a
                href="mailto:support@lazybstudios.com"
                className="rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-110"
                style={{ background: "var(--color-brand)", color: "#000" }}
              >
                Email Us
              </a>
            </div>
            <div style={{ borderTop: "1px solid var(--color-border-subtle)", paddingTop: "0.75rem" }}>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Email:{" "}
                <a
                  href="mailto:support@lazybstudios.com"
                  className="font-medium hover:underline"
                  style={{ color: "var(--color-brand)" }}
                >
                  support@lazybstudios.com
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Legal */}
        <section
          className="rounded-xl p-5"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Legal
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>Terms of Service</p>
              <Link
                href="/terms"
                className="text-sm font-medium hover:underline"
                style={{ color: "var(--color-brand)" }}
              >
                View →
              </Link>
            </div>
            <div className="flex items-center justify-between" style={{ borderTop: "1px solid var(--color-border-subtle)", paddingTop: "0.75rem" }}>
              <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>Privacy Policy</p>
              <Link
                href="/privacy"
                className="text-sm font-medium hover:underline"
                style={{ color: "var(--color-brand)" }}
              >
                View →
              </Link>
            </div>
          </div>
        </section>

        {/* App version */}
        <p className="pb-8 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
          FullStroke v1.0.0 · Built by{" "}
          <a
            href="https://lazybstudios.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "var(--color-brand)" }}
          >
            LazyB Studios
          </a>
        </p>
      </div>
    </div>
  );
}