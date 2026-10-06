// A short line under the cluster / scope / facility dashboards and reports:
// their figures are computed from the real approved records, but in this demo
// build those records are the fictional sample data (plus whatever the visitor
// submits in their own browser). Kept visible when printing so a printed
// report is never mistaken for operational data.
export default function DemoDataNote() {
  return (
    <p
      role="note"
      className="rounded-xl2 border border-amber-200 bg-amber-50 px-3 py-2 text-center text-[11px] font-semibold leading-5 text-amber-900"
    >
      الأرقام المعروضة مبنية على بيانات تجريبية لأغراض العرض وليست بيانات تشغيلية فعلية.
    </p>
  );
}
