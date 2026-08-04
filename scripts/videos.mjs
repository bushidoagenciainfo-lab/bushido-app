// Comprime los videos de la biblioteca de Maick para poder servirlos en la web.
//
// Uso:  node scripts/videos.mjs           (desde bushido-app)
//
// Los originales pesan 50-137 MB (hasta 4K). Aquí salen en 720px de ancho,
// H.264 (compatible con todo), audio AAC y `faststart` para que empiecen a
// reproducirse sin descargar el archivo entero. Quedan en ~1-3 MB.
//
// Salida: public/video/<id>/01.mp4 … NN.mp4

import { mkdir, readdir, unlink, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import ffmpeg from "ffmpeg-static";

const run = promisify(execFile);
const RAIZ = path.resolve(process.cwd(), "..", "Contenido_Aud");
const DEST = path.resolve(process.cwd(), "public", "video");
const ANCHO = 720;   // los originales son verticales 1080x1920 o 2160x3840
const CRF = 28;      // calidad: más alto = más liviano

/** id de la galería → archivos de video de origen (en orden) */
const MAPA = {
  veneno: ["Eventos/Veneno/REDBULL.mp4"],
  "adidas-outfit": ["Moda/Adidas_Outfit/ADIDAS_hd.mp4"],
  // OJO: el archivo se llama PEGASUS pero vive en la carpeta Nike_Dn.
  // PEGASUS_1.mp4 es un duplicado (misma duración y bitrate), no se usa.
  "nike-dn": ["Moda/Nike_Dn/PEGASUS.mp4"],
  "cinema-bts": [
    "Cinema/Recaps_bts/0a1c9f389d4d44d08cf03443c35437b7.MP4",
    "Cinema/Recaps_bts/copy_EC61E5E6-00C5-408A-A894-4BE2345FD539.MP4",
    "Cinema/Recaps_bts/copy_F338647B-5323-45E8-98AC-CD3559FD34C3.MP4",
    "Cinema/Recaps_bts/copy_F508304D-A51D-4C2B-B4FF-CE7866B6E963.MP4",
  ],
  "new-balance-1000": [
    "Moda/New Balance 1000/AQPwnL6ZbmchTTt5ac2eOEmpGJp5qgfWcRwxUxsfzZez6sEA2bUI2pXCXQsMePVKWBSUD41CNUEMAPEDSwBtzr_eWPSVovqni1AJQEg.mp4",
    "Moda/New Balance 1000/AQOGRvXzfJlDVvZQH3rEY_PVQqKW-YP6cQGvJMOBjiFyT5HW6Tv3F1_-jMR-qysrVkPcLnYsfQyf_Heg_zpLAXa7ZbRNML-eLPAsirs.mp4",
    "Moda/New Balance 1000/AQNXjCaIOfnTLwwdiR4B4a-TvsDcMfn0VW6CdLrKkfkJdO1AZiliLvLlheaY0WFzDPVqwccITxBydWThdYXThMa-m8UOV557Py3a0pg.mp4",
  ],
  "new-balance-mt10o": [
    "Moda/New Balance MT10O/AQN9rjEfA_bz289-WURKX_YJrFg7OjaytOZ8JlSj81DCgTfYdZW3GsHavewh2-_I5IounyIAllAMuCTaY9I1aUPj-TLJat-xJbOqXvo.mp4",
  ],
};

const mb = (b) => (b / 1024 / 1024).toFixed(1);
const resumen = [];

for (const [id, fuentes] of Object.entries(MAPA)) {
  const destDir = path.join(DEST, id);
  await mkdir(destDir, { recursive: true });
  let n = 0;

  for (const rel of fuentes) {
    const src = path.join(RAIZ, rel);
    if (!existsSync(src)) {
      console.log(`  ⚠ falta: ${rel}`);
      continue;
    }
    n++;
    const salida = path.join(destDir, `${String(n).padStart(2, "0")}.mp4`);
    const antes = (await stat(src)).size;

    await run(ffmpeg, [
      "-y", "-v", "error",
      "-i", src,
      // escala a 720 de ancho manteniendo proporción; fuerza dimensiones pares
      "-vf", `scale=${ANCHO}:-2`,
      "-c:v", "libx264", "-preset", "slow", "-crf", String(CRF),
      "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.0",
      "-c:a", "aac", "-b:a", "96k",
      "-movflags", "+faststart",
      salida,
    ]);

    const despues = (await stat(salida)).size;
    console.log(`✓ ${id}/${path.basename(salida)}  ${mb(antes)} MB → ${mb(despues)} MB`);
  }

  // limpia sobrantes de corridas anteriores
  for (const f of await readdir(destDir)) {
    if (Number(f.slice(0, 2)) > n) await unlink(path.join(destDir, f));
  }
  if (n) resumen.push({ id, videos: n });
}

console.log("\n── para src/lib/site.ts ──");
for (const r of resumen) console.log(`${r.id}: videos: ${r.videos},`);
