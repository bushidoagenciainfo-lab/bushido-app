import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Nav from "@/components/Nav";
import Cursor from "@/components/Cursor";
import AnalisisModal from "@/components/AnalisisModal";
import TrackPageviews from "@/components/TrackPageviews";
import WhatsAppFab from "@/components/WhatsAppFab";

export const metadata: Metadata = {
  metadataBase: new URL("https://bushidoav.com"),
  title: "Bushido — Agencia Audiovisual · bushidoav.com",
  description:
    "Agencia audiovisual en Bogotá. Video, foto y contenido para marcas y artistas: videoclips, eventos, campañas y redes. Pide tu análisis gratis en 24 horas.",
  openGraph: {
    title: "Bushido — Agencia Audiovisual",
    description:
      "Video, foto y contenido para marcas y artistas que necesitan vender, no solo publicar. Análisis gratis en 24 horas.",
    url: "https://bushidoav.com",
    siteName: "Bushido",
    locale: "es_CO",
    type: "website",
  },
  // La imagen la genera src/app/opengraph-image.tsx (fotograma real + marca).
  twitter: {
    card: "summary_large_image",
    title: "Bushido — Agencia Audiovisual",
    description: "Video, foto y contenido para marcas y artistas. Bogotá, Colombia.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
  // Deja que la página llegue hasta el notch; los elementos fijos usan env(safe-area-inset-*).
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="dark">
      <body className="mode-analog">
        <a className="skip-link" href="#contenido">
          Ir al contenido
        </a>
        <Cursor />
        <Nav />
        <div id="contenido">{children}</div>
        <WhatsAppFab />
        <AnalisisModal />
        <TrackPageviews />
        <Analytics />
      </body>
    </html>
  );
}
