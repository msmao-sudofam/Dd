import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminPresets({ searchParams }: PageProps<"/admin/presets">) {
  const [presets, models, sp] = await Promise.all([db().listPresets({ includeDisabled: true }), db().listModels({ includeDisabled: true }), searchParams]);
  const modelName = new Map(models.map((m) => [m.id, m.name]));
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-black">Presets</h1>
        <Link href="/admin/presets/new" className="btn-primary">New preset</Link>
      </div>
      {sp.saved && <p className="mb-4 text-sm text-foreground">Saved.</p>}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase text-muted">
            <tr><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Model</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {presets.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3"><Link className="underline" href={`/admin/presets/${p.id}`}>{p.name}</Link>{p.is_featured && <span className="ml-2 text-xs text-foreground">featured</span>}</td>
                <td className="p-3 text-muted">{p.category}</td>
                <td className="p-3 text-muted">{modelName.get(p.model_id)}</td>
                <td className="p-3">{p.enabled ? "live" : <span className="text-muted">hidden</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
