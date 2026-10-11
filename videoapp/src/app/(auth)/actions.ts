"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { googleSignInUrl, signInWithPassword, signOut, signUpWithPassword } from "@/lib/auth";

export type AuthFormState = { error?: string; message?: string; email?: string } | undefined;

const credentials = z.object({
  email: z.email("Enter a valid email.").transform((s) => s.trim().toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const safeNext = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/dashboard";
};

export async function signupAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const email = String(form.get("email") ?? "");
  const parsed = credentials.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message, email };
  const res = await signUpWithPassword(parsed.data.email, parsed.data.password);
  if (!res.ok) return { error: res.error, email };
  if (!res.user) return { message: res.message };
  redirect(safeNext(form.get("next")));
}

export async function loginAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const email = String(form.get("email") ?? "");
  const parsed = credentials.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message, email };
  const res = await signInWithPassword(parsed.data.email, parsed.data.password);
  if (!res.ok) return { error: res.error, email };
  redirect(safeNext(form.get("next")));
}

export async function googleAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const res = await googleSignInUrl(safeNext(form.get("next")));
  if ("error" in res) return { error: res.error };
  redirect(res.url);
}

export async function signOutAction() {
  await signOut();
  redirect("/");
}
