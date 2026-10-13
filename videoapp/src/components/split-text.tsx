/**
 * Text cut into letters inside per-word masks, so each letter can rise from below its own baseline
 * (`.split` in globals.css). Server-rendered: the page is complete and readable before any script runs.
 * The heading that holds it carries the sentence in `aria-label`; these spans are hidden from assistive tech.
 * `from` continues the letter count across several lines of one headline.
 */
export function SplitText({ text, from = 0 }: { text: string; from?: number }) {
  const words = text.split(" ");
  const starts = words.map((_, w) => from + words.slice(0, w).reduce((n, x) => n + [...x].length, 0));
  return (
    <span className="split" aria-hidden="true">
      {words.map((word, w) => (
        <span key={w}>
          <span className="w">
            {[...word].map((c, k) => (
              <span key={k} className="ch" style={{ "--i": starts[w] + k } as React.CSSProperties}>{c}</span>
            ))}
          </span>{" "}
        </span>
      ))}
    </span>
  );
}

/** Letters in `text`, not counting spaces: the `from` of the line that follows it. */
export const letterCount = (text: string) => [...text.replace(/ /g, "")].length;

/** Words as separate spans for the scroll-linked sharpen effect (`[data-scrub-words]`, driven by <Fx/>). */
export function ScrubWords({ text }: { text: string }) {
  return (
    <span aria-hidden="true">
      {text.split(" ").map((w, i) => (
        <span key={i}>
          <span className="sw">{w}</span>{" "}
        </span>
      ))}
    </span>
  );
}
