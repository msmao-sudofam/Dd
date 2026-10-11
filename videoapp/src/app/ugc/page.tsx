import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { estimateUgcCost, scriptText } from "@/lib/ugc/config";
import { templateScript } from "@/lib/ugc/script";

export const metadata = {
  title: "AI UGC video ads for brands",
  description: "Turn your product into UGC-style video ads: AI-written scripts, AI creators holding your product, voiceover, captions and an end card. Test hooks at scale.",
};

const STEPS = [
  { k: "Your product", v: "Name, a couple of benefits and one product photo. That's the brief." },
  { k: "Scripts that hook", v: "Four angles written for you — problem/solution, POV, 3 reasons, first impressions. Edit any line." },
  { k: "Pick creators", v: "Eight AI creators with distinct looks and voices — or use your own face." },
  { k: "Get the edit", v: "Talking creator holding your product, b-roll cutaway, captions, on-screen hook and end card." },
];

const EDIT = [
  "Voiceover in the creator's voice",
  "Creator holding your actual product",
  "Lip-synced talking-head video",
  "Product b-roll cutaway after the hook",
  "Bold pop-in or clean captions",
  "On-screen hook text",
  "End card with your CTA",
  "AI-generated disclosure label",
  "9:16, 4:5 and 1:1",
];

const sample = { name: "Glow Serum", description: "", benefits: ["soaks in fast", "no sticky feel"], audience: "", offer: "", tone: "friendly" as const };

export default async function UgcLanding() {
  const [user, actors] = await Promise.all([getSessionUser(), db().listUgcActors(null)]);
  const start = user ? "/ugc/new" : "/signup?next=/ugc/new";
  const typical = estimateUgcCost(scriptText(templateScript(sample, "three-reasons")), { quality: "standard", broll: true, hasProductImage: true });
  const examples = actors.slice(0, 3).map((a, i) => ({ a, s: templateScript(sample, ["problem-solution", "pov", "three-reasons"][i]) }));

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 lg:grid-cols-[1fr_minmax(0,520px)]">
        <div>
          <p className="mb-5 text-sm text-muted">UGC Ad Studio</p>
          <h1 className="display text-[clamp(44px,6.6vw,88px)]">UGC ads without hiring creators.</h1>
          <p className="mt-6 max-w-lg text-lg text-muted">
            Give us your product. Get talking-head ads of a creator holding it, with captions, b-roll and a call to action — ready to test on TikTok, Reels and Shorts.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={start} className="btn-primary !px-5 !py-3 !text-[15px]" data-testid="ugc-cta">Make a UGC ad</Link>
            <Link href="#how" className="btn-ghost !py-3">How it works</Link>
          </div>
          <p className="mt-4 text-xs text-subtle">About {typical.credits} credits per {typical.seconds}-second ad · cost shown before you generate</p>
        </div>
        <div className="grid grid-cols-3 gap-3" aria-label="Example ad layouts">
          {examples.map(({ a, s }, i) => (
            <figure key={a.id} className={`relative aspect-[9/16] overflow-hidden rounded-[20px] bg-surface ${i === 1 ? "translate-y-8" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {a.portrait_url && <img src={a.portrait_url} alt={`${a.name}, AI creator`} className="absolute inset-0 h-full w-full object-cover" />}
              <span className="absolute top-2 left-2 rounded bg-black/60 px-1 py-0.5 text-[8px] font-semibold">AI-generated</span>
              <span className="absolute top-[12%] left-1/2 -translate-x-1/2 bg-white px-1.5 py-0.5 text-[10px] font-extrabold whitespace-nowrap text-black">{s.on_screen_hook}</span>
              <span className="absolute top-[64%] left-1/2 w-[92%] -translate-x-1/2 text-center text-[13px] leading-tight font-extrabold uppercase [text-shadow:0_0_3px_#000,0_0_3px_#000]">
                {s.on_screen_hook}
              </span>
            </figure>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 pt-8">
        <h2 className="display max-w-2xl text-[clamp(32px,4.5vw,52px)]">Four steps. No shoot.</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.k}>
              <span className="text-sm text-subtle tabular-nums">0{i + 1}</span>
              <h3 className="mt-2 font-semibold tracking-[-0.02em]">{s.k}</h3>
              <p className="mt-2 text-sm text-muted">{s.v}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-24">
        <div className="rounded-[32px] bg-wash p-8 md:p-12">
          <h2 className="display max-w-xl text-[clamp(30px,4vw,46px)]">The whole edit, done.</h2>
          <ul className="mt-8 grid gap-x-8 gap-y-3 text-[15px] sm:grid-cols-2 md:grid-cols-3">
            {EDIT.map((e) => (
              <li key={e} className="border-t border-border pt-3 text-soft">{e}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-24">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 className="display text-[clamp(30px,4vw,46px)]">Meet the creators.</h2>
          <p className="hidden max-w-xs text-sm text-muted md:block">Fictional, AI-generated adults — or upload a selfie and star in your own ads.</p>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 md:mx-0 md:px-0">
          {actors.map((a) => (
            <div key={a.id} className="relative w-[40vw] shrink-0 snap-start overflow-hidden rounded-[10px] bg-surface sm:w-[180px]" data-testid="ugc-landing-actor">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {a.portrait_url && <img src={a.portrait_url} alt={`${a.name}, AI creator`} className="aspect-[9/16] w-full object-cover" />}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2.5">
                <div className="text-sm font-semibold">{a.name}</div>
                <div className="text-[11px] text-white/65">{a.vibe}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pt-24 md:grid-cols-2">
        <div>
          <h2 className="display text-[clamp(30px,4vw,46px)]">Built to pass ad review.</h2>
          <p className="mt-4 text-muted">Platforms are cracking down on fake testimonials and unlabeled AI. So the studio is honest by default.</p>
        </div>
        <ul className="space-y-4 text-[15px]">
          <li className="border-t border-border pt-4"><span className="font-semibold">No invented claims.</span> <span className="text-muted">Scripts only use what you tell us about the product — no made-up results, stats or reviews.</span></li>
          <li className="border-t border-border pt-4"><span className="font-semibold">AI label on by default.</span> <span className="text-muted">A small &quot;AI-generated&quot; tag satisfies TikTok, Meta and YouTube disclosure rules.</span></li>
          <li className="border-t border-border pt-4"><span className="font-semibold">Real faces need consent.</span> <span className="text-muted">Library creators are fictional. Your own face requires a logged &quot;this is me&quot; confirmation. No celebrities, ever.</span></li>
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-24">
        <div className="flex flex-col items-start gap-6 border-t border-border pt-16 md:flex-row md:items-end md:justify-between">
          <h2 className="display max-w-2xl text-[clamp(36px,5vw,64px)]">Test eight hooks before lunch.</h2>
          <Link href={start} className="btn-primary !px-5 !py-3 !text-[15px]">Make a UGC ad</Link>
        </div>
      </section>
    </>
  );
}
