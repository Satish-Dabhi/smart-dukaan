import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Terms of Service — SmartDukaan",
  description: "Terms and conditions governing your use of the SmartDukaan platform.",
};

export default function TermsPage() {
  const lastUpdated = "May 28, 2026";

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
              Terms of Service
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {lastUpdated}</p>
            <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of the
              SmartDukaan platform. By creating an account or using any part of SmartDukaan, you
              agree to be bound by these Terms. If you do not agree, do not use the service.
            </p>
          </div>

          <div className="space-y-10">
            <Section title="1. Definitions">
              <ul>
                <li>
                  <strong>&quot;Service&quot;</strong> means the SmartDukaan web application, APIs,
                  and all related features including POS billing, storefront, invoicing, and
                  analytics.
                </li>
                <li>
                  <strong>&quot;User&quot; / &quot;you&quot;</strong> means the individual or
                  business entity accessing the Service.
                </li>
                <li>
                  <strong>&quot;Business&quot;</strong> means a tenant account created by a Business
                  Owner on the platform.
                </li>
                <li>
                  <strong>&quot;Content&quot;</strong> means any data, products, images, or
                  information you upload or enter into the Service.
                </li>
              </ul>
            </Section>

            <Section title="2. Eligibility">
              <p>
                You must be at least 18 years old and legally capable of entering into contracts
                under Indian law to use SmartDukaan. By registering, you represent that you meet
                these requirements and that the information you provide is accurate and current.
              </p>
            </Section>

            <Section title="3. Account Registration">
              <ul>
                <li>You may register with an email/password or via Google OAuth.</li>
                <li>
                  You are responsible for maintaining the confidentiality of your account
                  credentials.
                </li>
                <li>You are responsible for all activity that occurs under your account.</li>
                <li>
                  Notify us immediately at{" "}
                  <a href="mailto:support@smartdukaan.com">support@smartdukaan.com</a> if you
                  suspect unauthorized access.
                </li>
                <li>
                  One account may be associated with one Business by default. Multi-branch plans
                  allow up to 3 businesses.
                </li>
              </ul>
            </Section>

            <Section title="4. Acceptable Use">
              <p>
                You agree <strong>not</strong> to:
              </p>
              <ul>
                <li>Use the Service for any unlawful purpose or in violation of Indian law.</li>
                <li>Upload products or content that infringes intellectual property rights.</li>
                <li>
                  Attempt to access another tenant&apos;s data or circumvent the multi-tenant
                  isolation controls.
                </li>
                <li>
                  Reverse engineer, decompile, or attempt to extract the source code of the Service.
                </li>
                <li>
                  Use automated scripts, bots, or scrapers against the Service without prior written
                  consent.
                </li>
                <li>
                  Use the Service to send spam, unsolicited WhatsApp messages, or harass customers.
                </li>
                <li>
                  Misrepresent GST numbers, HSN codes, or invoice amounts in a way that violates
                  India&apos;s GST Act.
                </li>
              </ul>
            </Section>

            <Section title="5. Subscription & Billing">
              <ul>
                <li>
                  SmartDukaan offers a Free plan and paid plans (Starter at ₹499/month, Pro at
                  ₹1,499/month).
                </li>
                <li>
                  Paid plans are billed monthly. Prices are in Indian Rupees (INR) and are inclusive
                  of applicable taxes.
                </li>
                <li>
                  You may upgrade or downgrade your plan at any time from the Billing section of
                  your dashboard.
                </li>
                <li>
                  Cancellations take effect at the end of the current billing period. No partial
                  refunds are issued for unused days.
                </li>
                <li>
                  We reserve the right to suspend accounts with overdue payments after a 7-day grace
                  period.
                </li>
              </ul>
            </Section>

            <Section title="6. Your Content & Data">
              <ul>
                <li>
                  You retain ownership of all Content you upload to the Service (product data,
                  images, customer records, etc.).
                </li>
                <li>
                  By uploading Content, you grant SmartDukaan a limited, non-exclusive license to
                  store and process that Content solely to operate the Service on your behalf.
                </li>
                <li>
                  You are solely responsible for the accuracy of your product prices, GST
                  percentages, HSN codes, and invoice details. SmartDukaan is a tool; we do not
                  verify your tax compliance.
                </li>
                <li>
                  You are responsible for obtaining appropriate consent before storing customer
                  phone numbers and personal data in the platform.
                </li>
              </ul>
            </Section>

            <Section title="7. GST & Financial Compliance">
              <p>
                SmartDukaan generates GST invoices based on the tax rates and HSN codes you
                configure. It is your responsibility as a registered business to ensure these are
                correct and compliant with the GST Act, 2017. SmartDukaan does not file GST returns
                on your behalf and is not a licensed tax advisor.
              </p>
            </Section>

            <Section title="8. Intellectual Property">
              <p>
                The SmartDukaan platform, its design, code, branding, and documentation are the
                intellectual property of SmartDukaan. Nothing in these Terms grants you any right to
                use our trademarks, logos, or branding outside of normal use of the Service.
              </p>
            </Section>

            <Section title="9. Third-Party Services">
              <p>
                SmartDukaan integrates with third-party services including Cloudinary, Resend,
                Google OAuth, Upstash Redis, and MongoDB Atlas. Your use of these integrations is
                subject to the respective providers&apos; terms of service. We are not responsible
                for any third-party service outages, data loss, or policy changes.
              </p>
            </Section>

            <Section title="10. Uptime & Service Availability">
              <p>
                We aim for high availability but do not guarantee 100% uptime. Planned maintenance
                windows will be communicated in advance where possible. The Service is provided
                &quot;as is&quot; and &quot;as available&quot; without warranties of uninterrupted
                service.
              </p>
            </Section>

            <Section title="11. Limitation of Liability">
              <p>
                To the maximum extent permitted by Indian law, SmartDukaan shall not be liable for
                any indirect, incidental, special, consequential, or punitive damages — including
                loss of revenue, loss of data, or business interruption — arising from your use of
                or inability to use the Service, even if we have been advised of the possibility of
                such damages.
              </p>
              <p>
                Our total liability to you for any claim arising from the Service shall not exceed
                the amount you paid to SmartDukaan in the three (3) months preceding the claim.
              </p>
            </Section>

            <Section title="12. Termination">
              <ul>
                <li>
                  You may terminate your account at any time from your dashboard settings or by
                  contacting support.
                </li>
                <li>
                  We may terminate or suspend your account immediately for material breach of these
                  Terms, fraudulent activity, or non-payment.
                </li>
                <li>
                  Upon termination, your access to the Service will cease. Your data will be deleted
                  within 30 days per our Privacy Policy, subject to legal retention requirements.
                </li>
              </ul>
            </Section>

            <Section title="13. Governing Law">
              <p>
                These Terms are governed by the laws of India. Any disputes shall be subject to the
                exclusive jurisdiction of courts in Ahmedabad, Gujarat, India.
              </p>
            </Section>

            <Section title="14. Changes to Terms">
              <p>
                We may update these Terms from time to time. We will notify you by updating the
                &quot;Last updated&quot; date. Continued use of the Service after changes
                constitutes acceptance. If you do not agree to updated Terms, you must stop using
                the Service.
              </p>
            </Section>

            <Section title="15. Contact">
              <p>For questions about these Terms, contact us:</p>
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
      <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-violet-600 [&_a]:hover:underline">
        {children}
      </div>
    </div>
  );
}
