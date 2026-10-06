"use client";

import Header from "@/components/Header";
import ReportFooter from "@/components/ReportFooter";
import ReportHeader from "@/components/ReportHeader";
import OrgTypeBadge from "@/components/OrgTypeBadge";
import MetricLine from "@/components/MetricLine";
import ResultDepartments from "@/components/ResultDepartments";
import { useAthariStore } from "@/lib/store";
import { formatArabicDate, isSameYear, reportYearOptions, uniqueDepartments } from "@/lib/utils";
import { useState } from "react";

export default function OrgAnnualReportPage() {
  const organizationalImpacts = useAthariStore((s) => s.organizationalImpacts);
  const initiatives = useAthariStore((s) => s.initiatives);
  const departments = useAthariStore((s) => s.departments);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());

  const approved = organizationalImpacts.filter((i) => i.status === "approved" && isSameYear(i.eventDate, year));
  const initiativeIds = new Set(approved.map((i) => i.initiativeId));
  // Unique participating/benefiting departments across this period's approved
  // results (wording variants merged).
  const deptLabels = uniqueDepartments(approved.flatMap((i) => i.departments), departments);
  const initiativeName = (id: string) => initiatives.find((i) => i.id === id)?.name ?? "غير معروف";
  const initiativeType = (id: string) => initiatives.find((i) => i.id === id)?.type;

  const years = reportYearOptions(now);

  return (
    <div>
      <Header title="الأثر المؤسسي السنوي" subtitle="Annual Organizational Impact" />

      <div className="p-5 lg:p-8 print:p-0">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex flex-wrap gap-3 print:hidden">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-xl2 border border-navy/10 px-3 py-2 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl2 bg-white p-5 shadow-card print:shadow-none sm:p-8">
            <ReportHeader
              title="تقرير الأثر المؤسسي السنوي"
              period={`عام ${year}`}
              tagline="أثري | ATHARI — توثيق الأثر المؤسسي"
            />

            <section className="mb-8 print:break-inside-avoid">
              <h2 className="mb-3 text-sm font-bold text-navy">ملخص الأثر</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl2 border border-navy/10 p-4 text-center">
                  <div className="text-2xl font-extrabold text-navy">{approved.length}</div>
                  <div className="mt-1 text-xs text-navy/50">الآثار المؤسسية الموثّقة</div>
                </div>
                <div className="rounded-xl2 border border-navy/10 p-4 text-center">
                  <div className="text-2xl font-extrabold text-navy">{deptLabels.length}</div>
                  <div className="mt-1 text-xs text-navy/50">الأقسام المشاركة</div>
                </div>
                <div className="rounded-xl2 border border-navy/10 p-4 text-center">
                  <div className="text-2xl font-extrabold text-navy">{initiativeIds.size}</div>
                  <div className="mt-1 text-xs text-navy/50">المبادرات المشمولة</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-bold text-navy">تفاصيل الآثار المعتمدة</h2>
              <div className="space-y-3">
                {approved.map((impact) => {
                  const type = initiativeType(impact.initiativeId);
                  return (
                    <div key={impact.id} className="rounded-xl2 border border-navy/5 p-4 print:break-inside-avoid">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold text-navy">{initiativeName(impact.initiativeId)}</p>
                        <span className="text-xs text-navy/40">{formatArabicDate(impact.eventDate)}</span>
                      </div>
                      <p className="mb-2 text-sm text-navy/70">
                        {impact.previousState} ← <strong>{impact.resultingChange}</strong>
                      </p>
                      <MetricLine
                        metricName={impact.metricName}
                        beforeValue={impact.beforeValue}
                        afterValue={impact.afterValue}
                      />
                      {type && <OrgTypeBadge type={type} />}
                      <ResultDepartments departments={impact.departments} registry={departments} />
                    </div>
                  );
                })}
                {approved.length === 0 && (
                  <p className="py-6 text-center text-sm text-navy/40">لا توجد نتائج معتمدة خلال هذا العام.</p>
                )}
              </div>
            </section>

            <ReportFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
