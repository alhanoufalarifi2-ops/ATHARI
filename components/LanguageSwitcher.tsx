"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

// Only ever rendered within the employee-facing /submit journey (the wizard,
// and the Clinical/Organizational forms when reached through it) — see
// app/submit/layout.tsx and the isQrEntry checks in AddImpactForm /
// OrgAddImpactForm.
export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const optionClass = (active: boolean) =>
    `rounded-full px-2.5 py-1 transition-colors ${
      active ? "bg-navy text-white" : "text-navy/50 hover:text-navy"
    }`;

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-navy/10 bg-white p-0.5 text-xs font-semibold">
      <button type="button" onClick={() => setLanguage("ar")} className={optionClass(language === "ar")}>
        العربية
      </button>
      <button type="button" onClick={() => setLanguage("en")} className={optionClass(language === "en")}>
        English
      </button>
    </div>
  );
}
