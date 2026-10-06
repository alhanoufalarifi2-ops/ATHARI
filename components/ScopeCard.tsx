import Link from "next/link";
import { ImpactStats } from "@/lib/clusterStats";
import { NetworkIcon } from "./icons";

export default function ScopeCard({
  id,
  name,
  stats,
}: {
  id: string;
  name: string;
  stats: ImpactStats;
}) {
  const total = stats.clinical + stats.organizational;

  return (
    // grid-rows-[auto_1fr_auto] pins the name/icon row to the top and the
    // secondary stats row to the bottom at an identical position in every
    // card, regardless of scope name length or number of digits — the middle
    // row absorbs whatever height is left instead of margins doing that job.
    <Link
      href={`/cluster/scope/${id}`}
      className="grid min-h-[248px] min-w-0 grid-cols-1 grid-rows-[auto_1fr_auto] gap-2.5 rounded-xl2 border border-[#DCE9F7] bg-gradient-to-b from-white to-[#F8FBFE] p-4 shadow-card transition-shadow hover:border-sky hover:shadow-cardHover"
    >
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="truncate text-base font-extrabold leading-tight text-navy">{name}</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky/35 to-sky-light/15 text-sky-dark">
          <NetworkIcon className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="flex flex-col justify-start">
        <span className="text-2xl font-extrabold leading-none text-navy">{total}</span>
        <span className="mt-1.5 text-[11px] text-navy/50">أثر معتمد</span>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px] text-navy/55">
        <span>{stats.facilityCount} منشأة</span>
        <span className="text-navy/25">|</span>
        <span>سريري {stats.clinical}</span>
        <span className="text-navy/25">|</span>
        <span>مؤسسي {stats.organizational}</span>
      </div>
    </Link>
  );
}
