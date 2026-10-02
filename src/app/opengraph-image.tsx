import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Imagen que sale al compartir bushidoav.com por WhatsApp, Instagram, X, etc.
// Fotograma real del portafolio + marca. Para cambiar la foto, cambia FOTO.
export const alt = "Bushido — Agencia Audiovisual · Bogotá";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FOTO = join(process.cwd(), "public", "portafolio", "g", "ferxxo", "01.jpg");

export default async function OpenGraphImage() {
  let foto: string | null = null;
  try {
    const buf = await readFile(FOTO);
    foto = `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {
    foto = null;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0A0A0B",
          color: "#EDE7DA",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {foto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto}
            alt=""
            width={1200}
            height={630}
            style={{ position: "absolute", inset: 0, objectFit: "cover", opacity: 0.55 }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(10,10,11,0.96) 0%, rgba(10,10,11,0.75) 55%, rgba(10,10,11,0.25) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 22, letterSpacing: 6, fontFamily: "monospace" }}>
            <span style={{ color: "#D5322E" }}>●</span>
            <span>AGENCIA AUDIOVISUAL · BOGOTÁ</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", flexWrap: "wrap", columnGap: 22, fontSize: 92, lineHeight: 0.95, letterSpacing: -2, maxWidth: 860 }}>
              <span>Hacemos</span>
              <span>lo</span>
              <span>que</span>
              <span>la</span>
              <span>gente</span>
              <span style={{ display: "flex" }}>
                <span style={{ color: "#D5322E", fontStyle: "italic" }}>recuerda</span>
                <span>.</span>
              </span>
            </div>
            <div style={{ fontSize: 28, color: "#A19C93", maxWidth: 760, lineHeight: 1.3 }}>
              Video, foto y contenido para marcas y artistas que necesitan vender, no solo publicar.
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex", fontSize: 44, letterSpacing: 12, fontFamily: "Impact, sans-serif" }}>
              <span>BUSH</span>
              <span style={{ color: "#D5322E" }}>I</span>
              <span>DO</span>
            </div>
            <div style={{ fontSize: 22, color: "#A19C93", fontFamily: "monospace", letterSpacing: 3 }}>bushidoav.com</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
