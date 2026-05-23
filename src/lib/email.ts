import nodemailer from "nodemailer";
import { escapeHtml } from "@/lib/utils";

type MailResult =
  | { success: true; messageId: string }
  | { success: true; mocked: true; otp?: string }
  | { success: false; error: string; otp?: string };

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const FROM = process.env.SMTP_FROM || `"SmartDukaan" <noreply@smartdukaan.com>`;

function baseLayout(content: string) {
  return `
<div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:560px;margin:0 auto;padding:30px;border:1px solid #f0f0f0;border-radius:16px;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
  <div style="text-align:center;margin-bottom:28px;">
    <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#7c3aed,#db2777);line-height:48px;color:#fff;font-weight:900;font-size:22px;text-align:center;">S</div>
    <h2 style="margin:10px 0 0;color:#1f2937;font-size:20px;font-weight:800;">SmartDukaan</h2>
  </div>
  ${content}
  <div style="border-top:1px solid #f3f4f6;padding-top:18px;margin-top:24px;text-align:center;color:#9ca3af;font-size:11px;">
    &copy; ${new Date().getFullYear()} SmartDukaan. All rights reserved.<br/>
    <span style="font-size:10px;">If you didn't request this email, you can safely ignore it.</span>
  </div>
</div>`;
}

function otpBox(otp: string) {
  return `<div style="text-align:center;margin:28px 0;padding:18px;background:#f5f3ff;border:1px dashed #c084fc;border-radius:12px;">
    <span style="font-size:34px;font-weight:900;letter-spacing:8px;color:#7c3aed;font-family:monospace;">${otp}</span>
  </div>`;
}

async function sendMail(to: string, subject: string, html: string): Promise<MailResult> {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("==========================================================");
    console.warn(`[SMTP NOT CONFIGURED] Would have sent "${subject}" to ${to}`);
    console.warn("==========================================================");
    return { success: true, mocked: true };
  }

  try {
    const info = await transporter.sendMail({ from: FROM, to, subject, html });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL] Failed to send "${subject}" to ${to}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "SMTP send failed" };
  }
}

// ─── Email Verification OTP ────────────────────────────────────────────────

export async function sendOtpEmail(email: string, name: string, otp: string): Promise<MailResult> {
  console.log(`[EMAIL] Sending verification OTP to ${email}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("==========================================================");
    console.warn(`[SMTP NOT CONFIGURED] Verification OTP for ${email}: ${otp}`);
    console.warn("==========================================================");
    return { success: true, mocked: true, otp };
  }

  const safeName = escapeHtml(name);
  const html = baseLayout(`
    <h3 style="color:#1f2937;font-size:18px;font-weight:700;margin-bottom:8px;">Hello ${safeName},</h3>
    <p style="color:#4b5563;font-size:14px;line-height:1.7;margin-bottom:20px;">
      Thank you for signing up for <strong>SmartDukaan</strong>! To complete your registration and activate your store dashboard, please verify your email address using the code below:
    </p>
    ${otpBox(otp)}
    <p style="color:#6b7280;font-size:12px;text-align:center;line-height:1.6;">
      This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.
    </p>
  `);

  return sendMail(email, "Verify Your Email — SmartDukaan", html);
}

// ─── Forgot Password OTP ───────────────────────────────────────────────────

export async function sendForgotPasswordEmail(
  email: string,
  name: string,
  otp: string
): Promise<MailResult> {
  console.log(`[EMAIL] Sending forgot-password OTP to ${email}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("==========================================================");
    console.warn(`[SMTP NOT CONFIGURED] Password-reset OTP for ${email}: ${otp}`);
    console.warn("==========================================================");
    return { success: true, mocked: true, otp };
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const html = baseLayout(`
    <h3 style="color:#1f2937;font-size:18px;font-weight:700;margin-bottom:8px;">Hello ${safeName},</h3>
    <p style="color:#4b5563;font-size:14px;line-height:1.7;margin-bottom:20px;">
      We received a request to reset the password for your SmartDukaan account linked to <strong>${safeEmail}</strong>. Use the code below to reset it:
    </p>
    ${otpBox(otp)}
    <p style="color:#6b7280;font-size:12px;text-align:center;line-height:1.6;">
      This code expires in <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email — your password will remain unchanged.
    </p>
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px;margin-top:20px;">
      <p style="margin:0;color:#9a3412;font-size:12px;line-height:1.6;">
        <strong>Security tip:</strong> SmartDukaan will never ask for your password via email, phone, or chat.
      </p>
    </div>
  `);

  return sendMail(email, "Reset Your Password — SmartDukaan", html);
}

// ─── Order Confirmation ────────────────────────────────────────────────────

export interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  items: OrderEmailItem[];
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  notes?: string;
}

export async function sendOrderConfirmationEmail(
  email: string,
  data: OrderEmailData
): Promise<MailResult> {
  console.log(`[EMAIL] Sending order confirmation for ${data.orderNumber} to ${email}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("==========================================================");
    console.warn(`[SMTP NOT CONFIGURED] Order confirmation for ${data.orderNumber} → ${email}`);
    console.warn("==========================================================");
    return { success: true, mocked: true };
  }

  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:13px;">${escapeHtml(item.name)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:13px;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:13px;text-align:right;">₹${item.price.toLocaleString("en-IN")}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:13px;text-align:right;font-weight:600;">₹${item.total.toLocaleString("en-IN")}</td>
      </tr>`
    )
    .join("");

  const paymentLabel: Record<string, string> = {
    cod: "Cash on Delivery",
    upi: "UPI",
    card: "Card",
    online: "Online",
  };

  const html = baseLayout(`
    <div style="background:linear-gradient(135deg,#7c3aed10,#db277710);border-radius:12px;padding:18px 20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;color:#7c3aed;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Order Confirmed</p>
      <h2 style="margin:0;color:#1f2937;font-size:22px;font-weight:900;">${data.orderNumber}</h2>
    </div>

    <h3 style="color:#1f2937;font-size:16px;font-weight:700;margin-bottom:6px;">Hello ${escapeHtml(data.customerName)},</h3>
    <p style="color:#4b5563;font-size:14px;line-height:1.7;margin-bottom:22px;">
      Your order has been placed successfully! Here's a summary of what you ordered:
    </p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;border:1px solid #f3f4f6;border-radius:10px;overflow:hidden;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Item</th>
          <th style="padding:10px 12px;text-align:center;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
          <th style="padding:10px 12px;text-align:right;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Price</th>
          <th style="padding:10px 12px;text-align:right;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div style="background:#f9fafb;border-radius:10px;padding:16px 18px;margin-bottom:20px;">
      ${data.discount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#6b7280;font-size:13px;">Subtotal</span><span style="color:#374151;font-size:13px;">₹${data.subtotal.toLocaleString("en-IN")}</span></div><div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#16a34a;font-size:13px;">Discount</span><span style="color:#16a34a;font-size:13px;">- ₹${data.discount.toLocaleString("en-IN")}</span></div>` : ""}
      ${data.taxAmount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#6b7280;font-size:13px;">GST / Tax</span><span style="color:#374151;font-size:13px;">₹${data.taxAmount.toLocaleString("en-IN")}</span></div>` : ""}
      <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid #e5e7eb;margin-top:4px;">
        <span style="color:#1f2937;font-size:15px;font-weight:700;">Total</span>
        <span style="color:#7c3aed;font-size:18px;font-weight:900;">₹${data.total.toLocaleString("en-IN")}</span>
      </div>
    </div>

    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:${data.notes ? "16px" : "0"};">
      <div style="flex:1;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 14px;">
        <p style="margin:0 0 2px;color:#15803d;font-size:10px;font-weight:700;text-transform:uppercase;">Payment</p>
        <p style="margin:0;color:#166534;font-size:13px;font-weight:600;">${paymentLabel[data.paymentMethod] ?? data.paymentMethod}</p>
      </div>
    </div>

    ${data.notes ? `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px 14px;"><p style="margin:0 0 2px;color:#92400e;font-size:10px;font-weight:700;text-transform:uppercase;">Note</p><p style="margin:0;color:#78350f;font-size:13px;">${escapeHtml(data.notes)}</p></div>` : ""}
  `);

  return sendMail(email, `Order Confirmed: ${data.orderNumber} — SmartDukaan`, html);
}

// ─── Welcome Email ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, name: string): Promise<MailResult> {
  console.log(`[EMAIL] Sending welcome email to ${email}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("==========================================================");
    console.warn(`[SMTP NOT CONFIGURED] Welcome Email for ${email}`);
    console.warn("==========================================================");
    return { success: true, mocked: true };
  }

  const safeName = escapeHtml(name);
  const html = baseLayout(`
    <h3 style="color:#1f2937;font-size:18px;font-weight:700;margin-bottom:8px;">Welcome to SmartDukaan, ${safeName}!</h3>
    <p style="color:#4b5563;font-size:14px;line-height:1.7;margin-bottom:20px;">
      We're absolutely thrilled to have you on board! SmartDukaan is designed to help you create a stunning, fully-functional online storefront and manage your products and orders with ultimate ease.
    </p>
    
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px;">
      <h4 style="margin:0 0 12px;color:#0f172a;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Your Onboarding Checklist</h4>
      <table style="width:100%;border-collapse:collapse;font-size:13px;color:#334155;">
        <tr>
          <td style="padding:6px 0;width:24px;vertical-align:top;font-weight:bold;color:#7c3aed;">1.</td>
          <td style="padding:6px 0;"><strong>Setup Your Business Profile</strong><br/><span style="color:#64748b;font-size:12px;">Fill in your business name, description, and contact info to create your store.</span></td>
        </tr>
        <tr>
          <td style="padding:6px 0;width:24px;vertical-align:top;font-weight:bold;color:#7c3aed;">2.</td>
          <td style="padding:6px 0;"><strong>Add Your First Product</strong><br/><span style="color:#64748b;font-size:12px;">Upload product details, pricing, and stock status in the dashboard.</span></td>
        </tr>
        <tr>
          <td style="padding:6px 0;width:24px;vertical-align:top;font-weight:bold;color:#7c3aed;">3.</td>
          <td style="padding:6px 0;"><strong>Preview & Launch Your Storefront</strong><br/><span style="color:#64748b;font-size:12px;">Visit your dynamic store link, copy it, and share it with your customers!</span></td>
        </tr>
      </table>
    </div>

    <p style="color:#4b5563;font-size:14px;line-height:1.7;margin-bottom:24px;">
      Our guided step-by-step assistant will walk you through these actions the moment you log in, unlocking your dashboard menus as you complete each task.
    </p>

    <div style="text-align:center;margin:28px 0 20px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;font-weight:700;text-decoration:none;border-radius:10px;font-size:14px;box-shadow:0 4px 6px rgba(124,58,237,0.2);">Go to Dashboard</a>
    </div>
  `);

  return sendMail(email, "Welcome to SmartDukaan — Let's build your store!", html);
}

// ─── Business Created Congratulations Email ───────────────────────────────────

export async function sendBusinessCreatedEmail(
  email: string,
  ownerName: string,
  businessName: string,
  storeUrl: string
): Promise<MailResult> {
  console.log(`[EMAIL] Sending business created email to ${email}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("==========================================================");
    console.warn(`[SMTP NOT CONFIGURED] Business Created Email for ${email}`);
    console.warn("==========================================================");
    return { success: true, mocked: true };
  }

  const safeOwnerName = escapeHtml(ownerName);
  const safeBusinessName = escapeHtml(businessName);
  const html = baseLayout(`
    <h3 style="color:#1f2937;font-size:18px;font-weight:700;margin-bottom:8px;">Congratulations, ${safeOwnerName}!</h3>
    <p style="color:#4b5563;font-size:14px;line-height:1.7;margin-bottom:20px;">
      Your business <strong>${safeBusinessName}</strong> has been successfully created and your custom storefront is now active! 🚀
    </p>
    
    <div style="background:#f5f3ff;border:1px dashed #7c3aed;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#4b5563;font-size:13px;font-weight:600;">Your Live Storefront URL:</p>
      <a href="${storeUrl}" style="font-size:16px;font-weight:700;color:#7c3aed;word-break:break-all;text-decoration:underline;">${storeUrl}</a>
    </div>

    <p style="color:#4b5563;font-size:14px;line-height:1.7;margin-bottom:20px;">
      <strong>What's next?</strong>
      <ul style="color:#4b5563;font-size:13px;line-height:1.7;padding-left:20px;margin-top:8px;">
        <li>Add products to display them on your dynamic storefront.</li>
        <li>Share your storefront link with your customer base on WhatsApp, social media, or flyers.</li>
        <li>Receive order alerts directly, and manage full order statuses seamlessly right from your dashboard!</li>
      </ul>
    </p>

    <div style="text-align:center;margin:28px 0 20px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="display:inline-block;padding:12px 28px;background:#7c3aed;color:#fff;font-weight:700;text-decoration:none;border-radius:10px;font-size:14px;">Go to Dashboard</a>
    </div>
  `);

  return sendMail(email, `Your store is live: ${businessName} — SmartDukaan`, html);
}

// ─── Business Suspended Email ───────────────────────────────────────────────

export async function sendBusinessSuspendedEmail(
  email: string,
  ownerName: string,
  businessName: string
): Promise<MailResult> {
  console.log(`[EMAIL] Sending business suspended email to ${email}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("==========================================================");
    console.warn(`[SMTP NOT CONFIGURED] Business Suspended Email for ${email}`);
    console.warn("==========================================================");
    return { success: true, mocked: true };
  }

  const adminEmail = process.env.SMTP_USER || "admin@smartdukaan.com";

  const html = baseLayout(`
    <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
      <h3 style="margin:0;color:#b91c1c;font-size:18px;font-weight:800;">⚠️ Shop Suspended</h3>
    </div>
    
    <h3 style="color:#1f2937;font-size:16px;font-weight:700;margin-bottom:8px;">Hello ${escapeHtml(ownerName)},</h3>
    <p style="color:#4b5563;font-size:14px;line-height:1.7;margin-bottom:20px;">
      This email is to notify you that your SmartDukaan store <strong>${escapeHtml(businessName)}</strong> has been suspended by the administration.
    </p>
    
    <p style="color:#4b5563;font-size:14px;line-height:1.7;margin-bottom:20px;">
      During the suspension period, your storefront will not be accessible to customers, and your shop dashboard is locked.
    </p>

    <div style="background:#f8fafc;border-left:4px solid #94a3b8;padding:14px;margin-bottom:24px;border-radius:0 8px 8px 0;">
      <p style="margin:0;color:#475569;font-size:13px;line-height:1.6;">
        <strong>How to resolve this:</strong><br/>
        Please get in touch with our system administrator immediately to discuss the reasons for suspension and steps to reinstate your account.
      </p>
    </div>

    <div style="text-align:center;margin:28px 0 20px;">
      <a href="mailto:${adminEmail}?subject=Suspension Appeal — ${encodeURIComponent(businessName)}" style="display:inline-block;padding:12px 28px;background:#ef4444;color:#fff;font-weight:700;text-decoration:none;border-radius:10px;font-size:14px;">Contact Support</a>
    </div>
  `);

  return sendMail(email, `Urgent: Your SmartDukaan store has been suspended`, html);
}

// ─── Trial Expiring Warning ─────────────────────────────────────────────────

export async function sendTrialExpiringEmail(
  email: string,
  ownerName: string,
  businessName: string,
  daysLeft: number,
  upgradeUrl: string
): Promise<MailResult> {
  console.log(`[EMAIL] Sending trial expiring (${daysLeft}d) to ${email}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`[SMTP NOT CONFIGURED] Trial expiring (${daysLeft}d) for ${email}`);
    return { success: true, mocked: true };
  }

  const urgencyColor = daysLeft <= 1 ? "#dc2626" : daysLeft <= 3 ? "#d97706" : "#7c3aed";
  const html = baseLayout(`
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
      <p style="margin:0;color:#92400e;font-size:13px;font-weight:700;">
        ⏳ Your free trial ends in <span style="color:${urgencyColor};font-size:18px;font-weight:900;">${daysLeft} day${daysLeft === 1 ? "" : "s"}</span>
      </p>
    </div>

    <h3 style="color:#1f2937;font-size:16px;font-weight:700;margin-bottom:8px;">Hi ${escapeHtml(ownerName)},</h3>
    <p style="color:#4b5563;font-size:14px;line-height:1.7;margin-bottom:20px;">
      Your free trial for <strong>${escapeHtml(businessName)}</strong> on SmartDukaan is ending soon.
      To keep your store running without interruption, please choose a plan before your trial expires.
    </p>

    <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:18px;margin-bottom:24px;">
      <p style="margin:0 0 10px;color:#4b5563;font-size:13px;font-weight:600;">Available Plans:</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr>
          <td style="padding:8px 0;color:#374151;font-weight:700;">Starter</td>
          <td style="padding:8px 0;color:#7c3aed;font-weight:700;text-align:right;">₹499 / month</td>
        </tr>
        <tr style="border-top:1px solid #ede9fe;">
          <td style="padding:8px 0;color:#374151;font-weight:700;">Pro</td>
          <td style="padding:8px 0;color:#7c3aed;font-weight:700;text-align:right;">₹999 / month</td>
        </tr>
        <tr style="border-top:1px solid #ede9fe;">
          <td style="padding:8px 0;color:#374151;font-weight:700;">Enterprise</td>
          <td style="padding:8px 0;color:#7c3aed;font-weight:700;text-align:right;">₹2,499 / month</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;margin:28px 0 20px;">
      <a href="${upgradeUrl}" style="display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;font-weight:700;text-decoration:none;border-radius:10px;font-size:14px;box-shadow:0 4px 6px rgba(124,58,237,0.25);">
        Choose a Plan Now
      </a>
    </div>

    <p style="color:#9ca3af;font-size:12px;text-align:center;">
      If you have questions, reply to this email and we'll help you pick the right plan.
    </p>
  `);

  return sendMail(email, `⏳ Your SmartDukaan trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"} — ${businessName}`, html);
}

// ─── Trial Expired ─────────────────────────────────────────────────────────────

export async function sendTrialExpiredEmail(
  email: string,
  ownerName: string,
  businessName: string,
  upgradeUrl: string
): Promise<MailResult> {
  console.log(`[EMAIL] Sending trial expired to ${email}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`[SMTP NOT CONFIGURED] Trial expired for ${email}`);
    return { success: true, mocked: true };
  }

  const html = baseLayout(`
    <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
      <h3 style="margin:0;color:#b91c1c;font-size:17px;font-weight:800;">🔒 Your free trial has ended</h3>
    </div>

    <h3 style="color:#1f2937;font-size:16px;font-weight:700;margin-bottom:8px;">Hi ${escapeHtml(ownerName)},</h3>
    <p style="color:#4b5563;font-size:14px;line-height:1.7;margin-bottom:20px;">
      Your 30-day free trial for <strong>${escapeHtml(businessName)}</strong> has expired.
      Your store dashboard is currently restricted. Upgrade to a paid plan to restore full access immediately.
    </p>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;color:#7f1d1d;font-size:13px;line-height:1.6;">
        <strong>What's restricted:</strong> Adding products, creating invoices, viewing analytics,
        and accepting online orders are paused until you upgrade.
      </p>
    </div>

    <div style="text-align:center;margin:28px 0 20px;">
      <a href="${upgradeUrl}" style="display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;font-weight:700;text-decoration:none;border-radius:10px;font-size:14px;box-shadow:0 4px 6px rgba(220,38,38,0.25);">
        Upgrade Now — From ₹499/mo
      </a>
    </div>

    <p style="color:#9ca3af;font-size:12px;text-align:center;">
      Your data is safe and will be fully restored the moment you upgrade.
    </p>
  `);

  return sendMail(email, `🔒 Your SmartDukaan trial has ended — ${businessName}`, html);
}

// ─── Order Delivered ───────────────────────────────────────────────────────────

export async function sendOrderDeliveredEmail(
  email: string,
  customerName: string,
  orderNumber: string,
  total: number,
  invoiceUrl?: string
): Promise<MailResult> {
  console.log(`[EMAIL] Sending delivery confirmation for ${orderNumber} to ${email}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("==========================================================");
    console.warn(`[SMTP NOT CONFIGURED] Delivery confirmation for ${orderNumber} → ${email}`);
    console.warn("==========================================================");
    return { success: true, mocked: true };
  }

  const html = baseLayout(`
    <div style="background:linear-gradient(135deg,#10b98110,#059f6110);border-radius:12px;padding:18px 20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;color:#059669;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Order Delivered</p>
      <h2 style="margin:0;color:#1f2937;font-size:22px;font-weight:900;">${orderNumber}</h2>
    </div>

    <h3 style="color:#1f2937;font-size:16px;font-weight:700;margin-bottom:6px;">Hello ${escapeHtml(customerName)},</h3>
    <p style="color:#4b5563;font-size:14px;line-height:1.7;margin-bottom:22px;">
      Great news! Your order has been successfully delivered. We hope you enjoy your purchase!
    </p>

    <div style="background:#f9fafb;border-radius:10px;padding:16px 18px;margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;padding-bottom:10px;">
        <span style="color:#6b7280;font-size:13px;">Order</span>
        <span style="color:#1f2937;font-size:13px;font-weight:600;">${orderNumber}</span>
      </div>
      <div style="display:flex;justify-content:space-between;border-top:1px solid #e5e7eb;padding-top:10px;">
        <span style="color:#1f2937;font-size:15px;font-weight:700;">Total Paid</span>
        <span style="color:#7c3aed;font-size:18px;font-weight:900;">₹${total.toLocaleString("en-IN")}</span>
      </div>
    </div>

    ${invoiceUrl ? `
    <div style="text-align:center;margin:24px 0;">
      <a href="${invoiceUrl}" style="display:inline-block;padding:11px 24px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;font-weight:700;text-decoration:none;border-radius:10px;font-size:13px;">
        View &amp; Download Invoice
      </a>
    </div>` : ""}

    <p style="color:#6b7280;font-size:13px;text-align:center;line-height:1.6;margin-top:8px;">
      Thank you for shopping with us. We look forward to serving you again!
    </p>
  `);

  return sendMail(email, `Your order ${orderNumber} has been delivered!`, html);
}
