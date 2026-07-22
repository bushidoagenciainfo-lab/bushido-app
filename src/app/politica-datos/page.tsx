import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de tratamiento de datos · Bushido",
};

export default function PoliticaDatosPage() {
  return (
    <>
      <main>
        <div className="view-header">
          <div className="view-header-inner">
            <div>
              <div className="view-header-eyebrow">Legal</div>
              <h1>
                Tratamiento de <em>datos</em>.
              </h1>
            </div>
            <p>
              Cómo recolectamos, usamos y protegemos tus datos personales,
              conforme a la Ley 1581 de 2012 (Colombia).
            </p>
          </div>
        </div>

        <article className="legal-body">
          <p className="legal-updated">Última actualización: 2025</p>

          <h2>1. Responsable</h2>
          <p>
            <strong>Bushido — Agencia Audiovisual</strong> (en adelante
            &laquo;Bushido&raquo;), con sede en Bogotá, Colombia, es responsable
            del tratamiento de tus datos personales. Contacto:{" "}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
          </p>

          <h2>2. Datos que recolectamos</h2>
          <p>
            Recolectamos únicamente los datos que nos entregas voluntariamente a
            través de nuestros formularios:
          </p>
          <ul>
            <li>Nombre, empresa o marca.</li>
            <li>Correo electrónico y número de WhatsApp/teléfono.</li>
            <li>Redes sociales y sitio web (para el análisis solicitado).</li>
            <li>
              En el banco de talentos: rol, hoja de vida (CV) y enlaces a tu
              trabajo (portafolio, Behance, reel, web).
            </li>
          </ul>

          <h2>3. Finalidad</h2>
          <p>Usamos tus datos para:</p>
          <ul>
            <li>Responder tu solicitud y prepararte una propuesta o análisis.</li>
            <li>Contactarte por correo o WhatsApp sobre tu proyecto.</li>
            <li>
              Considerar tu perfil para futuros proyectos (en el caso del banco de
              talentos).
            </li>
          </ul>
          <p>
            <strong>No</strong> vendemos, alquilamos ni compartimos tus datos con
            terceros con fines comerciales.
          </p>

          <h2>4. Tus derechos (Habeas Data)</h2>
          <p>
            Como titular de los datos tienes derecho a conocer, actualizar,
            rectificar y suprimir tu información, así como a revocar la
            autorización otorgada. Para ejercer cualquiera de estos derechos,
            escríbenos a <a href={`mailto:${EMAIL}`}>{EMAIL}</a> y atenderemos tu
            solicitud conforme a la ley.
          </p>

          <h2>5. Conservación y seguridad</h2>
          <p>
            Conservamos tus datos mientras sean necesarios para las finalidades
            descritas o hasta que solicites su eliminación. Aplicamos medidas
            razonables de seguridad para protegerlos.
          </p>

          <h2>6. Autorización</h2>
          <p>
            Al enviar cualquiera de nuestros formularios, autorizas de manera
            libre, previa e informada el tratamiento de tus datos personales según
            esta política.
          </p>

          <p className="legal-updated" style={{ marginTop: 40 }}>
            Nota: este documento es una base y debería ser revisado por un asesor
            legal antes de la publicación definitiva del sitio.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
