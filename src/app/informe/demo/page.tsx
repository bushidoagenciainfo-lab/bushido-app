import type { Metadata } from "next";
import ReportView from "@/components/ReportView";
import Footer from "@/components/Footer";
import { DEMO_ANALISIS } from "@/lib/analisis";

export const metadata: Metadata = {
  title: "Informe de análisis · Bushido",
  robots: { index: false },
};

/** `?corto=1` muestra el abrebocas: lo que ve alguien que aún no es cliente. */
export default async function InformeDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ corto?: string }>;
}) {
  const { corto } = await searchParams;
  const a = corto ? { ...DEMO_ANALISIS, modo: "abrebocas" as const } : DEMO_ANALISIS;

  return (
    <>
      <main>
        <ReportView a={a} />
      </main>
      <Footer />
    </>
  );
}
