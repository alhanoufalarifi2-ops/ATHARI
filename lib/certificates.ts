import { SubmitterInfo } from "./types";

// One approved impact can have several people credited on it: the first entry
// in `submitters` is the creator ("Created by"), every later entry is a
// contributor. Each of them gets an independent certificate linked to the
// same impact, identified by a unique verification code derived from the
// Impact Number plus that person's position — `ATH-2026-00001-C1` (creator),
// `ATH-2026-00001-C2` (first contributor), and so on. The code is the
// certificate route's only parameter, and the QR on each certificate encodes
// the URL carrying it.
export function certificateCode(impactNumber: string, index: number): string {
  return `${impactNumber}-C${index + 1}`;
}

// A bare Impact Number (older links/QR codes issued before per-person
// certificates existed) resolves to the creator's certificate, C1.
export function parseCertificateCode(code: string): { impactNumber: string; index: number } {
  const match = code.match(/^(.+)-C(\d+)$/);
  if (!match) return { impactNumber: code, index: 0 };
  return { impactNumber: match[1], index: Math.max(0, Number(match[2]) - 1) };
}

export function recipientsOf(record: { submitters?: SubmitterInfo[]; submitter?: SubmitterInfo }): SubmitterInfo[] {
  if (record.submitters && record.submitters.length > 0) return record.submitters;
  return record.submitter ? [record.submitter] : [];
}
