import "server-only";
import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { CONSENT_STATEMENT, moderateImage, moderateText, moderationMessage } from "@/lib/moderation";
import { adapterByName, adapterForModel, webhookUrlFor } from "@/lib/providers";
import { UGC_ENDPOINTS } from "@/lib/ugc/config";
import type { Profile, TrySession } from "@/lib/types";
import { lookById, type TryView } from "./looks";
import { safeGet } from "./net";
import { extractProduct, cleanProductName } from "./product-page";

/**
 * "Try it on your product" before sign-up. A visitor gives us one product photo (uploaded, or read from their
 * store page), can ask for a free AI ad still of it, and carries both into their account when they sign up.
 * The browser only holds a signed cookie with the session id; files live in the private uploads bucket.
 */

export const TRY_COOKIE = "rf_try";
const TTL_MS = 7 * 24 * 3600_000;
const DAY_MS = 24 * 3600_000;
const STILL_TIMEOUT_MS = 4 * 60_000;
const STILL_ENDPOINT = UGC_ENDPOINTS.composite; // image edit: prompt + reference photo → one image

const limit = (name: string, fallback: number) => Number(process.env[name] ?? fallback);
export const tryLimits = () => ({
  sessionsPerIpDay: limit("TRY_SESSIONS_PER_IP_DAY", 6),
  stillsPerSession: limit("TRY_STILLS_PER_SESSION", 2),
  stillsPerIpDay: limit("TRY_STILLS_PER_IP_DAY", 4),
  /** Site-wide ceiling: this is what bounds the daily cost of free previews. */
  stillsPerDay: limit("TRY_STILLS_PER_DAY", 150),
});

export class TryError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const TYPE_BY_EXT: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };

export function sniffImage(b: Uint8Array): string | null {
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45) return "image/webp";
  return null;
}

const sign = (id: string) => createHmac("sha256", env.sessionSecret()).update(`try:${id}`).digest("hex").slice(0, 32);

async function clientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}

async function ipHash(): Promise<string> {
  return createHash("sha256").update(`${env.sessionSecret()}:try:${(await clientIp()) ?? "unknown"}`).digest("hex").slice(0, 32);
}

/** The session a cookie value points at, if the signature is valid and the session is under a week old. */
async function sessionFromCookie(raw: string | undefined): Promise<TrySession | null> {
  if (!raw) return null;
  const [id, sig] = raw.split(".");
  if (!id || !sig) return null;
  const want = sign(id);
  if (sig.length !== want.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  const s = await db().getTrySession(id);
  if (!s || Date.now() - Date.parse(s.created_at) > TTL_MS) return null;
  return s;
}

/** The visitor's try session, if any. Read-only. */
export async function currentTry(): Promise<TrySession | null> {
  return sessionFromCookie((await cookies()).get(TRY_COOKIE)?.value);
}

export async function tryView(s: TrySession): Promise<TryView> {
  const look = lookById(s.look);
  return {
    name: s.product_name,
    shortName: s.product_name && s.product_name.length <= 28 ? s.product_name : "your product",
    photoUrl: await db().objectUrl("uploads", s.upload_path, 3600),
    look: s.look,
    still: {
      status: s.still_status,
      url: s.still_status === "succeeded" && s.still_path ? await db().objectUrl("uploads", s.still_path, 3600) : null,
    },
    stillsLeft: Math.max(0, tryLimits().stillsPerSession - s.stills_used),
    sample: s.still_provider === "mock",
    presetSlug: look?.presetSlug ?? "hero-shot",
  };
}

/** Server components: the current session as a view, or null. Never throws (the page must render without it). */
export async function currentTryView(): Promise<TryView | null> {
  // Read the cookie outside the try block: during a build this call is how Next learns the page is dynamic,
  // and that signal must not be swallowed.
  const raw = (await cookies()).get(TRY_COOKIE)?.value;
  if (!raw) return null;
  try {
    const s = await sessionFromCookie(raw);
    return s ? await tryView(s) : null;
  } catch (e) {
    console.error("[try] view failed", (e as Error).message);
    return null;
  }
}

async function removeFiles(s: TrySession) {
  const dir = `try/${s.id}`;
  const stills = Array.from({ length: tryLimits().stillsPerSession + 2 }, (_, i) => `${dir}/still-${i + 1}.jpg`);
  await db().removeObjects("uploads", [s.upload_path, ...stills]).catch(() => undefined);
}

/** Deletes a few expired sessions each time a new one starts, so preview files are not kept past a week. */
async function sweep() {
  try {
    const stale = await db().listStaleTrySessions(new Date(Date.now() - TTL_MS).toISOString(), 10);
    for (const s of stale) {
      await removeFiles(s);
      await db().deleteTrySession(s.id);
    }
  } catch (e) {
    console.error("[try] sweep failed", (e as Error).message);
  }
}

/** Store the photo and open a session. `consent` must already have been checked by the caller. */
export async function createTry(input: { bytes: Uint8Array; name: string; sourceUrl: string | null }): Promise<TrySession> {
  const type = sniffImage(input.bytes);
  if (!type) throw new TryError("Use a PNG, JPEG or WebP photo.", 415);
  const hash = await ipHash();
  const used = await db().countTrySince(new Date(Date.now() - DAY_MS).toISOString(), hash);
  if (used.sessions >= tryLimits().sessionsPerIpDay)
    throw new TryError("You've tried a few products today. Sign up free to keep going.", 429);

  const name = cleanProductName(input.name);
  if (name) {
    const text = await moderateText(name);
    if (!text.allowed) {
      await db().logModeration({ userId: null, kind: "text", excerpt: name, reasons: text.reasons, source: text.source });
      throw new TryError(moderationMessage(text.reasons), 422);
    }
  }
  const image = await moderateImage(`data:${type};base64,${Buffer.from(input.bytes).toString("base64")}`);
  if (!image.allowed) {
    await db().logModeration({ userId: null, kind: "image", excerpt: input.sourceUrl ?? "try upload", reasons: image.reasons, source: image.source });
    throw new TryError(moderationMessage(image.reasons), 422);
  }

  const id = randomUUID();
  const uploadPath = `try/${id}/photo.${EXT[type]}`;
  await db().uploadObject("uploads", uploadPath, input.bytes, type);
  const s = await db().createTrySession({ id, ip_hash: hash, product_name: name, source_url: input.sourceUrl, upload_path: uploadPath });
  (await cookies()).set(TRY_COOKIE, `${id}.${sign(id)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.appUrl().startsWith("https://"),
    maxAge: TTL_MS / 1000,
    path: "/",
  });
  await sweep();
  return s;
}

/** Read the product photo and name from a store page, then open a session with them. */
export async function createTryFromUrl(rawUrl: string): Promise<TrySession> {
  const page = await safeGet(rawUrl, { maxBytes: 1_500_000, onTooLarge: "truncate", accept: "text/html,application/xhtml+xml" });
  if (page.status >= 400)
    throw new TryError(`That page didn't open for us (it answered ${page.status}). Upload the photo instead.`, 422);
  const product = extractProduct(page.body.toString("utf8"), page.url);
  if (!product.imageUrl) throw new TryError("We couldn't find a product photo on that page. Upload the photo instead.", 422);
  const img = await safeGet(product.imageUrl, { maxBytes: 8_000_000, onTooLarge: "error", accept: "image/jpeg,image/png,image/webp,image/*;q=0.5" });
  if (img.status >= 400) throw new TryError("We found the product but couldn't download its photo. Upload the photo instead.", 422);
  const bytes = new Uint8Array(img.body);
  if (!sniffImage(bytes)) throw new TryError("That page's photo is in a format we can't use. Upload a PNG, JPEG or WebP instead.", 415);
  return createTry({ bytes, name: product.name, sourceUrl: page.url });
}

/** Ask the image model for one ad still of the visitor's product in the chosen look. */
export async function startStill(s: TrySession, lookId: string): Promise<TrySession> {
  const look = lookById(lookId);
  if (!look) throw new TryError("Pick one of the looks.", 400);
  if (s.still_status === "running") return s;
  const lim = tryLimits();
  if (s.stills_used >= lim.stillsPerSession)
    throw new TryError("Those were the free previews for this photo. Sign up free to make the video.", 429);
  const since = new Date(Date.now() - DAY_MS).toISOString();
  const [mine, all] = await Promise.all([db().countTrySince(since, s.ip_hash), db().countTrySince(since, null)]);
  if (mine.stills >= lim.stillsPerIpDay || all.stills >= lim.stillsPerDay)
    throw new TryError("Free previews are used up for today. Sign up free to make the video.", 429);

  const adapter = adapterForModel("fal");
  let requestId: string;
  try {
    ({ requestId } = await adapter.submitRaw!(
      STILL_ENDPOINT,
      {
        prompt: look.prompt,
        image_urls: [await db().objectUrl("uploads", s.upload_path, 3600)],
        aspect_ratio: "9:16",
        num_images: 1,
        output_format: "jpeg",
      },
      webhookUrlFor(adapter.name), // completion is picked up by polling; the webhook finds no job and is ignored
    ));
  } catch (e) {
    console.error("[try] still submit failed", (e as Error).message);
    throw new TryError("The free preview isn't available right now. You can still sign up and make the video.", 503);
  }
  return (await db().updateTrySession(s.id, {
    look: look.id,
    still_request_id: requestId,
    still_provider: adapter.name,
    still_status: "running",
    still_path: null,
    still_started_at: new Date().toISOString(),
    stills_used: s.stills_used + 1,
  }))!;
}

async function download(url: string): Promise<Uint8Array> {
  const mock = `${env.appUrl()}/mock/`;
  if (url.startsWith(mock)) {
    return new Uint8Array(await readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "mock", path.basename(url))));
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

/** Demo mode only: the poster of the preset behind this look, shown as a labelled sample (never as their product). */
async function sampleFrame(lookId: string | null): Promise<Uint8Array | null> {
  const slug = lookById(lookId)?.presetSlug;
  if (!slug) return null;
  try {
    return new Uint8Array(await readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "presets", `${slug}.jpg`)));
  } catch {
    return null;
  }
}

/** Called while the browser polls: moves a running still to succeeded or failed. A failure gives the try back. */
export async function reconcileStill(s: TrySession): Promise<TrySession> {
  if (s.still_status !== "running" || !s.still_request_id || !s.still_provider) return s;
  const fail = async () => (await db().updateTrySession(s.id, { still_status: "failed", stills_used: Math.max(0, s.stills_used - 1) })) ?? s;
  if (Date.now() - Date.parse(s.still_started_at ?? s.created_at) > STILL_TIMEOUT_MS) return fail();
  try {
    const result = await adapterByName(s.still_provider).statusRaw!(STILL_ENDPOINT, s.still_request_id);
    if (result.state === "failed") return fail();
    if (result.state !== "succeeded" || !result.outputUrl) return s;
    const sample = s.still_provider === "mock" ? await sampleFrame(s.look) : null;
    const bytes = sample ?? (await download(result.outputUrl));
    const stillPath = `try/${s.id}/still-${s.stills_used}.jpg`;
    await db().uploadObject("uploads", stillPath, bytes, sniffImage(bytes) ?? "image/jpeg");
    return (await db().updateTrySession(s.id, { still_status: "succeeded", still_path: stillPath })) ?? s;
  } catch (e) {
    console.error("[try] still reconcile failed", (e as Error).message);
    return s;
  }
}

/**
 * Copy the visitor's photo (or the ad still, when it belongs to this preset) into their account so the normal
 * generation path can use it, and record the consent they gave before signing up against their user id.
 */
export async function claimTry(profile: Profile, s: TrySession, presetSlug: string): Promise<{ path: string; previewUrl: string }> {
  const useStill = s.still_status === "succeeded" && !!s.still_path && lookById(s.look)?.presetSlug === presetSlug;
  const source = useStill ? s.still_path! : s.upload_path;
  const ext = source.split(".").pop() ?? "jpg";
  const dest = `${profile.id}/${randomUUID()}.${ext}`;
  await db().uploadObject("uploads", dest, await db().downloadObject("uploads", source), TYPE_BY_EXT[ext] ?? "image/jpeg");
  const h = await headers();
  await db().logConsent({
    userId: profile.id,
    uploadPath: dest,
    statement: `${CONSENT_STATEMENT} (Confirmed on the free preview at ${s.consent_at}, before sign-up.)`,
    ip: await clientIp(),
    userAgent: h.get("user-agent"),
  });
  await db().updateTrySession(s.id, { claimed_by: profile.id });
  return { path: dest, previewUrl: await db().objectUrl("uploads", dest, 3600) };
}

/** Delete the session, its files and the cookie. */
export async function forgetTry(s: TrySession): Promise<void> {
  await removeFiles(s);
  await db().deleteTrySession(s.id);
  (await cookies()).delete(TRY_COOKIE);
}
