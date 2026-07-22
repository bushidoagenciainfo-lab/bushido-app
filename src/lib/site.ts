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
    slug: "eventos", num: "01", cat: "Eventos", title: "Cobertura de", titleEm: "eventos",
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
    slug: "reels", num: "02", cat: "Contenido", title: "Reels de", titleEm: "marca",
    description: "Grabación, dirección creativa y edición optimizada para Instagram y TikTok. Contenido que se comparte.",
    packages: [
      { name: "1 Reel", price: "$500.000" },
      { name: "Pack 3 Reels", price: "$1.300.000", featured: true },
      { name: "Pack 6 Reels", price: "$2.400.000" },
      { name: "+ Guión y concepto", price: "+$200.000" },
    ],
    benefits: ["Hasta 60s por pieza", "Listo para publicar", "Dirección creativa incluida"],
    note: "El pack más pedido por marcas que publican constante.",
  },
  {
    slug: "comercial", num: "03", cat: "Campaña", title: "Mini", titleEm: "comercial",
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
    slug: "corporativo", num: "04", cat: "Empresa", title: "Video", titleEm: "corporativo",
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
    slug: "producto", num: "05", cat: "Producto", title: "Video de", titleEm: "producto",
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
    slug: "videoclip", num: "06", cat: "Música", title: "Video", titleEm: "clip",
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
