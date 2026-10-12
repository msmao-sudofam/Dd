"use client";

import { prepareImage } from "@/lib/client/resize-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useJobs } from "@/lib/client/use-jobs";
import type { Job } from "@/lib/types";
import { CONSENT_LABEL } from "../create/image-upload";
import { JobCard } from "../create/job-card";

/**
 * The 3-click flow: (1) tick consent, (2) pick a photo → uploads and starts generating
 * immediately (cost is shown on the button before you click). Subject-only presets: type + Generate.
 */
export function PresetRunner({
  presetId,
  presetSlug,
  carried = null,
  credits,
  requiresImage,
  requiresSubject,
  balance: initialBalance,
}: {
  presetId: string;
  presetSlug?: string;
  /** The photo (or ad frame) the visitor previewed before signing up; one click animates it. */
  carried?: { name: string; previewUrl: string } | null;
  credits: number;
  requiresImage: boolean;
  requiresSubject: boolean;
  balance: number;
}) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance);
  const { jobs, upsert } = useJobs([], setBalance);
  const [consent, setConsent] = useState(false);
  const [subject, setSubject] = useState("");
  const [busy, setBusy] = useState<null | "upload" | "generate">(null);
  const [useCarried, setUseCarried] = useState(!!carried);
  const [error, setError] = useState<string | null>(null);
  const job: Job | undefined = jobs[0];
  const short = balance < credits;

  async function generate(imagePath: string | null) {
    setBusy("generate");
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presetId, imagePath, subject: subject.trim() || undefined }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Generation failed");
    upsert([data.job]);
    setBalance(data.balance);
      router.refresh(); // header credit chip
  }

  async function onFile(file: File) {
    setError(null);
    if (requiresSubject && !subject.trim()) return setError("Describe your subject first.");
    setBusy("upload");
    try {
      const fd = new FormData();
      fd.set("file", await prepareImage(file));
      fd.set("consent", "true");
      const up = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await up.json();
      if (!up.ok) throw new Error(data.error ?? "Upload failed");
      await generate(data.path);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  /** Copies the previewed photo into the account (consent was given on the preview), then starts the clip. */
  async function onGenerateCarried() {
    setError(null);
    if (requiresSubject && !subject.trim()) return setError("Describe your subject first.");
    setBusy("upload");
    try {
      const res = await fetch("/api/try/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetSlug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not use that photo");
      await generate(data.path);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function onGenerateTextOnly() {
    setError(null);
    try {
      await generate(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  if (job) {
    return (
      <div className="space-y-4">
        <div className="mx-auto max-w-xs"><JobCard job={job} /></div>
        <div className="flex justify-center gap-2">
          <button className="btn-ghost" onClick={() => window.location.reload()}>Run again</button>
          <Link href="/library" className="btn-primary">Open library</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requiresSubject && (
        <div>
          <label className="label" htmlFor="subject">What&apos;s your product?</label>
          <input id="subject" className="input" maxLength={200} placeholder="e.g. matte black water bottle" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
      )}

      {short ? (
        <div className="card p-4 text-sm">
          This preset costs {credits} credits — you have {balance}.{" "}
          <Link href="/billing" className="text-foreground underline">Go monthly or get a pack</Link>
        </div>
      ) : requiresImage && useCarried && carried ? (
        <div className="space-y-3" data-testid="carried">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={carried.previewUrl} alt={carried.name || "Your product"} className="h-28 w-[63px] shrink-0 rounded-xl bg-white object-cover" />
            <div className="text-sm">
              <p className="font-semibold">{carried.name || "Your product"}</p>
              <p className="mt-1 text-xs text-muted">The photo from your preview. You confirmed it&apos;s yours to use.</p>
            </div>
          </div>
          <button className="btn-primary btn-sheen w-full !py-3" disabled={!!busy} onClick={onGenerateCarried} data-testid="generate-carried">
            {busy ? "Starting…" : `Generate · ${credits} credits`}
          </button>
          <button type="button" className="text-xs text-muted underline decoration-white/30 underline-offset-4 hover:text-foreground" onClick={() => setUseCarried(false)}>
            Use a different photo
          </button>
        </div>
      ) : requiresImage ? (
        <>
          <label className="flex items-start gap-2 text-xs text-muted">
            <input type="checkbox" className="mt-0.5" checked={consent} onChange={(e) => setConsent(e.target.checked)} data-testid="consent-checkbox" />
            <span>{CONSENT_LABEL}</span>
          </label>
          <label
            className={`flex h-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed text-center transition ${consent ? "border-white/40 bg-wash hover:bg-wash" : "border-border opacity-50"}`}
          >
            <span className="text-base font-semibold">{busy === "upload" ? "Uploading…" : busy === "generate" ? "Starting…" : "Upload photo & generate"}</span>
            <span className="text-xs text-muted">{credits} credits · balance {balance}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={!consent || !!busy}
              data-testid="file-input"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
            />
          </label>
        </>
      ) : (
        <button className="btn-primary w-full" disabled={!!busy || (requiresSubject && !subject.trim())} onClick={onGenerateTextOnly} data-testid="generate">
          {busy ? "Starting…" : `Generate · ${credits} credits`}
        </button>
      )}
      {error && <p className="text-sm text-danger" data-testid="generate-error">{error}</p>}
      <p className="text-[11px] text-muted">Credits are charged when generation starts and refunded automatically if it fails.</p>
    </div>
  );
}
