import Link from "next/link";
import { db } from "@/lib/db";
import { CREDIT_FLOOR_USD, MIN_MARGIN } from "@/lib/pricing";
import { providerConfigured } from "@/lib/providers";

export default async function AdminModels({ searchParams }: PageProps<"/admin/models">) {
  const [models, sp] = await Promise.all([db().listModels({ includeDisabled: true }), searchParams]);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-black">Models</h1>
        <Link href="/admin/models/new" className="btn-primary">New model</Link>
      </div>
      {sp.saved && <p className="mb-4 text-sm text-foreground">Saved.</p>}
      <p className="mb-4 text-xs text-muted">Worst-case margin uses the cheapest credit price, the biggest monthly plan (${CREDIT_FLOOR_USD.toFixed(3)}/credit). Target ≥ {Math.round(MIN_MARGIN * 100)}%.</p>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase text-muted">
            <tr><th className="p-3">Model</th><th className="p-3">Provider</th><th className="p-3 text-right">Credits</th><th className="p-3 text-right">API cost</th><th className="p-3 text-right">Min margin</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {models.map((m) => {
              const revenue = m.credit_cost * CREDIT_FLOOR_USD;
              const margin = revenue > 0 ? (revenue - m.api_cost_usd) / revenue : 0;
              return (
                <tr key={m.id} className="border-t border-border">
                  <td className="p-3"><Link className="underline" href={`/admin/models/${m.id}`}>{m.name}</Link><div className="text-xs text-muted">{m.provider_model_id}</div></td>
                  <td className="p-3">{m.provider}{!providerConfigured(m.provider) && <span className="ml-1 text-xs text-danger">(mock)</span>}</td>
                  <td className="p-3 text-right">{m.credit_cost}</td>
                  <td className="p-3 text-right">${m.api_cost_usd.toFixed(3)}</td>
                  <td className={`p-3 text-right ${margin < MIN_MARGIN ? "text-danger" : "text-foreground"}`}>{Math.round(margin * 100)}%</td>
                  <td className="p-3">{m.enabled ? "on" : <span className="text-muted">off</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
