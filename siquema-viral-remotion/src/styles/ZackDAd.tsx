import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Caption, E, PopCaption, Reel, clamp, prog } from "../lib/fx";
import { C, FREDOKA, sec } from "../lib/theme";

// Animation Studio /zackdfilms — soft rounded 3D explainer: how much caffeine is 200 mg?
// Watch-style reason: a physical comparison (cups next to a scoop) reads fastest as a 3D // gate: allow generated-product, generic measuring scoop, not the SÍ QUEMA tub or label
// demonstration. Generic mugs and a generic scoop; never the tub, never a body. // gate: allow generated-product, generic measuring scoop, not the SÍ QUEMA tub or label
export const ZACKD_AD_DUR = sec(9);

const MUG2_AT = 30;
const SCOOP_AT = 96;
const LINE_AT = 150;
const BG = "#CFE0DA";

const clay = (color: string) => ({ color, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.4 });

const Mug: React.FC<{ x: number; z?: number; level: number; scale?: number; color?: string }> = ({ x, z = 0, level, scale = 1, color = "#F7F2EA" }) => {
  const body = useMemo(() => {
    const pts = [
      [0.001, 0],
      [0.44, 0],
      [0.5, 0.06],
      [0.5, 1.0],
      [0.48, 1.05],
      [0.45, 1.05],
      [0.43, 1.0],
      [0.43, 0.1],
      [0.001, 0.1],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh geometry={body}>
        <meshPhysicalMaterial {...clay(color)} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.5, 0.55, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.26, 0.07, 20, 40, Math.PI]} />
        <meshPhysicalMaterial {...clay(color)} />
      </mesh>
      {level > 0.01 ? (
        <mesh position={[0, 0.1 + level * 0.84, 0]}>
          <cylinderGeometry args={[0.425, 0.425, 0.02, 48]} />
          <meshPhysicalMaterial color="#3B2416" roughness={0.25} clearcoat={0.6} />
        </mesh>
      ) : null}
      {/* soft contact shadow */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.62, 48]} />
        <meshBasicMaterial color="#000" transparent opacity={0.12} />
      </mesh>
    </group>
  );
};

/** A generic measuring scoop (not the tub) holding a mango-colored mound. */
const Scoop: React.FC<{ y: number; scale: number }> = ({ y, scale }) => (
  <group position={[0, y, 0.6]} scale={scale} rotation={[0.3, 1.15, 0]}>
    <mesh position={[0, 0.55, 0]}>
      <sphereGeometry args={[0.55, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      <meshPhysicalMaterial {...clay(C.red)} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0.58, 0]} scale={[1, 0.26, 1]}>
      <sphereGeometry args={[0.5, 48, 24]} />
      <meshPhysicalMaterial {...clay("#E7950D")} roughness={0.7} />
    </mesh>
    <mesh position={[0.86, 0.6, 0]} rotation={[0, 0, Math.PI / 2 - 0.12]}>
      <capsuleGeometry args={[0.07, 0.75, 8, 16]} />
      <meshPhysicalMaterial {...clay(C.red)} />
    </mesh>
  </group>
);

const Rig: React.FC = () => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const push = prog(f, SCOOP_AT, 30, E.inOut);
  camera.position.set(Math.sin(f / 90) * 0.15, 3.4 - push * 0.3, 8.4 - push * 1.3);
  camera.lookAt(0, 0.55, 0);
  return null;
};

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const m2 = prog(f, MUG2_AT, 18, E.settle);
  const fill2 = interpolate(f, [MUG2_AT + 16, MUG2_AT + 46], [0, 1], { ...clamp, easing: E.inOut });
  const apart = prog(f, SCOOP_AT, 24, E.inOut);
  const scoopUp = prog(f, SCOOP_AT + 6, 24, E.settle);
  const mugX = 0.56;
  const mugScale = 0.82 - apart * 0.22;
  const mugZ = -apart * 1.3;
  return (
    <>
      <color attach="background" args={[BG]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[-3, 5, 4]} intensity={1.6} color="#FFF1DE" />
      <directionalLight position={[3, 2, -3]} intensity={0.6} color="#DDEBFF" />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#BCD3CB" roughness={1} />
      </mesh>
      <Rig />
      <Mug x={-interpolate(m2, [0, 1], [0, mugX])} z={mugZ} level={1} scale={mugScale} />
      {f >= MUG2_AT ? <Mug x={interpolate(m2, [0, 1], [2.4, mugX])} z={mugZ} level={fill2} scale={mugScale} /> : null}
      {f >= SCOOP_AT ? <Scoop y={interpolate(scoopUp, [0, 1], [-1.6, 0.25])} scale={0.78} /> : null}
    </>
  );
};

const Label: React.FC<{ children: React.ReactNode; top: number; at: number; until?: number; color?: string; size?: number }> = ({
  children,
  top,
  at,
  until,
  color = C.ink,
  size = 64,
}) => {
  const f = useCurrentFrame();
  if (f < at || (until !== undefined && f >= until)) return null;
  const k = at <= 0 ? 1 : prog(f, at, 8, E.settle);
  return (
    <div style={{ position: "absolute", top, width: "100%", textAlign: "center", fontFamily: FREDOKA, fontWeight: 600, fontSize: size, lineHeight: 1.1, color, opacity: k, transform: `translateY(${(1 - k) * 24}px)` }}>
      {children}
    </div>
  );
};

const Body: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 30, position: [0, 1.9, 8.6] }}>
        <Scene />
      </ThreeCanvas>
      <Label top={470} at={0} until={MUG2_AT}>one 8-oz cup</Label>
      <Label top={470} at={MUG2_AT} until={SCOOP_AT}>+ one more</Label>
      <Label top={470} at={SCOOP_AT + 10}>
        = one scoop: <span style={{ color: C.red }}>200 mg</span> caffeine
      </Label>
      <PopCaption text="about two 8-oz cups of coffee." top={1362} at={LINE_AT} />
      <Caption text="how much caffeine is 200 mg?" top={260} />
    </AbsoluteFill>
  );
};

export const ZackDAd: React.FC = () => (
  <Reel
    dur={ZACKD_AD_DUR}
    grain={0.04}
    sfx={[
      { at: MUG2_AT, s: "whoosh" as const, v: 0.25 }, // gate: allow stock-sfx, synthesized soft air pass
      { at: SCOOP_AT + 18, s: "pop" as const },
      { at: LINE_AT, s: "pop" as const, v: 0.35 },
    ]}
  >
    <Body />
  </Reel>
);
