import React, { useMemo } from "react";
import * as THREE from "three";
import { BAR_HALF, CROWD, PLATE_R, PLATE_X, Pose, V2, barY, crowdJump, shakerAt, signUp } from "./rig";

type MatProps = { color: string; roughness?: number; metalness?: number; clearcoat?: number; flatShading?: boolean };
export type Look = {
  /** material factory: lets PS2 use Lambert flat shading and the others physical materials */
  mat: (p: MatProps) => React.ReactElement;
  segs: number; // radial segments (PS2 uses ~6)
  limb: number; // limb radius
  boxy?: boolean; // Lego: boxes instead of capsules
};

const v3 = (p: V2, z = 0) => new THREE.Vector3(p[0], p[1], z);
const UP = new THREE.Vector3(0, 1, 0);

/** A rounded (or boxy) limb between two joints. */
export const Limb: React.FC<{ a: V2; b: V2; r: number; color: string; look: Look; z?: number }> = ({ a, b, r, color, look, z = 0 }) => {
  const A = v3(a, z);
  const Bv = v3(b, z);
  const mid = A.clone().add(Bv).multiplyScalar(0.5);
  const dir = Bv.clone().sub(A);
  const len = Math.max(0.001, dir.length());
  const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
  return (
    <mesh position={mid} quaternion={q}>
      {look.boxy ? <boxGeometry args={[r * 2, len + r, r * 2]} /> : <capsuleGeometry args={[r, len, 4, look.segs]} />}
      {look.mat({ color })}
    </mesh>
  );
};

export const Figure3D: React.FC<{ pose: Pose; look: Look; skin: string; shirt: string; pants: string; hair?: string; face?: boolean }> = ({ pose, look, skin, shirt, pants, hair, face }) => {
  const r = look.limb;
  const torsoTop: V2 = [(pose.shL[0] + pose.shR[0]) / 2, (pose.shL[1] + pose.shR[1]) / 2 - 0.05];
  return (
    <group>
      {/* torso */}
      <Limb a={torsoTop} b={pose.pelvis} r={r * 2.4} color={shirt} look={look} />
      <Limb a={pose.shL} b={pose.shR} r={r * 1.1} color={shirt} look={look} />
      {/* arms */}
      <Limb a={pose.shL} b={pose.elL} r={r} color={skin} look={look} />
      <Limb a={pose.elL} b={pose.hL} r={r * 0.9} color={skin} look={look} />
      <Limb a={pose.shR} b={pose.elR} r={r} color={skin} look={look} />
      <Limb a={pose.elR} b={pose.hR} r={r * 0.9} color={skin} look={look} />
      {/* legs */}
      <Limb a={pose.hipL} b={pose.knL} r={r * 1.25} color={pants} look={look} />
      <Limb a={pose.knL} b={pose.ftL} r={r * 1.1} color={pants} look={look} />
      <Limb a={pose.hipR} b={pose.knR} r={r * 1.25} color={pants} look={look} />
      <Limb a={pose.knR} b={pose.ftR} r={r * 1.1} color={pants} look={look} />
      {/* head */}
      <mesh position={v3(pose.head)}>
        {look.boxy ? <cylinderGeometry args={[0.11, 0.11, 0.22, look.segs]} /> : <sphereGeometry args={[0.13, look.segs * 2, look.segs]} />}
        {look.mat({ color: skin })}
      </mesh>
      {hair ? (
        <mesh position={v3([pose.head[0], pose.head[1] + 0.06], -0.01)} scale={[1, 0.6, 1]}>
          <sphereGeometry args={[0.135, look.segs * 2, look.segs]} />
          {look.mat({ color: hair })}
        </mesh>
      ) : null}
      {face ? (
        <>
          {[-0.045, 0.045].map((dx) => (
            <mesh key={dx} position={v3([pose.head[0] + dx, pose.head[1] + 0.02], 0.12)}>
              <sphereGeometry args={[0.018, 12, 8]} />
              <meshBasicMaterial color="#111" />
            </mesh>
          ))}
        </>
      ) : null}
    </group>
  );
};

export const Bar3D: React.FC<{ f: number; look: Look; bar: string; plate: string }> = ({ f, look, bar, plate }) => {
  const y = barY(f);
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, BAR_HALF * 2, look.segs]} />
        {look.mat({ color: bar, metalness: 0.8, roughness: 0.35 })}
      </mesh>
      {[-1, 1].flatMap((s) =>
        PLATE_X.map((px, i) => (
          <mesh key={`${s}-${i}`} position={[s * px, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            {look.boxy ? <boxGeometry args={[0.07, (i ? PLATE_R * 0.8 : PLATE_R) * 2, (i ? PLATE_R * 0.8 : PLATE_R) * 2]} /> : <cylinderGeometry args={[i ? PLATE_R * 0.8 : PLATE_R, i ? PLATE_R * 0.8 : PLATE_R, 0.07, look.segs * 2]} />}
            {look.mat({ color: plate })}
          </mesh>
        )),
      )}
    </group>
  );
};

export const Shaker3D: React.FC<{ f: number; look: Look; body: string; lid: string }> = ({ f, look, body, lid }) => {
  const s = shakerAt(f);
  return (
    <group position={[s.x, s.y, 0.05]} rotation={[0, 0, -s.tilt]}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.065, 0.06, 0.3, look.segs]} />
        {look.mat({ color: body })}
      </mesh>
      <mesh position={[0, 0.33, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.06, look.segs]} />
        {look.mat({ color: lid })}
      </mesh>
    </group>
  );
};

/** Crowd in front of the platform (z > 0), jumping after the lift; one holds the sign. */
export const Crowd3D: React.FC<{ f: number; look: Look; skins: string[]; shirts: string[]; z?: number; signColor: string; signText: React.ReactNode }> = ({
  f,
  look,
  skins,
  shirts,
  z = 3.0,
  signColor,
  signText,
}) => {
  const up = signUp(f);
  return (
    <group position={[0, 0, z]} scale={0.62}>
      {CROWD.map((x, i) => {
        const jy = crowdJump(f, i);
        return (
          <group key={i} position={[x * 0.85, jy, (i % 2) * 0.25]}>
            <mesh position={[0, 0.45, 0]}>
              {look.boxy ? <boxGeometry args={[0.36, 0.5, 0.22]} /> : <capsuleGeometry args={[0.17, 0.3, 4, look.segs]} />}
              {look.mat({ color: shirts[i % shirts.length] })}
            </mesh>
            <mesh position={[0, 0.88, 0]}>
              {look.boxy ? <cylinderGeometry args={[0.1, 0.1, 0.2, look.segs]} /> : <sphereGeometry args={[0.13, look.segs * 2, look.segs]} />}
              {look.mat({ color: skins[i % skins.length] })}
            </mesh>
            {i === 5 && up > 0 ? (
              <group position={[0, 1.05 + 0.35 * up, 0.05]}>
                <mesh>
                  <boxGeometry args={[0.7, 0.24, 0.03]} />
                  {look.mat({ color: signColor })}
                </mesh>
                {signText}
              </group>
            ) : null}
          </group>
        );
      })}
    </group>
  );
};

export const useLathe = (pts: [number, number][], segs: number) => useMemo(() => new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), segs), [pts, segs]);

/** Sign text painted onto a canvas texture (fonts are loaded before frames render). */
export const SignFace: React.FC<{ text: string; font: string; color: string; bg: string; w?: number; h?: number }> = ({ text, font, color, bg, w = 0.68, h = 0.22 }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 166;
    const x = c.getContext("2d")!;
    x.fillStyle = bg;
    x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = color;
    x.font = `96px ${font}`;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(text, c.width / 2, c.height / 2 + 6);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, font, color, bg]);
  return (
    <mesh position={[0, 0, 0.02]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
};
