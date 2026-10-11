export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "What do I need to get started?",
    a: "One clear photo of your product (or yourself, for UGC-style presets). Pick a preset, upload, and you get a vertical 9:16 clip ready for TikTok, Reels and Shorts.",
  },
  {
    q: "How much does a video cost?",
    a: "Every generation shows its credit cost before you start. Fast clips are 24 credits (your free welcome credits cover one), premium cinematic models cost more. Credits never expire.",
  },
  {
    q: "What if a generation fails?",
    a: "Credits are charged when a generation starts and refunded automatically if it fails. You never pay for a broken clip.",
  },
  {
    q: "Can I use the videos in ads?",
    a: "Yes — videos you generate are yours to use commercially, including paid ads. Label AI-generated content where TikTok, Meta or YouTube require it.",
  },
  {
    q: "Why is there a watermark?",
    a: "Free-plan videos carry a small corner logo. Buy any credit pack or subscribe and your videos are watermark-free.",
  },
  {
    q: "Can I animate photos of celebrities or other people?",
    a: "No. We block public figures, and you can only upload photos of yourself or people who have given consent. No minors, ever. See the Acceptable Use Policy.",
  },
  {
    q: "Can I get a refund?",
    a: "Unused credit packs can be refunded within 14 days of purchase. Credits that have been used are non-refundable. Monthly plans can be cancelled anytime from Billing.",
  },
];

export function Faq() {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
      {FAQ_ITEMS.map((f) => (
        <details key={f.q} className="group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
            {f.q}
            <span className="text-muted transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
