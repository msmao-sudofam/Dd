import { AuthForm } from "../auth-form";
import { isMockBackend } from "@/lib/env";

export const metadata = { title: "Login" };

export default async function Page({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const n = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return <AuthForm mode="login" next={n} mock={isMockBackend()} />;
}
