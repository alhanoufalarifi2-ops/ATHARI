export type Role = "contributor" | "admin";

// "returned_for_revision" and "closed_expired" support the Review & Track
// Impact workflow: a reviewer can send a pending request back to the
// employee for changes (with a mandatory reason + a 7-calendar-day
// deadline); if the employee doesn't resubmit in time, the prototype's
// lazy-expiry check (see expireOverdueRevisions in lib/store.ts) flips it to
// "closed_expired" — closed, excluded from approved KPIs, and out of the
// reviewer's active queue, but never deleted.
export type ImpactStatus = "pending" | "approved" | "rejected" | "returned_for_revision" | "closed_expired";

// A lightweight, append-only trail of what happened to an impact request,
// used to render the employee-facing Track Impact timeline. Optional on
// existing records — legacy Impact/OrganizationalImpact rows created before
// this field existed simply have no entries, and the timeline is synthesized
// from `status`/`createdAt`/`reviewedAt` instead (see app/submit/track).
export type ReviewHistoryEventType =
  | "submitted"
  | "returned_for_revision"
  | "resubmitted"
  | "edited"
  | "approved"
  | "rejected"
  | "closed_expired";

// Who made the change behind a "resubmitted" or "edited" entry — there is no
// authenticated per-user identity in this prototype, so this only captures
// which SIDE of the workflow acted: the employee (via Edit & Resubmit after
// Return for Revision) or the reviewer (via the inline edit on a pending
// request in Review Details).
export type ReviewHistoryActor = "submitter" | "reviewer";

// One field-level change captured for an "edited"/"resubmitted" entry.
// `field` is an internal key (see AUDIT_FIELD_LABELS in
// lib/i18n/translations.ts for its bilingual display label); previousValue/
// newValue are already display-formatted strings (arrays joined, submitter
// lists reduced to names, empty values shown as "—") rather than raw data,
// so the Track Impact timeline can render them directly.
export interface ReviewHistoryFieldChange {
  field: string;
  previousValue: string;
  newValue: string;
}

export interface ReviewHistoryEntry {
  type: ReviewHistoryEventType;
  at: string; // ISO datetime
  reason?: string; // reviewer's reason — set for "returned_for_revision" and "rejected"
  revisionDeadline?: string; // ISO datetime — set only for "returned_for_revision"
  actor?: ReviewHistoryActor; // set for "resubmitted" and "edited"
  changes?: ReviewHistoryFieldChange[]; // set when at least one field actually changed
}

export type ImpactCategory =
  | "mobility"
  | "respiratory"
  | "neurological"
  | "nutrition"
  | "wound"
  | "functional"
  | "communication"
  | "other";

export interface Department {
  id: string;
  name: string;
}

// Who filled in the submission form — captured on both tracks with the same
// shape so a later return-for-edit / tracking phase can reuse one contact
// model instead of two parallel ones. Optional on the record types below
// because pre-existing seed/mock records were created before this field
// existed; every NEW submission from the forms always fills it in.
export interface SubmitterInfo {
  name: string;
  phone: string;
  email: string;
  jobTitle: string;
}

export interface Patient {
  id: string;
  mrn: string;
  // Legacy field — no longer collected or displayed anywhere in the UI (MRN
  // is now the only patient identifier). Kept only so pre-existing records
  // that already have a name don't lose data; every new patient is created
  // with name: "". Never render this field.
  name: string;
  admissionDate: string; // ISO date
  department: string; // department id
  status: "active" | "discharged" | "followup";
}

export interface Impact {
  id: string;
  patientId: string; // identifies the PATIENT (one row per MRN) — never the
  // admission episode by itself. See `admissionDate` below.
  // The admission-episode-defining fact for THIS impact. A single MRN
  // (Patient) can have multiple separate admission episodes over time —
  // "Patient Journey" = the (patientId, admissionDate) pair, derived at read
  // time (see app/patients/[id] and app/reports/patient/[id]), never a
  // separate stored entity or a duplicated Patient record. Optional so
  // legacy records (created before per-impact admission dates existed) fall
  // back to the shared Patient.admissionDate for display/grouping.
  admissionDate?: string; // ISO date
  eventDate: string; // ISO date — the date of THIS clinical event/outcome,
  // never earlier than the journey's admissionDate and never in the future
  // (enforced at submission time only — see AddImpactForm; existing/legacy
  // records are never validated or blocked from displaying).
  previousStatus: string;
  whatChanged: string;
  currentOutcome: string;
  category: ImpactCategory; // primary/first selected type — kept populated on every
  // record (including multi-select ones) so legacy single-value consumers
  // (dashboards, reports, Timeline) keep working unchanged.
  categories?: ImpactCategory[]; // full multi-select list; optional so legacy
  // records (created before multi-select) fall back to [category]. When
  // present, always non-empty and categories[0] === category.
  categoryOtherText?: string; // required text when "other" is among the selected type(s)
  departments: string[]; // participating departments — free-text names entered
  // manually by the submitter (NOT department ids). The lead/primary
  // department stays a completely separate concept, resolved via
  // findOrCreateDepartment onto the Patient record above — never inferred
  // from this list.
  // The department/administration that submitted THIS specific impact — an
  // independent, per-impact fact. Multiple impacts sharing the same MRN
  // (same Patient Journey) can each have a different one; this is never
  // overwritten by, or compared against, another impact's value. Optional
  // so legacy records (created before this field existed) fall back to
  // display via the shared Patient.department in the UI.
  submittingDepartment?: string;
  description: string;
  documentationSource: string;
  documentationSourceOtherText?: string; // required text when documentationSource === "أخرى"
  evidenceRef?: string;
  submitter?: SubmitterInfo; // legacy single-submitter shape — old prototype
  // records may still only have this; never written by new submissions.
  submitters?: SubmitterInfo[]; // current shape — one or more people who
  // submitted/contributed to this impact.
  scope?: string; // employee-facing /submit context only — display name, not an id
  facility?: string; // same — a manually-typed PHC name or Cluster Executive
  // Administration display name, never translated/altered after submission.
  impactNumber?: string; // ATH-YYYY-##### — optional so legacy records (created
  // before this feature) keep working; see generateImpactNumber in lib/store.ts.
  status: ImpactStatus;
  rejectionReason?: string; // mandatory reviewer reason for "rejected" (Not Approved)
  returnReason?: string; // mandatory reviewer reason for "returned_for_revision"
  revisionDeadline?: string; // ISO datetime — 7 calendar days from the return date
  reviewHistory?: ReviewHistoryEntry[];
  createdAt: string; // ISO datetime
  reviewedAt?: string;
}

export const CATEGORY_LABELS: Record<ImpactCategory, string> = {
  mobility: "الحركة والتأهيل",
  respiratory: "الجهاز التنفسي",
  neurological: "الأعصاب",
  nutrition: "التغذية والبلع",
  wound: "التئام الجروح",
  functional: "الاستقلالية الوظيفية",
  communication: "التواصل",
  other: "نتيجة مهمة أخرى",
};

export const DOCUMENTATION_SOURCES: string[] = [
  "ملاحظات التمريض",
  "ملاحظات الطبيب المعالج",
  "تقرير العلاج الطبيعي",
  "تقرير أخصائي التغذية",
  "تقرير علاج النطق والبلع",
  "الملف الطبي الإلكتروني",
  "تقرير العلاج التنفسي",
  "أخرى",
];

export const PATIENT_STATUS_LABELS: Record<Patient["status"], string> = {
  active: "نشط",
  discharged: "تم الخروج",
  followup: "متابعة",
};

export const IMPACT_STATUS_LABELS: Record<ImpactStatus, string> = {
  pending: "قيد المراجعة",
  approved: "معتمد",
  rejected: "غير مؤثر سريريًا",
  returned_for_revision: "بحاجة إلى تعديل",
  closed_expired: "مغلق – انتهت مهلة التعديل",
};

// ---------------------------------------------------------------------------
// Organizational Impact — a second, fully independent track alongside the
// Clinical Impact model above. Never mixed into Patient/Impact records.
// ---------------------------------------------------------------------------

export type Track = "clinical" | "organizational";

export type OrgImpactType =
  | "project"
  | "training"
  | "policy"
  | "quality"
  | "innovation"
  | "process"
  | "other";

export const ORG_IMPACT_TYPE_LABELS: Record<OrgImpactType, string> = {
  project: "مشروع أو مبادرة",
  training: "برنامج تدريبي",
  policy: "سياسة أو إجراء جديد/مطوّر",
  quality: "مشروع تحسين جودة",
  innovation: "ابتكار",
  process: "تحسين عملية أو خدمة",
  other: "أخرى",
};

export interface Initiative {
  id: string;
  name: string;
  department: string; // department id — shared with the clinical track
  type: OrgImpactType;
  typeOtherText?: string; // required text when type === "other"
  startDate: string; // ISO date
}

export interface OrganizationalImpact {
  id: string;
  initiativeId: string;
  eventDate: string; // تاريخ الأثر/القياس
  previousState: string; // التحدي أو الوضع قبل التنفيذ
  whatWasDone: string; // ما الذي تم تنفيذه؟
  resultingChange: string; // ما الذي تغيّر نتيجةً لذلك؟ (الأثر نفسه)
  metricName?: string; // المؤشر أو النتيجة القابلة للقياس
  beforeValue?: string;
  afterValue?: string;
  departments: string[]; // الأقسام المشاركة/المستفيدة — free-text names entered
  // manually by the submitter, same convention as Impact.departments above.
  description?: string;
  documentationSource: string;
  documentationSourceOtherText?: string; // required text when documentationSource === "أخرى"
  referenceNote?: string; // مرجع التوثيق — نصي فقط، بدون رفع ملفات
  submitter?: SubmitterInfo; // legacy single-submitter shape — see Impact above.
  submitters?: SubmitterInfo[]; // current shape — see Impact above.
  scope?: string; // see Impact above
  facility?: string; // see Impact above
  impactNumber?: string; // see Impact above — same shared ATH-YYYY-##### sequence
  status: ImpactStatus;
  rejectionReason?: string;
  returnReason?: string;
  revisionDeadline?: string;
  reviewHistory?: ReviewHistoryEntry[];
  createdAt: string;
  reviewedAt?: string;
}

export const ORG_DOCUMENTATION_SOURCES: string[] = [
  "تقرير مبادرة",
  "تقرير أداء",
  "محضر اجتماع",
  "نتائج استبيان",
  "تقرير جودة",
  "سياسة/إجراء",
  "أخرى",
];

// Same underlying pending/approved/rejected states as Clinical Impact, but the
// word "Rejected" is never surfaced — organizational context calls it
// "غير مؤثر مؤسسيًا" instead.
export const ORG_IMPACT_STATUS_LABELS: Record<ImpactStatus, string> = {
  pending: "قيد المراجعة",
  approved: "معتمد",
  rejected: "غير مؤثر مؤسسيًا",
  returned_for_revision: "بحاجة إلى تعديل",
  closed_expired: "مغلق – انتهت مهلة التعديل",
};

// ---------------------------------------------------------------------------
// Health Cluster hierarchy (ATHARI-R1 only) — التجمع الصحي > النطاق > المنشأة
// الصحية. This is a structural layer on top of the existing Clinical/
// Organizational tracks above; Impact/OrganizationalImpact records are not
// yet linked to a facility (that lands with the Facility Level phase). The
// real scope/facility list lives in lib/clusterData.ts — never hardcode a
// scope or facility name anywhere else.
// ---------------------------------------------------------------------------

export interface Scope {
  id: string;
  name: string;
}

export type FacilityType = "hospital" | "medical_city" | "phc";

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  scopeId: string; // Scope["id"]
}

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  hospital: "مستشفى",
  medical_city: "مدينة طبية",
  phc: "مركز رعاية صحية أولية",
};
