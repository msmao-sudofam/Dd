import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { ClipWall } from "@/components/landing/clip-wall";
import { CreatorFan } from "@/components/landing/creator-fan";
import { Faq, FAQ_ITEMS } from "@/components/landing/faq";
import { ScrollFilm, type Beat } from "@/components/landing/scroll-film";
import { LazyVideo } from "@/components/lazy-video";
import { PresetRows } from "@/components/presets/preset-rows";
import { PricingCards } from "@/components/pricing-cards";
import { db } from "@/lib/db";
import { SIGNUP_BONUS_CREDITS } from "@/lib/pricing";
import { CATEGORIES, listPresetCards } from "@/lib/presets";

const FILM_FRAMES = 72; // public/film/manifest.json

const PROOF = [
  { k: "Cost before you click", v: "Every generation shows its credit price up front. Failed clips are refunded automatically." },
  { k: "Yours to run as ads", v: "Commercial use included. Built for TikTok Shop, Shopify and Meta placements." },
  { k: "Safe by design", v: "No celebrities, no deepfakes, no minors. Consent is logged for every photo of a person." },
];

export default async function Home() {
  const [cards, user, actors] = await Promise.all([listPresetCards(), getSessionUser(), db().listUgcActors(null)]);
  const showcase = cards.find((c) => c.slug === "hero-shot" && c.preview_video_url);
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
          <p className="mb-4 inline-flex items-center gap-2.5 text-sm text-muted md:mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-[live-dot_2.4s_ease-out_infinite]" aria-hidden />
            AI video ads for small brands
          </p>
          <h1 className="display text-[clamp(40px,7.2vw,96px)]">
            One product
            <br />
            photo in.
          </h1>
          <p className="mt-4 max-w-md text-base text-white/75 md:mt-6 md:text-lg md:text-muted">The photo from your store listing is the whole brief. No studio, no editor, no prompts.</p>
          <p className="mt-10 hidden items-center gap-2 text-xs text-subtle md:flex">
            Scroll <span className="motion-safe:animate-[nudge-down_1.8s_ease-in-out_infinite]" aria-hidden>↓</span>
          </p>
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
            <Link href={start} className="btn-primary btn-sheen !px-5 !py-3 !text-[15px]" data-testid="hero-cta">
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

      <section className="pt-24 sm:pt-32" aria-label="Preset showreel">
        <div className="relative z-10 mx-auto max-w-6xl px-4 text-center" data-reveal>
          <p className="text-sm text-muted">{cards.length} one-click looks</p>
          <h2 className="display mx-auto mt-3 max-w-4xl text-[clamp(40px,6.4vw,88px)]">Every clip here started as one photo.</h2>
        </div>
        <div className="mt-2 sm:-mt-4">
          <ClipWall presets={cards} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10 sm:pt-4" id="presets">
        <div className="mb-12 flex items-end justify-between gap-6" data-reveal>
          <h2 className="display max-w-2xl text-[clamp(36px,5vw,56px)]">Presets that sell.</h2>
          <Link href="/presets" className="btn-ghost hidden shrink-0 sm:inline-flex">All presets</Link>
        </div>
        <PresetRows categories={CATEGORIES} presets={cards} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-24">
        <Link
          href="/ugc"
          className="spot group grid items-center gap-10 overflow-hidden rounded-[32px] border border-border bg-gradient-to-b from-white/[0.05] to-transparent p-8 transition hover:border-white/20 md:grid-cols-[1fr_auto] md:gap-6 md:p-12"
          data-testid="home-ugc"
          data-reveal
        >
          <div>
            <p className="text-sm text-muted">New · UGC Ad Studio</p>
            <h2 className="display mt-2 max-w-2xl text-[clamp(32px,4.5vw,56px)]">UGC ads without hiring creators.</h2>
            <p className="mt-3 max-w-xl text-muted">AI creators hold your product and pitch it to camera — scripts, voice, captions and end card included.</p>
            <span className="btn-ghost mt-8 group-hover:bg-surface-2">Open the studio →</span>
          </div>
          <CreatorFan actors={actors} />
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-24">
        <div className="spot grid items-center gap-10 overflow-hidden rounded-[32px] bg-wash p-8 md:grid-cols-[1fr_auto] md:p-12" data-reveal>
          <div>
            <h2 className="display max-w-xl text-[clamp(32px,4vw,48px)]">Brands pay $2k for this ad. It takes 30 seconds here.</h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {PROOF.map((p) => (
                <div key={p.k}>
                  <h3 className="font-semibold tracking-[-0.02em]">{p.k}</h3>
                  <p className="mt-2 text-sm text-muted">{p.v}</p>
                </div>
              ))}
            </div>
          </div>
          {showcase && (
            <div className="relative mx-auto hidden w-[210px] rotate-[4deg] md:mr-4 md:block" aria-hidden>
              <div className="aspect-[9/16] overflow-hidden rounded-[24px] bg-surface shadow-[0_30px_80px_rgba(0,0,0,0.7)] ring-1 ring-white/15">
                <LazyVideo src={showcase.preview_video_url!} poster={showcase.thumbnail_url ?? undefined} className="h-full w-full object-cover" />
              </div>
              <span className="pill absolute -left-6 bottom-10 -rotate-[4deg] !bg-white !px-3 !py-1.5 !text-[12px] !font-semibold !text-black shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                {showcase.name} · {showcase.credits} credits
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-24" id="pricing">
        <div data-reveal>
          <h2 className="display text-[clamp(36px,5vw,56px)]">Pricing</h2>
          <p className="mt-3 mb-10 text-muted">Pay for what you make. Credits never expire.</p>
        </div>
        <div data-reveal style={{ "--d": "90ms" } as React.CSSProperties}>
          <PricingCards loggedIn={!!user} />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pt-24" id="faq">
        <h2 className="display mb-8 text-[clamp(36px,5vw,56px)]" data-reveal>Questions</h2>
        <div data-reveal style={{ "--d": "90ms" } as React.CSSProperties}>
          <Faq />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-28 sm:pt-36">
        <div data-reveal>
          {/* The closing line is cut out of footage: six preset clips play through the letters. */}
          <div className="type-fill">
            <LazyVideo src="/media/type-fill.mp4" poster="/media/type-fill.jpg" />
            <h2 className="type-fill-text display py-3 text-[clamp(52px,10vw,148px)] !leading-[0.92]">Your next ad is one photo away.</h2>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href={start} className="btn-primary btn-sheen !px-6 !py-3.5 !text-base">
              {user ? "Make a video" : `Get ${SIGNUP_BONUS_CREDITS} free credits`}
            </Link>
            <p className="text-sm text-muted">No card required. Failed clips are refunded.</p>
          </div>
        </div>
      </section>
    </>
  );
}
