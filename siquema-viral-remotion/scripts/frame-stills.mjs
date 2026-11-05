// Renders specific frames of compositions as PNG stills, from one bundle (REMOTION_LOCAL_FONTS=1 fonts).
//   node scripts/frame-stills.mjs <outDir> <frame,frame,...> <Id> [<Id> ...]
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
const [outDir, frames, ...ids] = process.argv.slice(2);
const root = process.cwd();
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const envVariables = { REMOTION_LOCAL_FONTS: "1" };
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable, envVariables });
  for (const fr of frames.split(",").map(Number)) await renderStill({ composition, serveUrl, frame: fr, output: path.join(outDir, `${id}_${String(fr).padStart(3, "0")}.png`), browserExecutable, envVariables });
  console.log(id, "ok");
}
