// "PR DAY": the one story every style tells (like the promo's flying car).
// A cartoon lifter drinks a shaker, claps chalk, then squats, pulls, racks and presses a
// barbell overhead while a crowd erupts. Everything is a pure function of the frame, in
// metres, front view: x to the right, y up from the floor, origin between the feet.
import { Easing, interpolate } from "remotion";

export const STORY_DUR = 240; // 8 s at 30 fps
export const B = {
  drink: 22,
  drinkEnd: 60,
  clap: 66,
  clapEnd: 88,
  grab: 96,
  pull: 112,
  rack: 126,
  dip: 134,
  press: 142,
  lock: 154,
  cheer: 156,
  endLine: 192,
};

export type V2 = [number, number];
export type Pose = {
  head: V2;
  neck: V2;
  shL: V2;
  shR: V2;
  elL: V2;
  elR: V2;
  hL: V2;
  hR: V2;
  pelvis: V2;
  hipL: V2;
  hipR: V2;
  knL: V2;
  knR: V2;
  ftL: V2;
  ftR: V2;
};

const STAND: Pose = {
  head: [0, 1.62],
  neck: [0, 1.47],
  shL: [-0.21, 1.42],
  shR: [0.21, 1.42],
  elL: [-0.26, 1.15],
  elR: [0.26, 1.15],
  hL: [-0.27, 0.9],
  hR: [0.27, 0.9],
  pelvis: [0, 0.95],
  hipL: [-0.12, 0.93],
  hipR: [0.12, 0.93],
  knL: [-0.14, 0.5],
  knR: [0.14, 0.5],
  ftL: [-0.16, 0],
  ftR: [0.16, 0],
};
const DRINK: Pose = { ...STAND, head: [0.02, 1.63], elR: [0.34, 1.3], hR: [0.07, 1.56] };
const CLAP: Pose = { ...STAND, elL: [-0.3, 1.18], elR: [0.3, 1.18], hL: [-0.03, 1.27], hR: [0.03, 1.27] };
const SQUAT: Pose = {
  head: [0, 1.22],
  neck: [0, 1.08],
  shL: [-0.21, 1.03],
  shR: [0.21, 1.03],
  elL: [-0.33, 0.68],
  elR: [0.33, 0.68],
  hL: [-0.38, 0.26],
  hR: [0.38, 0.26],
  pelvis: [0, 0.55],
  hipL: [-0.13, 0.53],
  hipR: [0.13, 0.53],
  knL: [-0.36, 0.45],
  knR: [0.36, 0.45],
  ftL: [-0.2, 0],
  ftR: [0.2, 0],
};
const PULL: Pose = { ...STAND, elL: [-0.36, 1.15], elR: [0.36, 1.15], hL: [-0.38, 0.9], hR: [0.38, 0.9] };
const RACK: Pose = { ...STAND, elL: [-0.33, 1.3], elR: [0.33, 1.3], hL: [-0.27, 1.44], hR: [0.27, 1.44] };
const DIP: Pose = {
  ...RACK,
  head: [0, 1.55],
  neck: [0, 1.4],
  shL: [-0.21, 1.35],
  shR: [0.21, 1.35],
  elL: [-0.33, 1.23],
  elR: [0.33, 1.23],
  hL: [-0.27, 1.37],
  hR: [0.27, 1.37],
  pelvis: [0, 0.88],
  hipL: [-0.12, 0.86],
  hipR: [0.12, 0.86],
  knL: [-0.2, 0.47],
  knR: [0.2, 0.47],
};
const LOCK: Pose = { ...STAND, elL: [-0.36, 1.78], elR: [0.36, 1.78], hL: [-0.4, 2.12], hR: [0.4, 2.12] };

const KEYS: [number, Pose][] = [
  [0, STAND],
  [B.drink, STAND],
  [B.drink + 10, DRINK],
  [B.drinkEnd - 6, DRINK],
  [B.drinkEnd, STAND],
  [B.clap, STAND],
  [B.clap + 6, CLAP],
  [B.clapEnd, CLAP],
  [B.grab, SQUAT],
  [B.pull, PULL],
  [B.rack, RACK],
  [B.dip, DIP],
  [B.press, RACK],
  [B.lock, LOCK],
  [STORY_DUR, LOCK],
];

const ease = Easing.bezier(0.45, 0, 0.25, 1);
const mix = (a: V2, b: V2, k: number): V2 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

/** The lifter's pose at frame f (the loop-back freezes frame 0, so the cover is STAND). */
export const poseAt = (f: number): Pose => {
  let i = 0;
  while (i < KEYS.length - 2 && f >= KEYS[i + 1][0]) i++;
  const [f0, p0] = KEYS[i];
  const [f1, p1] = KEYS[i + 1];
  const k = f1 === f0 ? 1 : ease(Math.min(1, Math.max(0, (f - f0) / (f1 - f0))));
  const out = {} as Pose;
  (Object.keys(p0) as (keyof Pose)[]).forEach((j) => (out[j] = mix(p0[j], p1[j], k)));
  // breathing: the upper body never sits fully still (bigger after the lift)
  const amp = f >= B.lock ? 0.022 : 0.012;
  const breath = Math.sin(f / 7) * amp;
  (["head", "neck", "shL", "shR", "elL", "elR", "hL", "hR"] as (keyof Pose)[]).forEach((j) => (out[j] = [out[j][0], out[j][1] + breath]));
  out.hL = [out.hL[0] + Math.sin(f / 11) * 0.006, out.hL[1]];
  out.hR = [out.hR[0] - Math.sin(f / 11) * 0.006, out.hR[1]];
  return out;
};

export const PLATE_R = 0.225;
export const BAR_HALF = 0.78;
export const PLATE_X = [0.6, 0.68];
/** Bar centre height: on the floor until the grab, then in the hands. */
export const barY = (f: number) => {
  if (f < B.grab) return PLATE_R;
  const p = poseAt(f);
  return Math.max(PLATE_R, (p.hL[1] + p.hR[1]) / 2 + 0.02);
};

/** Shaker: in the right hand while drinking, standing on the floor otherwise. */
export const shakerAt = (f: number): { x: number; y: number; tilt: number } => {
  if (f >= B.drink && f < B.drinkEnd) {
    const p = poseAt(f);
    const tilt = interpolate(f, [B.drink, B.drink + 10, B.drinkEnd - 6, B.drinkEnd], [0, 2.2, 2.2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { x: p.hR[0], y: p.hR[1] - 0.08, tilt };
  }
  return { x: -0.98, y: 0, tilt: 0 }; // left of the platform, clear of the crowd's sign
};

/** Chalk cloud from the clap: 0 before, grows and fades over ~0.7 s. */
export const chalkAt = (f: number) => {
  const t = (f - (B.clap + 6)) / 24;
  if (t < 0 || t > 1) return null;
  return { x: 0, y: 1.27, r: 0.12 + 0.45 * t, alpha: 0.8 * (1 - t) };
};

export const CROWD = [-1.35, -0.95, -0.55, -0.15, 0.25, 0.65, 1.05, 1.45];
/** Crowd member i jumps after the lift; 0 before. */
export const crowdJump = (f: number, i: number) => {
  if (f < B.cheer) return 0;
  const t = (f - B.cheer + i * 4) / 9;
  return Math.abs(Math.sin(t)) * 0.18 * Math.min(1, (f - B.cheer) / 6);
};
/** The sign ("SÍ QUEMA") goes up right after lockout. */
export const signUp = (f: number) => interpolate(f, [B.cheer, B.cheer + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.22, 1, 0.36, 1) });
export const SIGN = "SÍ QUEMA";
export const SIGN_HOLDER = 5; // index in CROWD
export const END_LINE = "200 mg caffeine · every dose on the label.";
export const HOOK = "PR day. one scoop. one shot.";

/** Bar-speed meter 0..1 for the HUD styles: rises through the lift. */
export const meterAt = (f: number) => interpolate(f, [B.grab, B.lock], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Map rig metres to screen pixels for the 2D styles. */
export const toScreen = (p: V2, s = 320, ox = 540, ground = 1170): V2 => [ox + p[0] * s, ground - p[1] * s];

/** Bones as pairs, for line-based styles. */
export const BONES: (keyof Pose)[][] = [
  ["neck", "pelvis"],
  ["shL", "shR"],
  ["shL", "elL"],
  ["elL", "hL"],
  ["shR", "elR"],
  ["elR", "hR"],
  ["hipL", "hipR"],
  ["hipL", "knL"],
  ["knL", "ftL"],
  ["hipR", "knR"],
  ["knR", "ftR"],
];
