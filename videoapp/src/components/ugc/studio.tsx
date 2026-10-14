"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { prepareImage } from "@/lib/client/resize-image";
import { useJobs } from "@/lib/client/use-jobs";
import type { Job, UgcActor, UgcScript } from "@/lib/types";
import { CONSENT_LABEL } from "../create/image-upload";
import { JobCard } from "../create/job-card";

type Tone = "friendly" | "hype" | "calm" | "funny";
type Aspect = "9:16" | "4:5" | "1:1";
type Captions = "bold" | "clean" | "none";
type Quality = "standard" | "premium";

const STEPS = ["Product", "Script", "Creator", "Format"] as const;
const ANGLE_LABEL: Record<string, string> = {
  "problem-solution": "Problem → solution",
  "first-impressions": "First impressions",
  "three-reasons": "3 reasons",
  pov: "POV",
  "us-vs-them": "Old way vs new way",
  routine: "In my routine",
};
const VOICES = ["Sarah", "Laura", "Jessica", "Charlotte", "Aria", "Liam", "Chris", "Brian", "Will", "River"];
const SELF_CONSENT = "This is a photo of me. I consent to an AI version of my face and a synthetic voice being used in my ads.";

async function upload(file: File): Promise<{ path: string; previewUrl: string }> {
  const fd = new FormData();
  fd.set("file", await prepareImage(file));
  fd.set("consent", "true");
  const res = await fetch("/api/uploads", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  return data;
}

function Chip({ on, onClick, children, testId }: { on: boolean; onClick: () => void; children: React.ReactNode; testId?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      data-testid={testId}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${on ? "bg-white text-black" : "bg-ghost text-soft hover:bg-surface-2"}`}
    >
      {children}
    </button>
  );
}

export function UgcStudio({
  actors: initialActors,
  balance: initialBalance,
  mockProviders,
}: {
  actors: UgcActor[];
  balance: number;
  mockProviders: boolean;
}) {
  const router = useRouter();
  const [step, setStepRaw] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const setStep = (i: number) => {
    setStepRaw(i);
    setMaxStep((m) => Math.max(m, i));
  };
  const [balance, setBalance] = useState(initialBalance);
  const { jobs, upsert } = useJobs([], setBalance);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // 1 · product
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [benefits, setBenefits] = useState(["", "", ""]);
  const [audience, setAudience] = useState("");
  const [offer, setOffer] = useState("");
  const [tone, setTone] = useState<Tone>("friendly");
  const [photo, setPhoto] = useState<{ path: string; previewUrl: string } | null>(null);
  const [photoConsent, setPhotoConsent] = useState(false);

  // 2 · scripts
  const [scripts, setScripts] = useState<UgcScript[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [source, setSource] = useState<"claude" | "template" | null>(null);

  // 3 · creators
  const [actors, setActors] = useState(initialActors);
  const [cast, setCast] = useState<string[]>(initialActors[0] ? [initialActors[0].id] : []);
  const [selfOpen, setSelfOpen] = useState(false);
  const [selfName, setSelfName] = useState("");
  const [selfVoice, setSelfVoice] = useState(VOICES[0]);
  const [selfConsent, setSelfConsent] = useState(false);

  // 4 · format
  const [aspect, setAspect] = useState<Aspect>("9:16");
  const [captions, setCaptions] = useState<Captions>("bold");
  const [broll, setBroll] = useState(true);
  const [quality, setQuality] = useState<Quality>("standard");
  const [aiLabel, setAiLabel] = useState(true);
  const [ctaLabel, setCtaLabel] = useState("Shop now →");
  const [failAt, setFailAt] = useState<string>("");

  const chosen = picked.map((i) => scripts[i]).filter(Boolean);
  const firstActor = actors.find((a) => a.id === cast[0]);
  const previewScript = chosen[0] ?? scripts[0];
  const [quote, setQuote] = useState<{ total: number; perScript: { credits: number; seconds: number }[] } | null>(null);

  useEffect(() => {
    if (!chosen.length || !cast.length) return;
    const ctrl = new AbortController();
    fetch("/api/ugc/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scripts: chosen, actors: cast.length, quality, broll, hasProductImage: !!photo }),
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((q) => q && setQuote(q))
      .catch(() => {});
    return () => ctrl.abort();
    // chosen is derived from picked/scripts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, scripts, cast.length, quality, broll, photo]);

  const canNext = useMemo(() => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return picked.length > 0;
    if (step === 2) return cast.length > 0;
    return true;
  }, [step, name, picked, cast]);

  async function writeScripts() {
    setError(null);
    setBusy("scripts");
    try {
      const res = await fetch("/api/ugc/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, benefits: benefits.filter(Boolean), audience, offer, tone, count: 4 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't write scripts");
      setScripts(data.scripts);
      setSource(data.source);
      setPicked([0, 1].filter((i) => i < data.scripts.length));
      setStep(1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function editScript(i: number, patch: Partial<UgcScript>) {
    setScripts((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  }

  async function addSelf(file: File) {
    setError(null);
    if (!selfConsent || !selfName.trim()) return setError("Add your name and confirm it's you first.");
    setBusy("self");
    try {
      const up = await upload(file);
      const res = await fetch("/api/ugc/actors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selfName.trim(), uploadPath: up.path, voice: selfVoice, consent: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't add you as a creator");
      setActors((a) => [data.actor, ...a]);
      setCast((c) => [data.actor.id, ...c].slice(0, 3));
      setSelfOpen(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function generate() {
    setError(null);
    setBusy("render");
    try {
      const res = await fetch("/api/ugc/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: { name, description, benefits: benefits.filter(Boolean), audience, offer, imagePath: photo?.path ?? null },
          scripts: chosen,
          actorIds: cast,
          aspect,
          captions,
          broll: broll && !!photo,
          quality,
          aiLabel,
          ctaLabel,
          failAt: failAt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't start");
      upsert(data.jobs);
      setBalance(data.balance);
      router.refresh(); // header credit chip
      if (data.errors?.length) setError(data.errors[0]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const total = quote?.total ?? 0;
  const ratio = aspect === "9:16" ? "aspect-[9/16]" : aspect === "4:5" ? "aspect-[4/5]" : "aspect-square";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <ol className="mb-8 flex flex-wrap gap-2" aria-label="Steps">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                disabled={i > maxStep}
                onClick={() => setStep(i)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition disabled:opacity-40 ${i === step ? "bg-white text-black" : "bg-ghost text-soft"}`}
              >
                {i + 1} · {s}
              </button>
            </li>
          ))}
        </ol>

        {step === 0 && (
          <section className="space-y-5" aria-label="Product">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="label">Product name</span>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Glow Serum" maxLength={80} data-testid="ugc-name" />
              </label>
              <label className="sm:col-span-2">
                <span className="label">What is it?</span>
                <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A lightweight vitamin C serum" maxLength={400} />
              </label>
              {benefits.map((b, i) => (
                <label key={i} className={i === 0 ? "sm:col-span-2" : ""}>
                  <span className="label">Benefit {i + 1}{i === 0 ? "" : " (optional)"}</span>
                  <input className="input" value={b} maxLength={120} onChange={(e) => setBenefits((x) => x.map((v, j) => (j === i ? e.target.value : v)))} placeholder={["Soaks in fast", "No sticky feel", "Smells like citrus"][i]} />
                </label>
              ))}
              <label>
                <span className="label">Who is it for?</span>
                <input className="input" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="People with busy mornings" maxLength={120} />
              </label>
              <label>
                <span className="label">Offer (optional)</span>
                <input className="input" value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="20% off this week" maxLength={80} />
              </label>
            </div>
            <div>
              <span className="label">Tone</span>
              <div className="flex flex-wrap gap-2">
                {(["friendly", "hype", "calm", "funny"] as Tone[]).map((t) => (
                  <Chip key={t} on={tone === t} onClick={() => setTone(t)}>{t[0].toUpperCase() + t.slice(1)}</Chip>
                ))}
              </div>
            </div>
            <div>
              <span className="label">Product photo (recommended — the creator holds it, and it powers the b-roll)</span>
              {photo ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.previewUrl} alt="Product" className="h-20 w-20 rounded-[10px] object-cover" data-testid="ugc-photo-preview" />
                  <button type="button" className="btn-ghost !py-1.5" onClick={() => setPhoto(null)}>Replace</button>
                </div>
              ) : (
                <>
                  <label className="mb-2 flex items-start gap-2 text-xs text-muted">
                    <input type="checkbox" checked={photoConsent} onChange={(e) => setPhotoConsent(e.target.checked)} className="mt-0.5" data-testid="ugc-photo-consent" />
                    <span>{CONSENT_LABEL}</span>
                  </label>
                  <label className={`flex h-24 cursor-pointer items-center justify-center rounded-[10px] border border-dashed border-border text-sm text-muted ${photoConsent ? "hover:border-white/40" : "opacity-50"}`}>
                    {busy === "photo" ? "Uploading…" : "Upload product photo"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      disabled={!photoConsent || !!busy}
                      data-testid="ugc-photo-input"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (!f) return;
                        setBusy("photo");
                        try {
                          setPhoto(await upload(f));
                        } catch (err) {
                          setError((err as Error).message);
                        } finally {
                          setBusy(null);
                        }
                      }}
                    />
                  </label>
                </>
              )}
            </div>
            <button type="button" className="btn-primary" disabled={!name.trim() || !!busy} onClick={writeScripts} data-testid="ugc-write-scripts">
              {busy === "scripts" ? "Writing…" : "Write my scripts"}
            </button>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4" aria-label="Scripts">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                Pick the angles to film. Edit anything — it&apos;s your ad.
                {source === "template" && " (Written from proven hook formulas.)"}
              </p>
              <button type="button" className="btn-ghost !py-1.5" onClick={writeScripts} disabled={!!busy}>
                {busy === "scripts" ? "Rewriting…" : "Rewrite all"}
              </button>
            </div>
            {scripts.map((s, i) => {
              const on = picked.includes(i);
              return (
                <div key={i} className={`card rounded-[16px] p-4 ${on ? "!border-white/30" : ""}`} data-testid="ugc-script">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <input type="checkbox" checked={on} onChange={() => setPicked((p) => (on ? p.filter((x) => x !== i) : [...p, i]))} data-testid={`ugc-pick-${i}`} />
                      {ANGLE_LABEL[s.angle] ?? s.angle}
                    </label>
                    <span className="text-xs text-subtle">~{Math.ceil([s.hook, ...s.body, s.cta].join(" ").split(/\s+/).length / 2.6)}s</span>
                  </div>
                  <label className="block">
                    <span className="label">Hook (first 2 seconds)</span>
                    <input className="input" value={s.hook} maxLength={140} onChange={(e) => editScript(i, { hook: e.target.value })} />
                  </label>
                  <label className="mt-3 block">
                    <span className="label">Body</span>
                    <textarea className="input min-h-20" value={s.body.join(" ")} maxLength={900} onChange={(e) => editScript(i, { body: [e.target.value] })} />
                  </label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className="label">Call to action</span>
                      <input className="input" value={s.cta} maxLength={160} onChange={(e) => editScript(i, { cta: e.target.value })} />
                    </label>
                    <label>
                      <span className="label">On-screen hook</span>
                      <input className="input" value={s.on_screen_hook} maxLength={40} onChange={(e) => editScript(i, { on_screen_hook: e.target.value })} />
                    </label>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {step === 2 && (
          <section aria-label="Creators">
            <p className="mb-4 text-sm text-muted">Pick up to 3 creators — each one films every script you picked. All are AI-generated, fictional adults.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              <button
                type="button"
                onClick={() => setSelfOpen((o) => !o)}
                className="flex aspect-[9/16] flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-border text-center text-sm text-muted hover:border-white/40"
                data-testid="ugc-self-open"
              >
                <span className="text-2xl text-foreground">+</span>
                Use my own face
              </button>
              {actors.map((a) => {
                const on = cast.includes(a.id);
                return (
                  <button
                    type="button"
                    key={a.id}
                    aria-pressed={on}
                    data-testid={`ugc-actor-${a.slug}`}
                    onClick={() => setCast((c) => (on ? c.filter((x) => x !== a.id) : c.length >= 3 ? c : [...c, a.id]))}
                    className={`relative overflow-hidden rounded-[10px] bg-surface text-left ring-2 transition ${on ? "ring-white" : "ring-transparent hover:ring-white/30"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {a.portrait_url && <img src={a.portrait_url} alt={a.name} className="aspect-[9/16] w-full object-cover" />}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2.5">
                      <div className="text-sm font-semibold">{a.name}</div>
                      <div className="text-[11px] text-white/65">{a.vibe}</div>
                      {a.voice_label && <div className="text-[11px] text-white/45">Voice: {a.voice_label}</div>}
                    </div>
                    {on && <span className="pill absolute top-2 right-2 !bg-white !text-black">{cast.indexOf(a.id) + 1}</span>}
                  </button>
                );
              })}
            </div>
            {selfOpen && (
              <div className="card mt-5 space-y-3 rounded-[16px] p-4" data-testid="ugc-self-form">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    <span className="label">Your first name</span>
                    <input className="input" value={selfName} onChange={(e) => setSelfName(e.target.value)} maxLength={40} data-testid="ugc-self-name" />
                  </label>
                  <label>
                    <span className="label">Voice</span>
                    <select className="input" value={selfVoice} onChange={(e) => setSelfVoice(e.target.value)}>
                      {VOICES.map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </label>
                </div>
                <label className="flex items-start gap-2 text-xs text-muted">
                  <input type="checkbox" checked={selfConsent} onChange={(e) => setSelfConsent(e.target.checked)} className="mt-0.5" data-testid="ugc-self-consent" />
                  <span>{SELF_CONSENT} {CONSENT_LABEL}</span>
                </label>
                <label className={`flex h-20 cursor-pointer items-center justify-center rounded-[10px] border border-dashed border-border text-sm text-muted ${selfConsent && selfName.trim() ? "hover:border-white/40" : "opacity-50"}`}>
                  {busy === "self" ? "Uploading…" : "Upload a clear selfie (face the camera, good light)"}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={!selfConsent || !selfName.trim() || !!busy} data-testid="ugc-self-input" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) addSelf(f); }} />
                </label>
              </div>
            )}
          </section>
        )}

        {step === 3 && (
          <section className="space-y-6" aria-label="Format">
            <div>
              <span className="label">Format</span>
              <div className="flex flex-wrap gap-2">
                <Chip on={aspect === "9:16"} onClick={() => setAspect("9:16")}>9:16 TikTok / Reels</Chip>
                <Chip on={aspect === "4:5"} onClick={() => setAspect("4:5")}>4:5 Feed</Chip>
                <Chip on={aspect === "1:1"} onClick={() => setAspect("1:1")}>1:1 Square</Chip>
              </div>
            </div>
            <div>
              <span className="label">Captions</span>
              <div className="flex flex-wrap gap-2">
                <Chip on={captions === "bold"} onClick={() => setCaptions("bold")}>Bold pop-in</Chip>
                <Chip on={captions === "clean"} onClick={() => setCaptions("clean")}>Clean subtitles</Chip>
                <Chip on={captions === "none"} onClick={() => setCaptions("none")}>None</Chip>
              </div>
            </div>
            <div>
              <span className="label">Creator quality</span>
              <div className="flex flex-wrap gap-2">
                <Chip on={quality === "standard"} onClick={() => setQuality("standard")} testId="ugc-quality-standard">Standard</Chip>
                <Chip on={quality === "premium"} onClick={() => setQuality("premium")} testId="ugc-quality-premium">Premium (most lifelike)</Chip>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={broll && !!photo} disabled={!photo} onChange={(e) => setBroll(e.target.checked)} />
              Cut to product b-roll after the hook {!photo && <span className="text-subtle">(needs a product photo)</span>}
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={aiLabel} onChange={(e) => setAiLabel(e.target.checked)} className="mt-1" />
              <span>
                Show a small &quot;AI-generated&quot; label
                <span className="block text-xs text-muted">Recommended. TikTok, Meta and YouTube require AI-content disclosure; keep it on unless you label the post in-app.</span>
              </span>
            </label>
            <label className="block max-w-xs">
              <span className="label">End-card button text</span>
              <input className="input" value={ctaLabel} maxLength={30} onChange={(e) => setCtaLabel(e.target.value)} />
            </label>
            {mockProviders && (
              <label className="block max-w-xs text-xs text-muted">
                Mock mode: fail at stage (tests refunds)
                <select className="input mt-1" value={failAt} onChange={(e) => setFailAt(e.target.value)} data-testid="ugc-fail-at">
                  <option value="">— none —</option>
                  <option value="voice">voice</option>
                  <option value="composite">composite</option>
                  <option value="avatar">avatar</option>
                  <option value="broll">broll</option>
                </select>
              </label>
            )}
          </section>
        )}

        {error && <p className="mt-5 text-sm text-danger" data-testid="ugc-error">{error}</p>}

        {step > 0 && step < 3 && (
          <div className="mt-8 flex gap-2">
            <button type="button" className="btn-ghost" onClick={() => setStep(step - 1)}>Back</button>
            <button type="button" className="btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)} data-testid="ugc-next">Next</button>
          </div>
        )}
        {step === 3 && (
          <div className="mt-8">
            <button type="button" className="btn-ghost" onClick={() => setStep(2)}>Back</button>
          </div>
        )}

        {jobs.length > 0 && (
          <section className="mt-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">Your ads</h2>
              <Link href="/library" className="text-sm text-muted hover:text-foreground">Library →</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {jobs.map((j: Job) => <JobCard key={j.id} job={j} />)}
            </div>
          </section>
        )}
      </div>

      {/* Live preview + cost (Anam-style builder: settings left, preview right) */}
      <aside className="h-fit space-y-4 lg:sticky lg:top-20">
        <div className={`relative mx-auto w-full max-w-[300px] overflow-hidden rounded-[32px] border border-border bg-surface ${ratio}`} data-testid="ugc-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {firstActor?.portrait_url && <img src={firstActor.portrait_url} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.previewUrl} alt="" className="absolute bottom-[22%] left-1/2 w-[28%] -translate-x-1/2 rounded-md shadow-2xl" />
          )}
          {aiLabel && <span className="absolute top-3 left-3 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold">AI-generated</span>}
          {previewScript?.on_screen_hook && (
            <span className="absolute top-[12%] left-1/2 -translate-x-1/2 bg-white px-2 py-1 text-xs font-extrabold text-black">{previewScript.on_screen_hook}</span>
          )}
          {captions !== "none" && previewScript && (
            <span className={`absolute left-1/2 w-[90%] -translate-x-1/2 text-center ${captions === "bold" ? "top-[64%] text-lg font-extrabold uppercase [text-shadow:0_0_4px_#000,0_0_4px_#000]" : "bottom-[12%] rounded bg-black/60 px-2 py-1 text-xs font-semibold"}`}>
              {previewScript.hook.split(/\s+/).slice(0, captions === "bold" ? 3 : 6).join(" ")}
            </span>
          )}
        </div>
        <div className="card rounded-[20px] p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted">{chosen.length || 0} script{chosen.length === 1 ? "" : "s"} × {cast.length || 0} creator{cast.length === 1 ? "" : "s"}</span>
            <span className="text-2xl font-bold tabular-nums" data-testid="ugc-total">{total} cr</span>
          </div>
          {quote && (
            <p className="mt-1 text-xs text-subtle">
              {quote.perScript.map((p) => `${p.credits} cr (~${p.seconds}s)`).join(" · ")} per creator
            </p>
          )}
          <p className="mt-1 text-xs text-muted">Balance: <span data-testid="ugc-balance">{balance}</span> credits</p>
          {step === 3 ? (
            balance < total ? (
              <Link href="/billing" className="btn-primary mt-4 w-full">Get credits</Link>
            ) : (
              <button type="button" className="btn-primary mt-4 w-full" disabled={!chosen.length || !cast.length || busy === "render"} onClick={generate} data-testid="ugc-generate">
                {busy === "render" ? "Starting…" : `Generate ${chosen.length * cast.length} ad${chosen.length * cast.length === 1 ? "" : "s"} · ${total} cr`}
              </button>
            )
          ) : (
            <p className="mt-3 text-xs text-subtle">You&apos;ll see the exact cost before anything is charged.</p>
          )}
          <p className="mt-3 text-[11px] leading-snug text-subtle">Each ad is charged when it starts and refunded automatically if any step fails.</p>
        </div>
      </aside>
    </div>
  );
}
