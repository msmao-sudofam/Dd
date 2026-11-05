import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { B } from "./rig";

/** Front-on camera with a slow push; a touch closer on the lockout. */
const Rig: React.FC<{ drift: number }> = ({ drift }) => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const k = Math.min(1, f / 240);
  const lock = Math.min(1, Math.max(0, (f - B.lock) / 30));
  camera.position.set(Math.sin(f / 80) * drift, 2.25 + lock * 0.05, 8.4 - k * 0.5 - lock * 0.25);
  camera.lookAt(0, 0.95 + lock * 0.12, 0);
  return null;
};

export const Stage3D: React.FC<{ children: React.ReactNode; dpr?: number; antialias?: boolean; drift?: number; aces?: boolean }> = ({ children, dpr = 1, antialias = true, drift = 0.12, aces = true }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      dpr={dpr}
      gl={{ antialias, toneMapping: aces ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping }}
      camera={{ fov: 36, position: [0, 2.25, 8.4] }}
    >
      {children}
      <Rig drift={drift} />
    </ThreeCanvas>
  );
};
