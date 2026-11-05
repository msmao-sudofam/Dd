import React from "react";
import { MONO } from "../lib/theme";

/** Stamp for retired styles (siquema-motion/animation-studio.md): every frame says it must not be posted. */
export const InternalBadge: React.FC = () => (
  <div style={{ position: "absolute", top: 196, width: "100%", textAlign: "center", zIndex: 5 }}>
    <span style={{ fontFamily: MONO, fontSize: 24, color: "#fff", background: "rgba(17,17,17,.85)", padding: "6px 14px", borderRadius: 8 }}>
      INTERNAL TEST · NOT FOR POSTING
    </span>
  </div>
);
