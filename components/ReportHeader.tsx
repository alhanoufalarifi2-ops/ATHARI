import { formatArabicDate } from "@/lib/utils";
import HospitalLogo from "./HospitalLogo";
import { LeafMark } from "./icons";
import PrintButton from "./PrintButton";

// Same header language as the Scope/Facility Report (an icon-in-navy-box +
// title block on one side, the relevant logo + PrintButton on the other),
// extended with the same "تاريخ الإصدار" line those reports show — so every
// report in ATHARI states both the period it covers (when given) and when
// the document itself was generated.
export default function ReportHeader({
  title,
  period,
  tagline = "أثري | ATHARI — توثيق الأثر السريري",
}: {
  title: string;
  period?: string;
  tagline?: string;
}) {
  const generatedAt = formatArabicDate(new Date().toISOString());
  return (
    <div className="mb-6 flex flex-col gap-4 border-b-2 border-navy pb-5 print:break-inside-avoid sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl2 bg-navy text-white">
          <LeafMark className="h-8 w-8" />
        </div>
        <div>
          <p className="text-xs font-semibold text-sky-dark">{tagline}</p>
          <h1 className="text-xl font-extrabold text-navy">{title}</h1>
          {period && <p className="text-sm font-semibold text-navy/70">{period}</p>}
          <p className="text-xs text-navy/40">تاريخ الإصدار: {generatedAt}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-left text-[11px] leading-4 text-navy/50">
          مستشفى الرعاية المديدة
          <br />
          LONG TERM CARE HOSPITAL
        </div>
        <HospitalLogo width={48} />
        <PrintButton />
      </div>
    </div>
  );
}
