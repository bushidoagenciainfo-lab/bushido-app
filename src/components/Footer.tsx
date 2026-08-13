import Link from "next/link";
import { EMAIL, SOCIAL } from "@/lib/site";

export default function Footer() {
  return (
    <footer>
      <div className="foot-brandwrap">
        <Link href="/" className="foot-brand">
          BUSH<em>I</em>DO
        </Link>
        <span className="foot-tagline">Criterio antes que equipo.</span>
      </div>

      <div className="foot-social">
        <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
        </a>
        <a href={SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5 3c.4 2.3 1.9 3.8 4 4v2.8c-1.5 0-2.9-.5-4-1.3v6.2a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v2.9a2.8 2.8 0 1 0 2 2.7V3h2.8z" />
          </svg>
        </a>
        <a href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.7 1.7c1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4a2.5 2.5 0 0 0 1.7-1.7C23 15.2 23 12 23 12zM9.8 15.3V8.7l6.2 3.3-6.2 3.3z" />
          </svg>
        </a>
      </div>

      <div className="foot-right">
        © 2026 Bushido · <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        <span className="foot-legal">
          <Link href="/terminos">Términos de servicio</Link>
          <Link href="/politica-datos">Política de datos</Link>
        </span>
      </div>
    </footer>
  );
}
