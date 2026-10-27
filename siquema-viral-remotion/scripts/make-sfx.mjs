// Synthesizes the original SFX used by the reels into public/sfx/*.wav.
// Pure math, no samples, so there's nothing to license. Run: npm run sfx
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SR = 48000;
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "sfx");
fs.mkdirSync(outDir, { recursive: true });

let seed = 12345;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

function writeWav(name, samples) {
  const peak = Math.max(...samples.map(Math.abs)) || 1;
  const gain = 0.7 / peak; // about -3 dBFS
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s * gain)) * 32767), 44 + i * 2));
  fs.writeFileSync(path.join(outDir, name), buf);
}

const gen = (dur, fn) => Array.from({ length: Math.round(dur * SR) }, (_, i) => fn(i / SR, i));

// pop: fast pitch-drop sine with a click on the front
{
  let ph = 0;
  writeWav("pop.wav", gen(0.14, (t) => {
    const f = 300 + 900 * Math.exp(-t * 40);
    ph += (2 * Math.PI * f) / SR;
    return Math.sin(ph) * Math.exp(-t * 28) * Math.min(1, t * 800) + rnd() * 0.25 * Math.exp(-t * 400);
  }));
}

// tick: tiny bright click for counters and typing
writeWav("tick.wav", gen(0.035, (t) => (rnd() * 0.6 + Math.sin(2 * Math.PI * 2400 * t)) * Math.exp(-t * 160)));

// whoosh: noise through a sweeping resonant band-pass, bell envelope
{
  let lp = 0, bp = 0;
  const d = 0.42;
  writeWav("whoosh.wav", gen(d, (t) => {
    const k = t / d;
    const fc = 300 + 3200 * k * k;
    const f = 2 * Math.sin((Math.PI * fc) / SR);
    const x = rnd();
    lp += f * bp;
    const hp = x - lp - 0.5 * bp;
    bp += f * hp;
    return bp * Math.sin(Math.PI * k) ** 1.5;
  }));
}

// impact: sub thump (pitch drop) + short low-passed noise transient
{
  let ph = 0, lp = 0;
  writeWav("impact.wav", gen(0.6, (t) => {
    const f = 45 + 110 * Math.exp(-t * 18);
    ph += (2 * Math.PI * f) / SR;
    lp += 0.08 * (rnd() - lp);
    return Math.sin(ph) * Math.exp(-t * 6) * Math.min(1, t * 1500) + lp * 3 * Math.exp(-t * 60);
  }));
}

// ding: two bell partials for the reveal
writeWav("ding.wav", gen(0.8, (t) =>
  (Math.sin(2 * Math.PI * 1046.5 * t) + 0.5 * Math.sin(2 * Math.PI * 1568 * t) + 0.25 * Math.sin(2 * Math.PI * 2093 * t)) *
  Math.exp(-t * 5) * Math.min(1, t * 2000)));

console.log("sfx ->", outDir);
