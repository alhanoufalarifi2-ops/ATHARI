// Public demo build: every record is fictional, stored only in the visitor's
// own browser (localStorage), and the role switcher is open to anyone. A slim
// bilingual strip states this on every screen (it works inside and outside
// the /submit LanguageProvider, so it is a single static line) and is hidden
// when printing so reports and certificates stay clean.
export default function DemoNotice() {
  return (
    <div
      role="note"
      className="bg-amber-50 px-3 py-1.5 text-center text-[11px] font-semibold leading-5 text-amber-900 print:hidden"
    >
      <span>نسخة تجريبية (Demo): جميع البيانات المعروضة تجريبية وغير حقيقية.</span>{" "}
      <span dir="ltr" className="inline-block">
        This is a demo; all data is fictional.
      </span>
    </div>
  );
}
