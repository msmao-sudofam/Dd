"use client";

import posthog from "posthog-js";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
let started = false;

/** Client PostHog: pageviews + identify the signed-in user so server events join the same person. */
export function Analytics({ userId, email }: { userId?: string; email?: string }) {
  const pathname = usePathname();
  useEffect(() => {
    if (!KEY) return;
    if (!started) {
      posthog.init(KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
        capture_pageview: false,
        person_profiles: "identified_only",
      });
      started = true;
    }
    if (userId) posthog.identify(userId, { email });
  }, [userId, email]);
  useEffect(() => {
    if (KEY && started) posthog.capture("$pageview");
  }, [pathname]);
  return null;
}
