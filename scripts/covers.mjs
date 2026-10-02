// Genera portadas WebP livianas (cover.webp, 900px) para cada proyecto del portafolio.
// Uso: node scripts/covers.mjs   (idempotente: salta las que ya existen)
import { createRequire } from "node:module";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
const require = createRequire(import.meta.url);
const sharp = require("sharp");
const ROOT = join(process.cwd(), "public", "portafolio", "g");
let hechas = 0, saltadas = 0;
for (const id of await readdir(ROOT)) {
  const dir = join(ROOT, id);
  if (!(await stat(dir)).isDirectory()) continue;
  const out = join(dir, "cover.webp");
  try { await stat(out); saltadas++; continue; } catch {}
  await sharp(join(dir, "01.jpg")).resize({ width: 900, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
  hechas++;
}
console.log(`covers: ${hechas} generadas, ${saltadas} ya existían`);
