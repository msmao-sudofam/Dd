"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { TryView } from "@/lib/try/looks";

/**
 * While a visitor has a product in "try" mode, a small bar follows them around the site so the next step is
 * always one tap away: straight to the preset when logged in, to sign-up (and back) when not.
 */
export function TryBar({ view, loggedIn }: { view: TryView; loggedIn: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [gone, setGone] = useState(false);
  const target = `/presets/${view.presetSlug}`;
  // Not on the pages where the same action is already the main thing on screen.
  if (gone || pathname === target || pathname === "/signup" || pathname === "/login" || pathname.startsWith("/auth") || pathname.startsWith("/admin")) return null;

  const forget = async () => {
    setGone(true);
    await fetch("/api/try", { method: "DELETE" }).catch(() => undefined);
    router.refresh();
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-3" data-testid="try-bar">
      <div className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full border border-white/15 bg-[#161616]/95 py-1.5 pr-1.5 pl-1.5 shadow-[0_16px_50px_rgba(0,0,0,0.6)] backdrop-blur">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={view.still.url ?? view.photoUrl} alt="" className="h-9 w-9 shrink-0 rounded-full bg-white object-cover" />
        <span className="min-w-0 truncate text-sm">
          {view.name ? (
            <>
              <span className="text-muted">Your product: </span>
              <span className="font-medium">{view.name}</span>
            </>
          ) : (
            <span className="font-medium">Your photo is ready</span>
          )}
        </span>
        <Link href={loggedIn ? target : `/signup?next=${encodeURIComponent(target)}`} className="btn-primary shrink-0 !rounded-full !py-2">
          {loggedIn ? "Make my ad" : "Make my ad free"}
        </Link>
        <button type="button" onClick={forget} aria-label="Remove this product" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-foreground">
          ×
        </button>
      </div>
    </div>
  );
}
