"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "done" | "error";

/**
 * Tope real de subida: el servidor donde vive el sitio corta las peticiones que
 * pasan de ~4,5 MB, así que un CV más pesado ni siquiera llega y el navegador
 * lo reporta como "error de conexión". Avisamos ANTES de enviar.
 */
const MAX_CV = 4 * 1024 * 1024; // 4 MB
const mb = (b: number) => (b / 1024 / 1024).toFixed(1).replace(".", ",");

/**
 * Roles de una producción audiovisual, agrupados por área.
 * Incluye coordinación (project manager, productor ejecutivo) porque son los
 * perfiles que después nos ayudan a coordinar equipos, no solo a ejecutar.
 */
const ROLES = [
  {
    grupo: "Dirección",
    roles: ["Director", "Director de fotografía (DP)", "Asistente de dirección", "Guionista"],
  },
  {
    grupo: "Producción y coordinación",
    roles: [
      "Productor",
      "Productor ejecutivo",
      "Productor de campo",
      "Project manager / Coordinador",
      "Asistente de producción",
      "Scout de locaciones",
      "Casting",
    ],
  },
  {
    grupo: "Cámara y luz",
    roles: [
      "Camarógrafo / Operador",
      "Fotógrafo",
      "Foquista",
      "Gaffer / Luminotécnico",
      "Grip",
      "Piloto de dron",
    ],
  },
  {
    grupo: "Arte",
    roles: [
      "Director de arte",
      "Ambientación / Utilería",
      "Vestuario / Styling",
      "Maquillaje y peinado",
    ],
  },
  { grupo: "Sonido", roles: ["Sonidista", "Microfonista", "Post de audio / Musicalización"] },
  {
    grupo: "Postproducción",
    roles: [
      "Editor",
      "Colorista",
      "Motion graphics",
      "VFX / Composición",
      "Diseñador gráfico",
      "Ilustrador / 3D",
    ],
  },
  {
    grupo: "Contenido y estrategia",
    roles: ["Community manager", "Estratega de contenido", "Copywriter", "Pauta / Performance"],
  },
] as const;

export default function TalentForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [rol, setRol] = useState("");

  function elegirArchivo(f?: File | null) {
    setFileError("");
    if (!f) {
      setFileName("");
      return;
    }
    if (f.size > MAX_CV) {
      setFileName("");
      setFileError(
        `Ese archivo pesa ${mb(f.size)} MB y el máximo es 4 MB. ` +
          `Súbelo a Drive o Dropbox y pega el enlace en “Otros links”, o comprímelo.`
      );
      return;
    }
    setFileName(f.name);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (fileError) {
      setError("Revisa el archivo antes de enviar.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    // si el archivo se rechazó, no lo mandamos (el resto de la postulación sí vale)
    if (!fileName) fd.delete("cv");
    // "Otro" se guarda con el rol que la persona escribió, no como "Otro"
    const otro = (fd.get("role_otro") as string)?.trim();
    if (fd.get("role") === "Otro" && otro) fd.set("role", `Otro · ${otro}`);
    try {
      const res = await fetch("/api/talent", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No pudimos enviar tu postulación.");
        setStatus("error");
        return;
      }
      setStatus("done");
      form.reset();
      setFileName("");
      setRol("");
    } catch {
      setError(
        fileName
          ? "No se pudo enviar. Suele ser el archivo adjunto: quítalo y pega el enlace de tu CV en “Otros links”."
          : "Error de conexión. Revisa tu internet e intenta de nuevo."
      );
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="form-card">
        <div className="form-success" style={{ display: "block" }}>
          <div className="check">
            <svg viewBox="0 0 24 24" fill="none" stroke="#EDE7DA" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h4>¡Recibido!</h4>
          <p>Quedaste en el banco de talentos. Te escribimos cuando salga un proyecto para tu perfil.</p>
          <button type="button" className="again" onClick={() => setStatus("idle")}>
            Enviar otra postulación
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={onSubmit} noValidate>
      <div className="form-content">
        <div className="form-sub">Formulario · postulación</div>
        <h3>
          Únete al <em>gremio</em>.
        </h3>

        <div className="form-row">
          <div className="field">
            <label htmlFor="t-name">
              Nombre <span className="req">*</span>
            </label>
            <input id="t-name" name="name" type="text" placeholder="Tu nombre" required />
          </div>
          <div className="field">
            <label htmlFor="t-email">
              Email <span className="req">*</span>
            </label>
            <input id="t-email" name="email" type="email" placeholder="tu@correo.com" required />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="t-phone">WhatsApp</label>
            <div className="prefix-wrap">
              <span className="prefix">+57</span>
              <input id="t-phone" name="phone" type="tel" inputMode="numeric" placeholder="300 000 0000" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="t-role">
              Tu rol <span className="req">*</span>
            </label>
            <select
              id="t-role"
              name="role"
              required
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="" disabled>
                Selecciona uno
              </option>
              {ROLES.map((g) => (
                <optgroup key={g.grupo} label={g.grupo}>
                  {g.roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </optgroup>
              ))}
              <option>Otro</option>
            </select>
          </div>
        </div>

        {/* Si su rol no está en la lista, que lo escriba: el oficio audiovisual
            tiene más cargos de los que quepan en un desplegable. */}
        {rol === "Otro" && (
          <div className="field">
            <label htmlFor="t-role-otro">
              ¿Cuál es tu rol? <span className="req">*</span>
            </label>
            <input
              id="t-role-otro"
              name="role_otro"
              type="text"
              required
              placeholder="Ej: Supervisor de guion, Coordinador de dobles, Data manager…"
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="t-cv">
            Adjunta tu CV{" "}
            <span style={{ color: "var(--bone-ghost)", fontWeight: "normal" }}>
              (opcional · PDF, DOC o DOCX · máx 4 MB)
            </span>
          </label>
          <label htmlFor="t-cv" className={"file-drop" + (fileError ? " err" : "")}>
            <span>{fileName || "Elegir archivo…"}</span>
            <span className="file-btn">Subir</span>
          </label>
          <input
            id="t-cv"
            name="cv"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            style={{ display: "none" }}
            onChange={(e) => elegirArchivo(e.target.files?.[0])}
          />
          {fileError && <p className="file-err">{fileError}</p>}
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="t-portfolio">Portafolio</label>
            <input id="t-portfolio" name="portfolio" type="text" placeholder="Drive, web, IG…" />
          </div>
          <div className="field">
            <label htmlFor="t-reel">Reel</label>
            <input id="t-reel" name="reel" type="text" placeholder="Link de tu reel" />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="t-behance">Behance</label>
            <input id="t-behance" name="behance" type="text" placeholder="behance.net/tu" />
          </div>
          <div className="field">
            <label htmlFor="t-web">Sitio web</label>
            <input id="t-web" name="web" type="text" placeholder="www.tuweb.com" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="t-links">Otros links</label>
          <input id="t-links" name="links" type="text" placeholder="Cualquier otro enlace relevante" />
        </div>

        <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />

        {status === "error" && (
          <div style={{ color: "var(--sepp)", fontFamily: "var(--mono)", fontSize: 12 }}>{error}</div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
            {status === "loading" ? "Enviando…" : "Enviar postulación"}
            <span className="arrow">→</span>
          </button>
        </div>

        <p className="legal-note">
          Al enviar aceptas nuestra{" "}
          <a href="/politica-datos">política de tratamiento de datos personales</a>.
          Guardamos tu perfil para futuros proyectos.
        </p>
      </div>
    </form>
  );
}
