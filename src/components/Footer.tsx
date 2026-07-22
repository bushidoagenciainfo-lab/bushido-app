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
        <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 9h3l.5-3H14V4.5c0-.8.3-1.5 1.5-1.5H17.5V.2C17.2.1 16.2 0 15 0c-2.6 0-4.3 1.6-4.3 4.4V6H8v3h2.7v9H14V9z" />
          </svg>
        </a>
        <a href={SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5 3c.4 2.3 1.9 3.8 4 4v2.8c-1.5 0-2.9-.5-4-1.3v6.2a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v2.9a2.8 2.8 0 1 0 2 2.7V3h2.8z" />
          </svg>
        </a>
      </div>

      <div className="foot-right">
        © 2026 Bushido · <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </div>
    </footer>
  );
}
