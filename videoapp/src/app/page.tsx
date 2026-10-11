import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Faq, FAQ_ITEMS } from "@/components/landing/faq";
import { ScrollFilm, type Beat } from "@/components/landing/scroll-film";
import { PresetRows } from "@/components/presets/preset-rows";
import { PricingCards } from "@/components/pricing-cards";
import { SIGNUP_BONUS_CREDITS } from "@/lib/pricing";
import { CATEGORIES, listPresetCards } from "@/lib/presets";

const FILM_FRAMES = 72; // public/film/manifest.json

const PROOF = [
  { k: "Cost before you click", v: "Every generation shows its credit price up front. Failed clips are refunded automatically." },
  { k: "Yours to run as ads", v: "Commercial use included. Built for TikTok Shop, Shopify and Meta placements." },
  { k: "Safe by design", v: "No celebrities, no deepfakes, no minors. Consent is logged for every photo of a person." },
];

export default async function Home() {
  const [cards, user] = await Promise.all([listPresetCards(), getSessionUser()]);
  const start = user ? "/presets" : "/signup";
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const beats: Beat[] = [
    {
      from: 0,
      to: 0.33,
      content: (
        <div>
          <p className="mb-4 text-sm text-muted md:mb-5">AI video ads for small brands</p>
          <h1 className="display text-[clamp(40px,7.2vw,96px)]">
            One product
            <br />
            photo in.
          </h1>
          <p className="mt-4 max-w-md text-base text-white/75 md:mt-6 md:text-lg md:text-muted">The photo from your store listing is the whole brief. No studio, no editor, no prompts.</p>
          <p className="mt-10 hidden text-xs text-subtle md:block">Scroll ↓</p>
        </div>
      ),
    },
    {
      from: 0.33,
      to: 0.66,
      content: (
        <div>
          <h2 className="display text-[clamp(36px,6vw,80px)]">Pick a look.</h2>
          <p className="mt-4 max-w-md text-base text-white/75 md:mt-6 md:text-lg md:text-muted">
            360 spins, crash zooms, unboxings, creator UGC and this week&apos;s viral effects — {cards.length} presets with the camera move,
            model and prompt already tuned.
          </p>
          <ul className="mt-5 hidden max-w-md flex-wrap md:flex gap-2 text-sm">
            {["360 Spin", "Crash Zoom", "Unboxing", "Melt", "Earth Zoom Out"].map((t) => (
              <li key={t} className="rounded-full bg-ghost px-3 py-1 text-soft">{t}</li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      from: 0.66,
      to: 1,
      content: (
        <div>
          <h2 className="display text-[clamp(36px,6vw,80px)]">
            Post a scroll-
            <br />
            stopping ad.
          </h2>
          <p className="mt-4 max-w-md text-base text-white/75 md:mt-6 md:text-lg md:text-muted">A vertical 9:16 clip in about a minute — ready for TikTok, Reels and Shorts.</p>
          <div className="mt-6 flex flex-wrap gap-3 md:mt-8">
            <Link href={start} className="btn-primary !px-5 !py-3 !text-[15px]" data-testid="hero-cta">
              {user ? "Make a video" : "Make your first ad free"}
            </Link>
            <Link href="#presets" className="btn-ghost !py-3">See presets</Link>
          </div>
          <p className="mt-4 text-xs text-subtle">{SIGNUP_BONUS_CREDITS} free credits · no card required</p>
        </div>
      ),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <ScrollFilm frameCount={FILM_FRAMES} beats={beats} poster="/film/desktop/frame-0001.webp" label="A product photo turning into a finished vertical video ad" />

      <section className="mx-auto max-w-6xl px-4 pt-24" id="presets">
        <div className="mb-12 flex items-end justify-between gap-6">
          <h2 className="display max-w-2xl text-[clamp(36px,5vw,56px)]">Presets that sell.</h2>
          <Link href="/presets" className="btn-ghost hidden shrink-0 sm:inline-flex">All presets</Link>
        </div>
        <PresetRows categories={CATEGORIES} presets={cards} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-24">
        <Link href="/ugc" className="group grid items-center gap-6 rounded-[32px] border border-border p-8 transition hover:border-white/25 md:grid-cols-[1fr_auto] md:p-12" data-testid="home-ugc">
          <div>
            <p className="text-sm text-muted">New · UGC Ad Studio</p>
            <h2 className="display mt-2 max-w-2xl text-[clamp(32px,4.5vw,56px)]">UGC ads without hiring creators.</h2>
            <p className="mt-3 max-w-xl text-muted">AI creators hold your product and pitch it to camera — scripts, voice, captions and end card included.</p>
          </div>
          <span className="btn-ghost shrink-0 group-hover:bg-surface-2">Open the studio →</span>
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-24">
        <div className="rounded-[32px] bg-wash p-8 md:p-12">
          <h2 className="display max-w-xl text-[clamp(32px,4vw,48px)]">Brands pay $2k for this ad. It takes 30 seconds here.</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {PROOF.map((p) => (
              <div key={p.k}>
                <h3 className="font-semibold tracking-[-0.02em]">{p.k}</h3>
                <p className="mt-2 text-sm text-muted">{p.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-24" id="pricing">
        <h2 className="display text-[clamp(36px,5vw,56px)]">Pricing</h2>
        <p className="mt-3 mb-10 text-muted">Pay for what you make. Credits never expire.</p>
        <PricingCards loggedIn={!!user} />
      </section>

      <section className="mx-auto max-w-3xl px-4 pt-24" id="faq">
        <h2 className="display mb-8 text-[clamp(36px,5vw,56px)]">Questions</h2>
        <Faq />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-24">
        <div className="flex flex-col items-start gap-6 border-t border-border pt-16 md:flex-row md:items-end md:justify-between">
          <h2 className="display max-w-2xl text-[clamp(36px,5vw,64px)]">Your next ad is one photo away.</h2>
          <Link href={start} className="btn-primary !px-5 !py-3 !text-[15px]">
            {user ? "Make a video" : `Get ${SIGNUP_BONUS_CREDITS} free credits`}
          </Link>
        </div>
      </section>
    </>
  );
}
