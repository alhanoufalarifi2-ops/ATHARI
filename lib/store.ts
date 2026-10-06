"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { departments as seedDepartments, impacts as seedImpacts, patients as seedPatients } from "./mockData";
import {
  CATEGORY_LABELS,
  Department,
  Impact,
  ImpactCategory,
  ImpactStatus,
  Initiative,
  OrganizationalImpact,
  OrgImpactType,
  Patient,
  ReviewHistoryEntry,
  ReviewHistoryFieldChange,
  Role,
  SubmitterInfo,
  Track,
} from "./types";
import { genId } from "./utils";

// One centralized annual sequence shared by Clinical AND Organizational
// impacts across the entire cluster — never per facility/scope/type. Rather
// than persisting a separate mutable counter (which could drift out of sync
// with resetMockData or a deleted record), the next number is derived by
// scanning every impactNumber already in use for the current calendar year,
// across BOTH arrays, and taking max+1. This is naturally safe against
// duplicates within a single tab (JS is single-threaded, and both arrays are
// read at the same instant the new record is created), resets to 00001 the
// first time a new year is seen, and simply ignores legacy records that
// predate this field (they have no impactNumber to collide with).
const IMPACT_NUMBER_PREFIX = "ATH";

function generateImpactNumber(existingNumbers: (string | undefined)[]): string {
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^${IMPACT_NUMBER_PREFIX}-${year}-(\\d{5})$`);
  const maxSeq = existingNumbers.reduce((max, num) => {
    const match = num?.match(pattern);
    if (!match) return max;
    return Math.max(max, parseInt(match[1], 10));
  }, 0);
  return `${IMPACT_NUMBER_PREFIX}-${year}-${String(maxSeq + 1).padStart(5, "0")}`;
}

const REVISION_WINDOW_DAYS = 7;

function isOverdue(revisionDeadline: string): boolean {
  return new Date(revisionDeadline).getTime() < Date.now();
}

// ---------------------------------------------------------------------------
// Edit audit trail — field-level diffs recorded on `reviewHistory` whenever
// content actually changes, for the two places that can edit a record's
// content: the employee's Edit & Resubmit after Return for Revision
// (resubmitImpact/resubmitOrganizationalImpact — actor "submitter"), and the
// reviewer's inline edit of a still-pending request (updateImpact/
// updateOrganizationalImpact — actor "reviewer"). Values are formatted to
// plain display strings here (arrays joined, submitters reduced to names) so
// the Track Impact timeline can render them without re-deriving anything;
// only fields present in the incoming patch are ever compared, and a field
// is only included in the diff when its formatted value actually differs.
// ---------------------------------------------------------------------------

function formatAuditScalar(value: string | undefined): string {
  return value && value.trim() !== "" ? value : "—";
}

function formatAuditList(value: string[] | undefined): string {
  return value && value.length > 0 ? value.join("، ") : "—";
}

function formatAuditCategories(value: ImpactCategory[] | undefined): string {
  return value && value.length > 0 ? value.map((c) => CATEGORY_LABELS[c] ?? c).join("، ") : "—";
}

function formatAuditSubmitters(value: SubmitterInfo[] | undefined): string {
  const names = (value ?? []).map((s) => s.name.trim()).filter(Boolean);
  return names.length > 0 ? names.join("، ") : "—";
}

function diffField(
  changes: ReviewHistoryFieldChange[],
  field: string,
  previousValue: string,
  newValue: string
): void {
  if (previousValue !== newValue) changes.push({ field, previousValue, newValue });
}

function buildClinicalFieldChanges(before: Impact, patch: Partial<Impact>): ReviewHistoryFieldChange[] {
  const changes: ReviewHistoryFieldChange[] = [];
  if ("previousStatus" in patch)
    diffField(changes, "previousStatus", formatAuditScalar(before.previousStatus), formatAuditScalar(patch.previousStatus));
  if ("whatChanged" in patch)
    diffField(changes, "whatChanged", formatAuditScalar(before.whatChanged), formatAuditScalar(patch.whatChanged));
  if ("currentOutcome" in patch)
    diffField(changes, "currentOutcome", formatAuditScalar(before.currentOutcome), formatAuditScalar(patch.currentOutcome));
  if ("eventDate" in patch)
    diffField(changes, "eventDate", formatAuditScalar(before.eventDate), formatAuditScalar(patch.eventDate));
  if ("categories" in patch)
    diffField(
      changes,
      "categories",
      formatAuditCategories(before.categories && before.categories.length > 0 ? before.categories : [before.category]),
      formatAuditCategories(patch.categories)
    );
  if ("categoryOtherText" in patch)
    diffField(changes, "categoryOtherText", formatAuditScalar(before.categoryOtherText), formatAuditScalar(patch.categoryOtherText));
  if ("departments" in patch)
    diffField(changes, "departments", formatAuditList(before.departments), formatAuditList(patch.departments));
  if ("submittingDepartment" in patch)
    diffField(
      changes,
      "submittingDepartment",
      formatAuditScalar(before.submittingDepartment),
      formatAuditScalar(patch.submittingDepartment)
    );
  if ("description" in patch)
    diffField(changes, "description", formatAuditScalar(before.description), formatAuditScalar(patch.description));
  if ("documentationSource" in patch)
    diffField(
      changes,
      "documentationSource",
      formatAuditScalar(before.documentationSource),
      formatAuditScalar(patch.documentationSource)
    );
  if ("documentationSourceOtherText" in patch)
    diffField(
      changes,
      "documentationSourceOtherText",
      formatAuditScalar(before.documentationSourceOtherText),
      formatAuditScalar(patch.documentationSourceOtherText)
    );
  if ("evidenceRef" in patch)
    diffField(changes, "evidenceRef", formatAuditScalar(before.evidenceRef), formatAuditScalar(patch.evidenceRef));
  if ("submitters" in patch)
    diffField(
      changes,
      "submitters",
      formatAuditSubmitters(before.submitters ?? (before.submitter ? [before.submitter] : [])),
      formatAuditSubmitters(patch.submitters)
    );
  return changes;
}

function buildOrgFieldChanges(
  before: OrganizationalImpact,
  patch: Partial<OrganizationalImpact>
): ReviewHistoryFieldChange[] {
  const changes: ReviewHistoryFieldChange[] = [];
  if ("previousState" in patch)
    diffField(changes, "previousState", formatAuditScalar(before.previousState), formatAuditScalar(patch.previousState));
  if ("whatWasDone" in patch)
    diffField(changes, "whatWasDone", formatAuditScalar(before.whatWasDone), formatAuditScalar(patch.whatWasDone));
  if ("resultingChange" in patch)
    diffField(changes, "resultingChange", formatAuditScalar(before.resultingChange), formatAuditScalar(patch.resultingChange));
  if ("eventDate" in patch)
    diffField(changes, "eventDate", formatAuditScalar(before.eventDate), formatAuditScalar(patch.eventDate));
  if ("metricName" in patch)
    diffField(changes, "metricName", formatAuditScalar(before.metricName), formatAuditScalar(patch.metricName));
  if ("beforeValue" in patch)
    diffField(changes, "beforeValue", formatAuditScalar(before.beforeValue), formatAuditScalar(patch.beforeValue));
  if ("afterValue" in patch)
    diffField(changes, "afterValue", formatAuditScalar(before.afterValue), formatAuditScalar(patch.afterValue));
  if ("departments" in patch)
    diffField(changes, "departments", formatAuditList(before.departments), formatAuditList(patch.departments));
  if ("description" in patch)
    diffField(changes, "description", formatAuditScalar(before.description), formatAuditScalar(patch.description));
  if ("documentationSource" in patch)
    diffField(
      changes,
      "documentationSource",
      formatAuditScalar(before.documentationSource),
      formatAuditScalar(patch.documentationSource)
    );
  if ("documentationSourceOtherText" in patch)
    diffField(
      changes,
      "documentationSourceOtherText",
      formatAuditScalar(before.documentationSourceOtherText),
      formatAuditScalar(patch.documentationSourceOtherText)
    );
  if ("referenceNote" in patch)
    diffField(changes, "referenceNote", formatAuditScalar(before.referenceNote), formatAuditScalar(patch.referenceNote));
  if ("submitters" in patch)
    diffField(
      changes,
      "submitters",
      formatAuditSubmitters(before.submitters ?? (before.submitter ? [before.submitter] : [])),
      formatAuditSubmitters(patch.submitters)
    );
  return changes;
}

// Shared by both impacts and organizationalImpacts — generic over the record
// shape so neither array needs an unsafe cast back to its concrete type.
function expireIfOverdue<
  T extends { status: ImpactStatus; revisionDeadline?: string; reviewHistory?: ReviewHistoryEntry[] }
>(record: T): T {
  if (record.status !== "returned_for_revision" || !record.revisionDeadline || !isOverdue(record.revisionDeadline)) {
    return record;
  }
  const entry: ReviewHistoryEntry = { type: "closed_expired", at: new Date().toISOString() };
  return { ...record, status: "closed_expired", reviewHistory: [...(record.reviewHistory ?? []), entry] };
}

interface PatientIntake {
  mrn: string;
  department: string;
  admissionDate: string;
}

interface InitiativeIntake {
  name: string;
  department: string;
  type: OrgImpactType;
  typeOtherText?: string;
  startDate: string;
}

interface AthariState {
  role: Role;
  activeTrack: Track;
  patients: Patient[];
  impacts: Impact[];
  departments: typeof seedDepartments;
  initiatives: Initiative[];
  organizationalImpacts: OrganizationalImpact[];
  setRole: (role: Role) => void;
  setActiveTrack: (track: Track) => void;
  findPatientByMrn: (mrn: string) => Patient | undefined;
  findOrCreateDepartment: (name: string) => string;
  findOrCreatePatient: (data: PatientIntake, options?: { applyEditsIfExisting?: boolean }) => string;
  // Returns the newly-generated impactNumber so the submission form can show
  // it on the success screen (Track Impact needs it for lookup afterward).
  addImpact: (impact: Omit<Impact, "id" | "status" | "createdAt" | "impactNumber" | "reviewHistory">) => string;
  updateImpact: (id: string, patch: Partial<Omit<Impact, "id" | "status" | "createdAt">>) => void;
  reviewImpact: (id: string, status: ImpactStatus, rejectionReason?: string) => void;
  // Reviewer sends a pending request back to the employee with a mandatory
  // reason and a 7-calendar-day resubmission deadline computed from now.
  requestImpactRevision: (id: string, reason: string) => void;
  // Employee edits a "returned_for_revision" request and resubmits it — same
  // id and impactNumber, status back to "pending", history preserved.
  resubmitImpact: (id: string, patch: Omit<Impact, "id" | "status" | "createdAt" | "impactNumber" | "reviewHistory">) => void;
  createInitiative: (data: InitiativeIntake) => string;
  addOrganizationalImpact: (
    impact: Omit<OrganizationalImpact, "id" | "status" | "createdAt" | "impactNumber" | "reviewHistory">
  ) => string;
  updateOrganizationalImpact: (
    id: string,
    patch: Partial<Omit<OrganizationalImpact, "id" | "status" | "createdAt">>
  ) => void;
  reviewOrganizationalImpact: (id: string, status: ImpactStatus, rejectionReason?: string) => void;
  requestOrganizationalImpactRevision: (id: string, reason: string) => void;
  resubmitOrganizationalImpact: (
    id: string,
    patch: Omit<OrganizationalImpact, "id" | "status" | "createdAt" | "impactNumber" | "reviewHistory">
  ) => void;
  // Lazy expiry, called opportunistically (review queues, review detail,
  // Track Impact) rather than via a backend scheduler — flips any
  // "returned_for_revision" record past its revisionDeadline to
  // "closed_expired". Never deletes anything; always appends to history.
  expireOverdueRevisions: () => void;
  resetMockData: () => void;
}

export const useAthariStore = create<AthariState>()(
  persist(
    (set, get) => ({
      role: "contributor",
      activeTrack: "clinical",
      patients: seedPatients,
      impacts: seedImpacts,
      departments: seedDepartments,
      initiatives: [],
      organizationalImpacts: [],
      setRole: (role) => set({ role }),
      setActiveTrack: (track) => set({ activeTrack: track }),
      findPatientByMrn: (mrn) => {
        const trimmed = mrn.trim().toLowerCase();
        return get().patients.find((p) => p.mrn.trim().toLowerCase() === trimmed);
      },
      findOrCreateDepartment: (name) => {
        const trimmed = name.trim();
        const existing = get().departments.find(
          (d) => d.name.trim().toLowerCase() === trimmed.toLowerCase()
        );
        if (existing) return existing.id;

        const newDepartment: Department = { id: genId("dept"), name: trimmed };
        set((state) => ({ departments: [...state.departments, newDepartment] }));
        return newDepartment.id;
      },
      findOrCreatePatient: (data, options) => {
        const mrn = data.mrn.trim();
        const existing = get().patients.find(
          (p) => p.mrn.trim().toLowerCase() === mrn.toLowerCase()
        );

        if (existing) {
          const applyEdits = options?.applyEditsIfExisting ?? true;
          if (applyEdits) {
            // Patient Name is no longer collected anywhere in the UI — never
            // written here, so an existing patient's legacy name (if any) is
            // preserved untouched rather than being blanked out.
            set((state) => ({
              patients: state.patients.map((p) =>
                p.id === existing.id
                  ? { ...p, department: data.department, admissionDate: data.admissionDate }
                  : p
              ),
            }));
          }
          return existing.id;
        }

        const newPatient: Patient = {
          id: genId("pat"),
          mrn,
          name: "",
          department: data.department,
          admissionDate: data.admissionDate,
          status: "active",
        };
        set((state) => ({ patients: [...state.patients, newPatient] }));
        return newPatient.id;
      },
      addImpact: (impact) => {
        let impactNumber = "";
        set((state) => {
          impactNumber = generateImpactNumber([
            ...state.impacts.map((i) => i.impactNumber),
            ...state.organizationalImpacts.map((i) => i.impactNumber),
          ]);
          const now = new Date().toISOString();
          return {
            impacts: [
              {
                ...impact,
                id: genId("imp"),
                impactNumber,
                status: "pending",
                createdAt: now,
                reviewHistory: [{ type: "submitted", at: now }],
              },
              ...state.impacts,
            ],
          };
        });
        return impactNumber;
      },
      // Editing is only meaningful while a request is still "pending" — the
      // review UI enforces that; the store itself doesn't need to re-check it.
      // Every actually-changed field is appended to reviewHistory as an
      // "edited" entry (actor: "reviewer") — see buildClinicalFieldChanges.
      // Nothing is appended when the save produced no real change.
      updateImpact: (id, patch) =>
        set((state) => ({
          impacts: state.impacts.map((imp) => {
            if (imp.id !== id) return imp;
            const changes = buildClinicalFieldChanges(imp, patch);
            const updated = { ...imp, ...patch };
            if (changes.length === 0) return updated;
            const entry: ReviewHistoryEntry = {
              type: "edited",
              at: new Date().toISOString(),
              actor: "reviewer",
              changes,
            };
            return { ...updated, reviewHistory: [...(imp.reviewHistory ?? []), entry] };
          }),
        })),
      reviewImpact: (id, status, rejectionReason) =>
        set((state) => ({
          impacts: state.impacts.map((imp) =>
            imp.id === id
              ? {
                  ...imp,
                  status,
                  rejectionReason: status === "rejected" ? rejectionReason : undefined,
                  reviewedAt: new Date().toISOString(),
                }
              : imp
          ),
        })),
      requestImpactRevision: (id, reason) =>
        set((state) => {
          const now = new Date().toISOString();
          const deadline = new Date(Date.now() + REVISION_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
          return {
            impacts: state.impacts.map((imp) =>
              imp.id === id
                ? {
                    ...imp,
                    status: "returned_for_revision",
                    returnReason: reason,
                    revisionDeadline: deadline,
                    reviewedAt: now,
                    reviewHistory: [
                      ...(imp.reviewHistory ?? []),
                      { type: "returned_for_revision", at: now, reason, revisionDeadline: deadline },
                    ],
                  }
                : imp
            ),
          };
        }),
      resubmitImpact: (id, patch) =>
        set((state) => {
          const now = new Date().toISOString();
          return {
            impacts: state.impacts.map((imp) => {
              if (imp.id !== id) return imp;
              const changes = buildClinicalFieldChanges(imp, patch);
              const entry: ReviewHistoryEntry = {
                type: "resubmitted",
                at: now,
                actor: "submitter",
                ...(changes.length > 0 ? { changes } : {}),
              };
              return {
                ...imp,
                ...patch,
                status: "pending",
                returnReason: undefined,
                revisionDeadline: undefined,
                rejectionReason: undefined,
                reviewHistory: [...(imp.reviewHistory ?? []), entry],
              };
            }),
          };
        }),
      // Initiatives are never matched/deduplicated by name — the same name can
      // legitimately recur across different years, so every call creates a
      // fresh record with its own id. Reusing an initiative happens only via
      // explicit selection in the UI (searchable list), never automatically.
      createInitiative: (data) => {
        const newInitiative: Initiative = {
          id: genId("init"),
          name: data.name.trim(),
          department: data.department,
          type: data.type,
          typeOtherText: data.typeOtherText,
          startDate: data.startDate,
        };
        set((state) => ({ initiatives: [...state.initiatives, newInitiative] }));
        return newInitiative.id;
      },
      addOrganizationalImpact: (impact) => {
        let impactNumber = "";
        set((state) => {
          impactNumber = generateImpactNumber([
            ...state.impacts.map((i) => i.impactNumber),
            ...state.organizationalImpacts.map((i) => i.impactNumber),
          ]);
          const now = new Date().toISOString();
          return {
            organizationalImpacts: [
              {
                ...impact,
                id: genId("orgimp"),
                impactNumber,
                status: "pending",
                createdAt: now,
                reviewHistory: [{ type: "submitted", at: now }],
              },
              ...state.organizationalImpacts,
            ],
          };
        });
        return impactNumber;
      },
      // Same edit-audit behavior as updateImpact above, for the Organizational
      // track — see buildOrgFieldChanges.
      updateOrganizationalImpact: (id, patch) =>
        set((state) => ({
          organizationalImpacts: state.organizationalImpacts.map((imp) => {
            if (imp.id !== id) return imp;
            const changes = buildOrgFieldChanges(imp, patch);
            const updated = { ...imp, ...patch };
            if (changes.length === 0) return updated;
            const entry: ReviewHistoryEntry = {
              type: "edited",
              at: new Date().toISOString(),
              actor: "reviewer",
              changes,
            };
            return { ...updated, reviewHistory: [...(imp.reviewHistory ?? []), entry] };
          }),
        })),
      reviewOrganizationalImpact: (id, status, rejectionReason) =>
        set((state) => ({
          organizationalImpacts: state.organizationalImpacts.map((imp) =>
            imp.id === id
              ? {
                  ...imp,
                  status,
                  rejectionReason: status === "rejected" ? rejectionReason : undefined,
                  reviewedAt: new Date().toISOString(),
                }
              : imp
          ),
        })),
      requestOrganizationalImpactRevision: (id, reason) =>
        set((state) => {
          const now = new Date().toISOString();
          const deadline = new Date(Date.now() + REVISION_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
          return {
            organizationalImpacts: state.organizationalImpacts.map((imp) =>
              imp.id === id
                ? {
                    ...imp,
                    status: "returned_for_revision",
                    returnReason: reason,
                    revisionDeadline: deadline,
                    reviewedAt: now,
                    reviewHistory: [
                      ...(imp.reviewHistory ?? []),
                      { type: "returned_for_revision", at: now, reason, revisionDeadline: deadline },
                    ],
                  }
                : imp
            ),
          };
        }),
      resubmitOrganizationalImpact: (id, patch) =>
        set((state) => {
          const now = new Date().toISOString();
          return {
            organizationalImpacts: state.organizationalImpacts.map((imp) => {
              if (imp.id !== id) return imp;
              const changes = buildOrgFieldChanges(imp, patch);
              const entry: ReviewHistoryEntry = {
                type: "resubmitted",
                at: now,
                actor: "submitter",
                ...(changes.length > 0 ? { changes } : {}),
              };
              return {
                ...imp,
                ...patch,
                status: "pending",
                returnReason: undefined,
                revisionDeadline: undefined,
                rejectionReason: undefined,
                reviewHistory: [...(imp.reviewHistory ?? []), entry],
              };
            }),
          };
        }),
      expireOverdueRevisions: () =>
        set((state) => ({
          impacts: state.impacts.map(expireIfOverdue),
          organizationalImpacts: state.organizationalImpacts.map(expireIfOverdue),
        })),
      resetMockData: () =>
        set({
          patients: seedPatients,
          impacts: seedImpacts,
          departments: seedDepartments,
        }),
    }),
    {
      name: "athari-storage-v1",
    }
  )
);

// The persist middleware above writes every change to localStorage, but it
// only *reads* localStorage once, on initial load — it never listens for
// that key changing from outside its own tab. Without this, a request
// submitted via /submit in one tab/window (e.g. the QR flow opened
// separately) never shows up as pending in an already-open Review Queue or
// TopHeader bell in another tab of the same browser until that tab is
// manually reloaded. This listener rehydrates this tab's store whenever
// another tab writes to the same key, so already-open pages update live.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === "athari-storage-v1") {
      useAthariStore.persist.rehydrate();
    }
  });
}
