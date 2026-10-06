"use client";

import Header from "@/components/Header";
import { BuildingIcon, CalendarIcon, SearchIcon, TrendingUpIcon } from "@/components/icons";
import { useAthariStore } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";

export default function OrgReportsHubPage() {
  const initiatives = useAthariStore((s) => s.initiatives);
  const [query, setQuery] = useState("");

  const filtered = initiatives.filter((i) => i.name.includes(query));

  return (
    <div>
      <Header title="التقارير" subtitle="اختر نوع التقرير المطلوب" />

      <div className="p-5 lg:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Link
            href="/org/reports/monthly"
            className="flex h-full flex-col justify-center rounded-xl2 border border-navy/5 bg-white p-6 shadow-card transition-shadow hover:shadow-cardHover"
          >
            <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl2 bg-sky/15 text-sky-dark">
              <CalendarIcon className="h-5 w-5" />
            </span>
            <h2 className="mb-1 font-bold text-navy">الأثر المؤسسي الشهري</h2>
            <p className="text-sm text-navy/50">Monthly Organizational Impact — ملخص الآثار المؤسسية المعتمدة خلال الشهر الحالي.</p>
          </Link>

          <Link
            href="/org/reports/annual"
            className="flex h-full flex-col justify-center rounded-xl2 border border-navy/5 bg-white p-6 shadow-card transition-shadow hover:shadow-cardHover"
          >
            <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl2 bg-navy/10 text-navy">
              <TrendingUpIcon className="h-5 w-5" />
            </span>
            <h2 className="mb-1 font-bold text-navy">الأثر المؤسسي السنوي</h2>
            <p className="text-sm text-navy/50">Annual Organizational Impact — ملخص الآثار المؤسسية المعتمدة خلال السنة الحالية.</p>
          </Link>

          <div className="flex h-full flex-col rounded-xl2 border border-navy/5 bg-white p-6 shadow-card">
            <span className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-xl2 bg-sky/15 text-sky-dark">
              <BuildingIcon className="h-5 w-5" />
            </span>
            <h2 className="mb-1 font-bold text-navy">تقرير مبادرة</h2>
            <p className="mb-2 text-sm text-navy/50">Initiative Report — اختر مبادرة لعرض تقريرها.</p>
            <div className="relative mb-2">
              <SearchIcon className="pointer-events-none absolute top-1/2 end-3 h-4 w-4 -translate-y-1/2 text-navy/30" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث باسم المبادرة..."
                className="w-full rounded-xl2 border border-navy/10 px-3 py-2 pe-9 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
              />
            </div>
            <div className="max-h-24 space-y-1 overflow-y-auto">
              {filtered.slice(0, 6).map((init) => (
                <Link
                  key={init.id}
                  href={`/org/reports/initiative/${init.id}`}
                  className="block rounded-lg px-3 py-2 text-sm text-navy hover:bg-bgsoft"
                >
                  {init.name}
                </Link>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-2 text-sm text-navy/40">لا توجد نتائج مطابقة.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
