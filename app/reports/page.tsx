"use client";

import Header from "@/components/Header";
import { CalendarIcon, SearchIcon, TrendingUpIcon, UsersIcon } from "@/components/icons";
import { useAthariStore } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";

export default function ReportsHubPage() {
  const patients = useAthariStore((s) => s.patients);
  const [query, setQuery] = useState("");

  const filtered = patients.filter((p) => p.mrn.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <Header title="التقارير" subtitle="اختر نوع التقرير المطلوب" />

      <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-3 lg:p-8">
        <Link
          href="/reports/monthly"
          className="rounded-xl2 border border-navy/5 bg-white p-6 shadow-card transition-shadow hover:shadow-cardHover"
        >
          <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl2 bg-sky/15 text-sky-dark">
            <CalendarIcon className="h-5 w-5" />
          </span>
          <h2 className="mb-1 font-bold text-navy">الأثر السريري الشهري</h2>
          <p className="text-sm text-navy/50">Monthly Clinical Impact — ملخص الآثار السريرية المعتمدة خلال الشهر الحالي.</p>
        </Link>

        <Link
          href="/reports/annual"
          className="rounded-xl2 border border-navy/5 bg-white p-6 shadow-card transition-shadow hover:shadow-cardHover"
        >
          <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl2 bg-navy/10 text-navy">
            <TrendingUpIcon className="h-5 w-5" />
          </span>
          <h2 className="mb-1 font-bold text-navy">الأثر السريري السنوي</h2>
          <p className="text-sm text-navy/50">Annual Clinical Impact — ملخص الآثار السريرية المعتمدة خلال السنة الحالية.</p>
        </Link>

        <div className="rounded-xl2 border border-navy/5 bg-white p-6 shadow-card">
          <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl2 bg-sky/15 text-sky-dark">
            <UsersIcon className="h-5 w-5" />
          </span>
          <h2 className="mb-2 font-bold text-navy">تقرير رحلة مريض</h2>
          <p className="mb-3 text-sm text-navy/50">Patient Journey Report — اختر مريضًا لعرض تقريره.</p>
          <div className="relative mb-3">
            <SearchIcon className="pointer-events-none absolute top-1/2 end-3 h-4 w-4 -translate-y-1/2 text-navy/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث برقم الملف MRN..."
              className="w-full rounded-xl2 border border-navy/10 px-3 py-2 pe-9 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
            />
          </div>
          <div className="max-h-40 space-y-1 overflow-y-auto">
            {filtered.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                href={`/reports/patient/${p.id}`}
                className="block rounded-lg px-3 py-2 text-sm text-navy hover:bg-bgsoft"
              >
                رقم الملف: {p.mrn}
              </Link>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-navy/40">لا توجد نتائج مطابقة.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
