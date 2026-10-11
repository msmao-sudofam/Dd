"use client";

import { prepareImage } from "@/lib/client/resize-image";
import { useId, useState } from "react";

export const CONSENT_LABEL =
  "I own this image. Anyone shown in it is me or has given consent, and no one shown is under 18.";

export interface UploadedImage {
  path: string;
  previewUrl: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Photo",
}: {
  value: UploadedImage | null;
  onChange: (v: UploadedImage | null) => void;
  label?: string;
}) {
  const id = useId();
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    if (!consent) {
      setError("Tick the consent box first.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", await prepareImage(file));
      fd.set("consent", "true");
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data as UploadedImage);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      {value ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.previewUrl} alt="Uploaded" className="h-24 w-24 rounded-xl object-cover" data-testid="upload-preview" />
          <button type="button" className="btn-ghost !py-1.5" onClick={() => onChange(null)}>
            Replace
          </button>
        </div>
      ) : (
        <>
          <label className="mb-3 flex items-start gap-2 text-xs text-muted">
            <input
              type="checkbox"
              className="mt-0.5 accent-white"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              data-testid="consent-checkbox"
            />
            <span>{CONSENT_LABEL}</span>
          </label>
          <label
            htmlFor={id}
            className={`flex h-28 cursor-pointer items-center justify-center rounded-xl border border-dashed border-border bg-surface-2 text-sm text-muted hover:border-white/40 ${!consent ? "opacity-50" : ""}`}
          >
            {busy ? "Uploading…" : "Drop a photo or click to upload"}
          </label>
          <input
            id={id}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={busy || !consent}
            data-testid="file-input"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
        </>
      )}
      {error && <p className="mt-2 text-sm text-danger" data-testid="upload-error">{error}</p>}
    </div>
  );
}
