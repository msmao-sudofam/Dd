"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface Look {
  name: string;
  href: string;
}

const HOLD_MS = 2600;

function Letters({ text }: { text: string }) {
  return [...text].map((c, j) => (
    <span key={j} className="ch" style={{ "--j": j } as React.CSSProperties}>{c === " " ? "\u00a0" : c}</span>
  ));
}

/**
 * "Like <look>": the look's name rolls over letter by letter every few seconds and links to that preset.
 * It writes the current index to `data-look` on the hero film, which lights the matching card in the deck.
 * Waits while its beat is off screen or the tab is hidden; with reduced motion it shows the first look only.
 */
export function LookRotator({ looks, lead = "Like" }: { looks: Look[]; lead?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [state, setState] = useState<{ cur: number; prev: number | null }>({ cur: 0, prev: null });

  useEffect(() => {
    if (looks.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.hidden || ref.current?.closest('[data-active="false"]')) return;
      setState((s) => ({ cur: (s.cur + 1) % looks.length, prev: s.cur }));
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, [looks.length]);

  useEffect(() => {
    const film = ref.current?.closest<HTMLElement>(".film");
    if (film) film.dataset.look = String(state.cur);
  }, [state.cur]);

  if (looks.length === 0) return null;
  const look = looks[state.cur];
  return (
    <p ref={ref} className="look-rot display mt-2 text-[clamp(21px,6vw,28px)] md:mt-3 md:text-[clamp(24px,3.1vw,46px)]">
      <span className="text-white/40">{lead} </span>
      <Link href={look.href} className="look-slot" aria-label={`See the ${look.name} look`} data-testid="hero-look">
        {state.prev !== null && (
          <span key={`out-${state.prev}`} className="look-word" data-out aria-hidden="true">
            <Letters text={looks[state.prev].name} />
          </span>
        )}
        <span key={`in-${state.cur}`} className="look-word" data-first={state.prev === null ? "" : undefined} aria-hidden="true">
          <Letters text={look.name} />
        </span>
      </Link>
    </p>
  );
}
