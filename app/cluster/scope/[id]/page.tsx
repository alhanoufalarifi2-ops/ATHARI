"use client";

import Breadcrumb from "@/components/Breadcrumb";
import FacilityCard from "@/components/FacilityCard";
import DemoDataNote from "@/components/DemoDataNote";
import Header from "@/components/Header";
import KpiCard from "@/components/KpiCard";
import PhcGatewayCard from "@/components/PhcGatewayCard";
import SectionDivider from "@/components/SectionDivider";
import { ActivityIcon, BuildingIcon, FileBarChartIcon, LayersIcon, NetworkIcon } from "@/components/icons";
import { getFacilitiesByScope, getScopeById } from "@/lib/clusterData";
import { getFacilityStats, getScopeStats } from "@/lib/clusterStats";
import { useImpactRecords } from "@/lib/useImpactRecords";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ScopeDashboardPage() {
  const params = useParams<{ id: string }>();
  const scope = getScopeById(params.id);
  const records = useImpactRecords();

  if (!scope) {
    return (
      <div>
        <Header title="النطاق" />
        <div className="p-6 text-navy/50">لم يتم العثور على هذا النطاق.</div>
      </div>
    );
  }

  const stats = getScopeStats(scope.id, records);
  const total = stats.clinical + stats.organizational;
  const facilities = getFacilitiesByScope(scope.id);

  // Temporary: Wadi Dawasir's facility cards are 20px taller than the 160px
  // Riyadh reference, under review on this scope only.
  const facilityCardHeightClassName = scope.id === "wadi-dawasir" ? "min-h-[180px]" : undefined;

  return (
    <div>
      <Header
        title={scope.name}
        subtitle="نظرة عامة على الأثر المعتمد داخل النطاق"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Breadcrumb
              items={[{ label: "التجمع الصحي", href: "/cluster/dashboard" }, { label: scope.name }]}
            />
            <Link
              href={`/cluster/scope/${scope.id}/report`}
              className="inline-flex items-center gap-1.5 rounded-xl2 bg-navy px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-navy-light"
            >
              <FileBarChartIcon className="h-3.5 w-3.5" />
              تقرير النطاق
            </Link>
          </div>
        }
      />

      <div className="space-y-9 px-5 py-9">
        <DemoDataNote />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="إجمالي أثر النطاق" value={total} icon={LayersIcon} accent="navy" />
          <KpiCard label="الأثر السريري" value={stats.clinical} icon={ActivityIcon} />
          <KpiCard label="الأثر المؤسسي" value={stats.organizational} icon={BuildingIcon} accent="navy" />
          <KpiCard label="عدد المنشآت" value={stats.facilityCount} icon={NetworkIcon} />
        </div>

        <SectionDivider title="المنشآت الصحية" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {facilities.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              stats={getFacilityStats(facility.id, records)}
              minHeightClassName={facilityCardHeightClassName}
            />
          ))}
          <PhcGatewayCard scopeId={scope.id} minHeightClassName={facilityCardHeightClassName} />
        </div>
      </div>
    </div>
  );
}
