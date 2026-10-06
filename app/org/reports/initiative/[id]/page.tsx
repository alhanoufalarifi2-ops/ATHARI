"use client";

import Header from "@/components/Header";
import ReportHeader from "@/components/ReportHeader";
import InitiativeTimeline from "@/components/InitiativeTimeline";
import { useAthariStore } from "@/lib/store";
import { formatArabicDate, uniqueDepartments } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function InitiativeReportPage() {
  const params = useParams<{ id: string }>();
  const initiatives = useAthariStore((s) => s.initiatives);
  const organizationalImpacts = useAthariStore((s) => s.organizationalImpacts);
  const departments = useAthariStore((s) => s.departments);

  const initiative = initiatives.find((i) => i.id === params.id);
  const approvedImpacts = organizationalImpacts.filter(
    (i) => i.initiativeId === params.id && i.status === "approved"
  );
  const involvedDepartments = uniqueDepartments(approvedImpacts.flatMap((i) => i.departments), departments);

  if (!initiative) {
    return (
      <div>
        <Header title="تقرير المبادرة" />
        <div className="p-6 text-navy/50">لم يتم العثور على المبادرة.</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="تقرير المبادرة" subtitle={initiative.name} />

      <div className="p-4 sm:p-6 print:p-0">
        <div className="mx-auto max-w-3xl rounded-xl2 bg-white p-5 shadow-card print:shadow-none sm:p-8">
          <ReportHeader
            title={`تقرير المبادرة — ${initiative.name}`}
            period={`بدأت: ${formatArabicDate(initiative.startDate)}`}
            tagline="أثري | ATHARI — توثيق الأثر المؤسسي"
          />

          <p className="mb-6 leading-7 text-navy/80">
            منذ بدء المبادرة بتاريخ {formatArabicDate(initiative.startDate)}، تم توثيق{" "}
            <strong>{approvedImpacts.length}</strong> أثر مؤسسي مهم، بمشاركة{" "}
            <strong>{involvedDepartments.length}</strong> أقسام مستفيدة.
          </p>

          <InitiativeTimeline impacts={approvedImpacts} departments={departments} />
        </div>
      </div>
    </div>
  );
}
