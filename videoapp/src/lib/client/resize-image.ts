"use client";

const MAX_SIDE = 2048;
const MAX_BYTES = 3.5 * 1024 * 1024; // stay under Vercel's ~4.5 MB request limit

/** Downscale large photos in the browser before upload. Small files pass through untouched. */
export async function prepareImage(file: File): Promise<File> {
  if (file.size <= MAX_BYTES && file.type !== "image/heic") {
    const dims = await imageSize(file).catch(() => null);
    if (!dims || Math.max(dims.w, dims.h) <= MAX_SIDE) return file;
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process image"))), "image/jpeg", 0.9),
  );
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

function imageSize(file: File): Promise<{ w: number; h: number }> {
  return createImageBitmap(file).then((b) => ({ w: b.width, h: b.height }));
}
