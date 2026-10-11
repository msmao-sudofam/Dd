import { env, isMockProvidersForced } from "@/lib/env";
import type { ProviderName } from "@/lib/types";
import { falAdapter } from "./fal";
import { mockAdapter } from "./mock";
import { replicateAdapter } from "./replicate";
import { selfAdapter } from "./self";
import type { ProviderAdapter } from "./types";

export * from "./types";

const adapters: Record<ProviderName, ProviderAdapter> = {
  fal: falAdapter,
  replicate: replicateAdapter,
  self: selfAdapter,
  mock: mockAdapter,
};

export function providerConfigured(name: ProviderName): boolean {
  switch (name) {
    case "fal":
      return !!env.falKey();
    case "replicate":
      return !!env.replicateToken();
    case "self":
      return !!env.runpodApiKey() && !!env.runpodEndpointId() && !!env.selfWebhookSecret();
    case "mock":
      return true;
  }
}

/** Adapter used to SUBMIT a job for a model: falls back to mock when keys are missing. */
export function adapterForModel(provider: ProviderName): ProviderAdapter {
  if (isMockProvidersForced() || !providerConfigured(provider)) return mockAdapter;
  return adapters[provider];
}

/** Adapter that owns an existing job (jobs record the adapter actually used). */
export function adapterByName(name: ProviderName): ProviderAdapter {
  return adapters[name];
}

export function webhookUrlFor(name: ProviderName): string {
  return `${env.appUrl()}/api/webhooks/${name}`;
}
