import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { afterSignup } from "@/lib/signup";

// Google OAuth / email-confirmation PKCE callback.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/dashboard";
  if (!next.startsWith("/") || next.startsWith("//")) next = "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // First login via Google / email confirmation: referral + welcome bonus (both idempotent).
      if (data.user) await afterSignup(data.user.id).catch((e) => console.error("[afterSignup]", e));
      const forwardedHost = request.headers.get("x-forwarded-host");
      const base = process.env.NODE_ENV !== "development" && forwardedHost ? `https://${forwardedHost}` : origin;
      return NextResponse.redirect(`${base}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
