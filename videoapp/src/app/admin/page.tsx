import Link from "next/link";
import { db } from "@/lib/db";
import { isMockBackend, isMockStripe, missingKeys } from "@/lib/env";
import { providerConfigured } from "@/lib/providers";

export default async function AdminHome() {
  const [models, presets, profiles] = await Promise.all([
    db().listModels({ includeDisabled: true }),
    db().listPresets({ includeDisabled: true }),
    db().listProfiles(1000),
  ]);
  const missing = missingKeys();
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/presets" className="card p-5"><div className="label">Presets</div><div className="text-3xl font-black">{presets.length}</div></Link>
        <Link href="/admin/models" className="card p-5"><div className="label">Models</div><div className="text-3xl font-black">{models.length}</div></Link>
        <div className="card p-5"><div className="label">Users</div><div className="text-3xl font-black">{profiles.length}</div></div>
      </div>
      <div className="card p-5 text-sm">
        <h2 className="mb-3 font-bold">Integrations</h2>
        <ul className="space-y-1">
          <li>Backend: {isMockBackend() ? <span className="text-danger">mock (file DB)</span> : "Supabase"}</li>
          <li>Payments: {isMockStripe() ? <span className="text-danger">mock Stripe</span> : "Stripe"}</li>
          {(["fal", "replicate", "self"] as const).map((p) => (
            <li key={p}>{p}: {providerConfigured(p) ? "live" : <span className="text-danger">mock</span>}</li>
          ))}
        </ul>
        {missing.length > 0 && <p className="mt-3 text-muted">Missing keys: {missing.join(", ")}</p>}
      </div>
    </div>
  );
}
