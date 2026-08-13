// Brief de onboarding: lo llena cada cliente nuevo antes de arrancar.
// Definición única de las 8 secciones y sus 30 campos — la usan el formulario,
// el formateo para WhatsApp/correo y la ruta que lo manda a Bushido OS.

export interface BriefCampo {
  clave: string;
  label: string;
  tipo?: "texto" | "area" | "select";
  placeholder?: string;
  hint?: string;
  opciones?: Array<{ valor: string; label: string }>;
  requerido?: boolean;
}

export interface BriefSeccion {
  num: string;
  titulo: string;
  descripcion?: string;
  campos: BriefCampo[];
}

export const BRIEF: BriefSeccion[] = [
  {
    num: "01",
    titulo: "Datos del negocio",
    campos: [
      { clave: "nombre", label: "Nombre del negocio / marca", requerido: true },
      { clave: "sector", label: "Sector o industria", placeholder: "restaurante, textil, automotriz, fitness…" },
      { clave: "ciudad", label: "Ciudad(es) donde opera" },
      { clave: "tiempo", label: "¿Cuánto tiempo lleva el negocio?", placeholder: "3 años, recién abrimos…" },
      { clave: "web", label: "Sitio web (si tiene)" },
      { clave: "redes", label: "Instagram / TikTok / redes", placeholder: "@" },
      { clave: "contacto", label: "Persona de contacto y WhatsApp", placeholder: "Nombre + número" },
    ],
  },
  {
    num: "02",
    titulo: "El origen",
    descripcion: "Para nosotros la historia detrás es tan importante como el producto.",
    campos: [
      {
        clave: "origen",
        label: "¿Por qué existe este negocio? ¿Cómo nació?",
        tipo: "area",
        hint: "No busques la respuesta bonita. La historia real siempre es más interesante.",
      },
      {
        clave: "diferencial",
        label: "¿Qué te hace diferente de los demás?",
        tipo: "area",
        hint: "¿Qué haces tú que nadie más hace, o que nadie hace igual?",
      },
    ],
  },
  {
    num: "03",
    titulo: "Tu cliente ideal",
    campos: [
      {
        clave: "cliente_ideal",
        label: "¿Quién es tu cliente ideal? Descríbelo como persona, no como segmento",
        tipo: "area",
        hint: "Ej: María, 32 años, profesional, no tiene tiempo de cocinar pero quiere comer bien — NO “mujeres 25-40 NSE A/B”.",
      },
      {
        clave: "cliente_real",
        label: "¿Y quién te compra DE VERDAD hoy?",
        tipo: "area",
        hint: "A veces el cliente real es distinto al ideal. Eso no es malo, es información valiosa.",
      },
      {
        clave: "objeciones",
        label: "¿Cuál es la razón principal por la que la gente NO te compra?",
        tipo: "area",
        hint: "Precio, desconocimiento, ubicación, desconfianza… ¿cuál es la barrera?",
      },
    ],
  },
  {
    num: "04",
    titulo: "Producto o servicio",
    campos: [
      { clave: "productos", label: "¿Qué vendes? Lista tus productos o servicios principales", tipo: "area" },
      { clave: "estrella", label: "¿Cuál es tu producto estrella?" },
      { clave: "precios", label: "Rango de precios (aproximado)", placeholder: "$25.000 - $180.000" },
      {
        clave: "temporada",
        label: "¿Vendes más en alguna temporada?",
        placeholder: "diciembre, San Valentín, todo el año parejo…",
      },
    ],
  },
  {
    num: "05",
    titulo: "Percepción de marca",
    descripcion: "Cómo quieres que se sienta tu marca. Esto define el tono de todo lo que creamos.",
    campos: [
      {
        clave: "personalidad",
        label: "Si tu marca fuera una persona, ¿cómo sería?",
        tipo: "area",
        hint: "Describe su personalidad, cómo habla, cómo se viste, qué música escucha.",
      },
      {
        clave: "emocion",
        label: "¿Qué quieres que sienta alguien cuando ve tu contenido?",
        tipo: "area",
        hint: "Ej: “Que se le antoje”, “Que sienta confianza”.",
      },
      { clave: "palabras", label: "3 palabras que describan tu marca", placeholder: "premium, cercana, disruptiva" },
      {
        clave: "no_decir",
        label: "¿Qué NO quieres que se diga o se perciba?",
        tipo: "area",
        hint: "Ej: “Que somos baratos”, “Que solo es para ricos”, “Que somos aburridos”.",
      },
    ],
  },
  {
    num: "06",
    titulo: "Vocero y cara de marca",
    campos: [
      { clave: "vocero", label: "¿Quién va a ser la cara visible del contenido?", placeholder: "Nombre y rol" },
      {
        clave: "camara",
        label: "¿Qué tan cómodo/a está frente a cámara?",
        tipo: "select",
        opciones: [
          { valor: "Muy cómodo", label: "Muy cómodo — ya ha grabado antes" },
          { valor: "Normal", label: "Normal — puede hablar pero no es natural" },
          { valor: "Incómodo", label: "Incómodo — prefiere no hablar a cámara" },
          { valor: "Sin vocero", label: "No habrá vocero — todo sin voz" },
        ],
      },
      {
        clave: "voz_vocero",
        label: "¿Cómo habla esta persona en la vida real?",
        tipo: "area",
        hint: "¿Jerga técnica? ¿Coloquial? ¿Serio o relajado? Es clave para que el contenido suene auténtico.",
      },
    ],
  },
  {
    num: "07",
    titulo: "Referentes y competencia",
    campos: [
      {
        clave: "referentes",
        label: "2 o 3 marcas o cuentas que admires (no tienen que ser de tu sector)",
        tipo: "area",
      },
      { clave: "competencia", label: "¿Quiénes son tus 2 o 3 competidores principales?", tipo: "area" },
      { clave: "comp_analisis", label: "¿Qué hacen bien tus competidores? ¿Qué hacen mal?", tipo: "area" },
    ],
  },
  {
    num: "08",
    titulo: "Objetivos y expectativas",
    campos: [
      { clave: "objetivos", label: "¿Qué esperas lograr con este trabajo?", tipo: "area" },
      {
        clave: "pauta",
        label: "¿Has invertido en pauta digital antes?",
        tipo: "select",
        opciones: [
          { valor: "Nunca", label: "Nunca he pautado" },
          { valor: "Poco", label: "Sí, pero poco (menos de $500k/mes)" },
          { valor: "Regular", label: "Sí, regularmente ($500k-$2M/mes)" },
          { valor: "Fuerte", label: "Sí, con presupuesto fuerte (+$2M/mes)" },
        ],
      },
      {
        clave: "material",
        label: "¿Tienes logo, guía de marca, colores definidos?",
        tipo: "area",
        hint: "Si no tienes nada, no pasa nada — lo construimos desde cero.",
      },
      { clave: "extra", label: "¿Algo más que quieras contarnos?", tipo: "area" },
    ],
  },
];

/** Todas las claves, por si hay que validar del lado del servidor. */
export const BRIEF_CLAVES = BRIEF.flatMap((s) => s.campos.map((c) => c.clave));

/** Texto plano del brief — para WhatsApp, correo o copiar al portapapeles. */
export function briefATexto(datos: Record<string, string>): string {
  const partes: string[] = ["BRIEF DE MARCA · BUSHIDO", ""];
  for (const sec of BRIEF) {
    const llenos = sec.campos.filter((c) => datos[c.clave]?.trim());
    if (!llenos.length) continue;
    partes.push(`── ${sec.num} · ${sec.titulo.toUpperCase()} ──`);
    for (const c of llenos) partes.push(`${c.label}:`, datos[c.clave].trim(), "");
  }
  return partes.join("\n").trim();
}
