"use client";

import { usePathname } from "next/navigation";
import { waMensaje, waUrl } from "@/lib/site";
import { track } from "@/lib/track";

/**
 * Botón flotante de WhatsApp: el canal que de verdad cierra ventas en Colombia.
 * El mensaje cambia según la página. Se oculta (CSS) cuando hay modal, drawer o
 * lightbox abiertos, y en el panel admin.
 */
export default function WhatsAppFab() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/admin") || pathname.startsWith("/informe")) return null;
  const href = waUrl(waMensaje(pathname));
  return (
    <a
      className="wa-fab"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      onClick={() => track("cta", "whatsapp", { origen: "fab" })}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a9.9 9.9 0 0 0-8.5 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.1.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3l-.4-.2z" />
      </svg>
      <span className="wa-fab-label">WhatsApp</span>
    </a>
  );
}
