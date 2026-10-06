import { Facility, Scope } from "./types";

// ---------------------------------------------------------------------------
// Cluster structure — النطاقات والمنشآت الصحية التابعة للتجمع الصحي.
// هذا الملف هو المصدر الوحيد لهيكل Cluster/Scope/Facility. أي تغيير مستقبلي
// في تبعية منشأة لنطاق، أو إضافة/إعادة تسمية نطاق أو منشأة، يتم هنا فقط —
// لا صفحة ولا مكوّن يجب أن يكتب اسم نطاق أو منشأة مباشرة (Hardcoded).
// ---------------------------------------------------------------------------

export const scopes: Scope[] = [
  { id: "riyadh", name: "نطاق الرياض" },
  { id: "kharj", name: "نطاق الخرج" },
  { id: "quwaiyah", name: "نطاق القويعية" },
  { id: "wadi-dawasir", name: "نطاق وادي الدواسر" },
];

// Cluster-level entity — sits above the Scope/Facility layer entirely (not
// tied to any scope or facility), so the submission wizard offers it as a
// standalone alternative to picking a scope, skipping facility-type/facility
// selection and going straight to department.
export const CLUSTER_EXECUTIVE_ADMINISTRATION_ID = "cluster-executive-administration";
export const CLUSTER_EXECUTIVE_ADMINISTRATION_NAME = "الإدارة التنفيذية للتجمع";
export const CLUSTER_EXECUTIVE_ADMINISTRATION_NAME_EN = "Cluster Executive Administration";

export const facilities: Facility[] = [
  // نطاق الرياض
  { id: "ksmc", name: "مدينة الملك سعود الطبية", type: "medical_city", scopeId: "riyadh" },
  { id: "king-salman-hospital", name: "مستشفى الملك سلمان", type: "hospital", scopeId: "riyadh" },
  { id: "al-eman-hospital", name: "مستشفى الإيمان العام", type: "hospital", scopeId: "riyadh" },
  {
    id: "imam-abdulrahman-alfaisal-hospital",
    name: "مستشفى الإمام عبدالرحمن الفيصل",
    type: "hospital",
    scopeId: "riyadh",
  },
  {
    id: "riyadh-long-term-care-hospital",
    name: "مستشفى الرعاية المديدة بالرياض",
    type: "hospital",
    scopeId: "riyadh",
  },

  // نطاق الخرج
  { id: "king-khalid-kharj-hospital", name: "مستشفى الملك خالد بالخرج", type: "hospital", scopeId: "kharj" },
  {
    id: "kharj-maternity-children-hospital",
    name: "مستشفى الولادة والأطفال بالخرج",
    type: "hospital",
    scopeId: "kharj",
  },
  {
    id: "erada-mental-health-kharj-hospital",
    name: "مستشفى إرادة والصحة النفسية بالخرج",
    type: "hospital",
    scopeId: "kharj",
  },
  {
    id: "prince-salman-bin-mohammed-aldilam-hospital",
    name: "مستشفى الأمير سلمان بن محمد بالدلم",
    type: "hospital",
    scopeId: "kharj",
  },
  { id: "hotat-bani-tamim-hospital", name: "مستشفى حوطة بني تميم العام", type: "hospital", scopeId: "kharj" },
  { id: "al-aflaj-hospital", name: "مستشفى الأفلاج العام", type: "hospital", scopeId: "kharj" },
  { id: "al-hareeq-hospital", name: "مستشفى الحريق العام", type: "hospital", scopeId: "kharj" },

  // نطاق القويعية
  { id: "al-quwaiyah-hospital", name: "مستشفى القويعية العام", type: "hospital", scopeId: "quwaiyah" },
  { id: "al-rain-hospital", name: "مستشفى الرين العام", type: "hospital", scopeId: "quwaiyah" },
  { id: "ruwaidah-al-ard-hospital", name: "مستشفى رويضة العرض العام", type: "hospital", scopeId: "quwaiyah" },
  { id: "al-muzahmiyah-hospital", name: "مستشفى المزاحمية العام", type: "hospital", scopeId: "quwaiyah" },
  { id: "al-khasirah-hospital", name: "مستشفى الخاصرة العام", type: "hospital", scopeId: "quwaiyah" },

  // نطاق وادي الدواسر
  { id: "wadi-dawasir-hospital", name: "مستشفى وادي الدواسر العام", type: "hospital", scopeId: "wadi-dawasir" },
  { id: "al-sulayyil-hospital", name: "مستشفى السليل العام", type: "hospital", scopeId: "wadi-dawasir" },
];

export function getScopeById(id: string): Scope | undefined {
  return scopes.find((s) => s.id === id);
}

export function getFacilitiesByScope(scopeId: string): Facility[] {
  return facilities.filter((f) => f.scopeId === scopeId);
}

// Impact figures (cluster / scope / facility) are NOT stored here — they are
// computed from the actual approved records in lib/clusterStats.ts.
