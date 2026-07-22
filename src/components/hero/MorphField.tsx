"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vert = /* glsl */ `
  uniform float uMorph;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute vec3 aAnalog;
  attribute vec3 aDigital;
  attribute float aRand;
  varying float vMix;
  varying float vRand;
  void main() {
    vMix = uMorph;
    vRand = aRand;
    vec3 pos = mix(aAnalog, aDigital, uMorph);
    float t = uTime * 0.4 + aRand * 6.2831;
    pos += 0.035 * vec3(sin(t), cos(t * 1.1), sin(t * 0.7)) * (0.35 + uMorph);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = uSize * (0.55 + aRand * 0.9) * (1.0 + uMorph * 0.45);
    gl_PointSize = size * uPixelRatio * (300.0 / -mv.z);
  }
`;

const frag = /* glsl */ `
  precision mediump float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vMix;
  varying float vRand;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.12, d);
    vec3 col = mix(uColorA, uColorB, vMix);
    col *= 0.72 + vRand * 0.55;
    gl_FragColor = vec4(col, alpha * (0.5 + vMix * 0.4));
  }
`;

export default function MorphField() {
  const groupRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const morph = useRef(0);

  const COUNT = useMemo(() => {
    if (typeof window === "undefined") return 2400;
    return window.innerWidth < 768 ? 1400 : 2600;
  }, []);

  const { aAnalog, aDigital, aRand } = useMemo(() => {
    const a = new Float32Array(COUNT * 3);
    const d = new Float32Array(COUNT * 3);
    const r = new Float32Array(COUNT);
    const golden = Math.PI * (1 + Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const tt = i / COUNT;
      const inc = Math.acos(1 - 2 * tt);
      const az = golden * i;
      const x = Math.sin(inc) * Math.cos(az);
      const y = Math.sin(inc) * Math.sin(az);
      const z = Math.cos(inc);
      const R = 1.35;
      a[i * 3] = x * R;
      a[i * 3 + 1] = y * R;
      a[i * 3 + 2] = z * R;
      const rr = 1.8 + Math.random() * 2.4;
      d[i * 3] = x * rr + (Math.random() - 0.5) * 1.6;
      d[i * 3 + 1] = y * rr + (Math.random() - 0.5) * 1.6;
      d[i * 3 + 2] = z * rr * 1.3 + (Math.random() - 0.5) * 1.6;
      r[i] = Math.random();
    }
    return { aAnalog: a, aDigital: d, aRand: r };
  }, [COUNT]);

  const uniforms = useMemo(
    () => ({
      uMorph: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 3.6 },
      uPixelRatio: { value: typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1 },
      uColorA: { value: new THREE.Color("#F0782E") }, // análogo · cálido ámbar
      uColorB: { value: new THREE.Color("#38E1F5") }, // digital · cian
    }),
    []
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useFrame((_, delta) => {
    const t = uniforms.uTime.value + delta;
    uniforms.uTime.value = t;
    // objetivo del morph: cursor X (o vaivén suave si no hay cursor / móvil)
    // vaivén automático suave para que SIEMPRE se note el efecto,
    // reforzado por el cursor (X mapea de análogo→digital)
    const auto = 0.5 + 0.42 * Math.sin(t * 0.35);
    const byPointer = Math.min(1, Math.max(0, pointer.current.x * 0.65 + 0.5));
    const targetMorph = reduce ? 0.5 : Math.abs(pointer.current.x) < 0.001 ? auto : byPointer;
    morph.current += (targetMorph - morph.current) * (reduce ? 1 : 0.11);
    uniforms.uMorph.value = morph.current;

    const g = groupRef.current;
    if (g) {
      g.rotation.y += (reduce ? 0 : 0.0022) + pointer.current.x * 0.004;
      g.rotation.x += (pointer.current.y * 0.25 - g.rotation.x) * 0.05;
    }
  });

  return (
    <points ref={groupRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[aAnalog, 3]} />
        <bufferAttribute attach="attributes-aAnalog" args={[aAnalog, 3]} />
        <bufferAttribute attach="attributes-aDigital" args={[aDigital, 3]} />
        <bufferAttribute attach="attributes-aRand" args={[aRand, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
