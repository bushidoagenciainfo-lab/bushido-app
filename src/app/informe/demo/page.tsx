import type { Metadata } from "next";
import ReportView from "@/components/ReportView";
import Footer from "@/components/Footer";
import { DEMO_ANALISIS } from "@/lib/analisis";

export const metadata: Metadata = {
  title: "Informe de análisis · Bushido",
  robots: { index: false },
};

export default function InformeDemoPage() {
  return (
    <>
      <main>
        <ReportView a={DEMO_ANALISIS} />
      </main>
      <Footer />
    </>
  );
}
