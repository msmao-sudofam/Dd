import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env, isMockBackend } from "@/lib/env";

const YEAR = 60 * 60 * 24 * 365;

/** Device id (signup-bonus fingerprint) and ?ref= referral capture, for every visitor. */
function tagVisitor(request: NextRequest, response: NextResponse) {
  if (!request.cookies.get("did")) {
    response.cookies.set("did", crypto.randomUUID(), { httpOnly: true, sameSite: "lax", maxAge: YEAR, path: "/" });
  }
  const ref = request.nextUrl.searchParams.get("ref");
  if (ref && /^[a-z0-9]{4,16}$/i.test(ref)) {
    response.cookies.set("ref", ref, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
  }
  return response;
}

// Refreshes the Supabase auth session on every request (Next 16 "proxy", formerly middleware).
export async function proxy(request: NextRequest) {
  if (isMockBackend()) return tagVisitor(request, NextResponse.next({ request }));

  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.supabaseUrl(), env.supabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v as string));
      },
    },
  });
  // Must run immediately after creating the client.
  await supabase.auth.getClaims();
  return tagVisitor(request, response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/storage|mock/|presets/placeholder|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
