import nodemailer from "nodemailer";

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

  const html = baseLayout(`
    <h3 style="color:#1f2937;font-size:18px;font-weight:700;margin-bottom:8px;">Hello ${name},</h3>
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

export async function sendForgotPasswordEmail(email: string, name: string, otp: string): Promise<MailResult> {
  console.log(`[EMAIL] Sending forgot-password OTP to ${email}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("==========================================================");
    console.warn(`[SMTP NOT CONFIGURED] Password-reset OTP for ${email}: ${otp}`);
    console.warn("==========================================================");
    return { success: true, mocked: true, otp };
  }

  const html = baseLayout(`
    <h3 style="color:#1f2937;font-size:18px;font-weight:700;margin-bottom:8px;">Hello ${name},</h3>
    <p style="color:#4b5563;font-size:14px;line-height:1.7;margin-bottom:20px;">
      We received a request to reset the password for your SmartDukaan account linked to <strong>${email}</strong>. Use the code below to reset it:
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
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:13px;">${item.name}</td>
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

    <h3 style="color:#1f2937;font-size:16px;font-weight:700;margin-bottom:6px;">Hello ${data.customerName},</h3>
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

    ${data.notes ? `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px 14px;"><p style="margin:0 0 2px;color:#92400e;font-size:10px;font-weight:700;text-transform:uppercase;">Note</p><p style="margin:0;color:#78350f;font-size:13px;">${data.notes}</p></div>` : ""}
  `);

  return sendMail(email, `Order Confirmed: ${data.orderNumber} — SmartDukaan`, html);
}
