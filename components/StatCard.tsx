import { ComponentType, SVGProps } from "react";
import Link from "next/link";

export default function StatCard({
  label,
  value,
  hint,
  accent = "sky",
  icon: Icon,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "sky" | "navy";
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  href?: string;
}) {
  return (
    <div className="flex flex-col rounded-xl2 border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-2 shadow-card transition-shadow hover:shadow-cardHover">
      <div
        className={`mb-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${
          accent === "sky" ? "from-sky/35 to-sky-light/15 text-sky-dark" : "from-sky-dark/30 to-sky/10 text-navy"
        }`}
      >
        {Icon ? <Icon className="h-3.5 w-3.5" /> : <span className="text-sm font-bold">●</span>}
      </div>
      <div className="text-xl font-extrabold leading-tight text-navy">{value}</div>
      <div className="mt-0.5 text-xs text-navy/60">{label}</div>
      {hint && <div className="mt-0.5 text-[10px] text-navy/35">{hint}</div>}
      {href && (
        <Link
          href={href}
          className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-dark hover:underline"
        >
          عرض التفاصيل ←
        </Link>
      )}
    </div>
  );
}
