"use client";

import Header from "@/components/Header";
import KpiCard from "@/components/KpiCard";
import ScopeCard from "@/components/ScopeCard";
import { BuildingIcon, ActivityIcon, LayersIcon, NetworkIcon } from "@/components/icons";
import { CLUSTER_EXECUTIVE_ADMINISTRATION_NAME, scopes } from "@/lib/clusterData";
import { getClusterStats, getExecutiveAdministrationStats, getScopeStats } from "@/lib/clusterStats";
import { useImpactRecords } from "@/lib/useImpactRecords";

export default function ClusterDashboardPage() {
  const records = useImpactRecords();
  const clusterStats = getClusterStats(records);
  const total = clusterStats.clinical + clusterStats.organizational;
  const executiveStats = getExecutiveAdministrationStats(records);

  return (
    <div>
      <Header
        title="اللوحة التنفيذية"
        subtitle="نظرة عامة على الأثر المعتمد على مستوى التجمع الصحي"
        subtitleClassName="text-navy/65"
      />

      <div className="space-y-9 px-5 py-9">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="إجمالي الآثار المعتمدة" value={total} icon={LayersIcon} accent="navy" />
          <KpiCard label="الآثار السريرية" value={clusterStats.clinical} icon={ActivityIcon} />
          <KpiCard label="الآثار المؤسسية" value={clusterStats.organizational} icon={BuildingIcon} accent="navy" />
          <KpiCard label="عدد المنشآت المشاركة" value={clusterStats.participatingFacilityCount} icon={NetworkIcon} />
        </div>

        {/* Cluster Executive Administration — a cluster-level entity, not a
            fifth geographic scope, so it gets its own distinct banner here
            rather than joining the ScopeCard grid below. Organizational
            impact only, matching the existing submission flow. */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl2 border border-dashed border-navy/20 bg-bgsoft p-4 shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-dark/30 to-sky/10 text-navy">
              <BuildingIcon className="h-4 w-4" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-extrabold text-navy">{CLUSTER_EXECUTIVE_ADMINISTRATION_NAME}</span>
                <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-semibold text-navy/60">
                  مستوى التجمع
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-navy/50">أثر مؤسسي فقط — إدارة تنفيذية، وليست نطاقًا جغرافيًا</p>
            </div>
          </div>
          <div className="text-end">
            <span className="text-2xl font-extrabold leading-none text-navy">{executiveStats.organizational}</span>
            <p className="mt-0.5 text-[11px] text-navy/50">أثر مؤسسي معتمد</p>
          </div>
        </div>

        {/* Section divider — replaces a plain heading with a navy bar matching
            the app's identity, so it reads as a deliberate seam between the
            KPI row and the scope cards rather than a section label. */}
        <div className="flex h-[45px] items-center justify-center gap-5 rounded-xl2 bg-gradient-to-l from-navy to-navy-light px-8 shadow-card">
          <span className="h-px flex-1 bg-sky-light/40" />
          <h2 className="shrink-0 text-lg font-bold text-white">الأثر حسب النطاق</h2>
          <span className="h-px flex-1 bg-sky-light/40" />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {scopes.map((scope) => (
            <ScopeCard key={scope.id} id={scope.id} name={scope.name} stats={getScopeStats(scope.id, records)} />
          ))}
        </div>
      </div>
    </div>
  );
}
