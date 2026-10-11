import { requireProfile } from "@/lib/auth";
import { db } from "@/lib/db";
import { isMockProvidersForced } from "@/lib/env";
import { providerConfigured } from "@/lib/providers";
import { UgcStudio } from "@/components/ugc/studio";

export const metadata = { title: "UGC Ad Studio" };

export default async function UgcNewPage() {
  const profile = await requireProfile("/ugc/new");
  const actors = await db().listUgcActors(profile.id);
  // Own-face creators live in the private uploads bucket: sign their portraits for the picker.
  const withUrls = await Promise.all(
    actors.map(async (a) => (a.upload_path ? { ...a, portrait_url: await db().objectUrl("uploads", a.upload_path, 3600) } : a)),
  );
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm text-muted">UGC Ad Studio</p>
      <h1 className="display mt-1 mb-8 text-[clamp(36px,5vw,56px)]">Make a UGC ad</h1>
      <UgcStudio actors={withUrls} balance={profile.credits_balance} mockProviders={isMockProvidersForced() || !providerConfigured("fal")} />
    </div>
  );
}
