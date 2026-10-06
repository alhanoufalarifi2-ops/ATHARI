"use client";

import Header from "@/components/Header";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { CheckCircleIcon } from "@/components/icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  ACTOR_LABELS,
  AUDIT_FIELD_LABELS,
  CATEGORY_LABELS_EN,
  Language,
  TIMELINE_EVENT_LABELS,
  TRACK_STATUS_LABELS,
  tDaysRemaining,
} from "@/lib/i18n/translations";
import { certificateCode, recipientsOf } from "@/lib/certificates";
import { useAthariStore } from "@/lib/store";
import {
  CATEGORY_LABELS,
  Impact,
  ImpactStatus,
  OrganizationalImpact,
  ReviewHistoryEntry,
  SubmitterInfo,
} from "@/lib/types";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type FoundRecord =
  | { track: "clinical"; record: Impact }
  | { track: "organizational"; record: OrganizationalImpact };

function formatDate(iso: string, language: Language, withTime = false): string {
  try {
    return new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...(withTime ? { hour: "numeric", minute: "numeric" } : {}),
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// The certificates (with their position in the credited list, which is what
// the verification code is built from) that belong to the person searching.
function ownCertificates(
  record: { submitters?: SubmitterInfo[]; submitter?: SubmitterInfo },
  mobile: string
): { person: SubmitterInfo; index: number }[] {
  return recipientsOf(record)
    .map((person, index) => ({ person, index }))
    .filter(({ person }) => person.phone.trim() === mobile.trim());
}

function matchesMobile(record: { submitters?: SubmitterInfo[]; submitter?: SubmitterInfo }, mobile: string): boolean {
  const list = record.submitters && record.submitters.length > 0 ? record.submitters : record.submitter ? [record.submitter] : [];
  return list.some((s) => s.phone.trim() === mobile);
}

// reviewImpact/reviewOrganizationalImpact (approve/reject) intentionally
// never append to reviewHistory — see lib/store.ts — so the terminal
// "approved"/"rejected" stage is always synthesized here from
// status/reviewedAt/rejectionReason when it isn't already present. Legacy
// records created before reviewHistory existed have no entries at all and
// get a synthesized "submitted" stage too, so only stages that actually
// occurred are ever shown either way.
function buildTimeline(record: {
  createdAt: string;
  status: ImpactStatus;
  reviewedAt?: string;
  rejectionReason?: string;
  reviewHistory?: ReviewHistoryEntry[];
}): ReviewHistoryEntry[] {
  const entries =
    record.reviewHistory && record.reviewHistory.length > 0
      ? [...record.reviewHistory]
      : [{ type: "submitted" as const, at: record.createdAt }];
  const hasTerminalEntry = entries.some((e) => e.type === "approved" || e.type === "rejected");
  if (!hasTerminalEntry) {
    if (record.status === "approved") {
      entries.push({ type: "approved", at: record.reviewedAt ?? record.createdAt });
    } else if (record.status === "rejected") {
      entries.push({ type: "rejected", at: record.reviewedAt ?? record.createdAt, reason: record.rejectionReason });
    }
  }
  return entries;
}

export default function TrackImpactPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const impacts = useAthariStore((s) => s.impacts);
  const organizationalImpacts = useAthariStore((s) => s.organizationalImpacts);
  const patients = useAthariStore((s) => s.patients);
  const departments = useAthariStore((s) => s.departments);
  const initiatives = useAthariStore((s) => s.initiatives);
  const expireOverdueRevisions = useAthariStore((s) => s.expireOverdueRevisions);

  useEffect(() => {
    expireOverdueRevisions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [impactNumberInput, setImpactNumberInput] = useState("");
  const [mobileInput, setMobileInput] = useState("");
  const [error, setError] = useState("");
  const [found, setFound] = useState<FoundRecord | null>(null);
  // The mobile number this result was looked up with — it identifies which
  // credited person is looking, and so which certificate they are shown.
  const [foundMobile, setFoundMobile] = useState("");
  const [searched, setSearched] = useState(false);

  const departmentName = (id: string) => departments.find((d) => d.id === id)?.name ?? "";

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const number = impactNumberInput.trim();
    const mobile = mobileInput.trim();
    if (!number || !mobile) {
      setError(t("track.requiredFieldsError"));
      setFound(null);
      setSearched(false);
      return;
    }

    const impact = impacts.find((i) => i.impactNumber === number && matchesMobile(i, mobile));
    if (impact) {
      setError("");
      setSearched(true);
      setFound({ track: "clinical", record: impact });
      setFoundMobile(mobile);
      return;
    }

    const orgImpact = organizationalImpacts.find((i) => i.impactNumber === number && matchesMobile(i, mobile));
    if (orgImpact) {
      setError("");
      setSearched(true);
      setFound({ track: "organizational", record: orgImpact });
      setFoundMobile(mobile);
      return;
    }

    setError(t("track.notFound"));
    setSearched(true);
    setFound(null);
  };

  const handleSearchAgain = () => {
    setFound(null);
    setSearched(false);
    setError("");
    setImpactNumberInput("");
    setMobileInput("");
  };

  const facilityFor = (record: Impact | OrganizationalImpact) => record.facility || "—";

  // Each Clinical impact records its own submitting department — an
  // independent, per-impact fact even when several impacts share the same
  // MRN/Patient Journey. Legacy records created before that field existed
  // fall back to the patient's own department for display.
  const departmentFor = (result: FoundRecord) => {
    if (result.track === "clinical") {
      if (result.record.submittingDepartment) return result.record.submittingDepartment;
      const patient = patients.find((p) => p.id === result.record.patientId);
      return patient ? departmentName(patient.department) : "—";
    }
    const initiative = initiatives.find((i) => i.id === result.record.initiativeId);
    return initiative ? departmentName(initiative.department) : "—";
  };

  const editHref = (result: FoundRecord) =>
    result.track === "clinical"
      ? `/submit/clinical?editImpactId=${result.record.id}`
      : `/submit/organizational?editOrgImpactId=${result.record.id}`;

  // The most recent "returned_for_revision" entry's timestamp — a record can
  // theoretically be returned more than once across separate revision
  // cycles, so this reflects the return date behind the CURRENT deadline.
  const returnDateFor = (record: Impact | OrganizationalImpact) => {
    const entry = [...(record.reviewHistory ?? [])].reverse().find((e) => e.type === "returned_for_revision");
    return entry?.at ?? record.reviewedAt;
  };

  return (
    <div>
      <Header title={t("track.title")} subtitle={t("track.subtitle")} actions={<LanguageSwitcher />} />

      <div className="p-5 lg:p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {!found && (
            <form
              onSubmit={handleSearch}
              className="space-y-5 rounded-2xl border border-navy/5 bg-white p-5 shadow-card sm:p-8"
            >
              {error && (
                <div className="rounded-xl2 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy">{t("track.impactNumberField")}</label>
                <input
                  value={impactNumberInput}
                  onChange={(e) => setImpactNumberInput(e.target.value)}
                  placeholder={t("track.impactNumberPlaceholder")}
                  className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy">{t("track.mobileField")}</label>
                <input
                  value={mobileInput}
                  onChange={(e) => setMobileInput(e.target.value)}
                  placeholder={t("track.mobilePlaceholder")}
                  className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl2 bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
              >
                {t("track.searchButton")}
              </button>
              <button
                type="button"
                onClick={() => router.push("/submit")}
                className="block w-full text-center text-xs font-semibold text-sky-dark hover:underline"
              >
                {t("track.backToSubmit")}
              </button>
            </form>
          )}

          {found && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-navy/5 bg-white p-5 shadow-card sm:p-8">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-navy/5 pb-4">
                  <div>
                    <p className="text-xs font-semibold text-navy/40">{t("common.impactNumberLabel")}</p>
                    <p className="text-lg font-extrabold text-navy" dir="ltr">
                      {found.record.impactNumber}
                    </p>
                  </div>
                  <span className="rounded-full bg-sky/15 px-3 py-1 text-xs font-semibold text-sky-dark">
                    {found.track === "clinical" ? t("track.typeClinical") : t("track.typeOrganizational")}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-navy/40">{t("track.facilityLabel")}</p>
                    <p className="text-sm font-semibold text-navy">{facilityFor(found.record)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy/40">{t("track.departmentLabel")}</p>
                    <p className="text-sm font-semibold text-navy">{departmentFor(found)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy/40">{t("track.submissionDateLabel")}</p>
                    <p className="text-sm font-semibold text-navy">{formatDate(found.record.createdAt, language)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy/40">{t("track.statusLabel")}</p>
                    <p className="text-sm font-semibold text-navy">{TRACK_STATUS_LABELS[found.record.status][language]}</p>
                  </div>
                </div>

                {found.track === "clinical" && (
                  <div className="mt-4 border-t border-navy/5 pt-4">
                    <p className="mb-1.5 text-xs font-semibold text-navy/40">{t("track.categoryLabel")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(found.record.categories && found.record.categories.length > 0
                        ? found.record.categories
                        : [found.record.category]
                      ).map((c) => (
                        <span
                          key={c}
                          className="rounded-full border border-sky/40 bg-sky/10 px-2.5 py-1 text-xs font-medium text-sky-dark"
                        >
                          {language === "en" ? CATEGORY_LABELS_EN[c] : CATEGORY_LABELS[c]}
                        </span>
                      ))}
                    </div>
                    {(found.record.categories ?? [found.record.category]).includes("other") &&
                      found.record.categoryOtherText && (
                        <p className="mt-1.5 text-xs text-navy/50">{found.record.categoryOtherText}</p>
                      )}
                  </div>
                )}
              </div>

              {found.record.status === "returned_for_revision" && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
                  <p className="text-xs font-semibold text-amber-700">{t("track.reviewerReasonLabel")}</p>
                  <p className="mt-1 text-sm text-amber-900">{found.record.returnReason}</p>
                  {returnDateFor(found.record) && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-amber-700">{t("track.returnDateLabel")}</p>
                      <p className="text-sm font-semibold text-amber-900">
                        {formatDate(returnDateFor(found.record)!, language)}
                      </p>
                    </div>
                  )}
                  {found.record.revisionDeadline && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1">
                      <div>
                        <p className="text-xs font-semibold text-amber-700">{t("track.revisionDeadlineLabel")}</p>
                        <p className="text-sm font-semibold text-amber-900">
                          {formatDate(found.record.revisionDeadline, language)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-800">
                          {tDaysRemaining(
                            language,
                            Math.ceil((new Date(found.record.revisionDeadline).getTime() - Date.now()) / 86400000)
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  <p className="mt-3 text-xs leading-5 text-amber-800">{t("track.revisionInstructionNote")}</p>
                  <button
                    type="button"
                    onClick={() => router.push(editHref(found))}
                    className="mt-4 rounded-xl2 bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
                  >
                    {t("track.editResubmitButton")}
                  </button>
                </div>
              )}

              {found.record.status === "closed_expired" && (
                <div className="rounded-2xl border border-navy/10 bg-bgsoft p-5 sm:p-6">
                  {found.record.returnReason && (
                    <>
                      <p className="text-xs font-semibold text-navy/50">{t("track.reviewerReasonLabel")}</p>
                      <p className="mt-1 text-sm text-navy/70">{found.record.returnReason}</p>
                    </>
                  )}
                  <p className="mt-3 text-sm font-semibold text-navy/60">{t("track.expiredNotice")}</p>
                </div>
              )}

              {found.record.status === "rejected" && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:p-6">
                  <p className="text-xs font-semibold text-rose-700">{t("track.rejectionReasonLabel")}</p>
                  <p className="mt-1 text-sm text-rose-900">{found.record.rejectionReason}</p>
                </div>
              )}

              {found.record.status === "approved" && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <CheckCircleIcon className="h-5 w-5 shrink-0" />
                    {TRACK_STATUS_LABELS.approved[language]}
                  </div>
                  {found.record.impactNumber && (
                    // One independent certificate per credited person (creator
                    // + contributors), each with its own verification code. The
                    // tracker only gets the certificate of the person whose
                    // mobile number they searched with — never the other
                    // participants' (the reviewer sees all of them in /review).
                    <div className="flex flex-wrap gap-2">
                      {ownCertificates(found.record, foundMobile).map(({ person, index }, _i, own) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() =>
                            router.push(
                              `/submit/certificate/${encodeURIComponent(certificateCode(found.record.impactNumber!, index))}`
                            )
                          }
                          className="rounded-xl2 bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-light"
                        >
                          {own.length > 1
                            ? `${t("track.certificateFor")} ${person.name}`
                            : t("track.certificateButton")}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-2xl border border-navy/5 bg-white p-5 shadow-card sm:p-8">
                <h2 className="mb-4 text-sm font-bold text-navy">{t("track.timelineTitle")}</h2>
                <ol className="space-y-4">
                  {buildTimeline(found.record).map((entry, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-navy">{TIMELINE_EVENT_LABELS[entry.type][language]}</p>
                          {entry.actor && (
                            <span className="rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-semibold text-navy/50">
                              {ACTOR_LABELS[entry.actor][language]}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-navy/45">{formatDate(entry.at, language, true)}</p>
                        {entry.changes && entry.changes.length > 0 && (
                          <ul className="mt-2 space-y-1.5 rounded-xl2 bg-bgsoft p-3">
                            {entry.changes.map((change, changeIndex) => (
                              <li key={changeIndex} className="text-xs leading-5">
                                <span className="font-semibold text-navy/70">
                                  {(AUDIT_FIELD_LABELS[change.field]?.[language] ?? change.field) + ": "}
                                </span>
                                <span className="text-navy/45 line-through">{change.previousValue}</span>
                                <span className="mx-1.5 text-navy/30">→</span>
                                <span className="font-semibold text-navy">{change.newValue}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <button
                type="button"
                onClick={handleSearchAgain}
                className="block w-full rounded-xl2 border border-navy/10 bg-white px-5 py-2.5 text-center text-sm font-semibold text-navy hover:bg-bgsoft"
              >
                {t("track.searchAnother")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
