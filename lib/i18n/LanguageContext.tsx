"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Language, translate, TranslationKey } from "./translations";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  dir: "rtl" | "ltr";
}

// Default value used whenever useLanguage() is called OUTSIDE a
// LanguageProvider — i.e. everywhere except the employee-facing /submit
// journey (see app/submit/layout.tsx). It always resolves to Arabic with no
// way to switch, so shared components (AddImpactForm, OrgAddImpactForm,
// SubmitterInfoFields) render byte-for-byte the same Arabic text as before
// when mounted at /add-impact, /org/add-impact, or the review detail page.
const defaultValue: LanguageContextValue = {
  language: "ar",
  setLanguage: () => {},
  t: (key) => translate("ar", key),
  dir: "rtl",
};

const LanguageContext = createContext<LanguageContextValue>(defaultValue);

const STORAGE_KEY = "athari-employee-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");

  // Restored client-side only — keeps SSR/first-paint markup identical to the
  // Arabic default, then applies the visitor's last choice for this device.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "ar" || stored === "en") setLanguageState(stored);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
  };

  const dir: "rtl" | "ltr" = language === "ar" ? "rtl" : "ltr";
  const t = (key: TranslationKey) => translate(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      <div dir={dir} lang={language}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
