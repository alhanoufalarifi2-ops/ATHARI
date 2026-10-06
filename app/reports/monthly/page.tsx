"use client";

import Header from "@/components/Header";
import ReportFooter from "@/components/ReportFooter";
import ReportHeader from "@/components/ReportHeader";
import CategoryBadge from "@/components/CategoryBadge";
import ResultDepartments from "@/components/ResultDepartments";
import { useAthariStore } from "@/lib/store";
import { ARABIC_MONTHS, formatArabicDate, isFutureMonth, isSameMonth, reportYearOptions, uniqueDepartments } from "@/lib/utils";
import { useState } from "react";

export default function MonthlyReportPage() {
  const impacts = useAthariStore((s) => s.impacts);
  const patients = useAthariStore((s) => s.patients);
  const departments = useAthariStore((s) => s.departments);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const approved = impacts.filter(
    (i) => i.status === "approved" && isSameMonth(i.eventDate, year, month)
  );
  const patientIds = new Set(approved.map((i) => i.patientId));
  // Unique participating departments across this period's approved results
  // (legacy IDs resolved, wording variants merged).
  const deptLabels = uniqueDepartments(approved.flatMap((i) => i.departments), departments);
  // MRN only — the patient's name is never displayed (see Patient.name).
  const patientMrn = (id: string) => patients.find((p) => p.id === id)?.mrn ?? "غير معروف";

  const years = reportYearOptions(now);
  // Switching to the current year while a later month was selected on an
  // earlier year (e.g. December 2025 -> 2026) snaps to the latest allowed month.
  const changeYear = (nextYear: number) => {
    setYear(nextYear);
    if (isFutureMonth(nextYear, month, now)) setMonth(now.getMonth());
  };

  return (
    <div>
      <Header title="الأثر السريري الشهري" subtitle="Monthly Clinical Impact" />

      <div className="p-5 lg:p-8 print:p-0">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex flex-wrap gap-3 print:hidden">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-xl2 border border-navy/10 px-3 py-2 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
            >
              {ARABIC_MONTHS.map((m, idx) => (
                <option key={m} value={idx} disabled={isFutureMonth(year, idx, now)}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => changeYear(Number(e.target.value))}
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
              title="تقرير الأثر السريري الشهري"
              period={`${ARABIC_MONTHS[month]} ${year}`}
            />

            <section className="mb-8 print:break-inside-avoid">
              <h2 className="mb-3 text-sm font-bold text-navy">ملخص الأثر</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl2 border border-navy/10 p-4 text-center">
                  <div className="text-2xl font-extrabold text-navy">{approved.length}</div>
                  <div className="mt-1 text-xs text-navy/50">النتائج السريرية الموثّقة</div>
                </div>
                <div className="rounded-xl2 border border-navy/10 p-4 text-center">
                  <div className="text-2xl font-extrabold text-navy">{deptLabels.length}</div>
                  <div className="mt-1 text-xs text-navy/50">الأقسام المشاركة</div>
                </div>
                <div className="rounded-xl2 border border-navy/10 p-4 text-center">
                  <div className="text-2xl font-extrabold text-navy">{patientIds.size}</div>
                  <div className="mt-1 text-xs text-navy/50">المرضى المشمولون</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-bold text-navy">تفاصيل النتائج المعتمدة</h2>
              <div className="space-y-3">
                {approved.map((impact) => (
                  <div key={impact.id} className="rounded-xl2 border border-navy/5 p-4 print:break-inside-avoid">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-navy">رقم الملف الطبي: {patientMrn(impact.patientId)}</p>
                      <span className="text-xs text-navy/40">{formatArabicDate(impact.eventDate)}</span>
                    </div>
                    <p className="mb-2 text-sm text-navy/70">
                      {impact.previousStatus} ← <strong>{impact.currentOutcome}</strong>
                    </p>
                    <CategoryBadge category={impact.category} />
                    <ResultDepartments departments={impact.departments} registry={departments} />
                  </div>
                ))}
                {approved.length === 0 && (
                  <p className="py-6 text-center text-sm text-navy/40">لا توجد نتائج معتمدة خلال هذا الشهر.</p>
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
