import {
  CLUSTER_EXECUTIVE_ADMINISTRATION_NAME,
  CLUSTER_EXECUTIVE_ADMINISTRATION_NAME_EN,
  facilities,
  getFacilitiesByScope,
  scopes,
} from "./clusterData";
import { FACILITY_NAMES_EN, SCOPE_NAMES_EN } from "./i18n/entityNames";
import { Facility, Impact, OrganizationalImpact } from "./types";

// ---------------------------------------------------------------------------
// Cluster / Scope / Facility impact figures — ALWAYS computed from the actual
// APPROVED records (clinical Impact + OrganizationalImpact), never from fixed
// or prototype numbers. Every page that shows a cluster, scope or facility
// figure (Executive Dashboard, Scope Dashboard + Scope Report, Facility
// Dashboard + Facility Report, facility/scope cards) calls these same
// functions with the same records, so the numbers cannot disagree. With no
// matching approved records every figure is 0.
//
// A record is attributed through the `scope` / `facility` display names saved
// on it by the /submit journey (Arabic or English — whichever language the
// employee used). Records created from the internal forms carry neither, so
// they belong to no facility and are not part of any cluster figure.
// ---------------------------------------------------------------------------
export interface ImpactRecords {
  impacts: Impact[];
  organizationalImpacts: OrganizationalImpact[];
}

export interface ImpactStats {
  clinical: number;
  organizational: number;
  // Registered facilities in the structure (1 for a facility) — a structural
  // fact, not an impact indicator.
  facilityCount: number;
  // Facilities (and manually-named PHC centers) that have at least one
  // approved record — what "المنشآت المشاركة" actually means.
  participatingFacilityCount: number;
}

type Tagged = { scope?: string; facility?: string };

type Attribution =
  | { kind: "facility"; facilityId: string }
  | { kind: "executive" }
  | { kind: "phc"; scopeId: string; centerKey: string };

const norm = (value: string | undefined) => (value ?? "").replace(/\s+/g, " ").trim().toLowerCase();

function attributionOf(record: Tagged): Attribution | null {
  const facilityName = norm(record.facility);
  if (!facilityName) return null;

  const registered = facilities.find(
    (f) => norm(f.name) === facilityName || norm(FACILITY_NAMES_EN[f.id]) === facilityName
  );
  if (registered) return { kind: "facility", facilityId: registered.id };

  if (
    facilityName === norm(CLUSTER_EXECUTIVE_ADMINISTRATION_NAME) ||
    facilityName === norm(CLUSTER_EXECUTIVE_ADMINISTRATION_NAME_EN)
  ) {
    return { kind: "executive" };
  }

  // Not a registered facility: a manually-typed Primary Health Care center,
  // attributed to its scope.
  const scopeName = norm(record.scope);
  const scope = scopes.find((s) => norm(s.name) === scopeName || norm(SCOPE_NAMES_EN[s.id]) === scopeName);
  return scope ? { kind: "phc", scopeId: scope.id, centerKey: facilityName } : null;
}

interface Row {
  track: "clinical" | "organizational";
  attribution: Attribution;
}

function approvedRows(records: ImpactRecords): Row[] {
  const rows: Row[] = [];
  for (const i of records.impacts) {
    if (i.status !== "approved") continue;
    const attribution = attributionOf(i);
    if (attribution) rows.push({ track: "clinical", attribution });
  }
  for (const i of records.organizationalImpacts) {
    if (i.status !== "approved") continue;
    const attribution = attributionOf(i);
    if (attribution) rows.push({ track: "organizational", attribution });
  }
  return rows;
}

function tally(rows: Row[]): { clinical: number; organizational: number } {
  return {
    clinical: rows.filter((r) => r.track === "clinical").length,
    organizational: rows.filter((r) => r.track === "organizational").length,
  };
}

// The approved records of one registered facility — the same set behind its
// card, its dashboard and its report.
export function getFacilityRecords(
  facility: Facility,
  records: ImpactRecords
): { clinical: Impact[]; organizational: OrganizationalImpact[] } {
  const isHere = (r: Tagged) => {
    const a = attributionOf(r);
    return a?.kind === "facility" && a.facilityId === facility.id;
  };
  return {
    clinical: records.impacts.filter((i) => i.status === "approved" && isHere(i)),
    organizational: records.organizationalImpacts.filter((i) => i.status === "approved" && isHere(i)),
  };
}

// The approved results behind a scope's total: those of its registered
// facilities plus its manually-named Primary Health Care centers — the same
// set the scope figures count. `facilityLabel` is the facility's canonical
// name (or the PHC name as typed).
export interface ScopeResult {
  track: "clinical" | "organizational";
  facilityLabel: string;
  clinical?: Impact;
  organizational?: OrganizationalImpact;
}

export function getScopeResults(scopeId: string, records: ImpactRecords): ScopeResult[] {
  const labelFor = (r: Tagged): string | null => {
    const a = attributionOf(r);
    if (a?.kind === "facility") {
      const facility = facilities.find((f) => f.id === a.facilityId);
      return facility && facility.scopeId === scopeId ? facility.name : null;
    }
    if (a?.kind === "phc" && a.scopeId === scopeId) return (r.facility ?? "").replace(/\s+/g, " ").trim();
    return null;
  };
  const results: ScopeResult[] = [];
  for (const i of records.impacts) {
    const label = i.status === "approved" ? labelFor(i) : null;
    if (label) results.push({ track: "clinical", facilityLabel: label, clinical: i });
  }
  for (const i of records.organizationalImpacts) {
    const label = i.status === "approved" ? labelFor(i) : null;
    if (label) results.push({ track: "organizational", facilityLabel: label, organizational: i });
  }
  const dateOf = (r: ScopeResult) => (r.clinical ?? r.organizational)!.eventDate;
  return results.sort((a, b) => (dateOf(a) < dateOf(b) ? 1 : -1));
}

export function getFacilityStats(facilityId: string, records: ImpactRecords): ImpactStats {
  const rows = approvedRows(records).filter(
    (r) => r.attribution.kind === "facility" && r.attribution.facilityId === facilityId
  );
  const counts = tally(rows);
  return { ...counts, facilityCount: 1, participatingFacilityCount: rows.length > 0 ? 1 : 0 };
}

// Manually-named Primary Health Care centers of a scope, rolled up as one
// group (they have no registered facility record of their own).
export function getScopePhcStats(scopeId: string, records: ImpactRecords): ImpactStats & { centerCount: number } {
  const rows = approvedRows(records).filter((r) => r.attribution.kind === "phc" && r.attribution.scopeId === scopeId);
  const centers = new Set(rows.map((r) => (r.attribution.kind === "phc" ? r.attribution.centerKey : "")));
  return { ...tally(rows), facilityCount: 0, participatingFacilityCount: centers.size, centerCount: centers.size };
}

export function getScopeStats(scopeId: string, records: ImpactRecords): ImpactStats {
  const facilityStats = getFacilitiesByScope(scopeId).map((f) => getFacilityStats(f.id, records));
  const phc = getScopePhcStats(scopeId, records);
  return {
    clinical: facilityStats.reduce((n, s) => n + s.clinical, 0) + phc.clinical,
    organizational: facilityStats.reduce((n, s) => n + s.organizational, 0) + phc.organizational,
    facilityCount: facilityStats.length,
    participatingFacilityCount: facilityStats.reduce((n, s) => n + s.participatingFacilityCount, 0) + phc.centerCount,
  };
}

// Cluster Executive Administration sits above the Scope/Facility layer — it
// is neither a facility nor a scope — and supports Organizational Impact only,
// so `clinical` is always 0 here whatever a record says.
export function getExecutiveAdministrationStats(records: ImpactRecords): ImpactStats {
  const rows = approvedRows(records).filter((r) => r.attribution.kind === "executive");
  return {
    clinical: 0,
    organizational: rows.filter((r) => r.track === "organizational").length,
    facilityCount: 0,
    participatingFacilityCount: 0,
  };
}

// Cluster total = the four geographic scopes + Cluster Executive
// Administration, so the Executive Dashboard adds up even though Executive
// Administration is never shown as a fifth scope card.
export function getClusterStats(records: ImpactRecords): ImpactStats {
  const perScope = scopes.map((s) => getScopeStats(s.id, records));
  const executive = getExecutiveAdministrationStats(records);
  return {
    clinical: perScope.reduce((n, s) => n + s.clinical, 0) + executive.clinical,
    organizational: perScope.reduce((n, s) => n + s.organizational, 0) + executive.organizational,
    facilityCount: perScope.reduce((n, s) => n + s.facilityCount, 0),
    participatingFacilityCount: perScope.reduce((n, s) => n + s.participatingFacilityCount, 0),
  };
}
