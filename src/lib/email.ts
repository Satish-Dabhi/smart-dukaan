import nodemailer from "nodemailer";
import { escapeHtml } from "@/lib/utils";

const FROM = `SmartDukaan <${process.env.SMTP_USER}>`;
const REPLY_TO = process.env.SMTP_USER ?? "support@smartdukaan.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://smartdukaan.com";

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

type MailResult =
  | { success: true; messageId: string }
  | { success: true; mocked: true; otp?: string }
  | { success: false; error: string; otp?: string };

async function sendMail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<MailResult> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`[EMAIL DEV] Would send "${subject}" to ${to}`);
    return { success: true, mocked: true };
  }
  try {
    const transporter = createTransport();
    const info = await transporter.sendMail({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject,
      html,
      text: text ?? subject,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Failed to send "${subject}" to ${to}:`, err);
    return { success: false, error: err instanceof Error ? err.message : "Send failed" };
  }
}

// ─── Shared Layout ─────────────────────────────────────────────────────────────

function baseLayout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SmartDukaan</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed 0%,#db2777 100%);padding:28px 32px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:12px;">
              <div style="width:44px;height:44px;border-radius:10px;background:rgba(255,255,255,0.2);display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:22px;color:#fff;line-height:44px;text-align:center;">S</div>
              <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">SmartDukaan</span>
            </div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 28px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 36px;text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#374151;">SmartDukaan</p>
            <p style="margin:0 0 12px;font-size:12px;color:#6b7280;">Restaurant &amp; Business Management Platform</p>
            <p style="margin:0 0 12px;">
              <a href="${APP_URL}" style="color:#7c3aed;font-size:12px;text-decoration:none;margin:0 8px;">smartdukaan.com</a>
              <span style="color:#d1d5db;">·</span>
              <a href="mailto:support@smartdukaan.com" style="color:#7c3aed;font-size:12px;text-decoration:none;margin:0 8px;">support@smartdukaan.com</a>
            </p>
            <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
              This email was sent automatically by SmartDukaan.<br/>
              You received this because you have an account with us.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function otpBox(otp: string) {
  return `<div style="text-align:center;margin:28px 0;">
    <div style="display:inline-block;padding:20px 32px;background:#f5f3ff;border:2px dashed #7c3aed;border-radius:14px;">
      <span style="font-size:40px;font-weight:900;letter-spacing:10px;color:#7c3aed;font-family:'Courier New',Courier,monospace;">${otp}</span>
    </div>
  </div>`;
}

function ctaButton(text: string, url: string, color = "linear-gradient(135deg,#7c3aed,#db2777)") {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;padding:14px 32px;background:${color};color:#fff;font-weight:700;font-size:15px;text-decoration:none;border-radius:10px;box-shadow:0 4px 12px rgba(124,58,237,0.25);">${text}</a>
  </div>`;
}

function infoCard(items: Array<{ label: string; value: string }>) {
  const rows = items
    .map(
      (i) => `
    <tr>
      <td style="padding:10px 16px;font-size:13px;color:#6b7280;font-weight:600;background:#f9fafb;width:40%;border-bottom:1px solid #f3f4f6;">${escapeHtml(i.label)}</td>
      <td style="padding:10px 16px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">${escapeHtml(i.value)}</td>
    </tr>`
    )
    .join("");
  return `<table width="100%" style="border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #f3f4f6;margin:20px 0;">${rows}</table>`;
}

// ─── Email Verification OTP ─────────────────────────────────────────────────

export async function sendOtpEmail(email: string, name: string, otp: string): Promise<MailResult> {
  console.log(`[EMAIL] Sending verification OTP to ${email}`);
  const safeName = escapeHtml(name);
  const html = baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1f2937;">Verify your email</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.7;">
      Hi <strong>${safeName}</strong>, use the code below to verify your SmartDukaan account.
    </p>
    ${otpBox(otp)}
    <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;line-height:1.6;">
      Valid for <strong>10 minutes</strong>. Do not share this code with anyone.
    </p>
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;margin-top:20px;">
      <p style="margin:0;font-size:12px;color:#92400e;">
        <strong>Security:</strong> SmartDukaan will never ask for this code via phone, chat, or email.
      </p>
    </div>
  `);
  return sendMail(email, `${otp} — Verify your SmartDukaan account`, html);
}

// ─── Forgot Password OTP ────────────────────────────────────────────────────

export async function sendForgotPasswordEmail(
  email: string,
  name: string,
  otp: string
): Promise<MailResult> {
  console.log(`[EMAIL] Sending password reset OTP to ${email}`);
  const safeName = escapeHtml(name);
  const html = baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1f2937;">Reset your password</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.7;">
      Hi <strong>${safeName}</strong>, here is your password reset code:
    </p>
    ${otpBox(otp)}
    <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;line-height:1.6;">
      Valid for <strong>10 minutes</strong>. If you did not request this, ignore this email.
    </p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin-top:20px;">
      <p style="margin:0;font-size:12px;color:#991b1b;">
        <strong>Security tip:</strong> SmartDukaan will never ask for your password via email or phone.
      </p>
    </div>
  `);
  return sendMail(email, `${otp} — SmartDukaan password reset code`, html);
}

// ─── Onboarding Email (merged Welcome + Business Created) ────────────────────

export async function sendOnboardingEmail(
  email: string,
  ownerName: string,
  businessName: string,
  storeUrl: string
): Promise<MailResult> {
  console.log(`[EMAIL] Sending onboarding email to ${email}`);
  const safeOwner = escapeHtml(ownerName);
  const safeBiz = escapeHtml(businessName);
  const html = baseLayout(`
    <div style="background:linear-gradient(135deg,#f5f3ff,#fdf2f8);border-radius:12px;padding:20px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;">Store is Live!</p>
      <h2 style="margin:0;font-size:26px;font-weight:900;color:#1f2937;">${safeBiz}</h2>
    </div>

    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
      Welcome aboard, <strong>${safeOwner}</strong>! Your SmartDukaan store is now active and ready to receive orders.
    </p>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Your Store URL</p>
      <a href="${storeUrl}" style="font-size:15px;font-weight:700;color:#7c3aed;word-break:break-all;">${escapeHtml(storeUrl)}</a>
    </div>

    <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#1f2937;">Get started in 3 steps:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${[
        ["1", "Add your products", "Upload photos, prices, and stock to your catalog"],
        [
          "2",
          "Share your store",
          "Send your store URL to customers on WhatsApp &amp; social media",
        ],
        ["3", "Manage from dashboard", "Track orders, invoices, and analytics in real-time"],
      ]
        .map(
          ([num, title, desc]) => `
      <tr>
        <td style="width:36px;padding:8px 12px 8px 0;vertical-align:top;">
          <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;font-weight:800;font-size:14px;text-align:center;line-height:28px;">${num}</div>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
          <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#1f2937;">${title}</p>
          <p style="margin:0;font-size:12px;color:#6b7280;">${desc}</p>
        </td>
      </tr>`
        )
        .join("")}
    </table>

    ${ctaButton("Go to Dashboard &rarr;", `${APP_URL}/dashboard`)}

    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
      Your 30-day free trial has started. No credit card required.
    </p>
  `);
  return sendMail(email, `Your SmartDukaan store "${businessName}" is live!`, html);
}

// Keep old names as aliases for backward compatibility
export const sendWelcomeEmail = (email: string, name: string) =>
  sendOnboardingEmail(email, name, "", APP_URL + "/dashboard");
export const sendBusinessCreatedEmail = (
  email: string,
  ownerName: string,
  businessName: string,
  storeUrl: string
) => sendOnboardingEmail(email, ownerName, businessName, storeUrl);

// ─── Order Confirmation — REMOVED (customers see success on screen) ──────────

export async function sendOrderConfirmationEmail(): Promise<MailResult> {
  return { success: true, mocked: true };
}

// ─── Order Delivered ────────────────────────────────────────────────────────

export async function sendOrderDeliveredEmail(
  email: string,
  customerName: string,
  orderNumber: string,
  total: number,
  invoiceUrl?: string
): Promise<MailResult> {
  console.log(`[EMAIL] Sending delivery confirmation for ${orderNumber} to ${email}`);
  const safeName = escapeHtml(customerName);
  const html = baseLayout(`
    <div style="background:linear-gradient(135deg,#ecfdf5,#f0fdf4);border-radius:12px;padding:20px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:1px;">Order Delivered</p>
      <h2 style="margin:0;font-size:26px;font-weight:900;color:#1f2937;">${escapeHtml(orderNumber)}</h2>
    </div>

    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
      Hi <strong>${safeName}</strong>, your order has been delivered. Thank you for shopping with us!
    </p>

    <div style="background:#f9fafb;border-radius:10px;padding:18px;margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
        <span style="font-size:13px;color:#6b7280;">Order</span>
        <span style="font-size:13px;font-weight:600;color:#374151;">${escapeHtml(orderNumber)}</span>
      </div>
      <div style="border-top:1px solid #e5e7eb;padding-top:12px;display:flex;justify-content:space-between;">
        <span style="font-size:15px;font-weight:700;color:#1f2937;">Total Paid</span>
        <span style="font-size:20px;font-weight:900;color:#7c3aed;">&#8377;${total.toLocaleString("en-IN")}</span>
      </div>
    </div>

    ${invoiceUrl ? ctaButton("View &amp; Download Invoice", invoiceUrl, "#7c3aed") : ""}

    <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;">
      We look forward to serving you again!
    </p>
  `);
  return sendMail(email, `Order ${orderNumber} delivered — SmartDukaan`, html);
}

// ─── Business Suspended ────────────────────────────────────────────────────

export async function sendBusinessSuspendedEmail(
  email: string,
  ownerName: string,
  businessName: string
): Promise<MailResult> {
  console.log(`[EMAIL] Sending suspension notice to ${email}`);
  const html = baseLayout(`
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;text-align:center;margin-bottom:28px;">
      <h2 style="margin:0;font-size:20px;font-weight:800;color:#b91c1c;">Store Suspended</h2>
    </div>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
      Hi <strong>${escapeHtml(ownerName)}</strong>, your store <strong>${escapeHtml(businessName)}</strong> has been suspended by administration.
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#4b5563;line-height:1.7;">
      During suspension, your storefront is offline and dashboard access is restricted.
    </p>
    ${ctaButton("Contact Support", "mailto:support@smartdukaan.com?subject=Suspension Appeal", "#ef4444")}
  `);
  return sendMail(email, `Important: Your SmartDukaan store has been suspended`, html);
}

// ─── Trial Expiring ────────────────────────────────────────────────────────

export async function sendTrialExpiringEmail(
  email: string,
  ownerName: string,
  businessName: string,
  daysLeft: number,
  upgradeUrl: string
): Promise<MailResult> {
  console.log(`[EMAIL] Sending trial expiring (${daysLeft}d) to ${email}`);
  const urgency = daysLeft <= 1 ? "#dc2626" : daysLeft <= 3 ? "#d97706" : "#7c3aed";
  const html = baseLayout(`
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:20px;text-align:center;margin-bottom:28px;">
      <p style="margin:0;font-size:14px;font-weight:700;color:#92400e;">
        Trial ends in <span style="color:${urgency};font-size:26px;font-weight:900;">${daysLeft}</span> day${daysLeft === 1 ? "" : "s"}
      </p>
    </div>

    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
      Hi <strong>${escapeHtml(ownerName)}</strong>, your free trial for <strong>${escapeHtml(businessName)}</strong> is ending soon.
      Upgrade now to keep your store running without interruption.
    </p>

    <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#374151;">Available Plans</p>
      ${[
        ["Starter", "&#8377;499/mo"],
        ["Pro", "&#8377;999/mo"],
        ["Enterprise", "&#8377;2,499/mo"],
      ]
        .map(
          ([plan, price]) =>
            `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #ede9fe;">
          <span style="font-size:14px;font-weight:600;color:#374151;">${plan}</span>
          <span style="font-size:14px;font-weight:700;color:#7c3aed;">${price}</span>
        </div>`
        )
        .join("")}
    </div>

    ${ctaButton("Choose a Plan &rarr;", upgradeUrl)}

    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
      Reply to this email if you have questions about plans.
    </p>
  `);
  return sendMail(
    email,
    `${daysLeft} day${daysLeft === 1 ? "" : "s"} left on your SmartDukaan trial — ${businessName}`,
    html
  );
}

// ─── Trial Expired ─────────────────────────────────────────────────────────

export async function sendTrialExpiredEmail(
  email: string,
  ownerName: string,
  businessName: string,
  upgradeUrl: string
): Promise<MailResult> {
  console.log(`[EMAIL] Sending trial expired notice to ${email}`);
  const html = baseLayout(`
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;text-align:center;margin-bottom:28px;">
      <h2 style="margin:0;font-size:20px;font-weight:800;color:#b91c1c;">Free Trial Ended</h2>
    </div>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
      Hi <strong>${escapeHtml(ownerName)}</strong>, your 30-day trial for <strong>${escapeHtml(businessName)}</strong> has expired.
      Your store dashboard is now restricted.
    </p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#7f1d1d;">
        <strong>Restricted features:</strong> Adding products, creating invoices, analytics, and online orders are paused.
        Your data is safe and will be fully restored when you upgrade.
      </p>
    </div>
    ${ctaButton("Upgrade Now &mdash; from &#8377;499/mo", upgradeUrl, "#dc2626")}
  `);
  return sendMail(email, `Your SmartDukaan trial has ended — ${businessName}`, html);
}

// ─── Subscription Activated ─────────────────────────────────────────────────

export async function sendSubscriptionActivatedEmail(
  email: string,
  ownerName: string,
  businessName: string,
  planName: string,
  expiresAt: Date
): Promise<MailResult> {
  console.log(`[EMAIL] Sending subscription activated to ${email}`);
  const html = baseLayout(`
    <div style="background:linear-gradient(135deg,#ecfdf5,#f0fdf4);border-radius:12px;padding:20px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:1px;">Subscription Active</p>
      <h2 style="margin:0;font-size:26px;font-weight:900;color:#1f2937;">${escapeHtml(planName)} Plan</h2>
    </div>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
      Hi <strong>${escapeHtml(ownerName)}</strong>! Your <strong>${escapeHtml(businessName)}</strong> is now on the <strong>${escapeHtml(planName)}</strong> plan.
      Your store is fully powered up.
    </p>
    ${infoCard([
      { label: "Plan", value: planName },
      { label: "Business", value: businessName },
      {
        label: "Valid Until",
        value: expiresAt.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      },
    ])}
    ${ctaButton("Go to Dashboard", `${APP_URL}/dashboard`)}
  `);
  return sendMail(email, `You're on the ${planName} plan — SmartDukaan`, html);
}

// ─── Payment Success ────────────────────────────────────────────────────────

export async function sendPaymentSuccessEmail(
  email: string,
  ownerName: string,
  businessName: string,
  amount: number,
  planName: string,
  transactionId: string
): Promise<MailResult> {
  console.log(`[EMAIL] Sending payment success to ${email}`);
  const html = baseLayout(`
    <div style="background:linear-gradient(135deg,#ecfdf5,#f0fdf4);border-radius:12px;padding:20px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:1px;">Payment Received</p>
      <h2 style="margin:0;font-size:32px;font-weight:900;color:#1f2937;">&#8377;${amount.toLocaleString("en-IN")}</h2>
    </div>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
      Hi <strong>${escapeHtml(ownerName)}</strong>, we've received your payment for <strong>${escapeHtml(businessName)}</strong>.
    </p>
    ${infoCard([
      { label: "Amount", value: `₹${amount.toLocaleString("en-IN")}` },
      { label: "Plan", value: planName },
      { label: "Transaction ID", value: transactionId },
      { label: "Business", value: businessName },
    ])}
    ${ctaButton("Go to Dashboard", `${APP_URL}/dashboard`)}
    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">Save this email as your payment confirmation.</p>
  `);
  return sendMail(
    email,
    `Payment of ₹${amount.toLocaleString("en-IN")} received — SmartDukaan`,
    html
  );
}

// ─── Employee Invitation ────────────────────────────────────────────────────

export async function sendEmployeeInvitationEmail(
  email: string,
  employeeName: string,
  ownerName: string,
  businessName: string,
  tempPassword: string,
  loginUrl: string
): Promise<MailResult> {
  console.log(`[EMAIL] Sending employee invitation to ${email}`);
  const html = baseLayout(`
    <div style="background:linear-gradient(135deg,#f5f3ff,#fdf2f8);border-radius:12px;padding:20px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;">You're Invited!</p>
      <h2 style="margin:0;font-size:22px;font-weight:900;color:#1f2937;">${escapeHtml(businessName)}</h2>
    </div>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
      Hi <strong>${escapeHtml(employeeName)}</strong>, <strong>${escapeHtml(ownerName)}</strong> has invited you to manage
      <strong>${escapeHtml(businessName)}</strong> on SmartDukaan.
    </p>
    ${infoCard([
      { label: "Email", value: email },
      { label: "Temporary Password", value: tempPassword },
    ])}
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#92400e;">
        <strong>Important:</strong> Change your password immediately after your first login.
      </p>
    </div>
    ${ctaButton("Accept Invitation &amp; Login", loginUrl)}
  `);
  return sendMail(email, `${ownerName} invited you to join ${businessName} on SmartDukaan`, html);
}

// ─── Demo Request (admin notification) ─────────────────────────────────────

export async function sendDemoRequestEmail(details: {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  businessType: string;
  notes?: string;
}): Promise<MailResult> {
  const adminEmail = process.env.SMTP_USER || process.env.ADMIN_EMAIL || "admin@smartdukaan.com";
  const html = baseLayout(`
    <div style="background:linear-gradient(135deg,#f5f3ff,#fdf2f8);border-radius:12px;padding:20px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;">New Demo Request</p>
      <h2 style="margin:0;font-size:22px;font-weight:900;color:#1f2937;">${escapeHtml(details.businessName)}</h2>
    </div>
    ${infoCard([
      { label: "Name", value: details.name },
      { label: "Business", value: details.businessName },
      { label: "Email", value: details.email },
      { label: "Phone", value: details.phone },
      { label: "Business Type", value: details.businessType },
    ])}
    ${details.notes ? `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px;"><p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;">Message</p><p style="margin:0;font-size:13px;color:#78350f;">${escapeHtml(details.notes)}</p></div>` : ""}
  `);
  return sendMail(adminEmail, `New Demo Request: ${details.businessName} (${details.name})`, html);
}

export async function sendDemoRequestConfirmationEmail(
  email: string,
  name: string,
  businessName: string
): Promise<MailResult> {
  console.log(`[EMAIL] Sending demo confirmation to ${email}`);
  const html = baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1f2937;">We got your request!</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
      Hi <strong>${escapeHtml(name)}</strong>, thank you for requesting a demo for <strong>${escapeHtml(businessName)}</strong>.
      Our team will reach out within 24 hours to schedule a personalized walkthrough.
    </p>
    <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#374151;">What you'll see in the demo:</p>
      ${[
        "Custom storefront with QR ordering",
        "Cloud POS billing system",
        "GST-compliant invoicing",
        "Analytics dashboard",
        "Multi-staff management",
      ]
        .map(
          (f) =>
            `<p style="margin:0 0 8px;font-size:13px;color:#4b5563;padding-left:16px;">&#10003; ${f}</p>`
        )
        .join("")}
    </div>
    ${ctaButton("Explore SmartDukaan", APP_URL)}
  `);
  return sendMail(email, `We received your SmartDukaan demo request — ${businessName}`, html);
}

// ─── Daily Sales Summary ────────────────────────────────────────────────────

export async function sendDailySummaryEmail(
  email: string,
  ownerName: string,
  businessName: string,
  summary: {
    date: string;
    totalOrders: number;
    totalRevenue: number;
    topProduct?: string;
    newCustomers: number;
  }
): Promise<MailResult> {
  console.log(`[EMAIL] Sending daily summary to ${email}`);
  const html = baseLayout(`
    <div style="background:linear-gradient(135deg,#f5f3ff,#fdf2f8);border-radius:12px;padding:20px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;">Daily Sales Report</p>
      <h2 style="margin:0;font-size:22px;font-weight:900;color:#1f2937;">${escapeHtml(summary.date)}</h2>
    </div>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;">
      Hi <strong>${escapeHtml(ownerName)}</strong>, here is yesterday's summary for <strong>${escapeHtml(businessName)}</strong>:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        ${[
          { label: "Orders", value: String(summary.totalOrders), color: "#7c3aed" },
          {
            label: "Revenue",
            value: `&#8377;${summary.totalRevenue.toLocaleString("en-IN")}`,
            color: "#059669",
          },
          { label: "New Customers", value: String(summary.newCustomers), color: "#d97706" },
        ]
          .map(
            (s) => `<td style="text-align:center;padding:0 8px;">
          <div style="background:#f9fafb;border-radius:10px;padding:16px 12px;">
            <p style="margin:0 0 4px;font-size:24px;font-weight:900;color:${s.color};">${s.value}</p>
            <p style="margin:0;font-size:12px;color:#6b7280;">${s.label}</p>
          </div>
        </td>`
          )
          .join("")}
      </tr>
    </table>
    ${summary.topProduct ? `<p style="margin:0 0 20px;font-size:13px;color:#4b5563;text-align:center;">Top product: <strong>${escapeHtml(summary.topProduct)}</strong></p>` : ""}
    ${ctaButton("View Full Analytics", `${APP_URL}/dashboard/analytics`)}
  `);
  return sendMail(
    email,
    `Daily Report: ${summary.totalOrders} orders, ₹${summary.totalRevenue.toLocaleString("en-IN")} revenue — ${businessName}`,
    html
  );
}
