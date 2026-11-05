import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Caption, Reel } from "../lib/fx";
import { FLAVORS, PIXEL, sec } from "../lib/theme";

// Animation Studio /pixelart — a 16-bit flavor-select screen.
// Watch-style reason: "pick your flavor" maps exactly onto a game select screen, so the style
// carries the idea instead of decorating it. Fruit sprites only; the product is never drawn.
// Everything is drawn on a 180x320 logical grid and scaled x6 with crisp edges.
export const PIXEL_AD_DUR = sec(8);

const PAL = {
  bg0: "#140F26",
  bg1: "#1E1738",
  bg2: "#2A2050",
  ui: "#F3EEE6",
  dim: "#8C86A8",
  red: "#E5202F",
  yel: "#F7D33C",
  out: "#0B0816",
};
const CARD_W = 74;
const CARD_H = 64;
const CARDS = [
  { x: 12, y: 92 },
  { x: 94, y: 92 },
  { x: 12, y: 166 },
  { x: 94, y: 166 },
];
const STEP = 22; // cursor moves in whole steps, every 22 frames
const SELECT_AT = 20 + STEP * 4; // back on MANGO
const STATS_AT = SELECT_AT + 14;
const STAT_STEP = 10;

type Px = string | null;
// 12x12 sprites, built pixel by pixel: outline, then 3-4 shade bands lit from the top-left.
const sprite = (fn: (x: number, y: number) => Px): Px[][] => Array.from({ length: 12 }, (_, y) => Array.from({ length: 12 }, (_, x) => fn(x, y)));
const outline = (inside: (x: number, y: number) => boolean, fill: (x: number, y: number) => string) => (x: number, y: number): Px => {
  if (inside(x, y)) {
    const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
    return edge ? PAL.out : fill(x, y);
  }
  return null;
};
const SPRITES: Record<string, Px[][]> = {
  MANGO: sprite((x, y) => {
    if ((x === 3 && y <= 1) || (x === 2 && y === 0) || (x === 4 && y === 1)) return "#5DBB46";
    // tilted teardrop: the mango silhouette, blushing red at the top, gold at the belly
    const u = (a: number, b: number) => (a - 6) * Math.cos(0.7) + (b - 6.5) * Math.sin(0.7);
    const v = (a: number, b: number) => -(a - 6) * Math.sin(0.7) + (b - 6.5) * Math.cos(0.7);
    return outline(
      (a, b) => (u(a, b) / 5.6) ** 2 + (v(a, b) / (u(a, b) > 0 ? 3.6 : 4.4)) ** 2 <= 1,
      (a, b) => (a + b < 8 ? "#E5502F" : a + b < 12 ? "#F6B649" : a + b < 16 ? "#E7950D" : "#C06E1D"),
    )(x, y);
  }),
  WATERMELON: sprite(
    outline(
      (a, b) => b >= 4 && b <= 10 && ((a - 5.5) / 5.6) ** 2 + ((b - 4) / 6.4) ** 2 <= 1,
      (a, b) => {
        const r = Math.sqrt(((a - 5.5) / 5.6) ** 2 + ((b - 4) / 6.4) ** 2);
        if (r > 0.78) return "#3E8E3A";
        if (r > 0.68) return "#CFE9A8";
        if ((a === 3 && b === 6) || (a === 6 && b === 7) || (a === 8 && b === 5)) return PAL.out;
        return b < 6 ? "#FF5C6E" : "#DA6024";
      },
    ),
  ),
  "KIWI STRAWBERRY": sprite((x, y) => {
    if (y <= 2 && x >= 3 && x <= 8 && (x + y) % 2 === 0) return "#5DBB46";
    return outline(
      (a, b) => b >= 2 && b <= 11 && Math.abs(a - 5.5) <= 5.2 - (b - 2) * 0.55,
      (a, b) => ((a * 3 + b * 5) % 7 === 0 ? "#F7D33C" : a + b < 9 ? "#FF5C6E" : a + b < 13 ? "#D7192A" : "#A8121F"),
    )(x, y);
  }),
  KIWI: sprite(
    outline(
      (a, b) => (a - 5.5) ** 2 + (b - 6) ** 2 <= 26,
      (a, b) => {
        const d = Math.sqrt((a - 5.5) ** 2 + (b - 6) ** 2);
        if (d > 4.1) return "#7A5230";
        if (d < 1.2) return "#F3F0C8";
        if (Math.round(d * 2) === 5 && (a + b) % 2 === 0) return PAL.out;
        return a + b < 11 ? "#A6D65A" : "#7DB33A";
      },
    ),
  ),
  "CUCUMBER LIME": sprite(
    outline(
      (a, b) => (a - 5.5) ** 2 + (b - 6) ** 2 <= 30,
      (a, b) => {
        const d = Math.sqrt((a - 5.5) ** 2 + (b - 6) ** 2);
        if (d > 4.4) return "#5DBB46";
        if (Math.abs(a - 5.5) < 0.6 || Math.abs(b - 6) < 0.6) return "#E9F5C2";
        return a + b < 11 ? "#D7EE7A" : "#BFD02C";
      },
    ),
  ),
};

const Sprite: React.FC<{ map: Px[][]; x: number; y: number; scale?: number }> = ({ map, x, y, scale = 2 }) => (
  <>
    {map.flatMap((row, j) => row.map((c, i) => (c ? <rect key={`${i}-${j}`} x={x + i * scale} y={y + j * scale} width={scale} height={scale} fill={c} /> : null)))}
  </>
);

const T: React.FC<{ x: number; y: number; size?: number; fill?: string; anchor?: "start" | "middle" | "end"; children: React.ReactNode }> = ({
  x,
  y,
  size = 7,
  fill = PAL.ui,
  anchor = "start",
  children,
}) => (
  <text x={x} y={y} fontFamily={PIXEL} fontSize={size} fill={fill} textAnchor={anchor} style={{ fontWeight: 700 }}>
    {children}
  </text>
);

/** Backdrop: three flat bands joined by ordered (checker) dither rows, never a smooth gradient. */
const Backdrop: React.FC = () => (
  <>
    <defs>
      <pattern id="dither" width={2} height={2} patternUnits="userSpaceOnUse">
        <rect width={1} height={1} fill={PAL.bg1} />
        <rect x={1} y={1} width={1} height={1} fill={PAL.bg1} />
      </pattern>
      <pattern id="dither2" width={2} height={2} patternUnits="userSpaceOnUse">
        <rect width={1} height={1} fill={PAL.bg2} />
        <rect x={1} y={1} width={1} height={1} fill={PAL.bg2} />
      </pattern>
    </defs>
    <rect width={180} height={320} fill={PAL.bg0} />
    <rect y={120} width={180} height={6} fill="url(#dither)" />
    <rect y={126} width={180} height={194} fill={PAL.bg1} />
    <rect y={230} width={180} height={6} fill="url(#dither2)" />
    <rect y={236} width={180} height={84} fill={PAL.bg2} />
  </>
);

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const cur = f < 20 ? 0 : f >= SELECT_AT ? 0 : Math.floor((f - 20) / STEP) % 4;
  const selected = f >= SELECT_AT;
  const stats = f >= STATS_AT;
  const statRows = [
    ["CAFFEINE", "200 MG"],
    ["DOSES ON LABEL", "9"],
    ["SERVINGS", "30"],
    ["PROPRIETARY BLENDS", "NONE"],
  ];
  return (
    <AbsoluteFill style={{ background: PAL.bg0 }}>
      <svg width={1080} height={1920} viewBox="0 0 180 320" shapeRendering="crispEdges" style={{ position: "absolute", inset: 0 }}>
        <Backdrop />
        {!stats ? (
          <>
            <T x={90} y={80} size={9} anchor="middle">
              SELECT YOUR FLAVOR
            </T>
            {FLAVORS.map((fl, i) => {
              const c = CARDS[i];
              const on = i === cur;
              return (
                <g key={fl}>
                  <rect x={c.x} y={c.y} width={CARD_W} height={CARD_H} fill={PAL.out} />
                  <rect x={c.x + 1} y={c.y + 1} width={CARD_W - 2} height={CARD_H - 2} fill={on ? PAL.bg2 : PAL.bg1} />
                  {on ? (
                    <>
                      <rect x={c.x} y={c.y} width={CARD_W} height={2} fill={selected ? PAL.red : PAL.yel} />
                      <rect x={c.x} y={c.y + CARD_H - 2} width={CARD_W} height={2} fill={selected ? PAL.red : PAL.yel} />
                      <rect x={c.x} y={c.y} width={2} height={CARD_H} fill={selected ? PAL.red : PAL.yel} />
                      <rect x={c.x + CARD_W - 2} y={c.y} width={2} height={CARD_H} fill={selected ? PAL.red : PAL.yel} />
                    </>
                  ) : null}
                  {fl === "KIWI STRAWBERRY" ? (
                    <>
                      <Sprite map={SPRITES[fl]} x={c.x + CARD_W / 2 - 25} y={c.y + 8} />
                      <Sprite map={SPRITES.KIWI} x={c.x + CARD_W / 2 + 1} y={c.y + 8} />
                    </>
                  ) : (
                    <Sprite map={SPRITES[fl]} x={c.x + CARD_W / 2 - 12} y={c.y + 8} />
                  )}
                  <T x={c.x + CARD_W / 2} y={c.y + 46} size={fl.length > 10 ? 5 : 6} anchor="middle" fill={on ? PAL.ui : PAL.dim}>
                    {fl.split(" ")[0]}
                  </T>
                  {fl.includes(" ") ? (
                    <T x={c.x + CARD_W / 2} y={c.y + 54} size={5} anchor="middle" fill={on ? PAL.ui : PAL.dim}>
                      {fl.split(" ").slice(1).join(" ")}
                    </T>
                  ) : null}
                </g>
              );
            })}
            {/* cursor arrow, jumps card to card */}
            <g transform={`translate(${CARDS[cur].x - 1} ${CARDS[cur].y + CARD_H + 2})`}>
              <rect x={4} y={0} width={2} height={8} fill={PAL.yel} />
              <rect x={2} y={2} width={6} height={2} fill={PAL.yel} />
              <rect x={0} y={4} width={10} height={2} fill={PAL.yel} />
            </g>
            {selected ? (
              <T x={90} y={240} size={8} anchor="middle" fill={PAL.red}>
                MANGO SELECTED
              </T>
            ) : null}
          </>
        ) : (
          <>
            <Sprite map={SPRITES.MANGO} x={66} y={74} scale={4} />
            <T x={90} y={138} size={9} anchor="middle">
              MANGO
            </T>
            <rect x={14} y={146} width={152} height={2} fill={PAL.dim} />
            {statRows.map(([k, v], i) =>
              f >= STATS_AT + 6 + i * STAT_STEP ? (
                <g key={k}>
                  <T x={16} y={164 + i * 16} size={6}>
                    {k}
                  </T>
                  <T x={164} y={164 + i * 16} size={6} anchor="end" fill={PAL.yel}>
                    {v}
                  </T>
                </g>
              ) : null,
            )}
            {f >= STATS_AT + 6 + statRows.length * STAT_STEP + 6 ? (
              <T x={90} y={236} size={7} anchor="middle" fill={PAL.red}>
                EVERY DOSE ON THE LABEL
              </T>
            ) : null}
          </>
        )}
      </svg>
      <Caption text="which one are you?" top={260} />
    </AbsoluteFill>
  );
};

export const PixelArtAd: React.FC = () => (
  <Reel
    dur={PIXEL_AD_DUR}
    grain={0}
    printColor="#F3EEE6"
    sfx={[
      ...[0, 1, 2, 3].map((i) => ({ at: 20 + STEP * i, s: "tick" as const, v: 0.3 })),
      { at: SELECT_AT, s: "pop" as const },
      ...[0, 1, 2, 3].map((i) => ({ at: STATS_AT + 6 + i * STAT_STEP, s: "tick" as const, v: 0.25 })),
    ]}
  >
    <Body />
  </Reel>
);
