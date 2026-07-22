import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

  return (
    <>
      <main>
        <ReportView a={analisis} />
      </main>
      <Footer />
    </>
  );
}
