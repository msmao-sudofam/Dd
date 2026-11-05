import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Reel, hash } from "../../lib/fx";
import { ANTON, BANGERS, FREDOKA, INTER } from "../../lib/theme";
import { StoryCaptions, STORY_SFX } from "../common";
import { InternalBadge } from "../InternalBadge";
import { Bar3D, Crowd3D, Figure3D, Look, Shaker3D, SignFace } from "../rig3d";
import { SIGN, STORY_DUR, chalkAt, poseAt } from "../rig";
import { Stage3D } from "../stage3d";

// PR DAY in the four 3D styles. Same rig, same story; each style brings its own look and world.

const ChalkPuff3D: React.FC<{ f: number; color: string }> = ({ f, color }) => {
  const c = chalkAt(f);
  if (!c) return null;
  return (
    <group position={[c.x, c.y, 0.25]}>
      {[
        [0, 0, 1],
        [-0.5, 0.15, 0.7],
        [0.5, 0.1, 0.75],
      ].map(([dx, dy, s], i) => (
        <mesh key={i} position={[dx * c.r, dy * c.r, 0]}>
          <sphereGeometry args={[c.r * s, 16, 12]} />
          <meshBasicMaterial color={color} transparent opacity={c.alpha * 0.8} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

const SKINS = ["#E8A97E", "#C98B5E", "#8D5A3B", "#F2C49B"];
const SHIRTS = ["#D7192A", "#2E5BBA", "#3E8E3A", "#F7D33C", "#7A3B78"];

/* ---------------- ZackD Films: soft rounded clay explainer ---------------- */
const clay: Look = {
  mat: ({ color }) => <meshPhysicalMaterial color={color} roughness={0.45} clearcoat={0.35} clearcoatRoughness={0.4} />,
  segs: 20,
  limb: 0.075,
};
const ZackDScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <color attach="background" args={["#CFE0DA"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[-3, 5, 4]} intensity={1.7} color="#FFF1DE" />
      <directionalLight position={[3, 2, -3]} intensity={0.5} color="#DDEBFF" />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#BCD3CB" roughness={1} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[2.4, 0.06, 1.4]} />
        {clay.mat({ color: "#C89A6A" })}
      </mesh>
      {/* gym: back wall with big windows onto a soft city, a squat rack, a banner */}
      <mesh position={[0, 2, -2.4]}>
        <boxGeometry args={[10, 4.4, 0.2]} />
        {clay.mat({ color: "#E9D9C4" })}
      </mesh>
      {[-1.9, 0, 1.9].map((x) => (
        <group key={x} position={[x, 2.3, -2.28]}>
          <mesh>
            <boxGeometry args={[1.5, 1.6, 0.06]} />
            {clay.mat({ color: "#9CC8E8" })}
          </mesh>
          {[-0.45, -0.1, 0.3].map((bx, i) => (
            <mesh key={bx} position={[bx, -0.8 + (0.35 + i * 0.18) / 2, 0.04]}>
              <boxGeometry args={[0.28, 0.35 + i * 0.18, 0.02]} />
              {clay.mat({ color: "#7FA9C9" })}
            </mesh>
          ))}
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[0.06, 1.6, 0.03]} />
            {clay.mat({ color: "#F7F2EA" })}
          </mesh>
        </group>
      ))}
      <group position={[-1.7, 0, -1.4]}>
        {[-0.35, 0.35].map((dx) => (
          <mesh key={dx} position={[dx, 0.9, 0]}>
            <capsuleGeometry args={[0.05, 1.7, 4, 12]} />
            {clay.mat({ color: "#3A3A40" })}
          </mesh>
        ))}
        <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.03, 1.0, 4, 12]} />
          {clay.mat({ color: "#9AA0A8" })}
        </mesh>
      </group>
      <mesh position={[1.8, 0.75, -2.27]}>
        <boxGeometry args={[1.2, 0.36, 0.03]} />
        {clay.mat({ color: "#D7192A" })}
      </mesh>
      <Figure3D pose={poseAt(f)} look={clay} skin="#E8A97E" shirt="#D7192A" pants="#2B2A2A" hair="#3B2416" face />
      <Bar3D f={f} look={clay} bar="#9AA0A8" plate="#D7192A" />
      <Shaker3D f={f} look={clay} body="#F7F2EA" lid="#2B2A2A" />
      <ChalkPuff3D f={f} color="#FFFFFF" />
      <Crowd3D f={f} look={clay} skins={SKINS} shirts={SHIRTS} signColor="#F3EEE6" signText={<SignFace text={SIGN} font={FREDOKA} color="#D7192A" bg="#F3EEE6" />} />
    </>
  );
};
export const ZackDStory: React.FC = () => (
  <Reel dur={STORY_DUR} push={0.05} printBand grain={0.04} sfx={STORY_SFX}>
    <AbsoluteFill style={{ background: "#CFE0DA" }}>
      <Stage3D>
        <ZackDScene />
      </Stage3D>
      <StoryCaptions />
    </AbsoluteFill>
  </Reel>
);

/* ---------------- CGI Motion (internal): cinematic dusk stadium ---------------- */
const pbr: Look = {
  mat: ({ color, metalness = 0.05, roughness = 0.5 }) => <meshPhysicalMaterial color={color} roughness={roughness} metalness={metalness} clearcoat={0.2} />,
  segs: 24,
  limb: 0.062,
};
const CgiScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <color attach="background" args={["#1A1530"]} />
      <fog attach="fog" args={["#1A1530", 7, 16]} />
      <ambientLight intensity={0.15} />
      <spotLight position={[0, 6, 3]} angle={0.4} penumbra={0.6} intensity={90} color="#FFE7C2" />
      <directionalLight position={[-4, 2, -3]} intensity={2.4} color="#8FB4FF" />
      <pointLight position={[2.5, 1.2, -1]} intensity={8} color="#FF8A5B" />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshPhysicalMaterial color="#15131F" roughness={0.3} metalness={0.4} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[2.6, 0.08, 1.5]} />
        <meshPhysicalMaterial color="#3A2A20" roughness={0.6} />
      </mesh>
      {/* dusk city behind: dark towers with lit windows */}
      {Array.from({ length: 12 }, (_, i) => {
        const h = 2 + hash(i) * 4;
        return (
          <group key={i} position={[-6 + i * 1.1, h / 2, -6 - hash(i + 9) * 2]}>
            <mesh>
              <boxGeometry args={[0.9, h, 0.9]} />
              <meshStandardMaterial color="#120F1E" roughness={0.8} />
            </mesh>
            {Array.from({ length: Math.floor(h * 2) }, (_, j) =>
              hash(i * 17 + j) > 0.5 ? (
                <mesh key={j} position={[(hash(j + i) - 0.5) * 0.6, -h / 2 + 0.3 + j * 0.45, 0.46]}>
                  <planeGeometry args={[0.12, 0.16]} />
                  <meshBasicMaterial color="#FFC66B" />
                </mesh>
              ) : null,
            )}
          </group>
        );
      })}
      <mesh position={[0, 3, 0.4]}>
        <coneGeometry args={[1.4, 6, 48, 1, true]} />
        <meshBasicMaterial color="#FFE7C2" transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Figure3D pose={poseAt(f)} look={pbr} skin="#C98B5E" shirt="#B5121F" pants="#1A1A1E" hair="#1B120C" />
      <Bar3D f={f} look={pbr} bar="#D0D4DA" plate="#B5121F" />
      <Shaker3D f={f} look={pbr} body="#E8E2D6" lid="#1A1A1E" />
      <ChalkPuff3D f={f} color="#FFFFFF" />
      <Crowd3D f={f} look={pbr} skins={["#2A2230"]} shirts={["#1E1828", "#241C30"]} signColor="#F3EEE6" signText={<SignFace text={SIGN} font={ANTON} color="#B5121F" bg="#F3EEE6" />} />
    </>
  );
};
export const CgiStory: React.FC = () => (
  <Reel dur={STORY_DUR} push={0.05} printBand grain={0.05} printColor="#E8E8EE" sfx={STORY_SFX}>
    <AbsoluteFill style={{ background: "#1A1530" }}>
      <Stage3D>
        <CgiScene />
      </Stage3D>
      <StoryCaptions />
      <InternalBadge />
    </AbsoluteFill>
  </Reel>
);

/* ---------------- PS2 (internal): low-poly cutscene, quarter-res render ---------------- */
const lambert: Look = {
  mat: ({ color }) => <meshLambertMaterial color={color} flatShading />,
  segs: 6,
  limb: 0.06,
};
const Ps2Scene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <color attach="background" args={["#3A2C4A"]} />
      <fog attach="fog" args={["#3A2C4A", 6, 13]} />
      <ambientLight intensity={0.9} color="#B9A9D9" />
      <directionalLight position={[3, 5, 2]} intensity={1.6} color="#FFE2C4" />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 24]} />
        {lambert.mat({ color: "#5B4A3A" })}
      </mesh>
      <mesh position={[0, 3, -3]}>
        <boxGeometry args={[24, 6, 0.2]} />
        {lambert.mat({ color: "#6E5A7A" })}
      </mesh>
      {[-2.2, 2.2].map((x) => (
        <group key={x} position={[x, 0, -1.4]}>
          {[-0.4, 0.4].map((dx) => (
            <mesh key={dx} position={[dx, 1, 0]}>
              <boxGeometry args={[0.12, 2, 0.12]} />
              {lambert.mat({ color: "#2E2A33" })}
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[2.6, 0.08, 1.5]} />
        {lambert.mat({ color: "#7A5A3A" })}
      </mesh>
      <Figure3D pose={poseAt(f)} look={lambert} skin="#D9A27A" shirt="#C21A26" pants="#24242A" hair="#2A1A12" />
      <Bar3D f={f} look={lambert} bar="#8A8A92" plate="#C21A26" />
      <Shaker3D f={f} look={lambert} body="#E7E1D6" lid="#1B1B1F" />
      <ChalkPuff3D f={f} color="#FFFFFF" />
      <Crowd3D f={f} look={lambert} skins={SKINS} shirts={SHIRTS} signScale={1.5} signColor="#F3EEE6" signText={<SignFace text={SIGN} font={INTER} color="#C21A26" bg="#F3EEE6" />} />
    </>
  );
};
export const Ps2Story: React.FC = () => (
  <Reel dur={STORY_DUR} push={0.05} printBand grain={0.06} printColor="#F3EEE6" sfx={STORY_SFX}>
    <AbsoluteFill style={{ background: "#3A2C4A" }}>
      <Stage3D dpr={0.25} antialias={false} aces={false} drift={0}>
        <Ps2Scene />
      </Stage3D>
      <StoryCaptions />
      <InternalBadge />
    </AbsoluteFill>
  </Reel>
);

/* ---------------- Lego style (internal): brick-built gym ---------------- */
const brick: Look = {
  mat: ({ color }) => <meshPhysicalMaterial color={color} roughness={0.28} clearcoat={0.6} clearcoatRoughness={0.2} />,
  segs: 16,
  limb: 0.07,
  boxy: true,
};
const LegoScene: React.FC = () => {
  const f = useCurrentFrame();
  const U = 0.25;
  return (
    <>
      <color attach="background" args={["#8FD0F5"]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 6, 4]} intensity={1.8} />
      {/* green baseplate with studs */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[14, 0.1, 8]} />
        {brick.mat({ color: "#3E8E3A" })}
      </mesh>
      {Array.from({ length: 13 * 9 }, (_, i) => (
        <mesh key={i} position={[(i % 13) * U * 2 - 3, 0.03, Math.floor(i / 13) * U * 2 - 1.6]}>
          <cylinderGeometry args={[0.07, 0.07, 0.06, 12]} />
          {brick.mat({ color: "#3E8E3A" })}
        </mesh>
      ))}
      {/* brick towers behind */}
      {Array.from({ length: 7 }, (_, i) => {
        const n = 4 + Math.floor(hash(i) * 6);
        const color = ["#F7D33C", "#F3EEE6", "#2E5BBA", "#D7192A", "#3E8E3A"][i % 5];
        return (
          <group key={i} position={[-3 + i, 0, -2.6]}>
            {Array.from({ length: n }, (_, j) => (
              <mesh key={j} position={[(j % 2) * 0.06, 0.2 + j * 0.42, 0]}>
                <boxGeometry args={[0.8, 0.4, 0.5]} />
                {brick.mat({ color })}
              </mesh>
            ))}
          </group>
        );
      })}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[2.6, 0.12, 1.4]} />
        {brick.mat({ color: "#9A9A9A" })}
      </mesh>
      <Figure3D pose={poseAt(f)} look={brick} skin="#E2B98E" shirt="#D7192A" pants="#2E5BBA" hair="#5B3A22" />
      <Bar3D f={f} look={brick} bar="#5A5A5A" plate="#D7192A" />
      <Shaker3D f={f} look={brick} body="#F3EEE6" lid="#1B1B1F" />
      <ChalkPuff3D f={f} color="#FFFFFF" />
      <Crowd3D f={f} look={brick} skins={["#E2B98E", "#C98B5E", "#8D5A3B"]} shirts={SHIRTS} signColor="#F3EEE6" signText={<SignFace text={SIGN} font={BANGERS} color="#D7192A" bg="#F3EEE6" />} />
    </>
  );
};
export const LegoStory: React.FC = () => (
  <Reel dur={STORY_DUR} push={0.05} printBand grain={0.04} sfx={STORY_SFX}>
    <AbsoluteFill style={{ background: "#8FD0F5" }}>
      <Stage3D>
        <LegoScene />
      </Stage3D>
      <StoryCaptions />
      <InternalBadge />
    </AbsoluteFill>
  </Reel>
);
