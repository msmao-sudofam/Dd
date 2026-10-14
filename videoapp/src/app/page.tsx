import Link from "next/link";
import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/auth";
import { ClipWall } from "@/components/landing/clip-wall";
import { CreatorFan } from "@/components/landing/creator-fan";
import { Faq, FAQ_ITEMS } from "@/components/landing/faq";
import { Intro } from "@/components/landing/intro";
import { LookBand } from "@/components/landing/look-band";
import { LookRotator } from "@/components/landing/look-rotator";
import { ScrollFilm, type Beat, type DeckClip } from "@/components/landing/scroll-film";
import { TryStage } from "@/components/landing/try-stage";
import { LazyVideo } from "@/components/lazy-video";
import { PresetShowcase } from "@/components/presets/preset-showcase";
import { PricingCards } from "@/components/pricing-cards";
import { Roll } from "@/components/roll";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ScrubWords, SplitText, letterCount } from "@/components/split-text";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { MONTHLY_PLAN, SIGNUP_BONUS_CREDITS } from "@/lib/pricing";
import { CATEGORIES, listPresetCards } from "@/lib/presets";
import { currentTryView } from "@/lib/try/session";

const FILM_FRAMES = 72; // public/film/manifest.json

/**
 * Looks shown floating behind the hero film: upper left, upper right, lower left, lower right.
 * The lower-left card is the narrowest, so it gets the shortest name. Missing presets are skipped.
 */
const HERO_DECK: { slug: string; label?: string }[] = [
  { slug: "liquid-splash" },
  { slug: "holding-product", label: "Creator UGC" }, // "Creator Holding Product" does not fit the card
  { slug: "bullet-time" },
  { slug: "unboxing-reveal" },
];

/** Only promises the product keeps today. No durations: generation time isn't measured yet. */
const PROMISES: { k: string; v: string; icon: ReactNode }[] = [
  {
    k: "See the price first",
    v: "Every preset shows its credit cost before you press generate. Credits are only charged when a generation starts.",
    icon: <path d="M3 7.5V4a1 1 0 0 1 1-1h3.5l8.5 8.5-4.5 4.5L3 7.5Zm3.25-1.25h.01" />,
  },
  {
    k: "Failed clips refund themselves",
    v: "If a generation fails, its credits go back to your balance automatically. No support ticket needed.",
    icon: <path d="M3.5 10a6.5 6.5 0 1 0 2-4.7M3.5 3v3.5H7" />,
  },
  {
    k: "Commercial use included",
    v: "Run your clips as paid ads on TikTok, Meta and YouTube. Label them as AI-generated where a platform asks.",
    icon: <path d="M10 2.75 12 4.5l2.6-.2.5 2.55 2.15 1.5-1.05 2.4 1.05 2.4-2.15 1.5-.5 2.55-2.6-.2L10 17.25 8 15.5l-2.6.2-.5-2.55-2.15-1.5 1.05-2.4L2.75 8.85 4.9 7.35l.5-2.55L8 5l2-2.25Zm-2.5 7.5 1.75 1.75 3.25-3.5" />,
  },
  {
    k: "Consent on record",
    v: "Photos of people need a yes: it's you, or someone who agreed. Consent is logged for every photo of a person.",
    icon: <path d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 8a5 5 0 0 1 8.2-3.85M12.5 15.25l1.75 1.75 3.25-3.5" />,
  },
];

export default async function Home() {
  const [cards, user, actors, mine] = await Promise.all([listPresetCards(), getSessionUser(), db().listUgcActors(null), currentTryView()]);
  // A visitor who has put their own product in ("try" mode) is sent to the preset that animates it.
  const mineTarget = mine ? `/presets/${mine.presetSlug}` : null;
  const start = user ? (mineTarget ?? "/presets") : mineTarget ? `/signup?next=${encodeURIComponent(mineTarget)}` : "/signup";
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  // The small wall clips (public/presets/sm) when the preset still uses its seeded preview.
  const deck: (DeckClip & { href: string })[] = HERO_DECK.flatMap(({ slug, label }) => {
    const p = cards.find((c) => c.slug === slug);
    if (!p?.preview_video_url) return [];
    const seeded = p.preview_video_url === `/presets/${p.slug}.mp4`;
    return [{
      src: seeded ? `/presets/sm/${p.slug}.mp4` : p.preview_video_url,
      srcWide: seeded ? `/presets/${p.slug}.mp4` : undefined,
      poster: p.thumbnail_url ?? undefined,
      name: label ?? p.name,
      href: `/presets/${p.slug}`,
    }];
  });
  // The headline, in the three lines it is set in. The letter count runs on from line to line.
  const h1 = ["One photo.", `${cards.length} ways to stop`, "the scroll."];

  const presetsTitle = mine ? `Pick a look for ${mine.shortName}.` : "Presets that sell.";

  const beats: Beat[] = [
    {
      from: 0,
      to: 0.33,
      content: (
        <div>
          <p className="mb-4 inline-flex items-center gap-2.5 text-sm text-muted md:mb-5">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
            AI video ads for small brands
          </p>
          {/* Sized so the middle line always fits its column: the breaks are fixed, the letters are animated. */}
          <h1 className="display hero-words text-[clamp(34px,10vw,46px)] md:text-[clamp(40px,5.2vw,76px)]" aria-label={h1.join(" ")}>
            <SplitText text={h1[0]} />
            <br />
            <SplitText text={h1[1]} from={letterCount(h1[0])} />
            <br />
            <SplitText text={h1[2]} from={letterCount(h1[0] + h1[1])} />
          </h1>
          {/* The looks behind the film, named one at a time; the matching card lights up. */}
          <LookRotator looks={deck.map((d) => ({ name: d.name, href: d.href }))} />
          <p className="mt-4 max-w-md text-base text-white/75 md:mt-6 md:text-lg md:text-muted">
            Drop in the photo from your store listing and pick a look. Out comes a vertical video ad
            <span className="hidden sm:inline"> for TikTok, Reels and Shorts. No studio, no editor, no prompts</span>.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-8">
            <Link href={start} className="btn-primary btn-sheen !px-5 !py-3 !text-[15px]" data-testid="hero-cta-top" data-magnetic data-shine>
              <Roll arrow>{user ? "Make a video" : "Make your first ad free"}</Roll>
            </Link>
            <Link href="#try" className="btn-ghost hidden !py-3 sm:inline-flex" data-magnetic>
              <Roll>{mine ? `Back to ${mine.shortName}` : "Try it on your product"}</Roll>
            </Link>
          </div>
          <p className="mt-3 flex items-center gap-4 text-xs text-subtle md:mt-4">
            {!user && <span>{SIGNUP_BONUS_CREDITS} free credits · no card required</span>}
            <span className="hidden items-center gap-2 md:flex">
              Scroll to see how <span className="motion-safe:animate-[nudge-down_1.8s_ease-in-out_infinite]" aria-hidden>↓</span>
            </span>
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
            Post it where
            <br />
            they scroll.
          </h2>
          <p className="mt-4 max-w-md text-base text-white/75 md:mt-6 md:text-lg md:text-muted">A vertical 9:16 clip, ready for TikTok, Reels and Shorts.</p>
          <div className="mt-6 flex flex-wrap gap-3 md:mt-8">
            <Link href={start} className="btn-primary btn-sheen !px-5 !py-3 !text-[15px]" data-testid="hero-cta" data-magnetic>
              <Roll arrow>{user ? "Make a video" : "Make your first ad free"}</Roll>
            </Link>
            <Link href="#presets" className="btn-ghost !py-3"><Roll>See presets</Roll></Link>
          </div>
          <p className="mt-4 text-xs text-subtle">{SIGNUP_BONUS_CREDITS} free credits · no card required</p>
        </div>
      ),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Intro brand={env.brandName()} />
      <SmoothScroll />

      <ScrollFilm
        frameCount={FILM_FRAMES}
        beats={beats}
        poster="/film/desktop/frame-0001.webp"
        label="A product photo turning into a finished vertical video ad"
        captions={{ start: "Listing photo", end: "Finished ad" }}
        deck={deck}
      />

      <LookBand names={cards.map((c) => c.name)} />

      <section className="mx-auto max-w-6xl scroll-mt-[calc(var(--hdr)+24px)] px-4 pt-10 sm:pt-14" id="try" aria-label="Try it on your product">
        <TryStage initial={mine} loggedIn={!!user} />
      </section>

      <section className="pt-20 sm:pt-24" aria-label="Preset showreel">
        <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm text-muted" data-reveal>{cards.length} one-click looks</p>
          {/* The words sharpen one by one as the heading scrolls up the screen. */}
          <h2 className="display mx-auto mt-3 max-w-4xl text-[clamp(40px,6.4vw,88px)]" aria-label="Every clip here started as one photo." data-scrub-words>
            <ScrubWords text="Every clip here started as one photo." />
          </h2>
        </div>
        <div className="mt-2 sm:-mt-4">
          <ClipWall presets={cards} />
        </div>
        <div className="relative z-10 -mt-2 flex justify-center px-4" data-reveal>
          <Link href="/feed" className="btn-ghost !py-3" data-testid="open-feed">
            <Roll arrow>{`Swipe through all ${cards.length}`}</Roll>
          </Link>
        </div>
      </section>

      {/* overflow-x: clip lets the preset strips bleed to the screen edge without a sideways scrollbar. */}
      <div className="overflow-x-clip">
        <section className="mx-auto max-w-6xl px-4 pt-10 sm:pt-4" id="presets">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div data-reveal="kids">
              <p className="text-sm text-muted">Presets</p>
              <h2 className="display mt-2 max-w-2xl text-[clamp(36px,5vw,56px)]" aria-label={presetsTitle} data-reveal="split">
                <SplitText text={presetsTitle} />
              </h2>
            </div>
            <Link href="/presets" className="btn-ghost hidden shrink-0 sm:inline-flex" data-reveal><Roll arrow>Browse all</Roll></Link>
          </div>
          <div data-reveal style={{ "--d": "90ms" } as React.CSSProperties}>
            <PresetShowcase categories={CATEGORIES} presets={cards} photoLabel={mine ? "Your photo" : undefined} />
          </div>
        </section>
      </div>

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
            <span className="btn-ghost mt-8" data-group-fill><Roll arrow>Open the studio</Roll></span>
          </div>
          <CreatorFan actors={actors} />
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-28" id="pricing">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
          <div data-reveal="kids">
            <p className="text-sm text-muted">Pricing</p>
            <h2 className="display mt-2 text-[clamp(36px,5vw,56px)]" aria-label="Fresh credits every month." data-reveal="split">
              <SplitText text="Fresh credits every month." />
            </h2>
          </div>
          <p className="max-w-sm text-muted md:pb-1.5" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
            Monthly plans from ${MONTHLY_PLAN.priceUsd} for {MONTHLY_PLAN.creditsPerCycle} credits, or a one-off pack when you need a burst.{" "}
            {SIGNUP_BONUS_CREDITS} free credits to start, no card required.
          </p>
        </div>
        <div className="mt-10" data-reveal style={{ "--d": "90ms" } as React.CSSProperties}>
          <PricingCards loggedIn={!!user} />
        </div>
        {/* The fine print, set under the prices it qualifies: only promises the product keeps today. */}
        <ul
          className="mt-3 grid overflow-hidden rounded-[20px] border border-border sm:grid-cols-2 lg:grid-cols-4"
          data-testid="home-promises"
          data-reveal="kids"
          style={{ "--d": "160ms" } as React.CSSProperties}
        >
          {PROMISES.map((p) => (
            <li key={p.k} className="border-border p-6 not-last:border-b sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:not-last:border-r">
              <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-white/70 stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]" aria-hidden>
                {p.icon}
              </svg>
              <h3 className="mt-4 font-semibold tracking-[-0.02em]">{p.k}</h3>
              <p className="mt-1.5 text-sm text-muted">{p.v}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pt-28 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-16" id="faq">
        <div className="md:sticky md:top-[calc(var(--hdr)+32px)] md:self-start" data-reveal="kids">
          <p className="text-sm text-muted">Questions</p>
          <h2 className="display mt-2 text-[clamp(36px,5vw,56px)]" aria-label="Before you start." data-reveal="split">
            <SplitText text="Before you start." />
          </h2>
          <p className="mt-4 max-w-xs text-muted">
            The full rules are in the <Link href="/legal/terms" className="text-soft underline decoration-white/30 underline-offset-4 hover:decoration-white">Terms</Link> and{" "}
            <Link href="/legal/refunds" className="text-soft underline decoration-white/30 underline-offset-4 hover:decoration-white">Refund policy</Link>.
          </p>
        </div>
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
            <Link href={start} className="btn-primary btn-sheen !px-6 !py-3.5 !text-base" data-magnetic data-shine>
              <Roll arrow>{user ? "Make a video" : `Get ${SIGNUP_BONUS_CREDITS} free credits`}</Roll>
            </Link>
            <p className="text-sm text-muted">No card required. Failed clips are refunded.</p>
          </div>
        </div>
      </section>
    </>
  );
}
