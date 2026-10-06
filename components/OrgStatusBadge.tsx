import { ImpactStatus, ORG_IMPACT_STATUS_LABELS } from "@/lib/types";

const styles: Record<ImpactStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  returned_for_revision: "bg-orange-100 text-orange-700",
  closed_expired: "bg-navy/10 text-navy/50",
};

export default function OrgStatusBadge({ status }: { status: ImpactStatus }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {ORG_IMPACT_STATUS_LABELS[status]}
    </span>
  );
}
