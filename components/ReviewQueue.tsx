"use client";

import Header from "@/components/Header";
import OrgStatusBadge from "@/components/OrgStatusBadge";
import StatusBadge from "@/components/StatusBadge";
import { useAthariStore } from "@/lib/store";
import { ImpactStatus, Track } from "@/lib/types";
import { formatArabicDateTime } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

type Tab = ImpactStatus;

const TABS: { key: Tab; label: string }[] = [
  { key: "pending", label: "قيد المراجعة" },
  { key: "approved", label: "معتمد" },
  { key: "rejected", label: "غير معتمد" },
];

// Shared review-list UI for both /review (clinical) and /org/review
// (organizational) — each renders this with its own `impactType`, so the two
// queues stay fully independent while reusing the same Tabs/row/workflow.
export default function ReviewQueue({ impactType }: { impactType: Track }) {
  const role = useAthariStore((s) => s.role);
  const impacts = useAthariStore((s) => s.impacts);
  const organizationalImpacts = useAthariStore((s) => s.organizationalImpacts);
  const patients = useAthariStore((s) => s.patients);
  const initiatives = useAthariStore((s) => s.initiatives);
  const departments = useAthariStore((s) => s.departments);
  const expireOverdueRevisions = useAthariStore((s) => s.expireOverdueRevisions);

  // Lazy expiry (see lib/store.ts) — makes sure any "returned_for_revision"
  // record whose 7-day deadline has passed drops out of the active workload
  // as soon as a reviewer opens either queue, without a backend scheduler.
  useEffect(() => {
    expireOverdueRevisions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [tab, setTab] = useState<Tab>("pending");

  if (role !== "admin") {
    return (
      <div>
        <Header title="قائمة المراجعة" />
        <div className="p-5 lg:p-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
            هذه الصفحة مخصصة لدور «ATHARI Admin/Reviewer» فقط. استخدم مبدّل الدور أعلى الصفحة للاطّلاع عليها.
          </div>
        </div>
      </div>
    );
  }

  const deptNames = (ids: string[]) =>
    ids.map((id) => departments.find((d) => d.id === id)?.name ?? id).join("، ");

  // Clinical rows show the impact's own Submitting Department / الإدارة
  // المقدّمة للأثر — never Participating Departments (a separate concept;
  // see lib/types.ts). Legacy records created before submittingDepartment
  // existed fall back to the patient's stored department.
  const submittingDepartmentFor = (i: (typeof impacts)[number]) => {
    if (i.submittingDepartment) return i.submittingDepartment;
    const patient = patients.find((p) => p.id === i.patientId);
    return patient ? departments.find((d) => d.id === patient.department)?.name ?? "" : "";
  };

  const rows =
    impactType === "clinical"
      ? impacts.map((i) => ({
          id: i.id,
          // MRN only — the patient's name is never displayed (see Patient.name).
          title: `رقم الملف الطبي: ${patients.find((p) => p.id === i.patientId)?.mrn ?? "غير معروف"}`,
          subtitle: i.currentOutcome,
          departments: submittingDepartmentFor(i),
          createdAt: i.createdAt,
          status: i.status,
          impactNumber: i.impactNumber,
        }))
      : organizationalImpacts.map((i) => ({
          id: i.id,
          title: initiatives.find((init) => init.id === i.initiativeId)?.name ?? "غير معروف",
          subtitle: i.resultingChange,
          departments: deptNames(i.departments),
          createdAt: i.createdAt,
          status: i.status,
          impactNumber: i.impactNumber,
        }));

  const pendingCount = rows.filter((r) => r.status === "pending").length;

  const visibleRows = rows
    .filter((r) => r.status === tab)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <Header
        title={impactType === "clinical" ? "قائمة المراجعة — الأثر السريري" : "قائمة المراجعة — الأثر المؤسسي"}
        subtitle={`${pendingCount} عنصر بانتظار المراجعة`}
      />

      <div className="p-5 lg:p-8">
        <div className="mb-5 flex gap-2 border-b border-navy/5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === t.key ? "border-sky text-navy" : "border-transparent text-navy/40 hover:text-navy/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {visibleRows.map((row) => (
            <Link
              key={row.id}
              href={`/review/${row.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-navy/5 bg-white p-4 shadow-card transition-shadow hover:shadow-cardHover sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  {row.departments && <p className="truncate text-xs text-navy/40">{row.departments}</p>}
                  {row.impactNumber && (
                    <span
                      className="inline-flex items-center rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-bold text-navy"
                      dir="ltr"
                    >
                      {row.impactNumber}
                    </span>
                  )}
                </div>
                <p className="truncate text-sm font-bold text-navy">{row.title}</p>
                <p className="truncate text-xs text-navy/50">{row.subtitle}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-[11px] text-navy/40">{formatArabicDateTime(row.createdAt)}</span>
                {impactType === "clinical" ? (
                  <StatusBadge status={row.status} />
                ) : (
                  <OrgStatusBadge status={row.status} />
                )}
              </div>
            </Link>
          ))}
          {visibleRows.length === 0 && (
            <div className="rounded-xl2 border border-dashed border-navy/15 bg-white p-10 text-center text-navy/40">
              لا توجد طلبات في هذا التصنيف حاليًا.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
