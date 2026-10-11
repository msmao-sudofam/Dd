import { requireProfile } from "@/lib/auth";
import { db } from "@/lib/db";
import { isMockProvidersForced } from "@/lib/env";
import { modelAvailable, providerConfigured } from "@/lib/providers";
import { Generator } from "@/components/create/generator";

export const metadata = { title: "Create" };

export default async function GeneratePage() {
  const profile = await requireProfile("/generate");
  const [allModels, jobs] = await Promise.all([db().listModels(), db().listJobs(profile.id, 30)]);
  const models = allModels.filter(modelAvailable);
  const mockProviders = isMockProvidersForced() || models.some((m) => !providerConfigured(m.provider));
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-black tracking-tight">Create</h1>
      <Generator models={models} initialJobs={jobs} initialBalance={profile.credits_balance} mockProviders={mockProviders} />
    </div>
  );
}
