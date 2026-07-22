"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE =
  "a,button,input,select,textarea,[role=button],[data-open-modal],.card,.ficha,.eq-card,.arc-card,.svc-tile,.cat-card,.filter-btn,.dl-card,label";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return; // sin cursor custom en táctil / reduced-motion

    document.body.classList.add("has-cursor");
    const dot = dotRef.current;
    const ring = ringRef.current;

    const onMove = (e: MouseEvent) => {
      if (dot) dot.style.transform = `translate3d(${e.clientX - 3}px, ${e.clientY - 3}px, 0)`;
      if (ring) ring.style.transform = `translate3d(${e.clientX - 17}px, ${e.clientY - 17}px, 0)`;
      document.documentElement.style.setProperty("--mx", e.clientX + "px");
      document.documentElement.style.setProperty("--my", e.clientY + "px");
    };
    const over = (e: Event) => {
      if ((e.target as Element)?.closest?.(INTERACTIVE)) document.body.classList.add("cursor-hover");
    };
    const out = (e: Event) => {
      if ((e.target as Element)?.closest?.(INTERACTIVE)) document.body.classList.remove("cursor-hover");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      document.body.classList.remove("has-cursor", "cursor-hover");
    };
  }, []);

  return (
    <>
      <div className="cursor-spot" aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
    </>
  );
}
