import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // el panel, los informes privados y las APIs no se indexan
      disallow: ["/admin", "/informe/", "/api/"],
    },
    sitemap: "https://bushidoav.com/sitemap.xml",
    host: "https://bushidoav.com",
  };
}
