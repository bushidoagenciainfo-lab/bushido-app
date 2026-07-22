import Link from "next/link";
import { EMAIL } from "@/lib/site";

export default function Footer() {
  return (
    <footer>
      <Link href="/" className="foot-brand">
        BUSH<em>I</em>DO
      </Link>
      <div className="foot-mid">Criterio antes que equipo.</div>
      <div className="foot-right">
        © 2025 Bushido · <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </div>
    </footer>
  );
}
