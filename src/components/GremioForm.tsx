"use client";

import { useEffect, useState } from "react";
import CreatorForm from "./CreatorForm";
import TalentForm from "./TalentForm";

type Modo = "creator" | "crew";

const COPY: Record<Modo, { num: string; titulo: string; em: string; texto: string; perks: [string, string][] }> = {
  creator: {
    num: "Book de creadores · UGC",
    titulo: "Eres",
    em: "creator",
    texto:
      "Estamos armando el book de creadores de Bushido: gente que produce UGC real para marcas. No hacemos casting por seguidores — lo hacemos por nicho, formato y qué tan bien conecta tu contenido con la audiencia correcta.",
    perks: [
      ["Briefs con dirección", "no te dejamos improvisando"],
      ["Marcas reales", "pago por pieza, acordado antes"],
      ["Micro también cuenta", "importa el nicho, no el tamaño"],
    ],
  },
  crew: {
    num: "Banco de crew · Producción",
    titulo: "Eres",
    em: "crew",
    texto:
      "Sumamos gente al equipo por proyecto: foto, cámara, edición, color, sonido, producción y dirección. Deja tus datos, tu CV y links a tu trabajo. Cuando salga algo que encaje con tu perfil, te escribimos.",
    perks: [
      ["Proyectos reales", "no prácticas sin pago"],
      ["Pago justo por rol", "acordado antes de arrancar"],
      ["Crédito en la pieza", "tu nombre importa"],
    ],
  },
};

/**
 * Una sola puerta de entrada al gremio. La primera pregunta define el
 * formulario: creator (UGC) o crew (producción).
 */
export default function GremioForm() {
  const [modo, setModo] = useState<Modo | null>(null);

  // /gremio#creadores sigue funcionando: abre directo el formulario de creators.
  useEffect(() => {
    if (window.location.hash === "#creadores") setModo("creator");
  }, []);

  const copy = modo ? COPY[modo] : null;

  return (
    <div className="brief-wrap" style={{ maxWidth: 1200 }}>
      <div className="brief-copy">
        <div className="section-num">{copy ? copy.num : "Gremio · Postulación"}</div>
        <h2 className="gf-h2">
          {copy ? (
            <>
              {copy.titulo}{" "}
              <em style={{ color: "var(--sepp)", fontStyle: "italic" }}>{copy.em}</em>.
            </>
          ) : (
            <>
              Trabaja con <em style={{ color: "var(--sepp)", fontStyle: "italic" }}>nosotros</em>.
            </>
          )}
        </h2>
        <p style={{ color: "var(--bone-dim)", fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          {copy
            ? copy.texto
            : "Hay dos formas de entrar: creando contenido para marcas desde tus redes, o trabajando en producción con nosotros en set. Elige la tuya y llenas solo lo que te corresponde."}
        </p>
        <ul className="brief-perks">
          {(copy ? copy.perks : ([
            ["Un solo formulario", "eliges y llenas lo justo"],
            ["Te escribimos nosotros", "cuando salga algo de tu perfil"],
            ["Sin letra chica", "condiciones claras antes de arrancar"],
          ] as [string, string][])).map(([a, b]) => (
            <li key={a}>
              {a} · <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        {/* Pregunta 1: define qué formulario sale */}
        <div className="gf-switch">
          <div className="gf-q">¿Cómo quieres entrar al gremio?</div>
          <div className="gf-opts">
            <button
              type="button"
              className={"gf-opt" + (modo === "creator" ? " on" : "")}
              onClick={() => setModo("creator")}
            >
              <span className="gf-opt-k">Creator</span>
              <span className="gf-opt-d">
                Creo contenido para marcas desde mis redes (UGC, influencer)
              </span>
            </button>
            <button
              type="button"
              className={"gf-opt" + (modo === "crew" ? " on" : "")}
              onClick={() => setModo("crew")}
            >
              <span className="gf-opt-k">Crew</span>
              <span className="gf-opt-d">
                Trabajo en producción: foto, cámara, edición, color, sonido
              </span>
            </button>
          </div>
        </div>

        {modo === "creator" && <CreatorForm />}
        {modo === "crew" && <TalentForm />}
        {!modo && (
          <p className="gf-hint">Elige una opción y aparece el formulario que te toca.</p>
        )}
      </div>
    </div>
  );
}
