"use client";

import { useEffect } from "react";

/** Marca la página para que el pop-up de análisis no se abra solo (404, etc.). */
export default function NoPopup() {
  useEffect(() => {
    document.body.classList.add("no-popup");
    return () => document.body.classList.remove("no-popup");
  }, []);
  return null;
}
