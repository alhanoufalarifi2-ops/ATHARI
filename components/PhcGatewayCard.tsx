// Same visual family as FacilityCard, but this card represents ALL primary
// healthcare centers of a scope, not one measured facility — hence the
// "مجموعة مراكز" badge instead of a FacilityTypeBadge, and no clinical/
// organizational figures (there is no per-center data yet).
//
// Intentionally static for now: the PHC list page doesn't exist yet, so the
// card and its "عرض المراكز" action are not linked (a link would 404). Once
// that page is built, wrap this in a Link again.
//
// Same fixed min-h-[160px] sizing as FacilityCard (the Riyadh reference), so
// this card matches its row regardless of scope. `minHeightClassName` mirrors
// FacilityCard's per-scope override — see that component for context.
export default function PhcGatewayCard({
  minHeightClassName = "min-h-[160px]",
}: {
  scopeId?: string;
  minHeightClassName?: string;
}) {
  return (
    <div
      className={`flex ${minHeightClassName} flex-col justify-center rounded-xl2 border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-3 shadow-card`}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <span className="text-sm font-bold leading-tight text-navy">مراكز الرعاية الصحية الأولية</span>
        <span className="inline-block shrink-0 rounded-full border border-navy/10 bg-bgsoft px-2.5 py-0.5 text-[11px] font-medium text-navy/60">
          مجموعة مراكز
        </span>
      </div>
    </div>
  );
}
