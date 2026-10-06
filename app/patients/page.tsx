"use client";

import Header from "@/components/Header";
import { SearchIcon } from "@/components/icons";
import { useAthariStore } from "@/lib/store";
import { PATIENT_STATUS_LABELS } from "@/lib/types";
import { formatArabicDate } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export default function PatientsPage() {
  const patients = useAthariStore((s) => s.patients);
  const departments = useAthariStore((s) => s.departments);
  const [query, setQuery] = useState("");

  const deptName = (id: string) => departments.find((d) => d.id === id)?.name ?? id;

  const filtered = patients.filter((p) => p.mrn.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <Header title="المرضى" subtitle="قائمة المرضى ورحلاتهم العلاجية الموثقة" />

      <div className="p-5 lg:p-8">
        <div className="mb-5 relative max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 end-3.5 h-4 w-4 -translate-y-1/2 text-navy/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث برقم الملف (MRN)..."
            className="w-full rounded-xl2 border border-navy/10 bg-white px-4 py-3 pe-10 text-sm text-navy shadow-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-navy/5 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead>
                <tr className="border-b border-navy/5 bg-bgsoft/60 text-xs text-navy/50">
                  <th className="px-5 py-4 font-semibold">MRN</th>
                  <th className="px-5 py-4 font-semibold">تاريخ الدخول</th>
                  <th className="px-5 py-4 font-semibold">القسم</th>
                  <th className="px-5 py-4 font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/5">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="cursor-pointer transition-colors hover:bg-bgsoft"
                  onClick={() => (window.location.href = `/patients/${p.id}`)}
                >
                  <td className="px-5 py-4 font-mono text-navy/70">
                    <Link href={`/patients/${p.id}`} className="hover:underline">
                      {p.mrn}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-navy/60">{formatArabicDate(p.admissionDate)}</td>
                  <td className="px-5 py-4 text-navy/60">{deptName(p.department)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        p.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : p.status === "discharged"
                          ? "bg-navy/10 text-navy/60"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {PATIENT_STATUS_LABELS[p.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-navy/40">
                    لا توجد نتائج مطابقة.
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
