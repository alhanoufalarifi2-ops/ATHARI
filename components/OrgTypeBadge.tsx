import { OrgImpactType, ORG_IMPACT_TYPE_LABELS } from "@/lib/types";

export default function OrgTypeBadge({ type }: { type: OrgImpactType }) {
  return (
    <span className="inline-block rounded-full border border-sky/40 bg-sky/10 px-3 py-1 text-xs font-medium text-sky-dark">
      {ORG_IMPACT_TYPE_LABELS[type]}
    </span>
  );
}
