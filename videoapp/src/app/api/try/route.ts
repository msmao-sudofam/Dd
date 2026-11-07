import { z } from "zod";
import { track } from "@/lib/analytics";
import { FetchError } from "@/lib/try/net";
import { createTry, createTryFromUrl, currentTry, forgetTry, reconcileStill, TryError, tryView } from "@/lib/try/session";

// Reading a store page and running the image check can take a while.
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024;
const NEEDS_CONSENT = "Tick the box to confirm the photo is yours to use.";

const fail = (e: unknown) => {
  if (e instanceof TryError) return Response.json({ error: e.message }, { status: e.status });
  if (e instanceof FetchError) return Response.json({ error: `${e.message} Upload the photo instead.` }, { status: 422 });
  console.error("[api/try]", e);
  return Response.json({ error: "Something went wrong. Upload the photo instead, or try again." }, { status: 500 });
};

/** Current session (and the state of its still: this is what the browser polls). */
export async function GET() {
  try {
    const s = await currentTry();
    if (!s) return Response.json({ session: null });
    return Response.json({ session: await tryView(await reconcileStill(s)) });
  } catch (e) {
    return fail(e);
  }
}

const Link = z.object({ url: z.string().min(4).max(2000), consent: z.literal(true) });

/** Start a session from an uploaded photo (multipart: file, consent, name?) or a store link (JSON: url, consent). */
export async function POST(req: Request) {
  try {
    let session;
    if ((req.headers.get("content-type") ?? "").includes("application/json")) {
      const parsed = Link.safeParse(await req.json().catch(() => null));
      if (!parsed.success) {
        const noConsent = parsed.error.issues.some((i) => i.path[0] === "consent");
        return Response.json({ error: noConsent ? NEEDS_CONSENT : "Paste a link to your product page." }, { status: 400 });
      }
      const url = /^https?:\/\//i.test(parsed.data.url.trim()) ? parsed.data.url.trim() : `https://${parsed.data.url.trim()}`;
      session = await createTryFromUrl(url);
      await track(`try:${session.id}`, "try_started", { source: "link" });
    } else {
      const form = await req.formData().catch(() => null);
      const file = form?.get("file");
      if (!(file instanceof File)) return Response.json({ error: "Choose a photo." }, { status: 400 });
      if (form?.get("consent") !== "true") return Response.json({ error: NEEDS_CONSENT }, { status: 400 });
      if (file.size > MAX_BYTES) return Response.json({ error: "Photo must be under 8 MB." }, { status: 413 });
      session = await createTry({
        bytes: new Uint8Array(await file.arrayBuffer()),
        name: String(form?.get("name") ?? "").slice(0, 120),
        sourceUrl: null,
      });
      await track(`try:${session.id}`, "try_started", { source: "upload" });
    }
    return Response.json({ session: await tryView(session) });
  } catch (e) {
    return fail(e);
  }
}

/** Forget this product: deletes the photo, any still and the cookie. */
export async function DELETE() {
  try {
    const s = await currentTry();
    if (s) await forgetTry(s);
    return Response.json({ session: null });
  } catch (e) {
    return fail(e);
  }
}
