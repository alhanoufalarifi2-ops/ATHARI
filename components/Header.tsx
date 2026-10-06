import { ReactNode } from "react";

export default function Header({
  title,
  subtitle,
  actions,
  subtitleClassName = "text-navy/50",
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  subtitleClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-navy/5 bg-white px-5 py-1 sm:flex-row sm:items-center sm:justify-between print:hidden">
      <div>
        <h1 className="text-lg font-extrabold leading-tight text-navy">{title}</h1>
        {subtitle && <p className={`text-[11px] leading-tight ${subtitleClassName}`}>{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
