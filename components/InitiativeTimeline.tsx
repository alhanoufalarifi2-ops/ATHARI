import { OrganizationalImpact, Department } from "@/lib/types";
import { formatArabicDate, uniqueDepartments } from "@/lib/utils";

export default function InitiativeTimeline({
  impacts,
  departments,
}: {
  impacts: OrganizationalImpact[];
  departments: Department[];
}) {
  const sorted = [...impacts].sort(
    (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-navy/15 bg-white p-10 text-center text-navy/40">
        لا توجد آثار مؤسسية معتمدة بعد لهذه المبادرة.
      </div>
    );
  }

  return (
    <ol className="relative border-e-2 border-sky/50 pe-8">
      {sorted.map((impact) => (
        <li key={impact.id} className="mb-10 ms-0 last:mb-0">
          <span
            className="absolute -end-[17px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-navy text-white shadow"
            style={{ backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0) 65%)" }}
          />
          <div className="rounded-2xl border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-6 shadow-card">
            <span className="mb-2 block text-xs font-semibold text-navy/50">
              {formatArabicDate(impact.eventDate)}
            </span>

            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-lg bg-bgsoft px-3 py-1 text-navy/60 line-through decoration-navy/30">
                {impact.previousState}
              </span>
              <span className="text-sky-dark">←</span>
              <span className="rounded-lg bg-sky/15 px-3 py-1 font-semibold text-navy">
                {impact.resultingChange}
              </span>
            </div>

            <p className="mb-3 text-sm text-navy/50">
              <span className="font-semibold text-navy/70">ما الذي تم تنفيذه؟ </span>
              {impact.whatWasDone}
            </p>

            {impact.metricName && (
              <p className="mb-3 text-sm text-navy/60">
                <span className="font-semibold text-navy/70">{impact.metricName}: </span>
                {impact.beforeValue && <span className="line-through decoration-navy/30">{impact.beforeValue}</span>}
                {impact.beforeValue && impact.afterValue && <span className="text-sky-dark"> ← </span>}
                {impact.afterValue && <span className="font-semibold text-navy">{impact.afterValue}</span>}
              </p>
            )}

            {impact.description && <p className="mb-3 text-sm text-navy/70">{impact.description}</p>}

            <div className="flex flex-wrap items-center gap-2 text-xs text-navy/40">
              <span>الأقسام المستفيدة:</span>
              {uniqueDepartments(impact.departments, departments).map((d) => (
                <span key={d} className="rounded-full bg-navy/5 px-2 py-0.5">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
