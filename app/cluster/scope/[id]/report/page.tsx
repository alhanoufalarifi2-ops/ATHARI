"use client";

import ClusterLogo from "@/components/ClusterLogo";
import FacilityTypeBadge from "@/components/FacilityTypeBadge";
import Header from "@/components/Header";
import PrintButton from "@/components/PrintButton";
import { LeafMark } from "@/components/icons";
import { getFacilitiesByScope, getScopeById } from "@/lib/clusterData";
import { getFacilityStats, getScopePhcStats, getScopeResults, getScopeStats } from "@/lib/clusterStats";
import { useImpactRecords } from "@/lib/useImpactRecords";
import { formatArabicDate } from "@/lib/utils";
import { useParams } from "next/navigation";

// Dynamic by scopeId — one report template serves every scope, reading the
// same lib/clusterData.ts functions the Scope Dashboard uses. No per-scope
// report files, no duplicated mock data.
export default function ScopeReportPage() {
  const params = useParams<{ id: string }>();
  const scope = getScopeById(params.id);
  const records = useImpactRecords();

  if (!scope) {
    return (
      <div>
        <Header title="تقرير النطاق" />
        <div className="p-6 text-navy/50">لم يتم العثور على هذا النطاق.</div>
      </div>
    );
  }

  const stats = getScopeStats(scope.id, records);
  const total = stats.clinical + stats.organizational;
  const facilities = getFacilitiesByScope(scope.id).filter((f) => f.type !== "phc");
  const phcStats = getScopePhcStats(scope.id, records);
  const phcTotal = phcStats.clinical + phcStats.organizational;
  const results = getScopeResults(scope.id, records);
  const generatedAt = formatArabicDate(new Date().toISOString());

  return (
    <div>
      <Header title={`تقرير النطاق — ${scope.name}`} subtitle="نسخة رسمية قابلة للطباعة" />

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
                  <h1 className="text-xl font-extrabold text-navy">تقرير أثر النطاق</h1>
                  <p className="text-sm font-semibold text-navy/70">{scope.name}</p>
                  <p className="text-xs text-navy/40">تاريخ الإصدار: {generatedAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ClusterLogo width={100} />
                <PrintButton />
              </div>
            </div>

            <section className="mb-8 print:break-inside-avoid">
              <h2 className="mb-3 text-sm font-bold text-navy">ملخص الأثر</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl2 border border-navy/10 p-4 text-center">
                  <div className="text-2xl font-extrabold text-navy">{total}</div>
                  <div className="mt-1 text-xs text-navy/50">إجمالي الآثار المعتمدة</div>
                </div>
                <div className="rounded-xl2 border border-navy/10 p-4 text-center">
                  <div className="text-2xl font-extrabold text-navy">{stats.clinical}</div>
                  <div className="mt-1 text-xs text-navy/50">الآثار السريرية</div>
                </div>
                <div className="rounded-xl2 border border-navy/10 p-4 text-center">
                  <div className="text-2xl font-extrabold text-navy">{stats.organizational}</div>
                  <div className="mt-1 text-xs text-navy/50">الآثار المؤسسية</div>
                </div>
                <div className="rounded-xl2 border border-navy/10 p-4 text-center">
                  <div className="text-2xl font-extrabold text-navy">{stats.participatingFacilityCount}</div>
                  <div className="mt-1 text-xs text-navy/50">عدد المنشآت المشاركة</div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-3 text-sm font-bold text-navy">الأثر حسب المنشأة</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-right text-sm">
                  <thead>
                    <tr className="border-b border-navy/10 text-[11px] text-navy/50">
                      <th className="py-2 pe-2 font-semibold">اسم المنشأة</th>
                      <th className="py-2 pe-2 font-semibold">نوع المنشأة</th>
                      <th className="py-2 pe-2 font-semibold">إجمالي الآثار المعتمدة</th>
                      <th className="py-2 pe-2 font-semibold">الأثر السريري</th>
                      <th className="py-2 font-semibold">الأثر المؤسسي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/5">
                    {facilities.map((facility) => {
                      const facilityStats = getFacilityStats(facility.id, records);
                      const facilityTotal = facilityStats.clinical + facilityStats.organizational;
                      return (
                        <tr key={facility.id} className="print:break-inside-avoid">
                          <td className="py-2 pe-2 font-semibold text-navy">{facility.name}</td>
                          <td className="py-2 pe-2">
                            <FacilityTypeBadge type={facility.type} />
                          </td>
                          <td className="py-2 pe-2 font-semibold text-navy">{facilityTotal}</td>
                          <td className="py-2 pe-2 text-navy/70">{facilityStats.clinical}</td>
                          <td className="py-2 text-navy/70">{facilityStats.organizational}</td>
                        </tr>
                      );
                    })}
                    {/* Rolled-up PHC row — approved records of manually-named Primary
                        Health Care centers in this scope (they have no registered
                        facility record). 0 when there are none. */}
                    <tr className="print:break-inside-avoid">
                      <td className="py-2 pe-2 font-semibold text-navy">مراكز الرعاية الصحية الأولية</td>
                      <td className="py-2 pe-2">
                        <span className="inline-block shrink-0 rounded-full border border-navy/10 bg-bgsoft px-2.5 py-0.5 text-[11px] font-medium text-navy/60">
                          مجموعة مراكز
                        </span>
                      </td>
                      <td className="py-2 pe-2 font-semibold text-navy">{phcTotal}</td>
                      <td className="py-2 pe-2 text-navy/70">{phcStats.clinical}</td>
                      <td className="py-2 text-navy/70">{phcStats.organizational}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="print:break-inside-avoid">
              <h2 className="mb-3 text-sm font-bold text-navy">نماذج من الآثار المعتمدة</h2>
              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.slice(0, 8).map((r) => {
                    const record = (r.clinical ?? r.organizational)!;
                    const summary = r.clinical
                      ? `${r.clinical.previousStatus} ← ${r.clinical.currentOutcome}`
                      : `${r.organizational!.previousState} ← ${r.organizational!.resultingChange}`;
                    return (
                      <div key={record.id} className="rounded-xl2 border border-navy/5 p-4 print:break-inside-avoid">
                        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-navy/60">{r.facilityLabel}</span>
                          <span className="text-xs text-navy/40">{formatArabicDate(record.eventDate)}</span>
                        </div>
                        <p className="text-sm text-navy/70">{summary}</p>
                        <span className="mt-2 inline-block rounded-full border border-navy/10 bg-bgsoft px-2.5 py-0.5 text-[11px] font-medium text-navy/60">
                          {r.track === "clinical" ? "سريري" : "مؤسسي"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl2 border border-dashed border-navy/15 p-4 text-center text-xs leading-5 text-navy/40">
                  لا تتوفر حاليًا آثار معتمدة مرتبطة بمنشآت هذا النطاق لعرضها هنا — ستظهر تلقائيًا فور اعتماد آثار
                  مسجّلة عبر معالج الإرسال لإحدى منشآته.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
