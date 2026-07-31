"use client";

import { useEffect, useState } from "react";

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showLetterbox, setShowLetterbox] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLetterbox(false);
    }, 800); // mismo tiempo que la animación CSS

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {children}

      {showLetterbox && (
        <>
          <div className="lb lb-top" aria-hidden="true" />
          <div className="lb lb-bot" aria-hidden="true" />
        </>
      )}
    </>
  );
}