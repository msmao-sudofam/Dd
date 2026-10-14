import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { legalDocs } from "@/lib/legal";

const docs = () =>
  legalDocs(env.brandName(), process.env.LEGAL_COMPANY_NAME ?? `${env.brandName()} (operator name pending)`, process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@example.com");

export function generateStaticParams() {
  return Object.keys(docs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const d = docs()[(await params).slug];
  return d ? { title: d.title, description: d.description } : {};
}

export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const d = docs()[(await params).slug];
  if (!d) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-black tracking-tight">{d.title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated October 11, 2026</p>
      {d.sections.map((s) => (
        <section key={s.h} className="mt-8">
          <h2 className="text-lg font-bold">{s.h}</h2>
          {s.p.length > 2 ? (
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {s.p.map((p) => <li key={p}>{p}</li>)}
            </ul>
          ) : (
            s.p.map((p) => <p key={p} className="mt-2 text-sm leading-relaxed text-muted">{p}</p>)
          )}
        </section>
      ))}
    </article>
  );
}
