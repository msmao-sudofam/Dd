"use client";

import { useEffect, useState } from "react";

/** Candidate action colours. Every one keeps black text above 4.5:1. The first is the shipped one. */
export const ACCENTS = [
  { id: "lime", name: "Lime", value: "#c6ff3d" },
  { id: "ember", name: "Ember", value: "#ff5a2e" },
  { id: "gold", name: "Gold", value: "#ffb547" },
  { id: "pink", name: "Pink", value: "#ff3f8e" },
  { id: "violet", name: "Violet", value: "#8f73ff" },
  { id: "blue", name: "Blue", value: "#4d8dff" },
] as const;

const KEY = "accent-preview";
const KEY_TEXT = "accent-preview-text";

/**
 * Preview deployments only (see app/layout.tsx): a row of swatches that swaps the action colour on the
 * live page, so a colour can be judged on the real site before it is chosen. `?accent=<id>` picks one from
 * a link. "On text" also puts the colour on the rolling look name and the small dots (`[data-accent-text]`
 * in globals.css), to judge a bolder use of it. The choice lasts for the browser tab. Nothing here ships to
 * production.
 */
export function AccentPicker() {
  const [id, setId] = useState<string>(ACCENTS[0].id);
  const [onText, setOnText] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = new URLSearchParams(window.location.search).get("accent") ?? window.sessionStorage.getItem(KEY);
    } catch {}
    // The saved choice lives outside React (URL, session storage), so it can only be read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved && ACCENTS.some((a) => a.id === saved)) setId(saved);
    try {
      if (window.sessionStorage.getItem(KEY_TEXT) === "1") setOnText(true);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-accent-text", onText);
    try {
      window.sessionStorage.setItem(KEY_TEXT, onText ? "1" : "0");
    } catch {}
  }, [onText]);

  useEffect(() => {
    const accent = ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
    document.documentElement.style.setProperty("--accent", accent.value);
    try {
      window.sessionStorage.setItem(KEY, accent.id);
    } catch {}
  }, [id]);

  return (
    <div className="fixed bottom-3 left-3 z-[70] flex items-center gap-2 rounded-full border border-white/15 bg-[#161616] py-1.5 pr-2 pl-3 text-xs text-muted shadow-[0_16px_50px_rgba(0,0,0,0.6)]" data-testid="accent-picker">
      <span>Colour</span>
      {ACCENTS.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => setId(a.id)}
          aria-label={a.name}
          aria-pressed={a.id === id}
          title={a.name}
          className={`h-6 w-6 rounded-full transition ${a.id === id ? "ring-2 ring-white ring-offset-2 ring-offset-[#161616]" : "opacity-80 hover:opacity-100"}`}
          style={{ background: a.value }}
        />
      ))}
      <button
        type="button"
        onClick={() => setOnText((v) => !v)}
        aria-pressed={onText}
        className={`ml-1 rounded-full px-2.5 py-1 font-medium transition ${onText ? "bg-white text-black" : "bg-ghost text-soft"}`}
      >
        On text
      </button>
    </div>
  );
}
