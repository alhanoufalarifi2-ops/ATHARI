export function formatArabicDate(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
}

export function formatArabicDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
}

export function genId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

export function isSameMonth(iso: string, year: number, month: number): boolean {
  const d = new Date(iso);
  return d.getFullYear() === year && d.getMonth() === month;
}

export function isSameYear(iso: string, year: number): boolean {
  const d = new Date(iso);
  return d.getFullYear() === year;
}

// ---------------------------------------------------------------------------
// Department matching. `departments` on a record is a mixed bag: legacy seed
// records store department IDs ("pt"), every record submitted through the
// forms stores the free text the employee typed. These helpers resolve an ID
// to its registry name when it is one, and otherwise compare names by a
// normalized key, so that simple wording differences ("قسم العلاج الطبيعي" /
// "العلاج الطبيعي" / "علاج طبيعي", hamza/ta-marbuta variants, extra spaces,
// diacritics) are counted as ONE department — everywhere a department is
// counted or grouped (dashboards, reports, facility report).
// ---------------------------------------------------------------------------
export interface DepartmentRef {
  id: string;
  name: string;
}

const GENERIC_DEPARTMENT_WORDS = ["قسم", "اداره", "وحده"];

export function departmentKey(name: string): string {
  const words = name
    .normalize("NFKC")
    .replace(/[ً-ٰٟـ]/g, "") // tashkeel + tatweel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w.startsWith("وال") && w.length > 4 ? "و" + w.slice(3) : w.startsWith("ال") && w.length > 3 ? w.slice(2) : w));
  const meaningful = words.length > 1 && GENERIC_DEPARTMENT_WORDS.includes(words[0]) ? words.slice(1) : words;
  // spaces dropped on purpose: "علاج النطق والبلع" and "علاج النطق و البلع" are the same
  return meaningful.join("");
}

export function resolveDepartmentName(value: string, registry: DepartmentRef[]): string {
  const byId = registry.find((d) => d.id === value);
  return (byId ? byId.name : value).replace(/\s+/g, " ").trim();
}

// Distinct departments (first-seen wording kept as the label), in first-seen order.
export function uniqueDepartments(values: string[], registry: DepartmentRef[]): string[] {
  const seen = new Map<string, string>();
  for (const v of values) {
    const label = resolveDepartmentName(v, registry);
    if (!label) continue;
    const key = departmentKey(label);
    if (key && !seen.has(key)) seen.set(key, label);
  }
  return [...seen.values()];
}

// How many results each department took part in (a result counts once per
// department even if the department is typed twice on it), most first.
export function countResultsByDepartment(
  lists: string[][],
  registry: DepartmentRef[]
): { label: string; count: number }[] {
  const rows = new Map<string, { label: string; count: number }>();
  for (const list of lists) {
    for (const label of uniqueDepartments(list, registry)) {
      const key = departmentKey(label);
      const row = rows.get(key);
      if (row) row.count += 1;
      else rows.set(key, { label, count: 1 });
    }
  }
  return [...rows.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "ar"));
}

// Report period filters never offer the future: a year after the current one
// is not selectable, and within the current year only months up to the
// current month are. `now` is read fresh on every render, so a new month
// becomes selectable on its own once the calendar rolls over.
export function reportYearOptions(now: Date = new Date()): number[] {
  const current = now.getFullYear();
  return [current - 2, current - 1, current];
}

export function isFutureMonth(year: number, month: number, now: Date = new Date()): boolean {
  return year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth());
}

export const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];
