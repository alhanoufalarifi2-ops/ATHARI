"use client";

import Header from "@/components/Header";
import { SearchIcon } from "@/components/icons";
import { useAthariStore } from "@/lib/store";
import { ORG_IMPACT_TYPE_LABELS } from "@/lib/types";
import { formatArabicDate } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export default function InitiativesPage() {
  const initiatives = useAthariStore((s) => s.initiatives);
  const departments = useAthariStore((s) => s.departments);
  const organizationalImpacts = useAthariStore((s) => s.organizationalImpacts);
  const [query, setQuery] = useState("");

  const deptName = (id: string) => departments.find((d) => d.id === id)?.name ?? id;
  const approvedCount = (initiativeId: string) =>
    organizationalImpacts.filter((i) => i.initiativeId === initiativeId && i.status === "approved").length;

  const filtered = initiatives.filter((i) => i.name.includes(query));

  return (
    <div>
      <Header title="المبادرات" subtitle="قائمة المبادرات والمشاريع المؤسسية الموثقة" />

      <div className="p-5 lg:p-8">
        <div className="mb-5 relative max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 end-3.5 h-4 w-4 -translate-y-1/2 text-navy/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم المبادرة..."
            className="w-full rounded-xl2 border border-navy/10 bg-white px-4 py-3 pe-10 text-sm text-navy shadow-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-navy/5 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead>
                <tr className="border-b border-navy/5 bg-bgsoft/60 text-xs text-navy/50">
                  <th className="px-5 py-4 font-semibold">اسم المبادرة</th>
                  <th className="px-5 py-4 font-semibold">القسم المسؤول</th>
                  <th className="px-5 py-4 font-semibold">النوع</th>
                  <th className="px-5 py-4 font-semibold">تاريخ البدء</th>
                  <th className="px-5 py-4 font-semibold">الآثار المعتمدة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/5">
                {filtered.map((init) => (
                  <tr
                    key={init.id}
                    className="cursor-pointer transition-colors hover:bg-bgsoft"
                    onClick={() => (window.location.href = `/org/initiatives/${init.id}`)}
                  >
                    <td className="px-5 py-4 font-semibold text-navy">
                      <Link href={`/org/initiatives/${init.id}`} className="hover:underline">
                        {init.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-navy/60">{deptName(init.department)}</td>
                    <td className="px-5 py-4 text-navy/60">{ORG_IMPACT_TYPE_LABELS[init.type]}</td>
                    <td className="px-5 py-4 text-navy/60">{formatArabicDate(init.startDate)}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-sky/15 px-3 py-1 text-xs font-semibold text-sky-dark">
                        {approvedCount(init.id)}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-navy/40">
                      لا توجد مبادرات موثّقة بعد. ابدأ بإضافة أثر مؤسسي جديد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
