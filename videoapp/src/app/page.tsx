import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Faq, FAQ_ITEMS } from "@/components/landing/faq";
import { VideoWall } from "@/components/landing/video-wall";
import { PresetGallery } from "@/components/presets/preset-gallery";
import { PresetTile } from "@/components/presets/preset-tile";
import { PricingCards } from "@/components/pricing-cards";
import { env } from "@/lib/env";
import { SIGNUP_BONUS_CREDITS } from "@/lib/pricing";
import { CATEGORIES, listPresetCards } from "@/lib/presets";

const STEPS = [
  { n: "1", title: "Pick a preset", body: "360 spin, crash zoom, unboxing, UGC, viral effects — 20+ looks tuned for short-form." },
  { n: "2", title: "Upload one photo", body: "Your product shot from your store is enough. No studio, no editor, no prompt-writing." },
  { n: "3", title: "Post the clip", body: "Get a vertical 9:16 video in about a minute, ready for TikTok, Reels and Shorts." },
];

const USE_CASES = [
  { title: "Shopify & TikTok Shop brands", body: "Turn every SKU into a scroll-stopping ad without booking a shoot." },
  { title: "Agencies & freelancers", body: "Pitch clients with five ad concepts from one product photo before the call ends." },
  { title: "Creators", body: "Animate your selfie into a hook, or test a viral effect while it's still trending." },
];

export default async function Home() {
  const [cards, user] = await Promise.all([listPresetCards(), getSessionUser()]);
  const featured = cards.filter((c) => c.is_featured);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-16 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-border px-3 py-1 text-xs text-muted">
            Brands pay $2k for this ad. It takes 30 seconds here.
          </p>
          <h1 className="text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl">
            One product photo in.
            <br />
            <span className="text-accent">A scroll-stopping ad out.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            {env.brandName()} turns a single photo into 9:16 video ads with one-click presets — no studio, no editor, no prompt engineering.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={user ? "/presets" : "/signup"} className="btn-primary !px-7 !py-3 text-base" data-testid="hero-cta">
              {user ? "Make a video" : "Make your first ad free"}
            </Link>
            <Link href="#presets" className="btn-ghost !px-7 !py-3 text-base">See presets</Link>
          </div>
          <p className="mt-4 text-xs text-muted">{SIGNUP_BONUS_CREDITS} free credits on signup · no card required · failed clips refunded</p>
        </div>
        <VideoWall presets={featured.length >= 6 ? featured : cards} />
      </section>

      <section className="border-y border-border bg-surface/50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n}>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent font-black text-accent-ink">{s.n}</div>
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16" id="presets">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Presets that sell</h2>
            <p className="mt-1 text-muted">Every look is a locked recipe — model, camera move and prompt tuned for you.</p>
          </div>
          <Link href="/presets" className="hidden text-sm text-muted hover:text-foreground sm:block">All presets →</Link>
        </div>
        <PresetGallery
          categories={CATEGORIES}
          items={cards.map((c) => ({ key: c.id, category: c.category, featured: c.is_featured, node: <PresetTile preset={c} /> }))}
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {USE_CASES.map((u) => (
            <div key={u.title} className="card p-6">
              <h3 className="font-bold">{u.title}</h3>
              <p className="mt-2 text-sm text-muted">{u.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16" id="pricing">
        <h2 className="text-3xl font-black tracking-tight">Pricing</h2>
        <p className="mt-1 mb-8 text-muted">Pay for what you make. You always see the cost before you generate.</p>
        <PricingCards loggedIn={!!user} />
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16" id="faq">
        <h2 className="mb-6 text-3xl font-black tracking-tight">FAQ</h2>
        <Faq />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="card flex flex-col items-center gap-4 border-accent/40 p-10 text-center">
          <h2 className="text-3xl font-black tracking-tight">Your next ad is one photo away.</h2>
          <Link href={user ? "/presets" : "/signup"} className="btn-primary !px-7 !py-3 text-base">
            {user ? "Make a video" : `Get ${SIGNUP_BONUS_CREDITS} free credits`}
          </Link>
        </div>
      </section>
    </>
  );
}
