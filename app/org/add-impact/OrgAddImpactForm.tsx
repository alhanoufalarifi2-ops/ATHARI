"use client";

import Header from "@/components/Header";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SmsSimulationToast, { useSmsSimulation } from "@/components/SmsSimulationToast";
import SubmitterInfoFields, { EMPTY_SUBMITTER } from "@/components/SubmitterInfoFields";
import { CheckCircleIcon, PlusCircleIcon, SearchIcon, XIcon } from "@/components/icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  ORG_DOCUMENTATION_SOURCE_LABELS_EN,
  ORG_IMPACT_TYPE_LABELS_EN,
  tCreateNewInitiativeWithQuery,
  tEditingImpactBanner,
  tStartedOn,
} from "@/lib/i18n/translations";
import { useAthariStore } from "@/lib/store";
import { ORG_DOCUMENTATION_SOURCES, ORG_IMPACT_TYPE_LABELS, OrgImpactType, SubmitterInfo } from "@/lib/types";
import { formatArabicDate } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const orgTypes = Object.entries(ORG_IMPACT_TYPE_LABELS) as [OrgImpactType, string][];
const OTHER_DEPARTMENT = "__other__";
const OTHER_DOC_SOURCE = "أخرى";

export default function OrgAddImpactForm() {
  const router = useRouter();
  const pathname = usePathname();
  // Reached via the QR-code "/submit" entry point rather than the internal
  // navigation — same form, same submit logic, only the cancel destination
  // differs so it never sends a public submitter into the dashboard. Also
  // gates the language switcher — see the matching comment in AddImpactForm.
  const isQrEntry = pathname?.startsWith("/submit");
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const departments = useAthariStore((s) => s.departments);
  const initiatives = useAthariStore((s) => s.initiatives);
  const organizationalImpacts = useAthariStore((s) => s.organizationalImpacts);
  const findOrCreateDepartment = useAthariStore((s) => s.findOrCreateDepartment);
  const createInitiative = useAthariStore((s) => s.createInitiative);
  const addOrganizationalImpact = useAthariStore((s) => s.addOrganizationalImpact);
  const resubmitOrganizationalImpact = useAthariStore((s) => s.resubmitOrganizationalImpact);
  const expireOverdueRevisions = useAthariStore((s) => s.expireOverdueRevisions);

  // Edit & Resubmit: reached from Track Impact for a "returned_for_revision"
  // request — /submit/organizational?editOrgImpactId=<id>. Since an
  // initiative is a shared/reusable entity, editing locks initiativeMode to
  // "search" with the initiative fixed — only the impact-level fields below
  // are editable.
  const editOrgImpactId = searchParams.get("editOrgImpactId");
  const editingOrgImpact = editOrgImpactId
    ? organizationalImpacts.find((i) => i.id === editOrgImpactId)
    : undefined;

  useEffect(() => {
    expireOverdueRevisions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prefillInitiativeId = editingOrgImpact?.initiativeId ?? searchParams.get("initiativeId");
  // Facility/scope aren't stored on the OrganizationalImpact record yet, so
  // they only surface as a read-only banner here — carried from the /submit
  // QR wizard.
  const contextScope = searchParams.get("scope");
  const contextFacility = searchParams.get("facility");

  // A QR submitter creating an organizational impact almost always has no
  // existing initiative to search for — defaulting to "search" mode there
  // left them stuck on an inline "اختر مبادرة" validation error with no
  // initiative to pick, so the request silently never reached the store.
  // Internal use (or a direct initiativeId prefill) keeps the original
  // "search" default. Editing always locks to "search" with the initiative fixed.
  const [initiativeMode, setInitiativeMode] = useState<"search" | "new">(
    editingOrgImpact ? "search" : isQrEntry && !prefillInitiativeId ? "new" : "search"
  );
  const [initiativeQuery, setInitiativeQuery] = useState("");
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(prefillInitiativeId ?? null);

  const [newName, setNewName] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newCustomDepartmentName, setNewCustomDepartmentName] = useState("");
  // A QR (/submit) entry collects the responsible department as a plain
  // required free-text field right here — no dropdown, no suggestions, no
  // "other" reveal, and nothing carried over from the wizard (which no
  // longer asks for it). Works identically for a hospital, a manually-named
  // PHC, or the Cluster Executive Administration since none of those affect
  // this field.
  const [employeeDepartment, setEmployeeDepartment] = useState("");
  const [newType, setNewType] = useState<OrgImpactType>("project");
  const [newTypeOtherText, setNewTypeOtherText] = useState("");
  const [newStartDate, setNewStartDate] = useState("");

  const [eventDate, setEventDate] = useState(editingOrgImpact?.eventDate ?? new Date().toISOString().slice(0, 10));
  const [previousState, setPreviousState] = useState(editingOrgImpact?.previousState ?? "");
  const [whatWasDone, setWhatWasDone] = useState(editingOrgImpact?.whatWasDone ?? "");
  const [resultingChange, setResultingChange] = useState(editingOrgImpact?.resultingChange ?? "");
  const [metricName, setMetricName] = useState(editingOrgImpact?.metricName ?? "");
  const [beforeValue, setBeforeValue] = useState(editingOrgImpact?.beforeValue ?? "");
  const [afterValue, setAfterValue] = useState(editingOrgImpact?.afterValue ?? "");
  // Participating departments are free text the submitter types in — never
  // inferred from, or mixed with, the initiative's "القسم المسؤول" above.
  const [participatingDepartments, setParticipatingDepartments] = useState<string[]>(
    editingOrgImpact?.departments && editingOrgImpact.departments.length > 0 ? editingOrgImpact.departments : [""]
  );
  const [description, setDescription] = useState(editingOrgImpact?.description ?? "");
  const [documentationSource, setDocumentationSource] = useState(
    editingOrgImpact?.documentationSource ?? ORG_DOCUMENTATION_SOURCES[0]
  );
  const [documentationSourceOtherText, setDocumentationSourceOtherText] = useState(
    editingOrgImpact?.documentationSourceOtherText ?? ""
  );
  const [referenceNote, setReferenceNote] = useState(editingOrgImpact?.referenceNote ?? "");
  const [submitters, setSubmitters] = useState<SubmitterInfo[]>(
    editingOrgImpact?.submitters && editingOrgImpact.submitters.length > 0
      ? editingOrgImpact.submitters
      : [{ ...EMPTY_SUBMITTER }]
  );
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  // Only meaningful when isQrEntry (see enablePrimaryOtpDemo below) — the
  // internal /org/add-impact form never shows the OTP block, so this stays
  // unused/irrelevant there. Gated in handleSubmit so a disabled submit
  // button is never the only thing stopping an unverified submission.
  const [primaryOtpVerified, setPrimaryOtpVerified] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedImpactNumber, setSubmittedImpactNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const { sms, showSms, dismissSms } = useSmsSimulation();

  // On a fresh page load (as opposed to client-side navigation from Track
  // Impact), the zustand persist middleware hasn't rehydrated localStorage
  // yet on the very first render — organizationalImpacts is still empty, so
  // editingOrgImpact resolves to undefined and the useState initializers
  // above lock in empty defaults. This effect re-syncs every field once the
  // real record becomes available post-hydration; it's a no-op (same values)
  // on the already-hydrated fast path.
  const editPrefilledRef = useRef(false);
  useEffect(() => {
    if (!editingOrgImpact || editPrefilledRef.current) return;
    editPrefilledRef.current = true;
    setInitiativeMode("search");
    setSelectedInitiativeId(editingOrgImpact.initiativeId);
    setEventDate(editingOrgImpact.eventDate);
    setPreviousState(editingOrgImpact.previousState);
    setWhatWasDone(editingOrgImpact.whatWasDone);
    setResultingChange(editingOrgImpact.resultingChange);
    setMetricName(editingOrgImpact.metricName ?? "");
    setBeforeValue(editingOrgImpact.beforeValue ?? "");
    setAfterValue(editingOrgImpact.afterValue ?? "");
    setParticipatingDepartments(editingOrgImpact.departments.length > 0 ? editingOrgImpact.departments : [""]);
    setDescription(editingOrgImpact.description ?? "");
    setDocumentationSource(editingOrgImpact.documentationSource);
    setDocumentationSourceOtherText(editingOrgImpact.documentationSourceOtherText ?? "");
    setReferenceNote(editingOrgImpact.referenceNote ?? "");
    setSubmitters(
      editingOrgImpact.submitters && editingOrgImpact.submitters.length > 0
        ? editingOrgImpact.submitters
        : [{ ...EMPTY_SUBMITTER }]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingOrgImpact]);

  // The employee may have scrolled far down a long form to reach "Submit for
  // Review" — the success confirmation (with the generated Impact Number)
  // renders at the top of the form, above the current scroll position, so it
  // was going unseen. This brings it into view right after it renders.
  // "instant" (not "smooth"): see the matching note on decisionCardRef in
  // app/review/[id]/page.tsx — smooth scrollIntoView was verified to
  // sometimes never actually move the scroll position at all.
  const successBannerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!submitted) return;
    successBannerRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [submitted]);

  const deptName = (id: string) => departments.find((d) => d.id === id)?.name ?? id;

  const selectedInitiative = selectedInitiativeId
    ? initiatives.find((i) => i.id === selectedInitiativeId)
    : undefined;

  const filteredInitiatives = useMemo(() => {
    const q = initiativeQuery.trim();
    const list = q ? initiatives.filter((i) => i.name.includes(q)) : initiatives;
    return [...list].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).slice(0, 8);
  }, [initiatives, initiativeQuery]);

  const handleCopyImpactNumber = async () => {
    try {
      await navigator.clipboard.writeText(submittedImpactNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — the number is already visible to copy manually.
    }
  };

  const addParticipatingDepartment = () => setParticipatingDepartments((prev) => [...prev, ""]);
  const updateParticipatingDepartment = (index: number, value: string) =>
    setParticipatingDepartments((prev) => prev.map((d, i) => (i === index ? value : d)));
  const removeParticipatingDepartment = (index: number) =>
    setParticipatingDepartments((prev) => prev.filter((_, i) => i !== index));

  const resetForm = () => {
    setPreviousState("");
    setWhatWasDone("");
    setResultingChange("");
    setMetricName("");
    setBeforeValue("");
    setAfterValue("");
    setParticipatingDepartments([""]);
    setDescription("");
    setDocumentationSource(ORG_DOCUMENTATION_SOURCES[0]);
    setDocumentationSourceOtherText("");
    setReferenceNote("");
    setDeclarationAccepted(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);

    const isNewCustomDept = newDepartment === OTHER_DEPARTMENT;
    const isNewCustomType = newType === "other";
    const hasParticipatingDepartment = participatingDepartments.some((d) => d.trim());
    const isCustomDocSource = documentationSource === OTHER_DOC_SOURCE;

    if (initiativeMode === "search" && !selectedInitiativeId) {
      setError(t("org.selectInitiativeError"));
      return;
    }
    if (
      initiativeMode === "new" &&
      (!newName.trim() ||
        (isQrEntry ? !employeeDepartment.trim() : !newDepartment || (isNewCustomDept && !newCustomDepartmentName.trim())) ||
        (isNewCustomType && !newTypeOtherText.trim()) ||
        !newStartDate)
    ) {
      setError(t("org.newInitiativeError"));
      return;
    }
    if (
      !eventDate ||
      !previousState.trim() ||
      !whatWasDone.trim() ||
      !resultingChange.trim() ||
      !hasParticipatingDepartment ||
      !documentationSource ||
      (isCustomDocSource && !documentationSourceOtherText.trim()) ||
      !submitters.every((p) => p.name.trim() && p.phone.trim() && p.email.trim() && p.jobTitle.trim())
    ) {
      setError(t("org.requiredFieldsError"));
      return;
    }

    // Impact Date: never in the future (local calendar day), and never before
    // the initiative's own start date. Checked at submission time only —
    // existing/legacy records are never re-validated or blocked from displaying.
    const nowLocal = new Date();
    const todayLocal = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, "0")}-${String(
      nowLocal.getDate()
    ).padStart(2, "0")}`;
    const initiativeStart = initiativeMode === "search" ? selectedInitiative?.startDate : newStartDate;
    if (eventDate > todayLocal) {
      setError(t("org.eventDateFuture"));
      return;
    }
    if (initiativeStart && eventDate < initiativeStart) {
      setError(t("org.eventDateBeforeStart"));
      return;
    }

    if (isQrEntry && !primaryOtpVerified) {
      setError(t("otp.verificationRequiredError"));
      return;
    }

    if (!declarationAccepted) {
      setError(t("declaration.requiredError"));
      return;
    }

    let initiativeId: string;
    if (initiativeMode === "search") {
      initiativeId = selectedInitiativeId!;
    } else {
      const departmentId = isQrEntry
        ? findOrCreateDepartment(employeeDepartment.trim())
        : isNewCustomDept
        ? findOrCreateDepartment(newCustomDepartmentName)
        : newDepartment;
      initiativeId = createInitiative({
        name: newName,
        department: departmentId,
        type: newType,
        typeOtherText: isNewCustomType ? newTypeOtherText.trim() : undefined,
        startDate: newStartDate,
      });
      // Switch to "search" mode with the freshly created initiative selected,
      // so a second impact for the same initiative won't create a duplicate.
      setInitiativeMode("search");
      setSelectedInitiativeId(initiativeId);
      setNewName("");
      setNewDepartment("");
      setNewCustomDepartmentName("");
      setNewType("project");
      setNewTypeOtherText("");
      setNewStartDate("");
    }

    const trimmedDepartments = participatingDepartments.map((d) => d.trim()).filter(Boolean);
    const trimmedSubmitters = submitters.map((p) => ({
      name: p.name.trim(),
      phone: p.phone.trim(),
      email: p.email.trim(),
      jobTitle: p.jobTitle.trim(),
    }));

    const payload = {
      initiativeId,
      eventDate,
      previousState,
      whatWasDone,
      resultingChange,
      metricName: metricName || undefined,
      beforeValue: beforeValue || undefined,
      afterValue: afterValue || undefined,
      departments: trimmedDepartments,
      description: description || undefined,
      documentationSource,
      documentationSourceOtherText: isCustomDocSource ? documentationSourceOtherText.trim() : undefined,
      referenceNote: referenceNote || undefined,
      submitters: trimmedSubmitters,
      scope: contextScope ?? undefined,
      facility: contextFacility ?? undefined,
    };

    let impactNumber: string;
    if (editingOrgImpact) {
      resubmitOrganizationalImpact(editingOrgImpact.id, payload);
      impactNumber = editingOrgImpact.impactNumber ?? "";
    } else {
      impactNumber = addOrganizationalImpact(payload);
    }
    setSubmittedImpactNumber(impactNumber);

    // Demo-only simulated SMS to the Primary Submitter (first in the list) —
    // see components/SmsSimulationToast.tsx. Purely visual, no real message.
    const primaryPhone = trimmedSubmitters[0]?.phone;
    if (isQrEntry && primaryPhone && impactNumber) {
      showSms({ event: editingOrgImpact ? "resubmitted" : "submitted", impactNumber, phone: primaryPhone });
    }

    setSubmitted(true);
    if (editingOrgImpact) {
      // The record's status just flipped away from "returned_for_revision",
      // which would otherwise make the dead-end guard below kick in on the
      // next render — leave for Track Impact instead of lingering here.
      setTimeout(() => router.push("/submit/track"), 1500);
    } else {
      resetForm();
      // No auto-dismiss timer: the banner holds an actionable Impact Number
      // (with a Copy button) the employee may need a moment to read or copy,
      // and a fixed timeout risks hiding it before they've done either. It
      // stays until they start a new submission (see handleSubmit below).
    }
  };

  // The employee followed an Edit & Resubmit link for a request that's no
  // longer editable (already resubmitted from another tab, expired, or
  // otherwise moved on) — show a clear dead-end instead of a broken form.
  if (editOrgImpactId && !submitted && (!editingOrgImpact || editingOrgImpact.status !== "returned_for_revision")) {
    return (
      <div>
        <Header
          title={t("org.editTitle")}
          subtitle={t("org.editSubtitle")}
          actions={isQrEntry ? <LanguageSwitcher /> : undefined}
        />
        <div className="p-5 lg:p-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-navy/5 bg-white p-6 text-center shadow-card">
            <p className="text-sm font-semibold text-rose-600">{t("org.expiredEditError")}</p>
            <button
              type="button"
              onClick={() => router.push("/submit/track")}
              className="mt-4 rounded-xl2 bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
            >
              {t("track.title")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SmsSimulationToast sms={sms} onDismiss={dismissSms} />
      <Header
        title={editingOrgImpact ? t("org.editTitle") : t("org.title")}
        subtitle={editingOrgImpact ? t("org.editSubtitle") : t("org.subtitle")}
        actions={isQrEntry ? <LanguageSwitcher /> : undefined}
      />

      <div className="p-5 lg:p-8">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-navy/5 bg-white p-5 shadow-card sm:p-8"
        >
          {isQrEntry && (contextScope || contextFacility) && (
            <div className="rounded-xl2 bg-sky/10 px-4 py-2.5 text-xs font-semibold text-navy/70">
              {contextScope}
              {contextScope && contextFacility && " — "}
              {contextFacility}
            </div>
          )}
          {editingOrgImpact?.impactNumber && (
            <div className="rounded-xl2 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800">
              {tEditingImpactBanner(language, editingOrgImpact.impactNumber)}
            </div>
          )}
          {submitted && (
            <div ref={successBannerRef} className="rounded-xl2 bg-emerald-50 px-4 py-4 text-emerald-700">
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="h-5 w-5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold">
                    {editingOrgImpact ? t("org.resubmitSuccessMessage") : t("common.submissionSuccessTitle")}
                  </p>
                  {!editingOrgImpact && (
                    <p className="mt-0.5 text-xs font-normal text-emerald-800">{t("common.submissionSuccessThanks")}</p>
                  )}
                  {isQrEntry && submittedImpactNumber && (
                    <>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-xl2 bg-white/70 px-3 py-2">
                        <span className="text-xs font-semibold text-emerald-800">{t("common.impactNumberLabel")}:</span>
                        <span className="text-base font-extrabold tracking-wide text-emerald-900" dir="ltr">
                          {submittedImpactNumber}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyImpactNumber}
                          className="ms-auto rounded-lg border border-emerald-300 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          {copied ? t("common.copied") : t("common.copy")}
                        </button>
                      </div>
                      <p className="mt-1.5 text-xs font-normal text-emerald-800">{t("common.keepNumberForTracking")}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-3 text-sm font-bold text-navy">{t("org.initiativeInfo")}</h2>

            {!editingOrgImpact && (
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInitiativeMode("search");
                    setSelectedInitiativeId(null);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    initiativeMode === "search"
                      ? "border-sky bg-sky text-navy font-semibold"
                      : "border-navy/10 text-navy/60 hover:bg-bgsoft"
                  }`}
                >
                  {t("org.selectExistingInitiative")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInitiativeMode("new");
                    setSelectedInitiativeId(null);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    initiativeMode === "new"
                      ? "border-sky bg-sky text-navy font-semibold"
                      : "border-navy/10 text-navy/60 hover:bg-bgsoft"
                  }`}
                >
                  {t("org.createNewInitiative")}
                </button>
              </div>
            )}

            {initiativeMode === "search" &&
              (selectedInitiative ? (
                <div className="rounded-xl2 border border-sky/30 bg-sky/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-navy">{selectedInitiative.name}</p>
                      <p className="mt-1 text-xs text-navy/50">
                        {deptName(selectedInitiative.department)} ·{" "}
                        {language === "en"
                          ? ORG_IMPACT_TYPE_LABELS_EN[selectedInitiative.type]
                          : ORG_IMPACT_TYPE_LABELS[selectedInitiative.type]}{" "}
                        · {tStartedOn(language, formatArabicDate(selectedInitiative.startDate))}
                      </p>
                    </div>
                    {!editingOrgImpact && (
                      <button
                        type="button"
                        onClick={() => setSelectedInitiativeId(null)}
                        className="shrink-0 text-xs font-semibold text-sky-dark hover:underline"
                      >
                        {t("common.change")}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="relative mb-2">
                    <SearchIcon className="pointer-events-none absolute top-1/2 end-3.5 h-4 w-4 -translate-y-1/2 text-navy/30" />
                    <input
                      value={initiativeQuery}
                      onChange={(e) => setInitiativeQuery(e.target.value)}
                      placeholder={t("org.searchInitiativePlaceholder")}
                      className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 pe-10 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto rounded-xl2 border border-navy/10">
                    {filteredInitiatives.map((init) => (
                      <button
                        type="button"
                        key={init.id}
                        onClick={() => setSelectedInitiativeId(init.id)}
                        className="flex w-full flex-col items-start gap-0.5 border-b border-navy/5 px-3 py-2.5 text-right last:border-0 hover:bg-bgsoft"
                      >
                        <span className="text-sm font-semibold text-navy">{init.name}</span>
                        <span className="text-xs text-navy/45">
                          {deptName(init.department)} — {new Date(init.startDate).getFullYear()}
                        </span>
                      </button>
                    ))}
                    {filteredInitiatives.length === 0 && (
                      <div className="px-3 py-4 text-center text-sm text-navy/40">
                        {t("org.noMatchingInitiatives")}
                        <button
                          type="button"
                          onClick={() => {
                            setInitiativeMode("new");
                            setNewName(initiativeQuery);
                          }}
                          className="mt-2 block w-full font-semibold text-sky-dark hover:underline"
                        >
                          {tCreateNewInitiativeWithQuery(language, initiativeQuery)}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

            {initiativeMode === "new" && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-navy">{t("org.initiativeName")}</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={t("org.initiativeNamePlaceholder")}
                    className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                </div>
                {isQrEntry ? (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-navy">{t("org.responsibleDepartment")}</label>
                    <input
                      value={employeeDepartment}
                      onChange={(e) => setEmployeeDepartment(e.target.value)}
                      placeholder={t("wizard.departmentPlaceholder")}
                      className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-navy">{t("org.responsibleDepartment")}</label>
                    <select
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                    >
                      <option value="">{t("common.selectDepartment")}</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                      <option value={OTHER_DEPARTMENT}>{t("common.other")}</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-navy">{t("org.initiativeType")}</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as OrgImpactType)}
                    className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  >
                    {orgTypes.map(([value, label]) => (
                      <option key={value} value={value}>
                        {language === "en" ? ORG_IMPACT_TYPE_LABELS_EN[value] : label}
                      </option>
                    ))}
                  </select>
                  {newType === "other" && (
                    <input
                      value={newTypeOtherText}
                      onChange={(e) => setNewTypeOtherText(e.target.value)}
                      placeholder={t("common.pleaseSpecify")}
                      className="mt-2.5 w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                    />
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-navy">{t("org.startDate")}</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                </div>
                {!isQrEntry && newDepartment === OTHER_DEPARTMENT && (
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-navy">{t("common.pleaseSpecifyLabel")}</label>
                    <input
                      value={newCustomDepartmentName}
                      onChange={(e) => setNewCustomDepartmentName(e.target.value)}
                      placeholder={t("org.customDeptPlaceholder")}
                      className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="sm:max-w-[calc(50%-0.625rem)]">
            <label className="mb-1.5 block text-sm font-semibold text-navy">{t("org.eventDate")}</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">{t("org.previousState")}</label>
            <textarea
              value={previousState}
              onChange={(e) => setPreviousState(e.target.value)}
              rows={2}
              placeholder={t("org.previousStatePlaceholder")}
              className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">{t("org.whatWasDone")}</label>
            <textarea
              value={whatWasDone}
              onChange={(e) => setWhatWasDone(e.target.value)}
              rows={2}
              placeholder={t("org.whatWasDonePlaceholder")}
              className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">{t("org.resultingChange")}</label>
            <textarea
              value={resultingChange}
              onChange={(e) => setResultingChange(e.target.value)}
              rows={2}
              placeholder={t("org.resultingChangePlaceholder")}
              className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">
                {t("org.metricName")} <span className="font-normal text-navy/40">({t("common.optional")})</span>
              </label>
              <input
                value={metricName}
                onChange={(e) => setMetricName(e.target.value)}
                placeholder={t("org.metricNamePlaceholder")}
                className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">
                {t("org.beforeValue")} <span className="font-normal text-navy/40">({t("common.optional")})</span>
              </label>
              <input
                value={beforeValue}
                onChange={(e) => setBeforeValue(e.target.value)}
                placeholder={t("org.beforeValuePlaceholder")}
                className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">
                {t("org.afterValue")} <span className="font-normal text-navy/40">({t("common.optional")})</span>
              </label>
              <input
                value={afterValue}
                onChange={(e) => setAfterValue(e.target.value)}
                placeholder={t("org.afterValuePlaceholder")}
                className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">{t("org.participatingDepartments")}</label>
            <div className="space-y-2">
              {participatingDepartments.map((dept, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={dept}
                    onChange={(e) => updateParticipatingDepartment(index, e.target.value)}
                    placeholder={t("common.departmentName")}
                    className="flex-1 rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                  {participatingDepartments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParticipatingDepartment(index)}
                      aria-label={t("common.removeDepartment")}
                      className="shrink-0 rounded-lg p-2 text-navy/40 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addParticipatingDepartment}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-dark hover:underline"
            >
              <PlusCircleIcon className="h-3.5 w-3.5" />
              {t("common.addAnotherDepartment")}
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              {t("org.briefDescription")} <span className="font-normal text-navy/40">({t("common.optional")})</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t("org.briefDescriptionPlaceholder")}
              className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">{t("org.documentationSource")}</label>
              <select
                value={documentationSource}
                onChange={(e) => setDocumentationSource(e.target.value)}
                className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
              >
                {ORG_DOCUMENTATION_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {language === "en" ? ORG_DOCUMENTATION_SOURCE_LABELS_EN[s] ?? s : s}
                  </option>
                ))}
              </select>
              {documentationSource === OTHER_DOC_SOURCE && (
                <input
                  value={documentationSourceOtherText}
                  onChange={(e) => setDocumentationSourceOtherText(e.target.value)}
                  placeholder={t("common.pleaseSpecify")}
                  className="mt-2.5 w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                />
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">
                {t("org.referenceNote")} <span className="font-normal text-navy/40">{t("org.referenceNoteHint")}</span>
              </label>
              <input
                value={referenceNote}
                onChange={(e) => setReferenceNote(e.target.value)}
                placeholder={t("org.referenceNotePlaceholder")}
                className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
              />
            </div>
          </div>

          <SubmitterInfoFields
            value={submitters}
            onChange={setSubmitters}
            enablePrimaryOtpDemo={isQrEntry}
            onPrimaryOtpVerifiedChange={setPrimaryOtpVerified}
          />

          <div className="rounded-xl2 border border-navy/10 bg-bgsoft p-4">
            <label className="flex items-start gap-2.5 text-sm text-navy">
              <input
                type="checkbox"
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-navy/20 text-sky focus:ring-2 focus:ring-sky/20"
              />
              <span>{t("declaration.text")}</span>
            </label>
          </div>

          {error && (
            <div className="rounded-xl2 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>
          )}

          <div className="flex justify-end gap-3 border-t border-navy/5 pt-5">
            <button
              type="button"
              onClick={() => router.push(editingOrgImpact ? "/submit/track" : isQrEntry ? "/submit" : "/org/initiatives")}
              className="rounded-xl2 border border-navy/10 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-bgsoft"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="rounded-xl2 bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
            >
              {t("common.submitForReview")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
