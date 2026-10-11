import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { env, isMockBackend } from "@/lib/env";
import type { Profile, SessionUser } from "@/lib/types";
import { MOCK_SESSION_COOKIE, decodeSession, encodeSession, hashPassword, verifyPassword } from "./mock-session";
import { mockCreateUser, mockFindUserByEmail } from "@/lib/db/mock";
import { createSupabaseServerClient } from "./supabase-server";

export async function getSessionUser(): Promise<SessionUser | null> {
  if (isMockBackend()) {
    return decodeSession((await cookies()).get(MOCK_SESSION_COOKIE)?.value);
  }
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return { id: claims.sub, email: (claims.email as string | undefined) ?? "" };
}

export async function requireUser(next = "/dashboard"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export function isAdminProfile(p: Pick<Profile, "role" | "email"> | null): boolean {
  if (!p) return false;
  return p.role === "admin" || env.adminEmails().includes(p.email.toLowerCase());
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return db().getProfile(user.id);
}

export async function requireProfile(next = "/dashboard"): Promise<Profile> {
  const user = await requireUser(next);
  const profile = await db().getProfile(user.id);
  if (!profile) redirect(`/login?next=${encodeURIComponent(next)}`);
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile("/admin");
  if (!isAdminProfile(profile)) redirect("/dashboard");
  return profile;
}

export type AuthResult = { ok: true; user: SessionUser | null; message?: string } | { ok: false; error: string };

async function setMockSession(user: SessionUser) {
  (await cookies()).set(MOCK_SESSION_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function signUpWithPassword(email: string, password: string): Promise<AuthResult> {
  if (isMockBackend()) {
    if (await mockFindUserByEmail(email)) return { ok: false, error: "An account with this email already exists." };
    const user = await mockCreateUser(email, await hashPassword(password));
    const session = { id: user.id, email: user.email };
    await setMockSession(session);
    return { ok: true, user: session };
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${env.appUrl()}/auth/callback?next=/dashboard` },
  });
  if (error) return { ok: false, error: error.message };
  if (!data.session) return { ok: true, user: null, message: "Check your email to confirm your account." };
  return { ok: true, user: { id: data.user!.id, email: data.user!.email ?? email } };
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  if (isMockBackend()) {
    const u = await mockFindUserByEmail(email);
    if (!u || !(await verifyPassword(password, u.password_hash))) {
      return { ok: false, error: "Invalid email or password." };
    }
    const session = { id: u.id, email: u.email };
    await setMockSession(session);
    return { ok: true, user: session };
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, user: { id: data.user.id, email: data.user.email ?? email } };
}

/** Returns the provider URL to redirect to, or an error. */
export async function googleSignInUrl(next: string): Promise<{ url: string } | { error: string }> {
  if (isMockBackend()) return { error: "Google sign-in needs Supabase keys (mock mode is on)." };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${env.appUrl()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) return { error: error?.message ?? "Could not start Google sign-in." };
  return { url: data.url };
}

export async function signOut() {
  if (isMockBackend()) {
    (await cookies()).delete(MOCK_SESSION_COOKIE);
    return;
  }
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
