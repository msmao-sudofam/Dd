import type { Model, ProviderName } from "@/lib/types";

export interface GenerationRequest {
  prompt: string;
  imageUrl?: string | null;
  duration?: number | null;
  aspectRatio?: string | null;
  /** Mock-only: force the job to fail (used to test refunds). */
  forceFail?: boolean;
}

export type ProviderState = "queued" | "running" | "succeeded" | "failed";

export interface ProviderResult {
  state: ProviderState;
  outputUrl?: string;
  error?: string;
}

export interface WebhookEvent {
  requestId: string;
  result: ProviderResult;
}

/**
 * Swappable provider interface (BUILD_PLAN §2/Phase 2). Each adapter maps our generic request onto
 * the provider API, normalises its results, and verifies its webhooks.
 */
export interface ProviderAdapter {
  readonly name: ProviderName;
  submit(model: Model, req: GenerationRequest, webhookUrl: string): Promise<{ requestId: string }>;
  status(model: Model, requestId: string): Promise<ProviderResult>;
  /** Normalise a provider result/webhook payload into our shape. */
  parseResult(raw: unknown): ProviderResult;
  /** Returns null if the signature is missing/invalid. */
  verifyWebhook(headers: Headers, rawBody: string, url: URL): Promise<WebhookEvent | null>;
  /** Pipeline stages (UGC studio) call endpoints directly with a ready-made input. */
  submitRaw?(endpointId: string, input: Record<string, unknown>, webhookUrl: string, opts?: { forceFail?: boolean }): Promise<{ requestId: string }>;
  statusRaw?(endpointId: string, requestId: string): Promise<ProviderResult>;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
