"use client";

import { Canvas } from "@react-three/fiber";
import MorphField from "./MorphField";

export default function HeroCanvas() {
  return (
    <div className="hero-3d" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <MorphField />
      </Canvas>
    </div>
  );
}
