"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { prepareImage } from "@/lib/client/resize-image";
import { TRY_LOOKS, type TryView } from "@/lib/try/looks";
import { CONSENT_LABEL } from "../create/image-upload";

/**
 * "Try it on your product", before sign-up: paste a store link or upload a photo, see the photo on the card,
 * ask for one free AI ad frame of it, then carry both into sign-up. All state lives on the server behind a
 * cookie (see lib/try/session.ts); this component only shows it and polls while a frame is being made.
 */
export function TryStage({ initial, loggedIn }: { initial: TryView | null; loggedIn: boolean }) {
  const router = useRouter();
  const [view, setView] = useState<TryView | null>(initial);
  const [url, setUrl] = useState("");
  const [consent, setConsent] = useState(false);
  const [look, setLook] = useState(initial?.look ?? TRY_LOOKS[0].id);
  const [busy, setBusy] = useState<null | "link" | "upload" | "still" | "forget">(null);
  const [error, setError] = useState<string | null>(null);
  const [pos, setPos] = useState(38);
  const fileRef = useRef<HTMLInputElement>(null);
  const running = view?.still.status === "running";

  // Poll only while a frame is being made.
  useEffect(() => {
    if (!running) return;
    const t = setInterval(async () => {
      const res = await fetch("/api/try", { cache: "no-store" }).catch(() => null);
      const data = res?.ok ? ((await res.json()) as { session: TryView | null }) : null;
      if (!data) return;
      setView(data.session);
      if (data.session?.still.status === "failed") setError("That frame didn't come out. It didn't use up a free preview, so try again.");
    }, 2000);
    return () => clearInterval(t);
  }, [running]);

  async function send(kind: "link" | "upload" | "still" | "forget", init: RequestInit & { path?: string }) {
    setError(null);
    setBusy(kind);
    try {
      const res = await fetch(init.path ?? "/api/try", init);
      const data = (await res.json().catch(() => ({}))) as { session?: TryView | null; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setView(data.session ?? null);
      if (kind !== "still") router.refresh(); // the rest of the page reads the same session on the server
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const needConsent = () => {
    if (consent) return false;
    setError("Tick the box to confirm the photo is yours to use.");
    return true;
  };

  const submitLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return setError("Paste a link to your product page.");
    if (needConsent()) return;
    void send("link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, consent: true }) });
  };

  const onFile = async (file: File) => {
    if (needConsent()) return;
    const fd = new FormData();
    try {
      fd.set("file", await prepareImage(file));
    } catch {
      return setError("We couldn't read that photo. Try a PNG, JPEG or WebP.");
    }
    fd.set("consent", "true");
    void send("upload", { method: "POST", body: fd });
  };

  const makeStill = () =>
    send("still", { path: "/api/try/still", method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ look }) });

  const preset = TRY_LOOKS.find((l) => l.id === (view?.look ?? look))?.presetSlug ?? "hero-shot";
  const target = `/presets/${preset}`;
  const cta = loggedIn ? target : `/signup?next=${encodeURIComponent(target)}`;
  const done = view?.still.status === "succeeded" && view.still.url;

  return (
    <div className="grid items-center gap-10 md:grid-cols-[1fr_auto] md:gap-16" data-testid="try-stage">
      <div>
        <p className="text-sm text-muted">No sign-up needed</p>
        <h2 className="display mt-2 max-w-xl text-[clamp(36px,5vw,64px)]">{view ? `Here's ${view.shortName}.` : "Try it on your product."}</h2>

        {!view ? (
          <>
            <p className="mt-4 max-w-md text-muted">Paste your product link or add a photo. You&apos;ll see it as an ad frame right here, free, before you make an account.</p>
            <form onSubmit={submitLink} className="mt-7 flex max-w-lg gap-2">
              <input
                className="input !rounded-full !py-3"
                type="text"
                inputMode="url"
                autoComplete="off"
                placeholder="yourstore.com/products/…"
                aria-label="Link to your product page"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                data-testid="try-url"
              />
              <button className="btn-primary shrink-0 !rounded-full !px-5" disabled={!!busy} data-testid="try-url-submit">
                {busy === "link" ? "Reading…" : "Show it"}
              </button>
            </form>
            <div className="mt-3 flex items-center gap-3 text-sm text-muted">
              <span>or</span>
              <button type="button" className="btn-ghost !py-2" disabled={!!busy} onClick={() => !needConsent() && fileRef.current?.click()}>
                {busy === "upload" ? "Uploading…" : "Upload a photo"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                data-testid="try-file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onFile(f);
                  e.target.value = "";
                }}
              />
            </div>
            <label className="mt-5 flex max-w-md items-start gap-2 text-xs text-muted">
              <input type="checkbox" className="mt-0.5 accent-white" checked={consent} onChange={(e) => setConsent(e.target.checked)} data-testid="try-consent" />
              <span>{CONSENT_LABEL}</span>
            </label>
            <p className="mt-3 max-w-md text-xs text-subtle">Works with most store pages. If we can&apos;t read yours, upload the photo. We delete preview photos after 7 days.</p>
          </>
        ) : (
          <>
            <p className="mt-4 max-w-md text-muted">
              {done
                ? "That's one frame. Sign up and the same look becomes a moving 9:16 ad."
                : "Pick a look and we'll build one ad frame from this photo, free. The video comes after sign-up."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2" role="radiogroup" aria-label="Look">
              {TRY_LOOKS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  role="radio"
                  aria-checked={look === l.id}
                  onClick={() => setLook(l.id)}
                  disabled={running}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${look === l.id ? "bg-white text-black" : "bg-ghost text-soft hover:bg-surface-2"}`}
                  data-testid={`try-look-${l.id}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {done ? (
                <Link href={cta} className="btn-primary btn-sheen !px-5 !py-3 !text-[15px]" data-testid="try-cta">
                  {loggedIn ? "Make it move" : "Make it move, free"}
                </Link>
              ) : (
                <button className="btn-primary btn-sheen !px-5 !py-3 !text-[15px]" disabled={!!busy || running || view.stillsLeft === 0} onClick={makeStill} data-testid="try-still-btn">
                  {running || busy === "still" ? "Building your frame…" : "Show me the ad frame"}
                </button>
              )}
              {done && view.stillsLeft > 0 && (
                <button className="btn-ghost !py-3" disabled={!!busy || look === view.look} onClick={makeStill} data-testid="try-again">
                  Try this look instead
                </button>
              )}
              {!done && (
                <Link href={cta} className="btn-ghost !py-3">
                  Skip to the video
                </Link>
              )}
            </div>
            <p className="mt-4 text-xs text-subtle">
              {view.stillsLeft > 0 ? `${view.stillsLeft} free ${view.stillsLeft === 1 ? "preview" : "previews"} left for this photo.` : "No free previews left for this photo."}{" "}
              <button type="button" className="underline decoration-white/30 underline-offset-4 hover:text-foreground" disabled={!!busy} onClick={() => send("forget", { method: "DELETE" })} data-testid="try-forget">
                Use a different product
              </button>
            </p>
          </>
        )}
        {error && <p className="mt-4 max-w-md text-sm text-danger" role="alert" data-testid="try-error">{error}</p>}
      </div>

      {/* On phones the empty card is skipped: it would only push the page down. */}
      <div className={`relative mx-auto w-[min(300px,72vw)] md:w-[320px] ${view ? "" : "hidden md:block"}`}>
        <div className="relative aspect-[9/16] overflow-hidden rounded-[32px] border border-border bg-surface">
          {!view ? (
            <div className="absolute inset-3 grid place-items-center rounded-[24px] border border-dashed border-white/15 p-6 text-center text-sm text-subtle">
              Your product shows up here.
            </div>
          ) : done ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={view.still.url!} alt={`AI ad frame of ${view.shortName}`} className="absolute inset-0 h-full w-full object-cover" data-testid="try-still" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={view.photoUrl} alt="" className="absolute inset-0 h-full w-full bg-white object-cover" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
              <div className="pointer-events-none absolute inset-y-0 w-px bg-white" style={{ left: `${pos}%` }} aria-hidden>
                <span className="absolute top-1/2 left-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-xs font-bold text-black shadow-[0_6px_20px_rgba(0,0,0,0.5)]">↔</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={pos}
                onChange={(e) => setPos(Number(e.target.value))}
                aria-label="Compare your photo with the ad frame"
                className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
              />
              <span className="pill pointer-events-none absolute top-3 left-3">Your photo</span>
              <span className="pill pointer-events-none absolute top-3 right-3">{view.sample ? "Sample frame (demo mode)" : "AI ad frame"}</span>
            </>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={view.photoUrl} alt={view.name || "Your product photo"} className={`absolute inset-0 h-full w-full bg-white object-cover transition duration-700 ${running ? "scale-[1.03] brightness-75" : ""}`} data-testid="try-photo" />
              <span className="pill absolute top-3 left-3">Your photo</span>
              {running && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5 pt-16 text-sm font-medium" role="status">
                  <span className="live-dot mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white align-middle" aria-hidden />
                  Building your ad frame…
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
