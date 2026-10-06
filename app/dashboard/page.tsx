"use client";

import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import DonutChart from "@/components/DonutChart";
import {
  CalendarIcon,
  DownloadIcon,
  FileBarChartIcon,
  LayersIcon,
  PercentIcon,
  TrophyIcon,
  UsersIcon,
} from "@/components/icons";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryVisuals";

// Sequential deep-navy -> light-sky palette used for the donut and its legend,
// so the chart itself reads as one graduated scale rather than unrelated category colors.
const DONUT_PALETTE = ["#0B2545", "#13315C", "#1F4E79", "#2F6690", "#3B8FBD", "#4FA8D8", "#7EC0E4", "#BFE0F5"];
import { useAthariStore } from "@/lib/store";
import { CATEGORY_LABELS, ImpactCategory } from "@/lib/types";
import { ARABIC_MONTHS, countResultsByDepartment, formatArabicDate } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const impacts = useAthariStore((s) => s.impacts);
  const patients = useAthariStore((s) => s.patients);
  const departments = useAthariStore((s) => s.departments);

  const approved = impacts.filter((i) => i.status === "approved");
  const patientsWithApproved = new Set(approved.map((i) => i.patientId));
  const approvalRate = impacts.length > 0 ? Math.round((approved.length / impacts.length) * 100) : 0;

  const byCategory = (Object.keys(CATEGORY_LABELS) as ImpactCategory[])
    .map((category) => ({ category, count: approved.filter((i) => i.category === category).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  // Participating departments per approved result (legacy IDs resolved to
  // names, spelling variants merged — see countResultsByDepartment).
  const byDepartment = countResultsByDepartment(
    approved.map((i) => i.departments),
    departments
  ).slice(0, 5);

  const recentJourney = [...approved]
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
    .slice(0, 3);

  const latestAdded = [...impacts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // MRN is the only patient identifier shown anywhere in the UI now — Patient
  // Name is legacy-only data, never rendered.
  const patientIdentifier = (id: string) => patients.find((p) => p.id === id)?.mrn ?? "غير معروف";

  const now = new Date();

  return (
    <div>
      <Header
        title="الرئيسية"
        subtitle="نظرة عامة على الأثر السريري الموثق"
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-xl2 border border-navy/10 bg-white px-3 py-1.5 text-xs font-semibold text-navy/60 shadow-sm">
            <CalendarIcon className="h-3.5 w-3.5 text-sky-dark" />
            {formatArabicDate(now.toISOString())}
          </span>
        }
      />

      <div className="space-y-1.5 px-5 py-1.5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="المرضى ذوو الرحلات الموثقة"
            value={patientsWithApproved.size}
            accent="navy"
            icon={UsersIcon}
            href="/patients"
          />
          <StatCard
            label="إجمالي الآثار السريرية الموثقة"
            value={impacts.length}
            icon={LayersIcon}
            href="/review"
          />
          <StatCard
            label="نسبة اعتماد الأثر السريري"
            value={`${approvalRate}%`}
            hint="من إجمالي الآثار السريرية المُدخلة"
            accent="navy"
            icon={PercentIcon}
            href="/review"
          />
          <StatCard
            label="قصص النجاح المعتمدة"
            value={approved.length}
            icon={TrophyIcon}
            href="/review"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-xl2 border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-2.5 shadow-card">
            <h2 className="mb-1.5 text-sm font-bold text-navy">الرحلة السريرية الأخيرة</h2>
            {recentJourney.length === 0 ? (
              <p className="py-4 text-center text-sm text-navy/40">لا توجد آثار سريرية معتمدة بعد.</p>
            ) : (
              <ol className="relative border-e-2 border-sky/45 pe-6">
                {recentJourney.map((impact) => {
                  const Icon = CATEGORY_ICONS[impact.category];
                  return (
                    <li key={impact.id} className="mb-2 last:mb-0">
                      <span
                        className="absolute -end-[15px] flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-white shadow"
                        style={{
                          backgroundColor: CATEGORY_COLORS[impact.category],
                          backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0) 65%)",
                        }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-[11px] font-semibold text-navy/40">{formatArabicDate(impact.eventDate)}</p>
                      <Link href={`/patients/${impact.patientId}`} className="text-sm font-bold text-navy hover:underline">
                        {patientIdentifier(impact.patientId)}
                      </Link>
                      <p className="mt-0.5 text-xs text-navy/60">{impact.currentOutcome}</p>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <div className="rounded-xl2 border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-2.5 shadow-card">
            <div className="mb-1.5 flex items-center justify-between">
              <h2 className="text-sm font-bold text-navy">أحدث الآثار السريرية المضافة</h2>
              <Link href="/review" className="text-xs font-semibold text-sky-dark hover:underline">
                عرض الكل ←
              </Link>
            </div>
            <div className="-mx-1 overflow-x-auto">
              <table className="w-full min-w-[420px] text-right text-sm">
                <thead>
                  <tr className="border-b border-navy/5 text-[11px] text-navy/40">
                    <th className="px-1 py-1 font-semibold">التاريخ</th>
                    <th className="px-1 py-1 font-semibold">نوع الأثر</th>
                    <th className="px-1 py-1 font-semibold">المريض</th>
                    <th className="px-1 py-1 font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {latestAdded.map((impact) => {
                    const Icon = CATEGORY_ICONS[impact.category];
                    return (
                      <tr key={impact.id}>
                        <td className="whitespace-nowrap px-1 py-1 text-[11px] text-navy/50">
                          {formatArabicDate(impact.eventDate)}
                        </td>
                        <td className="px-1 py-1">
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                            style={{
                              backgroundColor: CATEGORY_COLORS[impact.category],
                              backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0) 65%)",
                            }}
                            title={CATEGORY_LABELS[impact.category]}
                          >
                            <Icon className="h-3 w-3" />
                          </span>
                        </td>
                        <td className="px-1 py-1 text-xs">
                          <Link href={`/patients/${impact.patientId}`} className="font-semibold text-navy hover:underline">
                            {patientIdentifier(impact.patientId)}
                          </Link>
                        </td>
                        <td className="px-1 py-1">
                          <StatusBadge status={impact.status} />
                        </td>
                      </tr>
                    );
                  })}
                  {latestAdded.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-sm text-navy/40">
                        لا توجد آثار سريرية بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="rounded-xl2 border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-4 shadow-card">
            <h2 className="mb-3 text-sm font-bold text-navy">تقرير سريع</h2>
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky/45 to-sky-light/15 text-sky-dark">
                <FileBarChartIcon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-navy">تقرير الأثر السريري للمرضى</p>
                <p className="text-[11px] text-navy/45">
                  {ARABIC_MONTHS[now.getMonth()]} {now.getFullYear()}
                </p>
                <p className="mt-1.5 text-[11px] leading-4 text-navy/50">
                  ملخص شامل للأثر السريري المعتمد خلال الشهر الحالي.
                </p>
              </div>
            </div>
            <Link
              href="/reports/monthly"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl2 bg-gradient-to-l from-navy to-navy-light px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              تحميل التقرير
            </Link>
          </div>

          <div className="rounded-xl2 border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-4 shadow-card">
            <h2 className="mb-3 text-sm font-bold text-navy">أبرز الأقسام المشاركة</h2>
            <div className="space-y-2.5">
              {byDepartment.map((d) => (
                <div key={d.label}>
                  <div className="mb-1 flex justify-between text-[11px] text-navy/60">
                    <span>{d.label}</span>
                    <span className="font-semibold text-navy">
                      {Math.round((d.count / approved.length) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-bgsoft">
                    <div
                      className="h-2 rounded-full bg-gradient-to-l from-sky-light via-sky to-sky-dark"
                      style={{ width: `${(d.count / approved.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {byDepartment.length === 0 && (
                <p className="py-4 text-center text-sm text-navy/40">لا توجد بيانات معتمدة بعد.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl2 border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-4 shadow-card">
            <h2 className="mb-3 text-sm font-bold text-navy">توزيع الأثر السريري حسب النوع</h2>
            {byCategory.length === 0 ? (
              <p className="py-4 text-center text-sm text-navy/40">لا توجد بيانات معتمدة بعد.</p>
            ) : (
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-center">
                <DonutChart
                  size={130}
                  thickness={20}
                  segments={byCategory.map((c, i) => ({
                    label: CATEGORY_LABELS[c.category],
                    value: c.count,
                    color: DONUT_PALETTE[i % DONUT_PALETTE.length],
                  }))}
                />
                <ul className="w-full space-y-1.5 text-[11px]">
                  {byCategory.map((c, i) => (
                    <li key={c.category} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-navy/70">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: DONUT_PALETTE[i % DONUT_PALETTE.length] }}
                        />
                        {CATEGORY_LABELS[c.category]}
                      </span>
                      <span className="font-semibold text-navy">
                        {Math.round((c.count / approved.length) * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
