import { AuthForm } from "../auth-form";
import { googleSignInEnabled } from "@/lib/auth";

export const metadata = { title: "Signup" };

export default async function Page({ searchParams }: PageProps<"/signup">) {
  const { next } = await searchParams;
  const n = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return <AuthForm mode="signup" next={n} google={await googleSignInEnabled()} />;
}
