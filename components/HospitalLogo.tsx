"use client";

import { useEffect, useState } from "react";

const CANDIDATES = ["/hospital-logo.svg", "/hospital-logo.png"];

export default function HospitalLogo({ width = 96 }: { width?: number }) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      for (const candidate of CANDIDATES) {
        const ok = await new Promise<boolean>((resolve) => {
          const probe = new window.Image();
          probe.onload = () => resolve(true);
          probe.onerror = () => resolve(false);
          probe.src = candidate;
        });
        if (cancelled) return;
        if (ok) {
          setResolvedSrc(candidate);
          return;
        }
      }
      if (!cancelled) setResolvedSrc(null);
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, []);

  if (resolvedSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedSrc}
        alt="شعار مستشفى الرعاية المديدة"
        style={{ width, height: "auto" }}
        className="object-contain"
      />
    );
  }

  return (
    <div
      style={{ width, height: width * 0.4 }}
      className="flex flex-col items-center justify-center gap-0.5 rounded-xl2 border-2 border-dashed border-navy/15 bg-bgsoft text-center text-[10px] font-medium leading-tight text-navy/35"
      title="ضع ملف الشعار في public/hospital-logo.svg أو public/hospital-logo.png"
    >
      <span>شعار</span>
      <span>المستشفى</span>
    </div>
  );
}
