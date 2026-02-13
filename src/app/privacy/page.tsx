import Link from "next/link";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Last updated: February 12, 2026
          </p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                1. Information We Collect
              </h2>
              <p>
                When you use FullStroke, we collect information you provide directly, including your name, email address, and shop name during account creation. We also collect the business data you enter into the Service, such as customer records, repair tickets, and parts inventory.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                2. How We Use Your Information
              </h2>
              <p>
                We use your information to provide and maintain the Service, authenticate your account, and communicate with you about your account or the Service. We do not sell, rent, or share your personal information with third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                3. Data Storage and Security
              </h2>
              <p>
                Your data is stored securely using Supabase, a trusted cloud database provider. We implement industry-standard security measures including encryption in transit (TLS/SSL) and at rest. Access to your workspace data is restricted through row-level security policies, ensuring only authorized members of your shop can view your data.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                4. Customer Data You Enter
              </h2>
              <p>
                You may enter your customers&apos; personal information (names, phone numbers, email addresses, physical addresses) into the Service as part of managing your repair business. You are responsible for ensuring you have the right to store this information and for complying with any applicable privacy laws regarding your customers&apos; data.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                5. Data Retention
              </h2>
              <p>
                We retain your data for as long as your account is active. If you delete your account, we will delete your data within 30 days, except where we are required by law to retain it. You may request deletion of specific records at any time through the Service.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                6. Cookies and Analytics
              </h2>
              <p>
                We use essential cookies to maintain your login session. We do not use tracking cookies or third-party analytics services that track your behavior across other websites.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                7. Third-Party Services
              </h2>
              <p>
                The Service uses the following third-party providers to operate: Supabase (database and authentication), and Vercel (hosting). These providers have their own privacy policies and security practices. We do not share your data with any other third parties.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                8. Your Rights
              </h2>
              <p>
                You have the right to access, update, or delete your personal information at any time. You can update your account information through the Service or by contacting us. You may request a complete export of your data or account deletion by emailing support.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                9. Children&apos;s Privacy
              </h2>
              <p>
                The Service is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                10. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by email or through the Service. Your continued use of the Service after changes are posted constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                11. Contact
              </h2>
              <p>
                For questions or concerns about this Privacy Policy or your data, please contact us at{" "}
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