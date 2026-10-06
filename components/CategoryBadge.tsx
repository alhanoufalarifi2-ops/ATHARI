import { ImpactCategory, CATEGORY_LABELS } from "@/lib/types";

export default function CategoryBadge({ category }: { category: ImpactCategory }) {
  return (
    <span className="inline-block rounded-full border border-sky/40 bg-sky/10 px-3 py-1 text-xs font-medium text-sky-dark">
      {CATEGORY_LABELS[category]}
    </span>
  );
}
