// Genera las galerías del portafolio desde la biblioteca de Maick (Contenido_Aud).
//
// Uso:  node scripts/portafolio.mjs           (desde bushido-app)
//
// Convención de portada: se toman las primeras MAX fotos por ORDEN ALFABÉTICO,
// así que el archivo que empiece por "01_portada" queda de portada. Renombrar
// en la carpeta de origen es todo lo que hace falta para cambiar la portada.
//
// Salida: public/portafolio/g/<id>/01.jpg … NN.jpg  (900px de ancho, jpeg q78)

import { readdir, mkdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RAIZ = path.resolve(process.cwd(), "..", "Contenido_Aud");
const DEST = path.resolve(process.cwd(), "public", "portafolio", "g");
const MAX = 10;          // fotos por álbum
const ANCHO = 900;
const EXT = /\.(jpe?g|png|webp|tiff?)$/i;

/** carpeta de origen → id de la galería (= PortfolioItem.id en src/lib/site.ts) */
const MAPA = [
  // ── Conciertos ──
  ["Conciertos/Arcangel", "arcangel"],
  ["Conciertos/Black Coffee", "black-coffee"],
  ["Conciertos/Blessd", "blessd"],
  ["Conciertos/Blink 182", "blink-182"],
  ["Conciertos/Ferxxo", "ferxxo"],
  ["Conciertos/Franco El Gorilla", "franco-el-gorilla"],
  ["Conciertos/J Balvin Bogotá", "j-balvin-bogota"],
  ["Conciertos/JuniorH", "juniorh"],
  ["Conciertos/Kaalvo", "kaalvo"],
  ["Conciertos/Keny-Y", "keny-y"],
  ["Conciertos/Lenny Tavarez & J Quiles", "lenny-tavarez-j-quiles"],
  ["Conciertos/Limp Bizkit", "limp-bizkit"],
  ["Conciertos/Luis Alfonso", "luis-alfonso"],
  ["Conciertos/Sam Smith", "sam-smith"],
  ["Conciertos/Yomo", "yomo"],

  // ── Eventos ──
  ["Eventos/Ciudad Primavera _ J Balvin", "ciudad-primavera-j-balvin"],
  ["Eventos/Estrellas Aguila", "estrellas-aguila"],
  ["Eventos/FEP Backstage", "fep-backstage"],
  ["Eventos/Forbes _ Colombia", "forbes-colombia"],
  ["Eventos/Guacherna _ Barranquilla _ 2026", "guacherna-barranquilla-2026"],
  ["Eventos/J Balvin _ Cali _ Callao", "j-balvin-cali-callao"],
  ["Eventos/Melina Martinez _ Ronda", "melina-martinez-ronda"],
  ["Eventos/Mindo & SoulBurge", "mindo-soulburge"],
  ["Eventos/Mindo _ Rueda de medios", "mindo-rueda-de-medios"],
  ["Eventos/Veneno", "veneno"], // Maick lo movió de Moda a Eventos

  // ── Moda ──
  ["Moda/adidas Adizero Aruku", "adidas-adizero-aruku"],
  ["Moda/Adidas Megarider 01", "adidas-megarider-01"],
  ["Moda/Adidas_Neighborhood", "adidas-neighborhood"],
  ["Moda/Adidas_Outfit", "adidas-outfit"],
  ["Moda/Adidas_Samba_DiaDeLosMuertos", "adidas-samba-diadelosmuertos"],
  ["Moda/Adidas_Sl_Bob", "adidas-sl-bob"],
  ["Moda/Airforce1", "airforce1"],
  // De las dos carpetas del Jordan 1 UNC nos quedamos con la que tiene más material.
  ["Moda/Jordan 1 Retro High OG “UNC Reimagined”", "jordan-1-retro-high-og-unc-reimagined"],
  ["Moda/New Balance 1000", "new-balance-1000"],
  ["Moda/New Balance 9060 “Great Plains”", "new-balance-9060-great-plains"],
  ["Moda/New Balance MT10O", "new-balance-mt10o"],
  ["Moda/NEW ERA 9FORTY", "new-era-9forty"],
  ["Moda/New Era 9FORTY Crinkled PU", "new-era-9forty-crinkled-pu"],
  ["Moda/New Era Cerrada", "new-era-cerrada"],
  ["Moda/New Era Fire", "new-era-fire"],
  ["Moda/New_Era_spot", "new-era"],
  ["Moda/Nike Air Force 1 [FE] by HYPE", "nike-air-force-1-fe-by-hype"],
  ["Moda/Nike Air Max DN Heat Map", "nike-air-max-dn-heat-map"],
  ["Moda/Nike_Dn", "nike-dn"],
  ["Moda/Real Madrid _ Adidas", "real-madrid-adidas"],
  ["Moda/Veneno Fire", "veneno-fire"],
  ["Moda/Veneno Rider", "veneno-rider"],
  ["Moda/Wales Bonner x adidas SS25", "wales-bonner-x-adidas-ss25"],

  // ── Otros ──
  ["Cinema/fotos", "cinema-bts"],
  ["Podcast/Historias de carceles", "historias-de-carceles"],
  ["Redes_Sociales_Reels/Avela", "avela"],
  ["Redes_Sociales_Reels/BearsBake", "bearsbake"],
  ["Redes_Sociales_Reels/Bianco Bake Lab", "bianco-bake-lab"],
  ["Redes_Sociales_Reels/Esquina_Kosher", "esquina-kosher"],
  ["Videoclips/TrucoPerro", "trucoperro"],
];

async function imagenesDe(dir) {
  const out = [];
  const entradas = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entradas) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await imagenesDe(full)));
    else if (EXT.test(e.name)) out.push(full);
  }
  return out;
}

const resumen = [];
const sinFuente = [];

for (const [rel, id] of MAPA) {
  const src = path.join(RAIZ, rel);
  if (!existsSync(src)) {
    sinFuente.push(`${id} (no existe la carpeta "${rel}")`);
    continue;
  }
  const fotos = (await imagenesDe(src)).sort((a, b) =>
    path.basename(a).localeCompare(path.basename(b), "es", { numeric: true, sensitivity: "base" }),
  );
  if (!fotos.length) {
    sinFuente.push(`${id} (carpeta vacía: "${rel}") — se deja la galería que ya estaba`);
    continue;
  }

  const destDir = path.join(DEST, id);
  await mkdir(destDir, { recursive: true });
  const usar = fotos.slice(0, MAX);

  for (let i = 0; i < usar.length; i++) {
    const nombre = `${String(i + 1).padStart(2, "0")}.jpg`;
    await sharp(usar[i])
      .rotate()
      .resize({ width: ANCHO, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(path.join(destDir, nombre));
  }
  // borra sobrantes de corridas anteriores (si el álbum encogió)
  for (const f of await readdir(destDir)) {
    const n = Number(f.slice(0, 2));
    if (Number.isFinite(n) && n > usar.length) await unlink(path.join(destDir, f));
  }

  resumen.push({ id, fotos: usar.length, disponibles: fotos.length });
  console.log(`✓ ${id.padEnd(40)} ${usar.length}/${fotos.length}`);
}

console.log("\n── conteos para src/lib/site.ts ──");
for (const r of resumen) console.log(`${r.id}: fotos: ${r.fotos},`);
if (sinFuente.length) {
  console.log("\n⚠ sin material nuevo:");
  for (const s of sinFuente) console.log("  · " + s);
}

// galerías publicadas que ya no tienen carpeta de origen mapeada
const ids = new Set(MAPA.map(([, id]) => id));
const huerfanas = (await readdir(DEST, { withFileTypes: true }))
  .filter((d) => d.isDirectory() && !ids.has(d.name))
  .map((d) => d.name);
if (huerfanas.length) console.log("\n⚠ galerías sin origen en el mapa: " + huerfanas.join(", "));
