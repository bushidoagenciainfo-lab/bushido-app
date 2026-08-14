import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import ReportView from "@/components/ReportView";
import Footer from "@/components/Footer";
import { getAnalisis } from "@/lib/analisis-store";

export const metadata: Metadata = {
  title: "Informe de análisis · Bushido",
  robots: { index: false }, // informes privados, no indexables
};

// Se renderiza bajo demanda (lee de la BD por id).
export const dynamic = "force-dynamic";

export default async function InformePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const analisis = await getAnalisis(id);
  if (!analisis) notFound();

  // El informe se GUARDA completo siempre; el abrebocas es solo lo que ve el
  // prospecto. Con la sesión del panel abierta ves la versión entera en la
  // misma URL — que es la que necesitas en la llamada de venta.
  const token = process.env.ADMIN_SESSION_TOKEN;
  const soyBushido =
    Boolean(token) && (await cookies()).get("bushido_admin")?.value === token;

  return (
    <>
      <main>
        <ReportView a={soyBushido ? { ...analisis, modo: "completo" } : analisis} />
        {soyBushido && (
          <div className="informe-nota">
            {analisis.conDatosReales === false && (
              <p className="informe-alerta">
                ⚠️ Este informe se escribió <strong>sin poder leer su cuenta</strong>{" "}
                (Instagram no devolvió datos — suele ser una cuenta personal, no
                profesional). No cita métricas ni publicaciones reales. Revísalo
                antes de mandarlo.
              </p>
            )}
            {analisis.modo === "abrebocas" && (
              <p>
                Estás viendo el informe completo porque tienes la sesión del panel
                abierta. El cliente ve la versión corta en este mismo enlace.
              </p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
