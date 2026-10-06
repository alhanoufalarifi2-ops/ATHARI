"use client";

import Header from "@/components/Header";
import ReportHeader from "@/components/ReportHeader";
import Timeline from "@/components/Timeline";
import { useAthariStore } from "@/lib/store";
import { formatArabicDate } from "@/lib/utils";
import { useParams, useSearchParams } from "next/navigation";

// Arabic numeral agreement for the two count phrases below — singular (1),
// dual (2), counted plural (3-10), and singular tamyiz (0 or 11+) each take
// a different noun/adjective form. Not a general-purpose Arabic pluralizer
// (only these two specific phrases are needed here), but correct for the
// full range a demo patient journey would realistically show.
function arabicOutcomesPhrase(count: number): string {
  if (count === 0) return "لم يتم توثيق أي نتيجة سريرية مهمة بعد";
  if (count === 1) return "تم توثيق نتيجة سريرية مهمة واحدة";
  if (count === 2) return "تم توثيق نتيجتين سريريتين مهمتين";
  if (count <= 10) return `تم توثيق ${count} نتائج سريرية مهمة`;
  return `تم توثيق ${count} نتيجة سريرية مهمة`;
}

function arabicDepartmentsPhrase(count: number): string {
  if (count === 0) return "دون مشاركة أقسام علاجية مسجّلة";
  if (count === 1) return "بمشاركة قسم علاجي واحد";
  if (count === 2) return "بمشاركة قسمين علاجيين";
  if (count <= 10) return `بمشاركة ${count} أقسام علاجية`;
  return `بمشاركة ${count} قسمًا علاجيًا`;
}

export default function PatientReportPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const patients = useAthariStore((s) => s.patients);
  const impacts = useAthariStore((s) => s.impacts);
  const departments = useAthariStore((s) => s.departments);

  const patient = patients.find((p) => p.id === params.id);

  if (!patient) {
    return (
      <div>
        <Header title="تقرير رحلة المريض" />
        <div className="p-6 text-navy/50">لم يتم العثور على المريض.</div>
      </div>
    );
  }

  // A Journey Report covers exactly one admission episode (MRN + Admission
  // Date) — never impacts from a previous or subsequent admission. Legacy
  // impacts without their own admissionDate fall back to the patient's
  // stored admission date, same convention as app/patients/[id].
  const admissionDateFor = (impact: { admissionDate?: string }) => impact.admissionDate ?? patient.admissionDate;
  const allApprovedImpacts = impacts.filter((i) => i.patientId === patient.id && i.status === "approved");
  const admissionDates = Array.from(new Set(allApprovedImpacts.map(admissionDateFor))).sort((a, b) =>
    b.localeCompare(a)
  );
  const selectedAdmission = searchParams.get("admission") ?? admissionDates[0] ?? patient.admissionDate;
  const patientImpacts = allApprovedImpacts.filter((i) => admissionDateFor(i) === selectedAdmission);

  // One clearly-defined department metric: every distinct department NAME
  // touching this journey, whether it appears as an impact's Submitting
  // Department or as one of its Participating Departments — deduplicated so
  // the same department is never counted twice under its two different roles.
  const involvedDepartmentNames = new Set(
    patientImpacts.flatMap((i) => [i.submittingDepartment, ...i.departments].filter((d): d is string => !!d))
  );

  return (
    <div>
      <Header title="تقرير رحلة المريض" subtitle={`رقم الملف ${patient.mrn}`} />

      <div className="p-4 sm:p-6 print:p-0">
        <div className="mx-auto max-w-3xl rounded-xl2 bg-white p-5 shadow-card print:shadow-none sm:p-8">
          <ReportHeader title="تقرير رحلة المريض" period={`رقم الملف: ${patient.mrn}`} />

          <p className="mb-6 leading-7 text-navy/80">
            منذ دخول المريض بتاريخ {formatArabicDate(selectedAdmission)}، {arabicOutcomesPhrase(patientImpacts.length)}
            ، {arabicDepartmentsPhrase(involvedDepartmentNames.size)}.
          </p>

          <Timeline impacts={patientImpacts} departments={departments} patients={patients} />
        </div>
      </div>
    </div>
  );
}
