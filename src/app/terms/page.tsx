import Link from "next/link";

export default function TermsPage() {
  return (
    <div
      className="flex min-h-screen justify-center px-4 py-16"
      style={{ background: "var(--color-surface-1)" }}
    >
      <div className="w-full max-w-2xl">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--color-brand)" }}
        >
          ← Back to Settings
        </Link>

        <div
          className="mt-4 rounded-xl p-6 sm:p-8"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            Terms of Service
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Last updated: February 12, 2026
          </p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using FullStroke (&quot;the Service&quot;), operated by LazyB Studios (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                2. Description of Service
              </h2>
              <p>
                FullStroke is a repair shop management platform designed for small engine repair businesses. The Service provides tools for managing repair tickets, customer records, parts inventory, and related business operations.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                3. User Accounts
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information when creating an account. You are responsible for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                4. Acceptable Use
              </h2>
              <p>
                You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, or impair the Service. You may not attempt to gain unauthorized access to any part of the Service, other accounts, or computer systems connected to the Service.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                5. Data and Content
              </h2>
              <p>
                You retain ownership of all data you enter into the Service, including customer information, ticket records, and parts inventory. You are solely responsible for the accuracy and legality of the data you provide. We do not claim ownership over your content.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                6. Service Availability
              </h2>
              <p>
                We strive to keep the Service available at all times but do not guarantee uninterrupted access. We may modify, suspend, or discontinue the Service at any time with reasonable notice. We are not liable for any downtime or service interruptions.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                7. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, LazyB Studios shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, arising from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                8. Termination
              </h2>
              <p>
                We may terminate or suspend your account at any time for violation of these terms. You may delete your account at any time by contacting support. Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                9. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                10. Contact
              </h2>
              <p>
                For questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:support@lazybstudios.com" className="font-medium hover:underline" style={{ color: "var(--color-brand)" }}>
                  support@lazybstudios.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}