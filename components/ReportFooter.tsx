// Shared closing block for every printable report except the Scope Report
// (kept exactly as-is per its own design freeze) — same ATHARI tagline
// already used on the Cover slide and the Impact Certificate, so every
// report ends on one consistent, recognizable note instead of just stopping
// after its last section.
export default function ReportFooter() {
  return (
    <div className="mt-8 border-t border-navy/10 pt-4 text-center print:break-inside-avoid">
      <p className="text-xs font-medium text-navy/45">نوثّق الأثر، نحفظ الإنجاز، ونُبرز ما صنع الفرق</p>
      <p className="mt-1 text-[11px] font-semibold text-navy/30">أثري | ATHARI</p>
    </div>
  );
}
