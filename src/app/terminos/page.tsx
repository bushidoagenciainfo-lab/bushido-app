import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos de servicio · Bushido",
};

export default function TerminosPage() {
  return (
    <>
      <main>
        <div className="view-header">
          <div className="view-header-inner">
            <div>
              <div className="view-header-eyebrow">Legal</div>
              <h1>
                Términos de <em>servicio</em>.
              </h1>
            </div>
            <p>
              Las condiciones bajo las que Bushido presta sus servicios y bajo
              las que un cliente los contrata.
            </p>
          </div>
        </div>

        <article className="legal-body">
          <p className="legal-updated">Última actualización: 13 de agosto de 2026</p>

          <h2>1. Quién presta el servicio</h2>
          <p>
            <strong>Bushido — Agencia Audiovisual</strong> (en adelante
            &laquo;Bushido&raquo;), con sede en Bogotá, Colombia, es quien presta
            los servicios descritos en este documento. Cualquier consulta sobre
            estos términos puede dirigirse a{" "}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
          </p>
          <p>
            Al contratar un servicio, solicitar una propuesta o entregarnos
            acceso a tus cuentas, aceptas estos términos.
          </p>

          <h2>2. Qué ofrecemos</h2>
          <ul>
            <li>
              <strong>Producción audiovisual:</strong> dirección, guion, rodaje,
              fotografía, edición y postproducción de piezas para marca.
            </li>
            <li>
              <strong>Estrategia de contenido:</strong> diagnóstico, definición
              de línea narrativa, formatos y calendario editorial.
            </li>
            <li>
              <strong>Gestión de contenido para redes sociales:</strong>{" "}
              producción continua, medición de rendimiento y ajuste de la
              estrategia con base en esos resultados.
            </li>
          </ul>
          <p>
            El alcance exacto de cada trabajo es el que quede escrito en la
            propuesta aceptada. Lo que no esté en ella no está incluido.
          </p>

          <h2>3. Cómo se acuerda un trabajo</h2>
          <p>
            Todo proyecto empieza con una propuesta escrita que detalla el
            alcance, los entregables, el plazo y el valor. Un trabajo se
            considera acordado cuando el cliente la aprueba por escrito —correo
            o WhatsApp son medios válidos— y se realiza el anticipo pactado.
          </p>
          <p>
            La programación de rodaje se confirma únicamente con el anticipo
            recibido. Los cambios de alcance solicitados después de la
            aprobación se cotizan aparte y pueden mover la fecha de entrega.
          </p>

          <h2>4. Plazos y entrega</h2>
          <p>
            Cada propuesta indica el plazo de entrega, contado en días hábiles
            desde el rodaje o desde la recepción del material, según
            corresponda. El plazo se suspende mientras esperemos insumos del
            cliente —accesos, material, aprobaciones o información— y se reanuda
            cuando los recibimos.
          </p>
          <p>
            Los entregables se envían en formato digital por el medio que se
            acuerde. Las piezas se entienden aceptadas si no recibimos
            observaciones dentro de los diez (10) días hábiles siguientes a su
            entrega.
          </p>

          <h2>5. Revisiones</h2>
          <p>
            Cada entregable incluye <strong>dos rondas de revisión</strong> sin
            costo, salvo que la propuesta indique otra cosa. Una ronda es un
            único conjunto consolidado de observaciones sobre la pieza entregada.
          </p>
          <p>
            Las revisiones cubren ajustes sobre lo acordado: ritmo, cortes,
            color, textos, música y correcciones. No cubren cambios de concepto,
            de guion aprobado o de dirección creativa después del rodaje: eso es
            un trabajo nuevo y se cotiza como tal. Las rondas adicionales se
            facturan según la tarifa vigente.
          </p>

          <h2>6. Propiedad del material y derechos de uso</h2>
          <p>
            Los derechos patrimoniales sobre las piezas finales entregadas se
            transfieren al cliente una vez pagado el valor total del proyecto.
            Hasta ese momento, Bushido conserva la titularidad y el material no
            está autorizado para publicación.
          </p>
          <ul>
            <li>
              <strong>El cliente</strong> puede usar las piezas finales para los
              fines pactados, sin límite de tiempo, y editarlas o adaptarlas bajo
              su responsabilidad.
            </li>
            <li>
              <strong>Bushido</strong> conserva el material bruto (crudos,
              proyectos de edición y archivos de trabajo), que no forma parte de
              la entrega salvo pacto expreso, y se reserva el derecho de mostrar
              las piezas finales en su portafolio, redes y material comercial.
              Si un proyecto es confidencial, basta decirlo por escrito y no lo
              publicamos.
            </li>
          </ul>
          <p>
            El cliente garantiza que tiene los derechos sobre las marcas,
            logotipos, productos y contenidos que nos entrega para producir, y
            responde por su uso.
          </p>
          <p>
            Cuando un proyecto involucre creadores, talento o música de terceros,
            el alcance de esa licencia —territorio, medios y duración— se define
            en la propuesta y puede ser distinto al de las piezas producidas por
            Bushido.
          </p>

          <h2>7. Cuentas de redes sociales conectadas</h2>
          <p>
            Algunos servicios requieren que el cliente conecte sus cuentas de
            redes sociales a nuestro sistema de gestión. Sobre ese acceso:
          </p>
          <ul>
            <li>
              Lo usamos <strong>únicamente para medir el rendimiento del
              contenido que producimos</strong>: alcance, interacción y
              comportamiento de las piezas, para poder ajustar la estrategia con
              datos y no con suposiciones.
            </li>
            <li>
              <strong>No publicamos en nombre del cliente</strong> ni modificamos
              sus publicaciones, perfil o configuración.
            </li>
            <li>
              No usamos esa información para otra finalidad, y no la vendemos ni
              la compartimos con terceros con fines comerciales.
            </li>
            <li>
              <strong>El cliente puede retirar el acceso cuando quiera</strong>,
              desde la configuración de la plataforma correspondiente o
              pidiéndonoslo a <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Retirarlo
              no afecta los trabajos ya entregados; sí puede impedir que sigamos
              midiendo resultados.
            </li>
          </ul>
          <p>
            El detalle sobre qué datos tratamos, con qué finalidad y cómo
            ejercer tus derechos está en nuestra{" "}
            <a href="/politica-datos">política de tratamiento de datos</a>.
          </p>

          <h2>8. Pagos</h2>
          <p>
            Salvo que la propuesta indique otra cosa, los proyectos se pagan con
            un anticipo del 50% para programar el trabajo y el 50% restante
            contra entrega. Los servicios de gestión continua se facturan de
            forma mensual y anticipada.
          </p>
          <p>
            La mora en los pagos suspende la entrega de piezas pendientes y la
            transferencia de derechos hasta que se regularice.
          </p>

          <h2>9. Cancelación</h2>
          <p>
            El cliente puede cancelar un proyecto en cualquier momento
            avisándonos por escrito. El anticipo cubre el trabajo ya realizado y
            los costos comprometidos, por lo que no es reembolsable una vez
            iniciada la preproducción. Los servicios de gestión continua pueden
            terminarse con treinta (30) días de aviso, y el mes en curso se
            factura completo.
          </p>

          <h2>10. Responsabilidad</h2>
          <p>
            Bushido responde por la ejecución de los servicios contratados con
            los estándares profesionales del oficio. No garantizamos resultados
            comerciales, de alcance o de crecimiento en redes sociales, porque
            dependen de factores fuera de nuestro control, incluidos los
            algoritmos de cada plataforma.
          </p>
          <p>
            Nuestra responsabilidad frente a cualquier reclamación se limita al
            valor efectivamente pagado por el proyecto en cuestión.
          </p>

          <h2>11. Cambios a estos términos</h2>
          <p>
            Podemos actualizar estos términos. La versión vigente es siempre la
            publicada en esta página, con su fecha de actualización. Los cambios
            no afectan proyectos ya acordados, que se rigen por los términos
            vigentes al momento de su aprobación.
          </p>

          <h2>12. Ley aplicable</h2>
          <p>
            Estos términos se rigen por la legislación de la República de
            Colombia. Cualquier controversia se intentará resolver de buena fe
            entre las partes antes de acudir a los jueces competentes de Bogotá.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
