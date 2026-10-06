import { Facility, Scope } from "@/lib/types";
import { Language } from "./translations";

// Display-only English names for the predefined Zones (Scope) and Hospitals
// (Facility) defined in lib/clusterData.ts, used ONLY by the employee-facing
// /submit journey when the visitor has switched to English. This never
// touches lib/clusterData.ts itself — ids and the canonical Arabic `name`
// fields stay exactly as stored, so nothing here can affect matching,
// review pages, or saved records. A manually-typed PHC center name has no
// entry here (and never will) — it is free text entered by the employee and
// is always shown exactly as typed, in both languages.
export const SCOPE_NAMES_EN: Record<string, string> = {
  riyadh: "Riyadh Zone",
  kharj: "Al-Kharj Zone",
  quwaiyah: "Al-Quwaiyah Zone",
  "wadi-dawasir": "Wadi Al-Dawasir Zone",
};

export const FACILITY_NAMES_EN: Record<string, string> = {
  ksmc: "King Saud Medical City",
  "king-salman-hospital": "King Salman Hospital",
  "al-eman-hospital": "Al Eman General Hospital",
  "imam-abdulrahman-alfaisal-hospital": "Imam Abdulrahman Al Faisal Hospital",
  "riyadh-long-term-care-hospital": "Riyadh Long-Term Care Hospital",

  "king-khalid-kharj-hospital": "King Khalid Hospital in Al-Kharj",
  "kharj-maternity-children-hospital": "Al-Kharj Maternity and Children Hospital",
  "erada-mental-health-kharj-hospital": "Erada Mental Health Hospital in Al-Kharj",
  "prince-salman-bin-mohammed-aldilam-hospital": "Prince Salman bin Mohammed Hospital in Al-Dilam",
  "hotat-bani-tamim-hospital": "Hotat Bani Tamim General Hospital",
  "al-aflaj-hospital": "Al-Aflaj General Hospital",
  "al-hareeq-hospital": "Al-Hareeq General Hospital",

  "al-quwaiyah-hospital": "Al-Quwaiyah General Hospital",
  "al-rain-hospital": "Al-Rain General Hospital",
  "ruwaidah-al-ard-hospital": "Ruwaidah Al-Ard General Hospital",
  "al-muzahmiyah-hospital": "Al-Muzahmiyah General Hospital",
  "al-khasirah-hospital": "Al-Khasirah General Hospital",

  "wadi-dawasir-hospital": "Wadi Al-Dawasir General Hospital",
  "al-sulayyil-hospital": "Al-Sulayyil General Hospital",
};

export function scopeDisplayName(scope: Scope, language: Language): string {
  return language === "en" ? SCOPE_NAMES_EN[scope.id] ?? scope.name : scope.name;
}

export function facilityDisplayNameFor(facility: Facility, language: Language): string {
  return language === "en" ? FACILITY_NAMES_EN[facility.id] ?? facility.name : facility.name;
}
