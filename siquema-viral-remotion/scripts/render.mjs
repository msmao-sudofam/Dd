// Renders every reel (or the ones named) to out/<Id>.mp4 as H.264, CRF 18.
//
//   npm run render                                  # all 8
//   npm run render -- NoMystery FinePrint           # just these
//   npm run render -- CommentReply --username=@maria --comment="is it safe with coffee?"
//
// Options:
//   --username / --comment   props for CommentReply (output gets a suffix from the username)
//   --browser=<path>         use an existing Chrome/Chromium instead of Remotion's download
// Env:
//   REMOTION_LOCAL_FONTS=1   load fonts from public/fonts instead of Google Fonts
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, selectComposition } from "@remotion/renderer";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (k) => {
  const a = args.find((x) => x.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : undefined;
};
const only = args.filter((a) => !a.startsWith("--"));
const browserExecutable = flag("browser") ?? process.env.REMOTION_BROWSER ?? null;
const envVariables = { REMOTION_LOCAL_FONTS: process.env.REMOTION_LOCAL_FONTS ?? "" };

const outDir = path.join(root, "out");
fs.mkdirSync(outDir, { recursive: true });

// Reel 2 uses public/scoop.mp4 automatically once it's there.
const hasScoop = fs.existsSync(path.join(root, "public", "scoop.mp4"));
const username = flag("username");
const comment = flag("comment");

const propsFor = (id) => {
  if (id === "GuessTheCaffeine") return { scoopSrc: hasScoop ? "scoop.mp4" : null };
  if (id === "CommentReply" && (username || comment)) {
    return { username: username ?? "@username", comment: comment ?? "your question here" };
  }
  return undefined;
};
const fileFor = (id) => {
  if (id === "CommentReply" && username) return `${id}-${username.replace(/[^a-z0-9]+/gi, "").toLowerCase()}.mp4`;
  return `${id}.mp4`;
};

console.log("bundling…");
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
const comps = await getCompositions(serveUrl, { browserExecutable, envVariables });
const ids = comps.filter((c) => c.id !== "ContactSheet").map((c) => c.id).filter((id) => only.length === 0 || only.includes(id));
if (only.length && ids.length !== only.length) {
  console.error("unknown composition(s):", only.filter((x) => !ids.includes(x)).join(", "));
  process.exit(1);
}
if (ids.includes("GuessTheCaffeine") && !hasScoop) {
  console.warn("note: public/scoop.mp4 not found; GuessTheCaffeine uses its built-in background.");
}

for (const id of ids) {
  const inputProps = propsFor(id);
  const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable, envVariables });
  const outputLocation = path.join(outDir, fileFor(id));
  const t0 = Date.now();
  let last = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    crf: 18,
    pixelFormat: "yuv420p",
    colorSpace: "bt709",
    audioCodec: "aac",
    outputLocation,
    inputProps,
    browserExecutable,
    envVariables,
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 10);
      if (p !== last) {
        last = p;
        process.stdout.write(`\r${id}: ${p * 10}%`);
      }
    },
  });
  console.log(`\r${id}: done in ${((Date.now() - t0) / 1000).toFixed(0)}s -> ${path.relative(root, outputLocation)}`);
}
