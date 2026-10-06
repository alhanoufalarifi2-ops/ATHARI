"use client";

import Header from "@/components/Header";
import Timeline from "@/components/Timeline";
import { FileBarChartIcon, PlusCircleIcon } from "@/components/icons";
import { useAthariStore } from "@/lib/store";
import { PATIENT_STATUS_LABELS } from "@/lib/types";
import { formatArabicDate } from "@/lib/utils";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

export default function PatientJourneyPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const patients = useAthariStore((s) => s.patients);
  const impacts = useAthariStore((s) => s.impacts);
  const departments = useAthariStore((s) => s.departments);

  const patient = patients.find((p) => p.id === params.id);
  const deptName = (id: string) => departments.find((d) => d.id === id)?.name ?? id;

  if (!patient) {
    return (
      <div>
        <Header title="رحلة المريض" />
        <div className="p-6 text-navy/50">لم يتم العثور على المريض.</div>
      </div>
    );
  }

  // A Patient Journey (admission episode) is identified by MRN + Admission
  // Date, never the MRN/patient alone — the same patient can have several
  // separate admissions over time (see lib/types.ts's Impact.admissionDate).
  // Legacy impacts created before that field existed fall back to the
  // patient's own stored admission date, so they still resolve to exactly
  // one (historical) journey rather than disappearing.
  const admissionDateFor = (impact: { admissionDate?: string }) => impact.admissionDate ?? patient.admissionDate;

  const allApprovedImpacts = impacts.filter((i) => i.patientId === patient.id && i.status === "approved");
  const admissionDates = Array.from(new Set(allApprovedImpacts.map(admissionDateFor))).sort((a, b) =>
    b.localeCompare(a)
  );
  const selectedAdmission = searchParams.get("admission") ?? admissionDates[0] ?? patient.admissionDate;
  const journeyImpacts = allApprovedImpacts.filter((i) => admissionDateFor(i) === selectedAdmission);

  return (
    <div>
      <Header
        title="رحلة المريض"
        subtitle={`رقم الملف ${patient.mrn}`}
        actions={
          <Link href="/review" className="text-xs font-semibold text-sky-dark hover:underline">
            ← العودة لقائمة المراجعة
          </Link>
        }
      />

      <div className="space-y-6 p-5 lg:space-y-8 lg:p-8">
        {/* Historical journeys stay accessible under the same MRN, but each
            one's impacts are shown separately — never mixed together. */}
        {admissionDates.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-navy/50">نوبات الدخول:</span>
            {admissionDates.map((date) => (
              <Link
                key={date}
                href={`/patients/${patient.id}?admission=${date}`}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  date === selectedAdmission
                    ? "border-sky bg-sky text-navy"
                    : "border-navy/10 text-navy/60 hover:bg-bgsoft"
                }`}
              >
                {formatArabicDate(date)}
              </Link>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-5 rounded-2xl border border-navy/5 bg-white p-6 shadow-card sm:grid-cols-4">
          <div>
            <p className="text-xs text-navy/40">تاريخ الدخول</p>
            <p className="font-semibold text-navy">{formatArabicDate(selectedAdmission)}</p>
          </div>
          <div>
            <p className="text-xs text-navy/40">القسم الأساسي</p>
            <p className="font-semibold text-navy">{deptName(patient.department)}</p>
          </div>
          <div>
            <p className="text-xs text-navy/40">الحالة</p>
            <p className="font-semibold text-navy">{PATIENT_STATUS_LABELS[patient.status]}</p>
          </div>
          <div>
            <p className="text-xs text-navy/40">عدد الآثار المعتمدة</p>
            <p className="font-semibold text-navy">{journeyImpacts.length}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-navy">الخط الزمني للرحلة العلاجية</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/reports/patient/${patient.id}?admission=${selectedAdmission}`}
              className="inline-flex items-center gap-2 rounded-xl2 border border-navy/10 bg-white px-4 py-2 text-xs font-semibold text-navy hover:bg-bgsoft"
            >
              <FileBarChartIcon className="h-4 w-4" />
              تقرير رحلة المريض
            </Link>
            <Link
              href={`/add-impact?patientId=${patient.id}`}
              className="inline-flex items-center gap-2 rounded-xl2 bg-sky px-4 py-2 text-xs font-semibold text-navy hover:bg-sky-dark hover:text-white"
            >
              <PlusCircleIcon className="h-4 w-4" />
              إضافة أثر لهذا المريض
            </Link>
          </div>
        </div>

        <Timeline impacts={journeyImpacts} departments={departments} patients={patients} />
      </div>
    </div>
  );
}
