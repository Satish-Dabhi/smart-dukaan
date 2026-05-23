import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Graceful degradation: if Upstash is not configured, all checks pass.
// Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in .env to enable.

function createLimiter(maxRequests: number, window: string) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, window as `${number} ${"ms" | "s" | "m" | "h" | "d"}`),
    analytics: false,
  });
}

// Registration: 5 attempts per 15 minutes per IP
const registerLimiter = createLimiter(5, "15 m");

// OTP send (register verify + forgot-password): 3 per 10 minutes per IP
const otpLimiter = createLimiter(3, "10 m");

// OTP verify: 10 attempts per 10 minutes per IP (prevent brute-force of 6-digit OTP)
const otpVerifyLimiter = createLimiter(10, "10 m");

// Password reset submit: 5 per 15 minutes per IP
const resetPasswordLimiter = createLimiter(5, "15 m");

// Login is handled by NextAuth — rate-limit the credential sign-in endpoint
const loginLimiter = createLimiter(10, "5 m");

// Customer register: 5 per 15 minutes per IP
const customerRegisterLimiter = createLimiter(5, "15 m");

type LimitResult = { allowed: boolean; retryAfterSeconds?: number };

async function check(limiter: Ratelimit | null, key: string): Promise<LimitResult> {
  if (!limiter) return { allowed: true };
  const { success, reset } = await limiter.limit(key);
  if (success) return { allowed: true };
  const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
  return { allowed: false, retryAfterSeconds };
}

export function getClientIp(req: Request): string {
  const forwarded = (req.headers as Headers).get("x-forwarded-for");
  const real = (req.headers as Headers).get("x-real-ip");
  return (forwarded?.split(",")[0] ?? real ?? "unknown").trim();
}

export async function checkRegisterLimit(ip: string): Promise<LimitResult> {
  return check(registerLimiter, `register:${ip}`);
}

export async function checkOtpLimit(ip: string): Promise<LimitResult> {
  return check(otpLimiter, `otp:${ip}`);
}

export async function checkOtpVerifyLimit(ip: string): Promise<LimitResult> {
  return check(otpVerifyLimiter, `otp_verify:${ip}`);
}

export async function checkResetPasswordLimit(ip: string): Promise<LimitResult> {
  return check(resetPasswordLimiter, `reset_pw:${ip}`);
}

export async function checkLoginLimit(ip: string): Promise<LimitResult> {
  return check(loginLimiter, `login:${ip}`);
}

export async function checkCustomerRegisterLimit(ip: string): Promise<LimitResult> {
  return check(customerRegisterLimiter, `customer_reg:${ip}`);
}
