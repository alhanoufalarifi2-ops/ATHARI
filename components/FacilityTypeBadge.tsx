import { FACILITY_TYPE_LABELS, FacilityType } from "@/lib/types";

const STYLES: Record<FacilityType, string> = {
  hospital: "border-sky/40 bg-sky/10 text-sky-dark",
  medical_city: "border-navy/20 bg-navy/10 text-navy",
  phc: "border-navy/10 bg-bgsoft text-navy/60",
};

export default function FacilityTypeBadge({ type }: { type: FacilityType }) {
  return (
    <span className={`inline-block shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STYLES[type]}`}>
      {FACILITY_TYPE_LABELS[type]}
    </span>
  );
}
