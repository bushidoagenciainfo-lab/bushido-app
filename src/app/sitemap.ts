import type { MetadataRoute } from "next";

const BASE = "https://bushidoav.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const rutas = [
    { path: "/", priority: 1.0 },
    { path: "/portafolio", priority: 0.9 },
    { path: "/servicios", priority: 0.9 },
    { path: "/gremio", priority: 0.7 },
    { path: "/equipos", priority: 0.7 },
    { path: "/descargables", priority: 0.6 },
    { path: "/contacto", priority: 0.8 },
    { path: "/politica-datos", priority: 0.2 },
  ];
  return rutas.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: r.priority,
  }));
}
