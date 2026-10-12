import { AuthForm } from "../auth-form";
import { isMockBackend } from "@/lib/env";

export const metadata = { title: "Login" };

export default async function Page({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const n = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  // Email scanners often open the one-time confirmation link first; the account is confirmed either way.
  const notice = error === "auth" ? "That link was already used or has expired. If you confirmed your email, log in below." : undefined;
  return <AuthForm mode="login" next={n} mock={isMockBackend()} notice={notice} />;
}
