"use client";

import Header from "@/components/Header";
import InitiativeTimeline from "@/components/InitiativeTimeline";
import { FileBarChartIcon, PlusCircleIcon } from "@/components/icons";
import { useAthariStore } from "@/lib/store";
import { ORG_IMPACT_TYPE_LABELS } from "@/lib/types";
import { formatArabicDate } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function InitiativeJourneyPage() {
  const params = useParams<{ id: string }>();
  const initiatives = useAthariStore((s) => s.initiatives);
  const organizationalImpacts = useAthariStore((s) => s.organizationalImpacts);
  const departments = useAthariStore((s) => s.departments);

  const initiative = initiatives.find((i) => i.id === params.id);
  const approvedImpacts = organizationalImpacts.filter(
    (i) => i.initiativeId === params.id && i.status === "approved"
  );
  const deptName = (id: string) => departments.find((d) => d.id === id)?.name ?? id;

  if (!initiative) {
    return (
      <div>
        <Header title="رحلة المبادرة" />
        <div className="p-6 text-navy/50">لم يتم العثور على المبادرة.</div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={`رحلة المبادرة — ${initiative.name}`}
        subtitle={ORG_IMPACT_TYPE_LABELS[initiative.type]}
        actions={
          <Link href="/org/review" className="text-xs font-semibold text-sky-dark hover:underline">
            ← العودة لقائمة المراجعة
          </Link>
        }
      />

      <div className="space-y-6 p-5 lg:space-y-8 lg:p-8">
        <div className="grid grid-cols-2 gap-5 rounded-2xl border border-navy/5 bg-white p-6 shadow-card sm:grid-cols-4">
          <div>
            <p className="text-xs text-navy/40">تاريخ البدء</p>
            <p className="font-semibold text-navy">{formatArabicDate(initiative.startDate)}</p>
          </div>
          <div>
            <p className="text-xs text-navy/40">القسم المسؤول</p>
            <p className="font-semibold text-navy">{deptName(initiative.department)}</p>
          </div>
          <div>
            <p className="text-xs text-navy/40">نوع المبادرة</p>
            <p className="font-semibold text-navy">{ORG_IMPACT_TYPE_LABELS[initiative.type]}</p>
          </div>
          <div>
            <p className="text-xs text-navy/40">عدد الآثار المعتمدة</p>
            <p className="font-semibold text-navy">{approvedImpacts.length}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-navy">الخط الزمني للأثر المؤسسي</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/org/reports/initiative/${initiative.id}`}
              className="inline-flex items-center gap-2 rounded-xl2 border border-navy/10 bg-white px-4 py-2 text-xs font-semibold text-navy hover:bg-bgsoft"
            >
              <FileBarChartIcon className="h-4 w-4" />
              تقرير المبادرة
            </Link>
            <Link
              href={`/org/add-impact?initiativeId=${initiative.id}`}
              className="inline-flex items-center gap-2 rounded-xl2 bg-sky px-4 py-2 text-xs font-semibold text-navy hover:bg-sky-dark hover:text-white"
            >
              <PlusCircleIcon className="h-4 w-4" />
              إضافة أثر لهذه المبادرة
            </Link>
          </div>
        </div>

        <InitiativeTimeline impacts={approvedImpacts} departments={departments} />
      </div>
    </div>
  );
}
