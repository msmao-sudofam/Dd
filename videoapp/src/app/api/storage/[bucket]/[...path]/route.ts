import { readFile } from "node:fs/promises";
import path from "node:path";
import { isMockBackend } from "@/lib/env";
import { mockSignObjectPath, storageDir } from "@/lib/db/mock";

const TYPES: Record<string, string> = { mp4: "video/mp4", png: "image/png", jpg: "image/jpeg", webp: "image/webp" };

// Serves files for the mock backend only (Supabase Storage serves them in production).
export async function GET(req: Request, ctx: RouteContext<"/api/storage/[bucket]/[...path]">) {
  if (!isMockBackend()) return new Response("not found", { status: 404 });
  const { bucket, path: parts } = await ctx.params;
  if (bucket !== "outputs" && bucket !== "uploads") return new Response("not found", { status: 404 });
  const rel = parts.join("/");
  if (bucket === "uploads") {
    const u = new URL(req.url);
    const exp = Number(u.searchParams.get("exp"));
    if (!exp || exp < Date.now() / 1000 || u.searchParams.get("sig") !== mockSignObjectPath(bucket, rel, exp))
      return new Response("forbidden", { status: 403 });
  }
  const root = path.join(storageDir(), bucket);
  const file = path.resolve(root, rel);
  if (!file.startsWith(root + path.sep)) return new Response("not found", { status: 404 });
  try {
    const body = await readFile(file);
    const download = new URL(req.url).searchParams.get("download");
    return new Response(body, {
      headers: {
        "Content-Type": TYPES[path.extname(file).slice(1)] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
        ...(download ? { "Content-Disposition": `attachment; filename="${path.basename(file)}"` } : {}),
      },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
