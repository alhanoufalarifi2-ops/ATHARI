"use client";

import { PrinterIcon } from "./icons";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl2 bg-navy px-4 py-2 text-sm font-semibold text-white shadow hover:bg-navy-light print:hidden"
    >
      <PrinterIcon className="h-4 w-4" />
      طباعة / تصدير
    </button>
  );
}
