import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import AnalisisModal from "@/components/AnalisisModal";

export const metadata: Metadata = {
  metadataBase: new URL("https://bushidoav.com"),
  title: "Bushido — Agencia Audiovisual · bushidoav.com",
  description:
    "Agencia audiovisual en Colombia. Producción de video, fotografía de artistas, contenido para marcas y TV. Pide tu análisis gratis en 24 horas.",
  openGraph: {
    title: "Bushido — Agencia Audiovisual",
    description:
      "Criterio antes que equipo. Análisis y propuesta a la medida en 24 horas.",
    url: "https://bushidoav.com",
    siteName: "Bushido",
    locale: "es_CO",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="dark">
      <body className="mode-analog">
        <Nav />
        {children}
        <AnalisisModal />
      </body>
    </html>
  );
}
