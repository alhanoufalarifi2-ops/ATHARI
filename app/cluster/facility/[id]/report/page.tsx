"use client";

import DemoDataNote from "@/components/DemoDataNote";
import ClusterLogo from "@/components/ClusterLogo";
import Header from "@/components/Header";
import PrintButton from "@/components/PrintButton";
import ReportFooter from "@/components/ReportFooter";
import { LeafMark } from "@/components/icons";
import { facilities, getScopeById } from "@/lib/clusterData";
import { getFacilityRecords } from "@/lib/clusterStats";
import { useAthariStore } from "@/lib/store";
import { Impact, OrganizationalImpact } from "@/lib/types";
import { useImpactRecords } from "@/lib/useImpactRecords";
import { departmentKey, formatArabicDate, resolveDepartmentName } from "@/lib/utils";
import { useParams } from "next/navigation";

// Same template/print format as the Scope Report (app/cluster/scope/[id]/report,
// kept exactly as-is — this page and every other report follow ITS visual
// language, not the other way around), scoped to one facility. EVERY figure
// here — the three headline KPIs, the department count/breakdown and the
// sample results — is computed from actual approved Impact/
// OrganizationalImpact records that carry this exact facility's name (Arabic
// or English) in their own `facility` field. No prototype/fixed figures:
// with no facility-tagged approved records everything reads zero / empty.
// "Department" here is the department that SUBMITTED a clinical impact
// (submittingDepartment) or the department RESPONSIBLE for the organizational
// initiative (Initiative.department) — each result counts once, under one
// department, so the breakdown adds up to the total.
export default function FacilityReportPage() {
  const params = useParams<{ id: string }>();
  const facility = facilities.find((f) => f.id === params.id);
  const scope = facility ? getScopeById(facility.scopeId) : undefined;

  const records = useImpactRecords();
  const initiatives = useAthariStore((s) => s.initiatives);
  const departments = useAthariStore((s) => s.departments);

  // The same approved records behind this facility's card and dashboard
  // (lib/clusterStats.ts) — one attribution rule for every page.
  const { clinical: clinicalHere, organizational: orgHere }: { clinical: Impact[]; organizational: OrganizationalImpact[] } =
    facility ? getFacilityRecords(facility, records) : { clinical: [], organizational: [] };

  if (!facility || !scope) {
    return (
      <div>
        <Header title="تقرير المنشأة" />
        <div className="p-6 text-navy/50">لم يتم العثور على هذه المنشأة.</div>
      </div>
    );
  }

  const clinicalCount = clinicalHere.length;
  const orgCount = orgHere.length;
  const total = clinicalCount + orgCount;
  const generatedAt = formatArabicDate(new Date().toISOString());

  type DeptRow = { name: string; clinical: number; organizational: number };
  const deptMap = new Map<string, DeptRow>();
  const bump = (value: string | undefined, key: "clinical" | "organizational") => {
    const label = value ? resolveDepartmentName(value, departments) : "";
    const dKey = departmentKey(label);
    if (!label || !dKey) return;
    const row = deptMap.get(dKey) ?? { name: label, clinical: 0, organizational: 0 };
    row[key] += 1;
    deptMap.set(dKey, row);
  };
  clinicalHere.forEach((i) => bump(i.submittingDepartment, "clinical"));
  orgHere.forEach((i) => {
    const initiative = initiatives.find((init) => init.id === i.initiativeId);
    bump(initiative?.department, "organizational");
  });
  const deptRows = Array.from(deptMap.values()).sort(
    (a, b) => b.clinical + b.organizational - (a.clinical + a.organizational)
  );

  const highlights = [
    ...clinicalHere.map((i) => ({
      id: i.id,
      date: i.eventDate,
      typeLabel: "سريري",
      department: (i.submittingDepartment && resolveDepartmentName(i.submittingDepartment, departments)) || "—",
      summary: `${i.previousStatus} ← ${i.currentOutcome}`,
    })),
    ...orgHere.map((i) => {
      const initiative = initiatives.find((init) => init.id === i.initiativeId);
      return {
        id: i.id,
        date: i.eventDate,
        typeLabel: "مؤسسي",
        department: (initiative && resolveDepartmentName(initiative.department, departments)) || "—",
        summary: `${i.previousState} ← ${i.resultingChange}`,
      };
    }),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      <Header title={`تقرير أثر المنشأة — ${facility.name}`} subtitle="نسخة رسمية قابلة للطباعة" />

      <div className="p-5 print:p-0 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl2 bg-white p-5 shadow-card print:shadow-none sm:p-8">
            <div className="mb-6 flex flex-col gap-4 border-b-2 border-navy pb-5 print:break-inside-avoid sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl2 bg-navy text-white">
                  <LeafMark className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-sky-dark">أثري | ATHARI</p>
                  <h1 className="text-xl font-extrabold text-navy">تقرير أثر المنشأة</h1>
                  <p className="text-sm font-semibold text-navy/70">
                    {facility.name} <span className="font-normal text-navy/40">— {scope.name}</span>
                  </p>
                  <p className="text-xs text-navy/40">تاريخ الإصدار: {generatedAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ClusterLogo width={100} />
                <PrintButton />
              </div>
            </div>

            <div className="mb-6">
              <DemoDataNote />
            </div>

            <section className="mb-8 print:break-inside-avoid">
              <h2 className="mb-3 text-sm font-bold text-navy">ملخص تنفيذي</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl2 border border-navy/10 p-4 text-center">
                  <div className="text-2xl font-extrabold text-navy">{total}</div>
                  <div className="mt-1 text-xs text-navy/50">إجمالي الآثار المعتمدة</div>
                </div>
                <div className="rounded-xl2 border border-navy/10 p-4 text-center">
                  <div className="text-2xl font-extrabold text-navy">{clinicalCount}</div>
                  <div className="mt-1 text-xs text-navy/50">الأثر السريري</div>
                </div>
                <div className="rounded-xl2 border border-navy/10 p-4 text-center">
                  <div className="text-2xl font-extrabold text-navy">{orgCount}</div>
                  <div className="mt-1 text-xs text-navy/50">الأثر المؤسسي</div>
                </div>
                <div className="rounded-xl2 border border-navy/10 p-4 text-center">
                  <div className="text-2xl font-extrabold text-navy">{deptRows.length}</div>
                  <div className="mt-1 text-xs text-navy/50">عدد الأقسام المقدِّمة أو المسؤولة</div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-3 text-sm font-bold text-navy">توزيع الأثر حسب القسم المقدِّم أو المسؤول داخل المنشأة</h2>
              {deptRows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-right text-sm">
                    <thead>
                      <tr className="border-b border-navy/10 text-[11px] text-navy/50">
                        <th className="py-2 pe-2 font-semibold">القسم المقدِّم / المسؤول</th>
                        <th className="py-2 pe-2 font-semibold">إجمالي الآثار المعتمدة</th>
                        <th className="py-2 pe-2 font-semibold">الأثر السريري</th>
                        <th className="py-2 font-semibold">الأثر المؤسسي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy/5">
                      {deptRows.map((row) => (
                        <tr key={row.name} className="print:break-inside-avoid">
                          <td className="py-2 pe-2 font-semibold text-navy">{row.name}</td>
                          <td className="py-2 pe-2 font-semibold text-navy">{row.clinical + row.organizational}</td>
                          <td className="py-2 pe-2 text-navy/70">{row.clinical}</td>
                          <td className="py-2 text-navy/70">{row.organizational}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl2 border border-dashed border-navy/15 p-4 text-center text-xs leading-5 text-navy/40">
                  لا تتوفر حاليًا آثار موثّقة تحمل بيانات هذه المنشأة لعرض توزيعها حسب القسم — ستظهر تلقائيًا فور
                  توثيق آثار جديدة عبر معالج الإرسال لهذه المنشأة.
                </div>
              )}
            </section>

            <section className="print:break-inside-avoid">
              <h2 className="mb-3 text-sm font-bold text-navy">نماذج من الآثار المعتمدة في المنشأة</h2>
              {highlights.length > 0 ? (
                <div className="space-y-3">
                  {highlights.slice(0, 8).map((h) => (
                    <div key={h.id} className="rounded-xl2 border border-navy/5 p-4 print:break-inside-avoid">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-navy/60">{h.department}</span>
                        <span className="text-xs text-navy/40">{formatArabicDate(h.date)}</span>
                      </div>
                      <p className="text-sm text-navy/70">{h.summary}</p>
                      <span className="mt-2 inline-block rounded-full border border-navy/10 bg-bgsoft px-2.5 py-0.5 text-[11px] font-medium text-navy/60">
                        {h.typeLabel}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl2 border border-dashed border-navy/15 p-4 text-center text-xs leading-5 text-navy/40">
                    لا تتوفر حاليًا آثار سريرية مرتبطة بمستوى هذه المنشأة لعرضها هنا — ستظهر تلقائيًا بعد ربط الآثار
                    بمستوى المنشأة.
                  </div>
                  <div className="rounded-xl2 border border-dashed border-navy/15 p-4 text-center text-xs leading-5 text-navy/40">
                    لا تتوفر حاليًا آثار مؤسسية مرتبطة بمستوى هذه المنشأة لعرضها هنا — ستظهر تلقائيًا بعد ربط الآثار
                    بمستوى المنشأة.
                  </div>
                </div>
              )}
            </section>

            <ReportFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
