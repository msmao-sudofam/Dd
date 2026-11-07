import "server-only";

const host = () => process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

/**
 * Server-side PostHog capture for the funnel that matters: signup → first generation → purchase.
 * No-op without NEXT_PUBLIC_POSTHOG_KEY. Never throws, never blocks for long.
 */
export async function track(distinctId: string, event: string, properties: Record<string, unknown> = {}) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  try {
    await fetch(`${host()}/i/v0/e/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: key, event, distinct_id: distinctId, properties: { ...properties, $lib: "server" } }),
      signal: AbortSignal.timeout(2000),
    });
  } catch {}
}
