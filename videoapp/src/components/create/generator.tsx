"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Job, Model } from "@/lib/types";
import { useJobs } from "@/lib/client/use-jobs";
import { ImageUpload, type UploadedImage } from "./image-upload";
import { JobCard } from "./job-card";

const TYPE_LABEL: Record<Model["type"], string> = {
  t2v: "Text → Video",
  i2v: "Image → Video",
  t2i: "Text → Image",
  i2i: "Image → Image",
};

function cost(model: Model, duration: number | null) {
  if (model.credit_cost_per_second && duration) return Math.ceil(model.credit_cost_per_second * duration);
  return model.credit_cost;
}

export function Generator({
  models,
  initialJobs,
  initialBalance,
  mockProviders,
}: {
  models: Model[];
  initialJobs: Job[];
  initialBalance: number;
  mockProviders: boolean;
}) {
  const [balance, setBalance] = useState(initialBalance);
  const { jobs, upsert } = useJobs(initialJobs, setBalance);
  const [modelId, setModelId] = useState(models[0]?.id ?? "");
  const model = models.find((m) => m.id === modelId) ?? models[0];
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [duration, setDuration] = useState<number | null>(model?.default_duration ?? null);
  const [aspect, setAspect] = useState("9:16");
  const [forceFail, setForceFail] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsImage = model?.type === "i2v" || model?.type === "i2i";
  const price = useMemo(() => (model ? cost(model, duration) : 0), [model, duration]);

  function pickModel(m: Model) {
    setModelId(m.id);
    setDuration(m.default_duration);
    setAspect(m.allowed_aspects.includes(aspect) ? aspect : m.allowed_aspects.includes("9:16") ? "9:16" : m.allowed_aspects[0]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!model) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: model.id,
          prompt,
          imagePath: needsImage ? image?.path : null,
          duration,
          aspectRatio: aspect,
          forceFail: forceFail || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      upsert([data.job]);
      setBalance(data.balance);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!model) return <p className="text-muted">No models are enabled yet.</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="card h-fit space-y-5 p-5 lg:sticky lg:top-20">
        <div>
          <span className="label">Model</span>
          <div className="grid grid-cols-2 gap-2" role="radiogroup">
            {models.map((m) => (
              <button
                type="button"
                key={m.id}
                role="radio"
                aria-checked={m.id === model.id}
                onClick={() => pickModel(m)}
                data-testid={`model-${m.slug}`}
                className={`rounded-xl border p-3 text-left text-xs transition ${m.id === model.id ? "border-white/40 bg-surface-2" : "border-border hover:border-muted"}`}
              >
                <div className="text-sm font-semibold text-foreground">{m.name}</div>
                <div className="text-muted">{TYPE_LABEL[m.type]}</div>
                <div className="mt-1 text-[11px] uppercase tracking-wide text-foreground">{m.tier}</div>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">{model.description}</p>
        </div>

        {needsImage && <ImageUpload value={image} onChange={setImage} label="Start image" />}

        <div>
          <label className="label" htmlFor="prompt">Prompt</label>
          <textarea
            id="prompt"
            className="input min-h-28 resize-y"
            placeholder="A glass serum bottle on wet black stone, slow orbit, soft rim light…"
            value={prompt}
            maxLength={2000}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {model.allowed_durations.length > 0 && (
            <div>
              <label className="label" htmlFor="duration">Duration</label>
              <select id="duration" className="input" value={duration ?? ""} onChange={(e) => setDuration(Number(e.target.value))}>
                {model.allowed_durations.map((d) => (
                  <option key={d} value={d}>{d}s</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label" htmlFor="aspect">Aspect</label>
            <select id="aspect" className="input" value={aspect} onChange={(e) => setAspect(e.target.value)}>
              {model.allowed_aspects.map((a) => (
                <option key={a} value={a}>{a}{a === "9:16" ? " (Reels/TikTok)" : ""}</option>
              ))}
            </select>
          </div>
        </div>

        {mockProviders && (
          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={forceFail} onChange={(e) => setForceFail(e.target.checked)} data-testid="force-fail" />
            Mock mode: force this job to fail (tests the refund)
          </label>
        )}

        {error && <p className="text-sm text-danger" data-testid="generate-error">{error}</p>}

        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <div className="text-sm">
            <div className="font-semibold" data-testid="cost">{price} credits</div>
            <div className="text-xs text-muted">Balance: <span data-testid="gen-balance">{balance}</span></div>
          </div>
          {balance < price ? (
            <Link href="/billing" className="btn-primary">Buy credits</Link>
          ) : (
            <button className="btn-primary" disabled={busy || !prompt.trim() || (needsImage && !image)} data-testid="generate">
              {busy ? "Starting…" : `Generate · ${price} cr`}
            </button>
          )}
        </div>
        <p className="text-[11px] leading-snug text-muted">
          Credits are charged when you start. If a generation fails, they&apos;re refunded automatically.
        </p>
      </form>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Your creations</h2>
          <Link href="/library" className="text-sm text-muted hover:text-foreground">Library →</Link>
        </div>
        {jobs.length === 0 ? (
          <div className="card p-10 text-center text-sm text-muted">Your clips will show up here.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {jobs.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
