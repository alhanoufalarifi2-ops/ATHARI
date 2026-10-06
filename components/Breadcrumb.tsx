import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-navy/40">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-navy/25">/</span>}
          {item.href ? (
            <Link href={item.href} className="font-semibold text-sky-dark hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-navy">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
