import { Department, Impact, Patient } from "@/lib/types";
import { formatArabicDate } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryVisuals";
import CategoryBadge from "./CategoryBadge";

export default function Timeline({
  impacts,
  departments,
  patients,
}: {
  impacts: Impact[];
  departments: Department[];
  // Only used as a legacy fallback for impacts predating the per-impact
  // submittingDepartment field (see below) — optional so existing call
  // sites that never need the fallback aren't forced to pass it.
  patients?: Patient[];
}) {
  const sorted = [...impacts].sort(
    (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  );

  const deptName = (id: string) => departments.find((d) => d.id === id)?.name ?? id;

  // The department/administration that submitted THIS specific impact — an
  // independent, per-impact fact, never the same as Participating
  // Departments below (see lib/types.ts). Legacy records created before
  // this field existed fall back to the patient's stored department.
  const submittingDepartmentFor = (impact: Impact) => {
    if (impact.submittingDepartment) return impact.submittingDepartment;
    const patient = patients?.find((p) => p.id === impact.patientId);
    return patient ? deptName(patient.department) : "";
  };

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-navy/15 bg-white p-10 text-center text-navy/40">
        لا توجد آثار معتمدة بعد لهذا المريض.
      </div>
    );
  }

  return (
    <ol className="relative border-e-2 border-sky/50 pe-8">
      {sorted.map((impact) => {
        const Icon = CATEGORY_ICONS[impact.category];
        const submittingDepartment = submittingDepartmentFor(impact);
        return (
        <li key={impact.id} className="mb-10 ms-0 last:mb-0">
          <span
            className="absolute -end-[17px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-white shadow"
            style={{
              backgroundColor: CATEGORY_COLORS[impact.category],
              backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0) 65%)",
            }}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="rounded-2xl border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-6 shadow-card">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-navy/50">
                {formatArabicDate(impact.eventDate)}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <CategoryBadge category={impact.category} />
                {impact.impactNumber && (
                  <span
                    className="inline-flex items-center rounded-full bg-navy/10 px-2.5 py-0.5 text-[11px] font-bold text-navy"
                    dir="ltr"
                  >
                    {impact.impactNumber}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-lg bg-bgsoft px-3 py-1 text-navy/60 line-through decoration-navy/30">
                {impact.previousStatus}
              </span>
              <span className="text-sky-dark">←</span>
              <span className="rounded-lg bg-sky/15 px-3 py-1 font-semibold text-navy">
                {impact.currentOutcome}
              </span>
            </div>

            <p className="mb-3 text-sm text-navy/50">
              <span className="font-semibold text-navy/70">ما الذي تغيّر؟ </span>
              {impact.whatChanged}
            </p>

            <p className="mb-3 text-sm text-navy/70">{impact.description}</p>

            {submittingDepartment && (
              <p className="mb-1.5 text-xs text-navy/40">
                <span className="font-semibold text-navy/60">القسم / الإدارة المقدّمة للأثر: </span>
                {submittingDepartment}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs text-navy/40">
              <span>الأقسام المشاركة:</span>
              {impact.departments.length > 0 ? (
                impact.departments.map((d) => (
                  <span key={d} className="rounded-full bg-navy/5 px-2 py-0.5">
                    {deptName(d)}
                  </span>
                ))
              ) : (
                <span>—</span>
              )}
            </div>
          </div>
        </li>
        );
      })}
    </ol>
  );
}
