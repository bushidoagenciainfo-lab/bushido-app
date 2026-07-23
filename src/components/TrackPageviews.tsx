"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

/** Registra una vista de página cada vez que cambia la ruta. */
export default function TrackPageviews() {
  const pathname = usePathname();
  useEffect(() => {
    // no rastreamos el propio panel admin
    if (pathname?.startsWith("/admin")) return;
    track("pageview");
  }, [pathname]);
  return null;
}
