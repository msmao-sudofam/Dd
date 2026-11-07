"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PresetCard } from "@/lib/presets";

/**
 * Full-screen vertical feed of the preset clips (one per screen, snap scrolling), the way the audience already
 * watches ads. Only the clip on screen plays; the others stay on their poster. Each one carries the same action:
 * make this with my product.
 */
export function Feed({ presets, hrefFor, cta }: { presets: PresetCard[]; hrefFor: Record<string, string>; cta: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current!;
    const items = [...el.querySelectorAll<HTMLElement>("[data-feed-item]")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const video = e.target.querySelector("video");
          if (e.isIntersecting) {
            setActive(Number((e.target as HTMLElement).dataset.feedItem));
            if (video && !reduced) {
              if (!video.src) video.src = video.dataset.src!;
              video.play().catch(() => undefined);
            }
          } else video?.pause();
        }
      },
      { root: el, threshold: 0.6 },
    );
    items.forEach((i) => io.observe(i));

    // Deep link: /feed#hero-shot opens on that clip (also when only the hash changes).
    const toHash = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      const item = slug ? el.querySelector<HTMLElement>(`[data-slug="${CSS.escape(slug)}"]`) : null;
      if (item) el.scrollTo({ top: item.offsetTop });
    };
    toHash();
    window.addEventListener("hashchange", toHash);

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "j" && e.key !== "k") return;
      if ((e.target as HTMLElement | null)?.closest("input, textarea")) return;
      e.preventDefault();
      el.scrollBy({ top: (e.key === "ArrowDown" || e.key === "j" ? 1 : -1) * el.clientHeight, behavior: reduced ? "auto" : "smooth" });
    };
    window.addEventListener("keydown", onKey);
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", toHash);
    };
  }, []);

  return (
    <div className="relative mx-auto h-[calc(100svh-var(--hdr))] w-full max-w-[460px] sm:h-[calc(100svh-var(--hdr)-2rem)]">
      <div ref={root} className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain sm:rounded-[28px]" data-testid="feed" tabIndex={0} aria-label="Preset clips">
        {presets.map((p, i) => (
          <article key={p.id} data-feed-item={i} data-slug={p.slug} className="relative h-full snap-start snap-always overflow-hidden bg-black">
            <video
              data-src={p.preview_video_url ?? undefined}
              poster={p.thumbnail_url ?? undefined}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              loop
              playsInline
              preload="none"
              onClick={(e) => (e.currentTarget.paused ? e.currentTarget.play().catch(() => undefined) : e.currentTarget.pause())}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-transparent via-45% to-black/35" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-xs">
              <span className="pill">{p.credits} credits</span>
              <span className="pill tabular-nums">{i + 1} / {presets.length}</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5 pb-6">
              <h2 className="display text-[34px]">{p.name}</h2>
              <p className="mt-2 max-w-[30ch] text-sm text-white/80">{p.description}</p>
              <Link href={hrefFor[p.slug]} className="btn-primary btn-sheen mt-4 w-full !rounded-full !py-3.5 !text-[15px]" data-testid={`feed-cta-${p.slug}`}>
                {p.requires_image ? cta : "Make this"}
              </Link>
            </div>
          </article>
        ))}
      </div>
      {active === 0 && (
        <p className="pointer-events-none absolute inset-x-0 top-[13%] text-center text-sm font-medium text-white/85 motion-safe:animate-[nudge-down_1.8s_ease-in-out_infinite]" aria-hidden>
          Swipe up ↑
        </p>
      )}
    </div>
  );
}
