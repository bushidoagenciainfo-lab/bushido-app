"use client";

// Se re-monta en cada navegación → el letterbox "parpadea" (abre desde negro)
// en la carga inicial y al pasar de una sección a otra.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div className="lb lb-top" aria-hidden="true" />
      <div className="lb lb-bot" aria-hidden="true" />
    </>
  );
}
