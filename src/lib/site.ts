// Datos del sitio Bushido (fuente única mientras montamos el CMS en Fase 3).

export type PortfolioCat =
  | "conciertos"
  | "eventos"
  | "moda"
  | "contenido"
  | "podcast"
  | "videoclip"
  | "cinema";

export interface PortfolioItem {
  id: string;               // carpeta en /public/portafolio/g/<id>/
  cat: PortfolioCat;
  label: string;
  title: string;
  client: string;
  fotos: number;            // cuántas fotos tiene la galería (01.jpg…)
  featured?: boolean;
  link?: string;            // reel publicado (Instagram), si existe
}

export const PORTFOLIO: PortfolioItem[] = [
  { id: "arcangel", cat: "conciertos", label: "En vivo", title: "Arcángel", client: "Show en vivo", fotos: 8, featured: true },
  { id: "blessd", cat: "conciertos", label: "En vivo", title: "Blessd", client: "Si Supieras Tour", fotos: 8, featured: true },
  { id: "blink-182", cat: "conciertos", label: "En vivo", title: "Blink-182", client: "Festival", fotos: 8, featured: true },
  { id: "ferxxo", cat: "conciertos", label: "En vivo", title: "Ferxxo", client: "Feid · gira", fotos: 8, featured: true },
  { id: "j-balvin-bogota", cat: "conciertos", label: "En vivo", title: "J Balvin", client: "Bogotá", fotos: 8, featured: true },
  { id: "black-coffee", cat: "conciertos", label: "En vivo", title: "Black Coffee", client: "Set en vivo", fotos: 8 },
  { id: "franco-el-gorilla", cat: "conciertos", label: "En vivo", title: "Franco El Gorila", client: "Show en vivo", fotos: 8 },
  { id: "juniorh", cat: "conciertos", label: "En vivo", title: "Junior H", client: "Show en vivo", fotos: 8 },
  { id: "kaalvo", cat: "conciertos", label: "En vivo", title: "Kaalvo", client: "Show en vivo", fotos: 8 },
  { id: "keny-y", cat: "conciertos", label: "En vivo", title: "Ken-Y", client: "Show en vivo", fotos: 8 },
  { id: "lenny-tavarez-j-quiles", cat: "conciertos", label: "En vivo", title: "Lenny Tavárez & J Quiles", client: "Show en vivo", fotos: 7 },
  { id: "limp-bizkit", cat: "conciertos", label: "En vivo", title: "Limp Bizkit", client: "Festival", fotos: 8 },
  { id: "luis-alfonso", cat: "conciertos", label: "En vivo", title: "Luis Alfonso", client: "Show en vivo", fotos: 8 },
  { id: "sam-smith", cat: "conciertos", label: "En vivo", title: "Sam Smith", client: "Tour internacional", fotos: 8 },
  { id: "yomo", cat: "conciertos", label: "En vivo", title: "Yomo", client: "Show en vivo", fotos: 8 },
  { id: "adidas-samba-diadelosmuertos", cat: "moda", label: "Campaña", title: "Adidas Samba", client: "Día de Muertos", fotos: 8, featured: true, link: "https://www.instagram.com/reel/DJ2sIgaMYUl/" },
  { id: "jordan-1-retro-high-og-unc-reimagined", cat: "moda", label: "Drop", title: "Air Jordan 1 UNC", client: "Reimagined", fotos: 8, featured: true, link: "https://www.instagram.com/reel/DJp_q5BMpRO/" },
  { id: "nike-procity", cat: "moda", label: "Drop", title: "Nike Dunk ProCity", client: "Nike SB", fotos: 8, featured: true, link: "https://www.instagram.com/reel/DBuON3YvBwl/" },
  { id: "real-madrid-adidas", cat: "moda", label: "Campaña", title: "Real Madrid × Adidas", client: "Adidas Football", fotos: 6, featured: true },
  { id: "wales-bonner-x-adidas-ss25", cat: "moda", label: "Campaña", title: "Wales Bonner × Adidas", client: "SS25", fotos: 8, featured: true },
  { id: "adidas-adizero-aruku", cat: "moda", label: "Drop", title: "Adidas Adizero Aruku", client: "Adidas", fotos: 8 },
  { id: "adidas-megarider-01", cat: "moda", label: "Drop", title: "Adidas Megaride", client: "Adidas", fotos: 6 },
  { id: "adidas-neighborhood", cat: "moda", label: "Campaña", title: "Adidas Neighborhood", client: "Adidas Originals", fotos: 8 },
  { id: "adidas-outfit", cat: "moda", label: "Editorial", title: "Adidas Outfit", client: "Adidas", fotos: 8 },
  { id: "adidas-sl-bob", cat: "moda", label: "Campaña", title: "Adidas SL", client: "Adidas Running", fotos: 8 },
  { id: "air-jordan-1-retro-high-og-unc-reimagined", cat: "moda", label: "Drop", title: "Air Jordan 1 UNC", client: "Retro High OG", fotos: 5 },
  { id: "airforce1", cat: "moda", label: "Drop", title: "Nike Air Force 1", client: "Nike", fotos: 8 },
  { id: "new-balance-1000", cat: "moda", label: "Drop", title: "New Balance 1000", client: "New Balance", fotos: 8 },
  { id: "new-balance-9060-great-plains", cat: "moda", label: "Drop", title: "New Balance 9060", client: "Great Plains", fotos: 6 },
  { id: "new-balance-mt10o", cat: "moda", label: "Drop", title: "New Balance MT10", client: "New Balance", fotos: 8 },
  { id: "new-era", cat: "moda", label: "Editorial", title: "New Era", client: "Lookbook", fotos: 8, link: "https://www.instagram.com/reel/DJ7zwTbs6z6/" },
  { id: "new-era-9forty", cat: "moda", label: "Drop", title: "New Era 9FORTY", client: "New Era", fotos: 8 },
  { id: "new-era-9forty-crinkled-pu", cat: "moda", label: "Drop", title: "New Era 9FORTY Crinkled", client: "New Era", fotos: 8 },
  { id: "new-era-fire", cat: "moda", label: "Campaña", title: "New Era Fire", client: "New Era", fotos: 8 },
  { id: "nike-air-force-1-fe-by-hype", cat: "moda", label: "Drop", title: "Nike Air Force 1 [FE]", client: "by HYPE", fotos: 5 },
  { id: "nike-air-max-dn-heat-map", cat: "moda", label: "Drop", title: "Nike Air Max DN", client: "Heat Map", fotos: 6, link: "https://www.instagram.com/reel/DJF0vq3s2ke/" },
  { id: "nike-dn", cat: "moda", label: "Drop", title: "Nike DN", client: "Nike Sportswear", fotos: 8, link: "https://www.instagram.com/reel/DJF0vq3s2ke/" },
  { id: "veneno-fire", cat: "moda", label: "Editorial", title: "Veneno Fire", client: "Red Bull", fotos: 4 },
  { id: "veneno-rider", cat: "moda", label: "Editorial", title: "Veneno Rider", client: "Red Bull", fotos: 6 },
  { id: "forbes-colombia", cat: "eventos", label: "Corporate", title: "Forbes Colombia", client: "Evento corporativo", fotos: 8, featured: true },
  { id: "veneno", cat: "moda", label: "Editorial", title: "Veneno", client: "Red Bull", fotos: 8, featured: true },
  { id: "ciudad-primavera-j-balvin", cat: "eventos", label: "Festival", title: "Ciudad Primavera", client: "J Balvin", fotos: 8 },
  { id: "estrellas-aguila", cat: "eventos", label: "Activación", title: "Estrellas Águila", client: "Cerveza Águila", fotos: 8 },
  { id: "fep-backstage", cat: "eventos", label: "Backstage", title: "FEP Backstage", client: "Estéreo Picnic", fotos: 8 },
  { id: "guacherna-barranquilla-2026", cat: "eventos", label: "Cultural", title: "Guacherna", client: "Barranquilla 2026", fotos: 8 },
  { id: "j-balvin-cali-callao", cat: "eventos", label: "Festival", title: "J Balvin · Callao", client: "Cali", fotos: 8 },
  { id: "melina-martinez-ronda", cat: "eventos", label: "Activación", title: "Melina Martínez", client: "Ronda", fotos: 8 },
  { id: "mindo-soulburge", cat: "eventos", label: "Creators", title: "Mindo & SoulBurge", client: "Creadores", fotos: 8 },
  { id: "mindo-rueda-de-medios", cat: "eventos", label: "Prensa", title: "Mindo", client: "Rueda de medios", fotos: 8 },
  { id: "avela", cat: "contenido", label: "Social", title: "Avela", client: "Contenido de marca", fotos: 8 },
  { id: "bearsbake", cat: "contenido", label: "Social", title: "Bears Bakery", client: "Contenido de marca", fotos: 7, link: "https://www.instagram.com/p/DOJcn1IjYYH/" },
  { id: "bianco-bake-lab", cat: "contenido", label: "Social", title: "Bianco Bake Lab", client: "Contenido de marca", fotos: 8 },
  { id: "esquina-kosher", cat: "contenido", label: "Social", title: "Esquina Kosher", client: "Contenido de marca", fotos: 7, link: "https://www.instagram.com/p/Da3C2IKJohQ/" },
  { id: "trucoperro", cat: "videoclip", label: "Music video", title: "Truco Perro", client: "Videoclip musical", fotos: 8, featured: true },
  { id: "cinema-bts", cat: "cinema", label: "Cinema", title: "Cine y series", client: "Behind the scenes", fotos: 8, featured: true },
  { id: "historias-de-carceles", cat: "podcast", label: "Podcast", title: "Historias de cárceles", client: "Producción de podcast", fotos: 8, featured: true },
];

export const PORTFOLIO_FILTERS: { key: "todos" | PortfolioCat; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "conciertos", label: "Conciertos" },
  { key: "moda", label: "Moda" },
  { key: "eventos", label: "Eventos" },
  { key: "contenido", label: "Contenido" },
  { key: "cinema", label: "Cine y series" },
  { key: "videoclip", label: "Videoclips" },
  { key: "podcast", label: "Podcast" },
];

export interface ServicePackage {
  name: string;
  price: string;
  featured?: boolean;
}
// Familias de servicio: agrupan la oferta para que se lea ordenada.
export const SERVICE_GROUPS = [
  { key: "growth", label: "Marca y crecimiento", hint: "Estrategia, redes, pauta y branding" },
  { key: "creators", label: "Creators y UGC", hint: "Contenido de creador con data" },
  { key: "produccion", label: "Producción audiovisual", hint: "Video, foto y cobertura" },
] as const;
export type ServiceGroup = (typeof SERVICE_GROUPS)[number]["key"];

export interface Service {
  slug: string;
  num: string;
  grupo: ServiceGroup;
  cat: string;
  title: string;
  titleEm: string; // parte en itálica/rojo
  description: string;
  packages: ServicePackage[];
  benefits: string[];
  note: string;
}

export const SERVICES: Service[] = [
  {
    slug: "ugc", num: "01", grupo: "creators", cat: "Creators · Data-driven", title: "UGC con", titleEm: "data",
    description:
      "Contenido de creador que no se elige por tendencia: elegimos al creator y el ángulo con data de tu nicho, y medimos el resultado. Casting curado de nuestro book, producción con dirección de arte y reporte de performance.",
    packages: [
      { name: "Starter · 4 piezas", price: "$1.600.000" },
      { name: "Growth · 8 piezas", price: "$2.900.000", featured: true },
      { name: "Always-on · 12+ /mes", price: "Desde $4.200.000" },
    ],
    benefits: [
      "Casting por nicho y buyer persona, no por seguidores",
      "Briefing y ángulos definidos con data (método Kansei)",
      "Derechos de uso para pauta (whitelisting) incluidos",
      "Reporte de performance por pieza: qué ángulo ganó y por qué",
    ],
    note: "Ideal para testear mensajes antes de invertir fuerte en pauta.",
  },
  {
    slug: "pauta", num: "03", grupo: "growth", cat: "Performance", title: "Pauta y", titleEm: "amplificación",
    description:
      "Tu mejor contenido no sirve si nadie lo ve. Gestionamos Meta, TikTok y Google Ads con la data que ya construimos de tu marca y tu nicho: segmentación, testeo de creativos y optimización semanal.",
    packages: [
      { name: "Fee gestión · /mes", price: "$1.200.000" },
      { name: "Performance · /mes", price: "$1.900.000", featured: true },
      { name: "Full-funnel · /mes", price: "Desde $2.800.000" },
    ],
    benefits: [
      "Setup de campañas, públicos y píxel/eventos",
      "Testeo A/B de creativos (qué hook y qué emoción convierte)",
      "Optimización semanal + reporte con CPA, ROAS y aprendizajes",
      "Remarketing y embudo completo en planes superiores",
    ],
    note: "El fee es la gestión; la inversión publicitaria va aparte y es tuya.",
  },
  {
    slug: "estrategia", num: "01", grupo: "growth", cat: "Strategy · Kansei", title: "Estrategia", titleEm: "Kansei",
    description:
      "Nuestro método propio para decodificar qué te compran y qué emociones lo mueven. Auditoría profunda de tu marca y tu competencia, buyer personas, pilares de contenido y un roadmap de 90 días listo para ejecutar.",
    packages: [
      { name: "Auditoría express", price: "$900.000" },
      { name: "Estrategia 90 días", price: "$2.400.000", featured: true },
      { name: "Estrategia + acompañamiento", price: "Desde $3.500.000" },
    ],
    benefits: [
      "Investigación real de marca, nicho y competencia",
      "Buyer personas con jobs-to-be-done y drivers de compra",
      "Pilares de contenido y calendario editorial por funnel",
      "KPIs y tablero de medición para saber si funciona",
    ],
    note: "El análisis gratis del sitio es la versión corta de este método.",
  },
  {
    slug: "branding", num: "04", grupo: "growth", cat: "Brand", title: "Branding e", titleEm: "identidad",
    description:
      "El universo visual de tu marca: cómo se ve, cómo suena y cómo se siente. Construimos el sistema para que todo tu contenido se vea de la misma familia, no como piezas sueltas.",
    packages: [
      { name: "Identidad esencial", price: "$1.800.000" },
      { name: "Sistema de marca", price: "$3.400.000", featured: true },
      { name: "Rebrand completo", price: "Desde $5.500.000" },
    ],
    benefits: [
      "Logo, paleta, tipografías y usos correctos",
      "Dirección de arte y guía de estilo para redes",
      "Tono de voz y mensajes clave de la marca",
      "Plantillas editables para tu equipo",
    ],
    note: "Se puede abonar al primer mes si contratas un paquete de redes.",
  },
  {
    slug: "redes", num: "02", grupo: "growth", cat: "Mensual · Insignia", title: "Paquetes de", titleEm: "redes",
    description:
      "Manejo integral de tus redes: estrategia, producción y campañas. Lo construimos con la data de tu marca y la data que ya hemos creado en tu nicho — no publicamos por publicar.",
    packages: [
      { name: "Esencial · /mes", price: "$2.000.000" },
      { name: "Crecimiento · /mes", price: "$3.200.000", featured: true },
      { name: "Posicionamiento · /mes", price: "$4.300.000" },
    ],
    benefits: [
      "Reels, fotos, gráficas y stories cada mes",
      "Gestión de perfiles + campañas Meta Ads",
      "Estrategia con data de tu marca + nuestra data de nicho",
      "Sesión estratégica mensual (planes superiores)",
    ],
    note: "Mínimo 3 meses · pauta publicitaria aparte (desde $800.000/mes recomendado).",
  },
  {
    slug: "reels", num: "06", grupo: "produccion", cat: "À la carte", title: "Reels", titleEm: "sueltos",
    description:
      "Piezas puntuales para una necesidad específica. Si publicas constante, el paquete mensual de redes te rinde mucho más por lo que incluye.",
    packages: [
      { name: "1 Reel", price: "$400.000" },
      { name: "Pack 3 Reels", price: "$1.000.000", featured: true },
      { name: "Pack 6 Reels", price: "$1.700.000" },
      { name: "+ Guión y concepto", price: "+$200.000" },
    ],
    benefits: ["Hasta 60s por pieza", "Listo para publicar", "Dirección creativa incluida"],
    note: "À la carte · para el flujo mensual, mira Paquetes de redes.",
  },
  {
    slug: "eventos", num: "04", grupo: "produccion", cat: "Eventos", title: "Cobertura de", titleEm: "eventos",
    description: "Fotografía + Reel highlight con entrega el mismo día. Conciertos, lanzamientos y corporativos.",
    packages: [
      { name: "Hasta 3 horas", price: "$1.000.000" },
      { name: "Hasta 6 horas", price: "$1.600.000" },
      { name: "Día completo", price: "$2.500.000" },
      { name: "+ Entrega mismo día", price: "+$300.000" },
    ],
    benefits: ["Fotos + 1–2 Reels", "Viáticos en Bogotá incluidos", "Entrega express opcional"],
    note: "Ideal para prensa, giras y activaciones de marca.",
  },
  {
    slug: "comercial", num: "02", grupo: "produccion", cat: "Campaña", title: "Mini", titleEm: "comercial",
    description: "Para lanzamientos de producto, marca y campañas digitales. Narrativa completa, hasta 90 segundos.",
    packages: [
      { name: "Básico", price: "$1.700.000" },
      { name: "Con concepto", price: "$2.800.000" },
      { name: "Pack lanzamiento", price: "$4.200.000", featured: true },
    ],
    benefits: ["Narrativa de hasta 90s", "Pack lanzamiento: 1 comercial + 3 cortes para redes", "Dirección de arte"],
    note: "Cuando el lanzamiento merece una pieza con historia.",
  },
  {
    slug: "corporativo", num: "03", grupo: "produccion", cat: "Empresa", title: "Video", titleEm: "corporativo",
    description: "Institucional, testimoniales, capacitación y presentación de marca. Producción completa para empresas.",
    packages: [
      { name: "Corto (2–3 min)", price: "$2.800.000" },
      { name: "Mediano (5–7 min)", price: "$4.500.000" },
      { name: "Paquete empresarial", price: "Desde $6.500.000" },
    ],
    benefits: ["Incluye gráficas", "2 rondas de revisión", "Guion y entrevistas dirigidas"],
    note: "Para empresas que quieren verse a la altura de lo que hacen.",
  },
  {
    slug: "producto", num: "05", grupo: "produccion", cat: "Producto", title: "Video de", titleEm: "producto",
    description: "Para e-commerce, redes y publicidad. Muestra el producto de forma que vende.",
    packages: [
      { name: "1 producto", price: "$550.000" },
      { name: "Pack 3 productos", price: "$1.400.000" },
      { name: "Catálogo (hasta 10)", price: "$3.000.000" },
    ],
    benefits: ["Múltiples ángulos", "Optimizado para conversión", "Fondo y styling"],
    note: "El detalle que hace que un producto se vea deseable.",
  },
  {
    slug: "videoclip", num: "01", grupo: "produccion", cat: "Música", title: "Video", titleEm: "clip",
    description: "Concepto, locación, dirección y colorización. Para artistas que van al siguiente nivel.",
    packages: [
      { name: "Básico (1 locación)", price: "$3.000.000" },
      { name: "Con concepto (2–3 loc.)", price: "$5.000.000", featured: true },
      { name: "Premium", price: "Cotización" },
    ],
    benefits: ["Dirección + producción", "Corrección de color", "Concepto y locaciones"],
    note: "Nuestro ADN: el sujeto y el giro inesperado.",
  },
];

export const NAV = [
  { href: "/portafolio", label: "Portafolio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/gremio", label: "Gremio" },
  { href: "/contacto", label: "Contacto" },
];

export const WHATSAPP = "573008923390";
export const EMAIL = "servicios@bushidoav.com";

// Redes sociales (footer).
export const SOCIAL = {
  instagram: "https://www.instagram.com/bushido.aa/",
  tiktok: "https://www.tiktok.com/@bushido.aa",
  youtube: "https://www.youtube.com/@BushidoAgenciaAudiovisual",
};
