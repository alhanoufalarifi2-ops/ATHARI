import { LanguageProvider } from "@/lib/i18n/LanguageContext";

// Wraps the whole employee-facing submission journey — /submit itself, plus
// /submit/clinical and /submit/organizational, which mount the same
// AddImpactForm/OrgAddImpactForm used internally at /add-impact and
// /org/add-impact. The provider persists the chosen language across
// client-side navigation between these routes, and a future /submit/track
// (Track Impact) page will sit under this same layout and reuse it
// automatically without any extra wiring.
export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
