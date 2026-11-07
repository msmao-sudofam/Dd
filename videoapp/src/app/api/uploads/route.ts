import { randomUUID } from "node:crypto";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CONSENT_STATEMENT, moderateImage, moderationMessage } from "@/lib/moderation";

const MAX_BYTES = 15 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

function sniff(b: Uint8Array): string | null {
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45) return "image/webp";
  return null;
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Log in first." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file uploaded." }, { status: 400 });
  if (form?.get("consent") !== "true")
    return Response.json({ error: "Please confirm you have the rights and consent for this photo." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Image must be under 15 MB." }, { status: 413 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniff(bytes);
  if (!type || !TYPES[type]) return Response.json({ error: "Upload a PNG, JPEG or WebP image." }, { status: 415 });

  const mod = await moderateImage(`data:${type};base64,${Buffer.from(bytes).toString("base64")}`);
  if (!mod.allowed) {
    await db().logModeration({ userId: user.id, kind: "image", excerpt: file.name, reasons: mod.reasons, source: mod.source });
    return Response.json({ error: moderationMessage(mod.reasons) }, { status: 422 });
  }

  const path = `${user.id}/${randomUUID()}.${TYPES[type]}`;
  await db().uploadObject("uploads", path, bytes, type);
  await db().logConsent({
    userId: user.id,
    uploadPath: path,
    statement: CONSENT_STATEMENT,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: req.headers.get("user-agent"),
  });
  return Response.json({ path, previewUrl: await db().objectUrl("uploads", path, 3600) });
}
