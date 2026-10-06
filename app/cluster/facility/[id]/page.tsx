"use client";

import Breadcrumb from "@/components/Breadcrumb";
import FacilityTypeBadge from "@/components/FacilityTypeBadge";
import DemoDataNote from "@/components/DemoDataNote";
import Header from "@/components/Header";
import KpiCard from "@/components/KpiCard";
import { ActivityIcon, BuildingIcon, FileBarChartIcon, LayersIcon } from "@/components/icons";
import { facilities, getScopeById } from "@/lib/clusterData";
import { getFacilityStats } from "@/lib/clusterStats";
import { useImpactRecords } from "@/lib/useImpactRecords";
import Link from "next/link";
import { useParams } from "next/navigation";

// One facility's own drill-down from its Scope Dashboard card (see
// FacilityCard's Link) — same KpiCard/Header pattern as the Scope Dashboard,
// scoped to a single facility. Facility Count doesn't apply here (it's always
// exactly this one facility), so the fourth tile shows its type/scope instead.
export default function FacilityDashboardPage() {
  const params = useParams<{ id: string }>();
  const facility = facilities.find((f) => f.id === params.id);
  const records = useImpactRecords();
  const scope = facility ? getScopeById(facility.scopeId) : undefined;

  if (!facility || !scope) {
    return (
      <div>
        <Header title="المنشأة" />
        <div className="p-6 text-navy/50">لم يتم العثور على هذه المنشأة.</div>
      </div>
    );
  }

  const stats = getFacilityStats(facility.id, records);
  const total = stats.clinical + stats.organizational;

  return (
    <div>
      <Header
        title={facility.name}
        subtitle="نظرة عامة على الأثر المعتمد داخل المنشأة"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Breadcrumb
              items={[
                { label: "التجمع الصحي", href: "/cluster/dashboard" },
                { label: scope.name, href: `/cluster/scope/${scope.id}` },
                { label: facility.name },
              ]}
            />
            <Link
              href={`/cluster/facility/${facility.id}/report`}
              className="inline-flex items-center gap-1.5 rounded-xl2 bg-navy px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-navy-light"
            >
              <FileBarChartIcon className="h-3.5 w-3.5" />
              تقرير المنشأة
            </Link>
          </div>
        }
      />

      <div className="space-y-9 px-5 py-9">
        <DemoDataNote />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="إجمالي أثر المنشأة" value={total} icon={LayersIcon} accent="navy" />
          <KpiCard label="الأثر السريري" value={stats.clinical} icon={ActivityIcon} />
          <KpiCard label="الأثر المؤسسي" value={stats.organizational} icon={BuildingIcon} accent="navy" />
          <div className="flex min-h-[172px] flex-col items-center justify-center gap-2 rounded-xl2 border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-3 text-center shadow-card">
            <FacilityTypeBadge type={facility.type} />
            <span className="text-xs text-navy/70">{scope.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
