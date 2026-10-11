import "server-only";
import type { Job } from "@/lib/types";

export interface OutputFile {
  bytes: Uint8Array;
  contentType: string;
}

/** Hook between download and storage (watermarking for free-tier outputs lands here in Phase 5). */
export async function postProcessOutput(_job: Job, file: OutputFile): Promise<OutputFile> {
  return file;
}
