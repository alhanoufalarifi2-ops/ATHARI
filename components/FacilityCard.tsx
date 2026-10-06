import { ImpactStats } from "@/lib/clusterStats";
import { Facility } from "@/lib/types";
import Link from "next/link";
import FacilityTypeBadge from "./FacilityTypeBadge";

// Navigates to this facility's own dashboard (app/cluster/facility/[id]),
// which hosts its "تقرير المنشأة" report button — same drill-down pattern as
// PhcGatewayCard's Link, just to a real per-facility page instead of a group.
//
// Fixed min-h-[160px] is the sizing reference approved on the Riyadh scope
// page — every scope uses this same width/height/padding, regardless of how
// many facilities it has, so all Scope Dashboards read as one consistent grid.
// `minHeightClassName` allows a single scope's page to override this height
// (e.g. Wadi Dawasir) while every other scope keeps the 160px reference.
export default function FacilityCard({
  facility,
  stats,
  minHeightClassName = "min-h-[160px]",
}: {
  facility: Facility;
  stats: ImpactStats;
  minHeightClassName?: string;
}) {
  const total = stats.clinical + stats.organizational;

  return (
    <Link
      href={`/cluster/facility/${facility.id}`}
      className={`flex ${minHeightClassName} flex-col justify-center rounded-xl2 border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-3 shadow-card transition-shadow hover:border-sky hover:shadow-cardHover`}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <span className="text-sm font-bold leading-tight text-navy">{facility.name}</span>
        <FacilityTypeBadge type={facility.type} />
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-navy/50">
        <span className="font-semibold text-navy">{total} أثر معتمد</span>
        <span className="flex items-center gap-2">
          <span>سريري {stats.clinical}</span>
          <span>مؤسسي {stats.organizational}</span>
        </span>
      </div>
    </Link>
  );
}
