import { NextRequest, NextResponse } from "next/server";
import { ConnectSchema } from "@/lib/schemas";
import { sendDemoRequestEmail, sendDemoRequestConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the incoming JSON against ConnectSchema
    const result = ConnectSchema.safeParse(body);

    if (!result.success) {
      // Formulate human-readable validation errors
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const data = result.data;

    // Fire dual notification emails asynchronously in parallel
    const [adminResult, customerResult] = await Promise.all([
      sendDemoRequestEmail(data),
      sendDemoRequestConfirmationEmail(data.email, data.name, data.businessName),
    ]);

    if (!adminResult.success) {
      console.error("[CONNECT_API] Failed to dispatch admin notification:", adminResult.error);
    }
    if (!customerResult.success) {
      console.error(
        "[CONNECT_API] Failed to dispatch customer welcome confirmation:",
        customerResult.error
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CONNECT_API] Unexpected handler error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
