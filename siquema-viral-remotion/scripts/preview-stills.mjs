// Renders preview stills (fractions of each composition) into a folder, from one bundle.
//   node scripts/preview-stills.mjs <outDir> <Id> [<Id> ...]
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const [outDir, ...ids] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const envVariables = { REMOTION_LOCAL_FONTS: process.env.REMOTION_LOCAL_FONTS ?? "" };
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable, envVariables });
  for (const frac of [0, 0.3, 0.6, 0.85]) {
    const frame = Math.floor((composition.durationInFrames - 1) * frac);
    await renderStill({ composition, serveUrl, frame, output: path.join(outDir, `${id}_${String(frame).padStart(3, "0")}.png`), browserExecutable, envVariables });
  }
  console.log(id, "ok");
}
