import { db } from "@/lib/db";
import { computeMargin, type MarginRow } from "@/lib/margin";

const usd = (n: number) => `$${n.toFixed(2)}`;
const pct = (n: number) => `${Math.round(n * 100)}%`;

function Table({ rows, showDay }: { rows: MarginRow[]; showDay?: boolean }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-surface-2 text-left text-xs uppercase text-muted">
          <tr>
            {showDay && <th className="p-3">Day</th>}
            <th className="p-3">Model</th><th className="p-3 text-right">Jobs</th><th className="p-3 text-right">Failed</th>
            <th className="p-3 text-right">Credits</th><th className="p-3 text-right">Revenue</th><th className="p-3 text-right">API cost</th>
            <th className="p-3 text-right">Profit</th><th className="p-3 text-right">Margin</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-border" data-testid={`margin-${r.key}`}>
              {showDay && <td className="p-3 text-muted">{r.day}</td>}
              <td className="p-3 font-medium">{r.model}</td>
              <td className="p-3 text-right">{r.jobs}</td>
              <td className="p-3 text-right">{r.failed}</td>
              <td className="p-3 text-right">{r.creditsSpent}</td>
              <td className="p-3 text-right">{usd(r.revenueUsd)}</td>
              <td className="p-3 text-right">{usd(r.costUsd)}</td>
              <td className={`p-3 text-right font-semibold ${r.profitUsd < 0 ? "text-danger" : "text-accent"}`}>{usd(r.profitUsd)}</td>
              <td className={`p-3 text-right ${r.marginPct < 0.6 ? "text-danger" : ""}`}>{pct(r.marginPct)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function MarginPage({ searchParams }: PageProps<"/admin/margin">) {
  const sp = await searchParams;
  const days = Math.min(365, Math.max(1, Number(sp.days ?? 30)));
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const [jobs, ledger, models] = await Promise.all([
    db().listJobsSince(since),
    db().listLedgerSince(since, ["purchase", "subscription", "signup_bonus", "referral", "admin"]),
    db().listModels({ includeDisabled: true }),
  ]);
  const r = computeMargin(jobs, ledger, models);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Margin — last {days} days</h1>
        <div className="flex gap-2 text-sm">
          {[7, 30, 90].map((d) => <a key={d} href={`?days=${d}`} className={d === days ? "text-accent" : "text-muted"}>{d}d</a>)}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card p-5"><div className="label">Cash in</div><div className="text-2xl font-black" data-testid="cash-in">{usd(r.cashInUsd)}</div></div>
        <div className="card p-5"><div className="label">API cost</div><div className="text-2xl font-black">{usd(r.totals.costUsd)}</div></div>
        <div className="card p-5"><div className="label">Gross profit (earned)</div><div className="text-2xl font-black">{usd(r.totals.profitUsd)}</div></div>
        <div className="card p-5"><div className="label">Effective $/credit</div><div className="text-2xl font-black">${r.effectiveCreditUsd.toFixed(3)}</div><div className="text-xs text-muted">{r.creditsSold} sold · {r.freeCreditsGranted} free</div></div>
      </div>
      <section>
        <h2 className="mb-3 font-bold">Profit per model</h2>
        <Table rows={r.byModel} />
      </section>
      <section>
        <h2 className="mb-3 font-bold">Per day</h2>
        <Table rows={r.byDay} showDay />
      </section>
      <p className="text-xs text-muted">
        Revenue = credits spent on non-failed jobs × effective $/credit (cash ÷ all credits issued, free ones included).
        API cost includes failed jobs, since providers may still bill them. Target margin ≥ 60%.
      </p>
    </div>
  );
}
