import { ComponentType, SVGProps } from "react";

// Dedicated to the Executive Dashboard's top KPI row only (kept separate from
// the shared StatCard so this alignment contract never leaks into /dashboard,
// /org/dashboard, or the Scope Dashboard). Icon, number, and label always sit
// in the same fixed slot in every card — `truncate` keeps the label to one
// line so a longer label can never push the row taller in one card than
// another and throw off the shared row height.
export default function KpiCard({
  label,
  value,
  accent = "sky",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  accent?: "sky" | "navy";
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="flex min-h-[172px] flex-col justify-center rounded-xl2 border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-3 shadow-card transition-shadow hover:shadow-cardHover">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${
          accent === "sky" ? "from-sky/35 to-sky-light/15 text-sky-dark" : "from-sky-dark/30 to-sky/10 text-navy"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="mt-2.5 text-2xl font-extrabold leading-none text-navy">{value}</div>
      <div className="mt-1.5 truncate text-xs text-navy/70">{label}</div>
    </div>
  );
}
