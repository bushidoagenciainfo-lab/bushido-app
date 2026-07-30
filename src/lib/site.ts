// Datos del sitio Bushido (fuente única mientras montamos el CMS en Fase 3).

export type PortfolioCat = "eventos" | "moda" | "contenido";

export interface PortfolioItem {
  file: string; // en /public/portafolio
  cat: PortfolioCat;
  label: string;
  title: string;
  client: string;
  badge: string;
  featured?: boolean;
}

export const PORTFOLIO: PortfolioItem[] = [
  { file: "ferxxo", cat: "eventos", label: "En vivo", title: "Ferxxo", client: "Feid · gira", badge: "Concierto", featured: true },
  { file: "blessd", cat: "eventos", label: "En vivo", title: "Blessd", client: "Si Supieras Tour", badge: "Concierto", featured: true },
  { file: "kaalvo", cat: "eventos", label: "En vivo", title: "Kaalvo", client: "Show en vivo", badge: "Concierto" },
  { file: "limp", cat: "eventos", label: "En vivo", title: "LIMP", client: "Festival", badge: "Concierto" },
  { file: "black", cat: "eventos", label: "Cobertura", title: "Black", client: "Evento", badge: "Evento" },
  { file: "blink", cat: "eventos", label: "Cobertura", title: "Blink", client: "Evento", badge: "Evento" },
  { file: "adidas-samba", cat: "moda", label: "Campaña", title: "Adidas Samba", client: "Día de Muertos", badge: "Moda", featured: true },
  { file: "adidas-neighborhood", cat: "moda", label: "Campaña", title: "Adidas Neighborhood", client: "Adidas Originals", badge: "Moda" },
  { file: "adidas-outfit", cat: "moda", label: "Editorial", title: "Adidas Outfit", client: "Adidas", badge: "Moda" },
  { file: "adidas-sl-bob", cat: "moda", label: "Campaña", title: "Adidas SL", client: "Adidas Running", badge: "Moda" },
  { file: "nike-dn", cat: "moda", label: "Sneaker", title: "Nike DN", client: "Nike Sportswear", badge: "Producto" },
  { file: "nike-procity", cat: "moda", label: "Sneaker", title: "Nike Dunk ProCity", client: "Nike SB", badge: "Producto", featured: true },
  { file: "new-era", cat: "moda", label: "Editorial", title: "New Era", client: "Lookbook", badge: "Moda" },
  { file: "airforce", cat: "moda", label: "Sneaker", title: "Nike Air Force 1", client: "Producto", badge: "Producto" },
  { file: "veneno", cat: "moda", label: "Editorial", title: "Veneno", client: "Red Bull", badge: "Moda" },
  { file: "nike-pegasus", cat: "moda", label: "Sneaker", title: "Nike Pegasus", client: "Nike Running", badge: "Producto" },
  { file: "mindo", cat: "contenido", label: "Creadores", title: "Mindo & SoulBurge", client: "Creadores", badge: "Contenido", featured: true },
  { file: "bianco", cat: "contenido", label: "Gastronomía", title: "Bianco Bake Lab", client: "Reels de marca", badge: "Reels" },
  { file: "kosher", cat: "contenido", label: "Gastronomía", title: "Esquina Kosher", client: "Reels de marca", badge: "Reels" },
];

export const PORTFOLIO_FILTERS: { key: "todos" | PortfolioCat; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "eventos", label: "Eventos" },
  { key: "moda", label: "Moda" },
  { key: "contenido", label: "Contenido" },
];

export interface ServicePackage {
  name: string;
  price: string;
  featured?: boolean;
}
export interface Service {
  slug: string;
  num: string;
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
    slug: "ugc", num: "01", cat: "Creators · Data-driven", title: "UGC con", titleEm: "data",
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
    slug: "pauta", num: "02", cat: "Performance", title: "Pauta y", titleEm: "amplificación",
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
    slug: "estrategia", num: "03", cat: "Strategy · Kansei", title: "Estrategia", titleEm: "Kansei",
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
    slug: "branding", num: "04", cat: "Brand", title: "Branding e", titleEm: "identidad",
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
    slug: "redes", num: "05", cat: "Mensual · Insignia", title: "Paquetes de", titleEm: "redes",
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
    slug: "reels", num: "06", cat: "À la carte", title: "Reels", titleEm: "sueltos",
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
    slug: "eventos", num: "07", cat: "Eventos", title: "Cobertura de", titleEm: "eventos",
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
    slug: "comercial", num: "08", cat: "Campaña", title: "Mini", titleEm: "comercial",
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
    slug: "corporativo", num: "09", cat: "Empresa", title: "Video", titleEm: "corporativo",
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
    slug: "producto", num: "10", cat: "Producto", title: "Video de", titleEm: "producto",
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
    slug: "videoclip", num: "11", cat: "Música", title: "Video", titleEm: "clip",
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
