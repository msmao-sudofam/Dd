import React from "react";
import { C, EXAMPLE_BLEND, INTER, MONO } from "./theme";

const rule = (h: number, color = C.ink): React.CSSProperties => ({ height: h, background: color, margin: "10px 0" });

/** Generic proprietary-blend facts card (fictional, not a real brand). */
export const ExampleBlendCard: React.FC<{ width?: number; scale?: number; style?: React.CSSProperties }> = ({
  width = 820,
  scale = 1,
  style,
}) => (
  <div
    style={{
      width,
      background: "#fff",
      border: `${4 * scale}px solid ${C.ink}`,
      padding: `${22 * scale}px ${28 * scale}px`,
      fontFamily: INTER,
      color: C.ink,
      ...style,
    }}
  >
    <div style={{ fontWeight: 800, fontSize: 62 * scale, lineHeight: 1, letterSpacing: "-0.02em" }}>Supplement Facts</div>
    <div style={{ fontWeight: 500, fontSize: 24 * scale, marginTop: 8 * scale }}>Serving Size 1 Scoop</div>
    <div style={rule(14 * scale)} />
    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 22 * scale }}>
      <span>Amount Per Serving</span>
      <span>% DV</span>
    </div>
    <div style={rule(4 * scale)} />
    <div style={{ display: "flex", alignItems: "baseline", fontWeight: 800, fontSize: 32 * scale }}>
      <span>{EXAMPLE_BLEND.line}</span>
      <span style={{ flex: 1, borderBottom: `${3 * scale}px dotted ${C.ink}`, margin: `0 ${10 * scale}px`, transform: `translateY(-${6 * scale}px)` }} />
      <span data-amount>{EXAMPLE_BLEND.amount}</span>
    </div>
    <div style={{ fontWeight: 500, fontSize: 24 * scale, lineHeight: 1.35, marginTop: 8 * scale, color: "#333" }}>
      {EXAMPLE_BLEND.names}
    </div>
    <div style={rule(14 * scale)} />
    <div style={{ fontWeight: 500, fontSize: 20 * scale }}>{EXAMPLE_BLEND.dagger}</div>
  </div>
);

/** One "name ...... dose" row with a dotted leader. */
export const DoseRow: React.FC<{
  name: React.ReactNode;
  dose: React.ReactNode;
  size?: number;
  doseColor?: string;
  color?: string;
  leader?: string;
  style?: React.CSSProperties;
}> = ({ name, dose, size = 34, doseColor = C.red, color = C.ink, leader, style }) => (
  <div style={{ display: "flex", alignItems: "baseline", fontFamily: INTER, fontSize: size, color, ...style }}>
    <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{name}</span>
    <span style={{ flex: 1, minWidth: 20, borderBottom: `3px dotted ${leader ?? color}`, opacity: 0.35, margin: "0 12px", transform: "translateY(-8px)" }} />
    <span style={{ fontWeight: 800, color: doseColor, whiteSpace: "nowrap" }}>{dose}</span>
  </div>
);

export const MonoTag: React.FC<{ children: React.ReactNode; color?: string; bg?: string; style?: React.CSSProperties }> = ({
  children,
  color = C.cream,
  bg = C.ink,
  style,
}) => (
  <span style={{ fontFamily: MONO, fontSize: 24, color, background: bg, padding: "6px 14px", borderRadius: 8, ...style }}>{children}</span>
);
