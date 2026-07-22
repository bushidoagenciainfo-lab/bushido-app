"use client";

import { openAnalisis } from "@/lib/ui";

export default function AnalisisButton({
  className = "btn btn-primary",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className={className} onClick={openAnalisis}>
      {children}
    </button>
  );
}
