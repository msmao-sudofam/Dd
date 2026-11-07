import { Fragment, type CSSProperties } from "react";

/**
 * A button label whose letters roll up one after another on hover (or keyboard focus) while a copy of the
 * word rolls in from below; `arrow` adds an arrow that slides out to the right as a new one slides in.
 * The copy is a text-shadow, so each letter is one element. Screen readers get the plain text once.
 * Styles: `.roll` in globals.css. Server-safe (no hooks).
 */
export function Roll({ children, arrow = false }: { children: string; arrow?: boolean }) {
  let i = 0;
  const words = children.split(" ");
  return (
    <>
      <span className="sr-only">{children}</span>
      <span className="roll" aria-hidden>
        {words.map((w, k) => (
          <Fragment key={k}>
            {k > 0 && " "}
            <span className="roll-w">
              {[...w].map((c) => (
                <span key={i} className="roll-ch" style={{ "--i": i++ } as CSSProperties}>
                  {c}
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
      {arrow && (
        <span className="roll-arrow" aria-hidden>
          <ArrowGlyph />
          <ArrowGlyph />
        </span>
      )}
    </>
  );
}

function ArrowGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
    </svg>
  );
}
