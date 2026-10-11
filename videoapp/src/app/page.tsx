import Link from "next/link";
import { env } from "@/lib/env";

export default function Home() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-5xl font-black tracking-tight">{env.brandName()}</h1>
      <p className="mt-4 text-muted">One product photo in. A scroll-stopping 9:16 ad out.</p>
      <Link href="/signup" className="btn-primary mt-8">Get free credits</Link>
    </section>
  );
}
