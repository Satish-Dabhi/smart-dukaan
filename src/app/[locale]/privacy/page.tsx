import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Privacy Policy — SmartDukaan",
  description: "How SmartDukaan collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  const lastUpdated = "May 28, 2026";

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {lastUpdated}</p>
            <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              SmartDukaan (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the
              SmartDukaan platform — a multi-tenant SaaS application for Indian businesses. This
              Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our service.
            </p>
          </div>

          <div className="space-y-10 prose prose-gray dark:prose-invert max-w-none">
            <Section title="1. Information We Collect">
              <p>
                We collect information you provide directly and information generated through your
                use of the platform:
              </p>
              <ul>
                <li>
                  <strong>Account Information:</strong> Name, email address, phone number, and
                  password when you register.
                </li>
                <li>
                  <strong>Business Information:</strong> Business name, address, GST number,
                  slug/URL, theme preferences, and other settings you configure.
                </li>
                <li>
                  <strong>Product & Inventory Data:</strong> Product names, prices, stock levels,
                  barcodes, HSN codes, and images you upload.
                </li>
                <li>
                  <strong>Transaction Data:</strong> Orders, invoices, payment methods
                  (cash/UPI/card), and amounts processed through the POS system.
                </li>
                <li>
                  <strong>Customer Records:</strong> Customer names, phone numbers, loyalty points,
                  and purchase history that you enter during billing.
                </li>
                <li>
                  <strong>Usage Data:</strong> Pages visited, features used, session duration, and
                  browser/device information collected automatically.
                </li>
              </ul>
            </Section>

            <Section title="2. How We Use Your Information">
              <p>We use collected information to:</p>
              <ul>
                <li>
                  Provide and maintain the SmartDukaan platform and its features (POS billing,
                  storefront, invoicing, analytics).
                </li>
                <li>Generate GST-compliant invoices and financial reports for your business.</li>
                <li>Power your public storefront and WhatsApp ordering links.</li>
                <li>
                  Send transactional emails (order confirmations, invoice delivery, password
                  resets).
                </li>
                <li>
                  Enforce multi-tenant data isolation so your business data is never accessible to
                  other tenants.
                </li>
                <li>Monitor platform health, debug issues, and improve the product.</li>
                <li>Comply with applicable Indian laws and tax regulations.</li>
              </ul>
            </Section>

            <Section title="3. Multi-Tenant Data Isolation">
              <p>
                SmartDukaan is a multi-tenant platform. Every data record (products, orders,
                customers, invoices) is scoped to your <code>businessId</code>. Server-side API
                endpoints and server actions extract the business identity exclusively from your
                authenticated JWT session — your data is never accessible to other businesses on the
                platform.
              </p>
            </Section>

            <Section title="4. Data Sharing">
              <p>We do not sell your personal information. We share data only with:</p>
              <ul>
                <li>
                  <strong>Service Providers:</strong> Cloudinary (image storage), Resend/Nodemailer
                  (email delivery), Upstash Redis (rate limiting), and MongoDB Atlas (database
                  hosting). Each provider is contractually bound to protect your data.
                </li>
                <li>
                  <strong>Google OAuth:</strong> If you sign in with Google, your email and name are
                  received from Google. We do not share your data back to Google beyond the OAuth
                  flow.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose information when required by
                  Indian law, court order, or government authority.
                </li>
              </ul>
            </Section>

            <Section title="5. Data Storage & Security">
              <ul>
                <li>Data is stored on MongoDB Atlas servers with encryption at rest.</li>
                <li>All API routes and server actions are protected by Auth.js v5 JWT sessions.</li>
                <li>Rate limiting via Upstash Redis prevents abuse and brute-force attacks.</li>
                <li>
                  Role-based access control (RBAC) limits staff and customer roles to appropriate
                  data only.
                </li>
                <li>HTTPS is enforced on all connections.</li>
              </ul>
              <p>
                Despite these measures, no method of transmission over the internet is 100% secure.
                We cannot guarantee absolute security but commit to industry-standard protections.
              </p>
            </Section>

            <Section title="6. Cookies & Local Storage">
              <p>
                SmartDukaan uses session cookies issued by Auth.js for authentication. We do not use
                third-party advertising cookies. The platform may use <code>localStorage</code> for
                theme preferences (light/dark) and offline PWA caching.
              </p>
            </Section>

            <Section title="7. Your Rights">
              <p>You have the right to:</p>
              <ul>
                <li>
                  <strong>Access</strong> the personal data we hold about you.
                </li>
                <li>
                  <strong>Correct</strong> inaccurate data via your Profile settings.
                </li>
                <li>
                  <strong>Delete</strong> your account and associated business data by contacting
                  us.
                </li>
                <li>
                  <strong>Export</strong> your invoice and order data in CSV format from the
                  dashboard.
                </li>
              </ul>
              <p>
                To exercise these rights, email us at{" "}
                <a href="mailto:support@smartdukaan.com">support@smartdukaan.com</a>.
              </p>
            </Section>

            <Section title="8. Data Retention">
              <p>
                We retain your account and business data for as long as your account is active. If
                you delete your account, we will delete your personal data within 30 days, except
                where retention is required by Indian financial regulations (e.g., GST invoice
                records must be retained per GST Act requirements).
              </p>
            </Section>

            <Section title="9. Children's Privacy">
              <p>
                SmartDukaan is intended for use by business owners and is not directed to
                individuals under the age of 18. We do not knowingly collect personal information
                from minors.
              </p>
            </Section>

            <Section title="10. Changes to This Policy">
              <p>
                We may update this Privacy Policy periodically. We will notify you of significant
                changes by updating the &quot;Last updated&quot; date at the top of this page.
                Continued use of SmartDukaan after changes constitutes acceptance of the updated
                policy.
              </p>
            </Section>

            <Section title="11. Contact Us">
              <p>
                If you have questions about this Privacy Policy or our data practices, please
                contact us at:
              </p>
              <p>
                <strong>SmartDukaan</strong>
                <br />
                Ahmedabad, Gujarat, India
                <br />
                Email: <a href="mailto:support@smartdukaan.com">support@smartdukaan.com</a>
              </p>
            </Section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        {title}
      </h2>
      <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-violet-600 [&_a]:hover:underline [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm">
        {children}
      </div>
    </div>
  );
}
