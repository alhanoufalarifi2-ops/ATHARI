"use client";

import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import OrgStatusBadge from "@/components/OrgStatusBadge";
import DonutChart from "@/components/DonutChart";
import {
  BuildingIcon,
  CalendarIcon,
  DownloadIcon,
  FileBarChartIcon,
  LayersIcon,
  PercentIcon,
  TrophyIcon,
} from "@/components/icons";
import { ORG_TYPE_ICONS } from "@/lib/orgVisuals";

// Same sequential deep-navy -> light-sky palette used on the clinical dashboard,
// so the donut reads as one graduated scale rather than unrelated flat colors.
const DONUT_PALETTE = ["#0B2545", "#13315C", "#1F4E79", "#2F6690", "#3B8FBD", "#4FA8D8", "#7EC0E4", "#BFE0F5"];

import { useAthariStore } from "@/lib/store";
import { ORG_IMPACT_TYPE_LABELS, OrgImpactType } from "@/lib/types";
import { ARABIC_MONTHS, countResultsByDepartment, formatArabicDate } from "@/lib/utils";
import Link from "next/link";

export default function OrgDashboardPage() {
  const organizationalImpacts = useAthariStore((s) => s.organizationalImpacts);
  const initiatives = useAthariStore((s) => s.initiatives);
  const departments = useAthariStore((s) => s.departments);

  const approved = organizationalImpacts.filter((i) => i.status === "approved");
  const approvalRate =
    organizationalImpacts.length > 0 ? Math.round((approved.length / organizationalImpacts.length) * 100) : 0;

  const initiativeType = (initiativeId: string): OrgImpactType | undefined =>
    initiatives.find((i) => i.id === initiativeId)?.type;
  const initiativeName = (initiativeId: string) =>
    initiatives.find((i) => i.id === initiativeId)?.name ?? "غير معروف";

  const byType = (Object.keys(ORG_IMPACT_TYPE_LABELS) as OrgImpactType[])
    .map((type) => ({
      type,
      count: approved.filter((i) => initiativeType(i.initiativeId) === type).length,
    }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  // Participating/benefiting departments per approved result (the field holds
  // the free text typed on the form — see countResultsByDepartment).
  const byDepartment = countResultsByDepartment(
    approved.map((i) => i.departments),
    departments
  ).slice(0, 5);

  const recentImpacts = [...approved]
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
    .slice(0, 3);

  const latestAdded = [...organizationalImpacts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const now = new Date();

  return (
    <div className="flex h-full flex-col">
      <Header
        title="الرئيسية"
        subtitle="نظرة عامة على الأثر المؤسسي الموثق"
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-xl2 border border-navy/10 bg-white px-3 py-1.5 text-xs font-semibold text-navy/60 shadow-sm">
            <CalendarIcon className="h-3.5 w-3.5 text-sky-dark" />
            {formatArabicDate(now.toISOString())}
          </span>
        }
      />

      <div className="flex flex-1 flex-col gap-1.5 px-5 py-1.5">
        <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="المبادرات الموثّقة"
            value={initiatives.length}
            accent="navy"
            icon={BuildingIcon}
            href="/org/initiatives"
          />
          <StatCard
            label="إجمالي الآثار المؤسسية الموثقة"
            value={organizationalImpacts.length}
            icon={LayersIcon}
            href="/org/review"
          />
          <StatCard
            label="نسبة اعتماد الأثر المؤسسي"
            value={`${approvalRate}%`}
            hint="من إجمالي الآثار المؤسسية المُدخلة"
            accent="navy"
            icon={PercentIcon}
            href="/org/review"
          />
          <StatCard
            label="قصص النجاح المؤسسية المعتمدة"
            value={approved.length}
            icon={TrophyIcon}
            href="/org/review"
          />
        </div>

        <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="flex h-full flex-col rounded-xl2 border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-2.5 shadow-card">
            <h2 className="mb-1.5 shrink-0 text-sm font-bold text-navy">أحدث الآثار المؤسسية</h2>
            <div className="flex flex-1 flex-col justify-center">
              {recentImpacts.length === 0 ? (
                <p className="py-4 text-center text-sm text-navy/40">لا توجد آثار مؤسسية معتمدة بعد.</p>
              ) : (
                <ol className="relative border-e-2 border-sky/45 pe-6">
                  {recentImpacts.map((impact) => {
                    const type = initiativeType(impact.initiativeId);
                    const Icon = type ? ORG_TYPE_ICONS[type] : BuildingIcon;
                    return (
                      <li key={impact.id} className="mb-2 last:mb-0">
                        <span
                          className="absolute -end-[15px] flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-navy text-white shadow"
                          style={{ backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0) 65%)" }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <p className="text-[11px] font-semibold text-navy/40">{formatArabicDate(impact.eventDate)}</p>
                        <Link
                          href={`/org/initiatives/${impact.initiativeId}`}
                          className="text-sm font-bold text-navy hover:underline"
                        >
                          {initiativeName(impact.initiativeId)}
                        </Link>
                        <p className="mt-0.5 text-xs text-navy/60">{impact.resultingChange}</p>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>

          <div className="flex h-full flex-col rounded-xl2 border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-2.5 shadow-card">
            <div className="mb-1.5 flex shrink-0 items-center justify-between">
              <h2 className="text-sm font-bold text-navy">أحدث الآثار المؤسسية المضافة</h2>
              <Link href="/org/review" className="text-xs font-semibold text-sky-dark hover:underline">
                عرض الكل ←
              </Link>
            </div>
            <div className="-mx-1 flex-1 overflow-x-auto">
              <table className="w-full min-w-[420px] text-right text-sm">
                <thead>
                  <tr className="border-b border-navy/5 text-[11px] text-navy/40">
                    <th className="px-1 py-1 font-semibold">التاريخ</th>
                    <th className="px-1 py-1 font-semibold">النوع</th>
                    <th className="px-1 py-1 font-semibold">المبادرة</th>
                    <th className="px-1 py-1 font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {latestAdded.map((impact) => {
                    const type = initiativeType(impact.initiativeId);
                    const Icon = type ? ORG_TYPE_ICONS[type] : BuildingIcon;
                    return (
                      <tr key={impact.id}>
                        <td className="whitespace-nowrap px-1 py-1 text-[11px] text-navy/50">
                          {formatArabicDate(impact.eventDate)}
                        </td>
                        <td className="px-1 py-1">
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white"
                            style={{ backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0) 65%)" }}
                            title={type ? ORG_IMPACT_TYPE_LABELS[type] : ""}
                          >
                            <Icon className="h-3 w-3" />
                          </span>
                        </td>
                        <td className="px-1 py-1 text-xs">
                          <Link
                            href={`/org/initiatives/${impact.initiativeId}`}
                            className="font-semibold text-navy hover:underline"
                          >
                            {initiativeName(impact.initiativeId)}
                          </Link>
                        </td>
                        <td className="px-1 py-1">
                          <OrgStatusBadge status={impact.status} />
                        </td>
                      </tr>
                    );
                  })}
                  {latestAdded.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-sm text-navy/40">
                        لا توجد آثار مؤسسية بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="flex h-full flex-col rounded-xl2 border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-4 shadow-card">
            <h2 className="mb-3 shrink-0 text-sm font-bold text-navy">تقرير سريع</h2>
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky/45 to-sky-light/15 text-sky-dark">
                <FileBarChartIcon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-navy">تقرير الأثر المؤسسي</p>
                <p className="text-[11px] text-navy/45">
                  {ARABIC_MONTHS[now.getMonth()]} {now.getFullYear()}
                </p>
                <p className="mt-1.5 text-[11px] leading-4 text-navy/50">
                  ملخص شامل للأثر المؤسسي المعتمد خلال الشهر الحالي.
                </p>
              </div>
            </div>
            <Link
              href="/org/reports/monthly"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl2 bg-gradient-to-l from-navy to-navy-light px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              تحميل التقرير
            </Link>
          </div>

          <div className="flex h-full flex-col rounded-xl2 border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-4 shadow-card">
            <h2 className="mb-3 shrink-0 text-sm font-bold text-navy">أبرز الأقسام المشاركة</h2>
            <div className="flex flex-1 flex-col justify-center gap-2.5">
              {byDepartment.map((d) => (
                <div key={d.label}>
                  <div className="mb-1 flex justify-between text-[11px] text-navy/60">
                    <span>{d.label}</span>
                    <span className="font-semibold text-navy">{Math.round((d.count / approved.length) * 100)}%</span>
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

          <div className="flex h-full flex-col rounded-xl2 border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-4 shadow-card">
            <h2 className="mb-3 shrink-0 text-sm font-bold text-navy">توزيع الأثر المؤسسي حسب النوع</h2>
            <div className="flex flex-1 flex-col justify-center">
              {byType.length === 0 ? (
                <p className="py-4 text-center text-sm text-navy/40">لا توجد بيانات معتمدة بعد.</p>
              ) : (
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-center">
                  <DonutChart
                    size={130}
                    thickness={20}
                    segments={byType.map((t, i) => ({
                      label: ORG_IMPACT_TYPE_LABELS[t.type],
                      value: t.count,
                      color: DONUT_PALETTE[i % DONUT_PALETTE.length],
                    }))}
                  />
                  <ul className="w-full space-y-1.5 text-[11px]">
                    {byType.map((t, i) => (
                      <li key={t.type} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-navy/70">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: DONUT_PALETTE[i % DONUT_PALETTE.length] }}
                          />
                          {ORG_IMPACT_TYPE_LABELS[t.type]}
                        </span>
                        <span className="font-semibold text-navy">{Math.round((t.count / approved.length) * 100)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
