import { DepartmentRef, uniqueDepartments } from "@/lib/utils";

// Compact "which departments took part" line shown under a result in the
// reports. Deliberately departments only — contributor names stay in the
// impact record details and on the certificates, never in report bodies.
export default function ResultDepartments({
  departments,
  registry,
}: {
  departments: string[];
  registry: DepartmentRef[];
}) {
  const list = uniqueDepartments(departments, registry);
  if (list.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-navy/60">
      <span className="font-semibold text-navy/70">الأقسام المشاركة</span>
      {list.map((d) => (
        <span key={d} className="rounded-full bg-navy/5 px-2 py-0.5">
          {d}
        </span>
      ))}
    </div>
  );
}
