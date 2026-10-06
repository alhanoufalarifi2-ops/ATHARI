"use client";

import Header from "@/components/Header";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SmsSimulationToast, { useSmsSimulation } from "@/components/SmsSimulationToast";
import SubmitterInfoFields, { EMPTY_SUBMITTER } from "@/components/SubmitterInfoFields";
import { CheckCircleIcon, PlusCircleIcon, XIcon } from "@/components/icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CATEGORY_LABELS_EN, DOCUMENTATION_SOURCE_LABELS_EN, tEditingImpactBanner } from "@/lib/i18n/translations";
import { useAthariStore } from "@/lib/store";
import { CATEGORY_LABELS, DOCUMENTATION_SOURCES, ImpactCategory, SubmitterInfo } from "@/lib/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

const categories = Object.entries(CATEGORY_LABELS) as [ImpactCategory, string][];
const OTHER_DEPARTMENT = "__other__";
const OTHER_DOC_SOURCE = "أخرى";

export default function AddImpactForm() {
  const router = useRouter();
  const pathname = usePathname();
  // Reached via the QR-code "/submit" entry point rather than the internal
  // navigation — same form, same submit logic, only the cancel destination
  // differs so it never sends a public submitter into the dashboard. It also
  // gates the language switcher: this form renders outside a LanguageProvider
  // at /add-impact, so useLanguage() there always resolves to Arabic-only —
  // the switcher would have nothing to switch, so it's only shown when
  // actually reached through the bilingual /submit journey.
  const isQrEntry = pathname?.startsWith("/submit");
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const patients = useAthariStore((s) => s.patients);
  const impacts = useAthariStore((s) => s.impacts);
  const departments = useAthariStore((s) => s.departments);
  const findOrCreatePatient = useAthariStore((s) => s.findOrCreatePatient);
  const findOrCreateDepartment = useAthariStore((s) => s.findOrCreateDepartment);
  const addImpact = useAthariStore((s) => s.addImpact);
  const resubmitImpact = useAthariStore((s) => s.resubmitImpact);
  const expireOverdueRevisions = useAthariStore((s) => s.expireOverdueRevisions);

  // Edit & Resubmit: reached from Track Impact for a "returned_for_revision"
  // request — /submit/clinical?editImpactId=<id>. Same form, same fields;
  // submitting calls resubmitImpact instead of addImpact so the id and
  // impactNumber never change and the review history trail is preserved.
  const editImpactId = searchParams.get("editImpactId");
  const editingImpact = editImpactId ? impacts.find((i) => i.id === editImpactId) : undefined;
  const editingPatient = editingImpact ? patients.find((p) => p.id === editingImpact.patientId) : undefined;

  useEffect(() => {
    expireOverdueRevisions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prefillPatientId = searchParams.get("patientId");
  const prefillPatient = editingPatient ?? (prefillPatientId ? patients.find((p) => p.id === prefillPatientId) : undefined);
  // Facility/scope aren't stored on the Impact record yet, so they only
  // surface as a read-only banner here — carried from the /submit QR wizard.
  const contextScope = searchParams.get("scope");
  const contextFacility = searchParams.get("facility");

  const [mrn, setMrn] = useState(prefillPatient?.mrn ?? "");
  const [patientDepartment, setPatientDepartment] = useState(prefillPatient?.department ?? "");
  const [customDepartmentName, setCustomDepartmentName] = useState("");
  // A QR (/submit) entry collects the lead department as a plain required
  // free-text field right here — no dropdown, no suggestions, no "other"
  // reveal, and nothing carried over from the wizard (which no longer asks
  // for it). Works identically for a hospital, a manually-named PHC, or the
  // Cluster Executive Administration since none of those affect this field.
  // Prefilled from THIS impact's own submittingDepartment when editing — never
  // from the patient's shared department field, which may since have been
  // overwritten by a different, independently-submitted impact for the same MRN.
  const [employeeDepartment, setEmployeeDepartment] = useState(
    editingImpact?.submittingDepartment ??
      (editingPatient ? departments.find((d) => d.id === editingPatient.department)?.name ?? "" : "")
  );
  // This impact's OWN admission episode when editing — never the patient's
  // shared field, which may since reflect a different, later admission.
  const [admissionDate, setAdmissionDate] = useState(
    editingImpact?.admissionDate ?? prefillPatient?.admissionDate ?? ""
  );

  const [eventDate, setEventDate] = useState(editingImpact?.eventDate ?? new Date().toISOString().slice(0, 10));
  const [previousStatus, setPreviousStatus] = useState(editingImpact?.previousStatus ?? "");
  const [whatChanged, setWhatChanged] = useState(editingImpact?.whatChanged ?? "");
  const [currentOutcome, setCurrentOutcome] = useState(editingImpact?.currentOutcome ?? "");
  // Multi-select: one or more predefined Clinical Impact Types per impact.
  // Starts empty for a brand-new submission (the employee must actively pick
  // at least one) and is prefilled from the record's `categories` array when
  // editing, falling back to its single legacy `category` when `categories`
  // is absent.
  const [selectedCategories, setSelectedCategories] = useState<ImpactCategory[]>(
    editingImpact ? editingImpact.categories && editingImpact.categories.length > 0 ? editingImpact.categories : [editingImpact.category] : []
  );
  const [categoryOtherText, setCategoryOtherText] = useState(editingImpact?.categoryOtherText ?? "");
  // Participating departments are free text the submitter types in — never
  // inferred from, or mixed with, the lead "القسم" selected above. One input
  // to start, "+" adds another, each can be removed independently.
  const [participatingDepartments, setParticipatingDepartments] = useState<string[]>(
    editingImpact?.departments && editingImpact.departments.length > 0 ? editingImpact.departments : [""]
  );
  const [description, setDescription] = useState(editingImpact?.description ?? "");
  const [documentationSource, setDocumentationSource] = useState(editingImpact?.documentationSource ?? DOCUMENTATION_SOURCES[0]);
  const [documentationSourceOtherText, setDocumentationSourceOtherText] = useState(
    editingImpact?.documentationSourceOtherText ?? ""
  );
  const [evidenceRef, setEvidenceRef] = useState(editingImpact?.evidenceRef ?? "");
  const [submitters, setSubmitters] = useState<SubmitterInfo[]>(
    editingImpact?.submitters && editingImpact.submitters.length > 0
      ? editingImpact.submitters
      : editingImpact?.submitter
      ? [editingImpact.submitter]
      : [{ ...EMPTY_SUBMITTER }]
  );
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  // Only meaningful when isQrEntry (see enablePrimaryOtpDemo below) — the
  // internal /add-impact form never shows the OTP block, so this stays
  // unused/irrelevant there. Gated in handleSubmit so a disabled submit
  // button is never the only thing stopping an unverified submission.
  const [primaryOtpVerified, setPrimaryOtpVerified] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedImpactNumber, setSubmittedImpactNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const { sms, showSms, dismissSms } = useSmsSimulation();
  const [matchedExisting, setMatchedExisting] = useState(!!prefillPatient);

  const lastAutoFilledMrn = useRef<string | null>(null);

  // On a fresh page load (as opposed to client-side navigation from Track
  // Impact), the zustand persist middleware hasn't rehydrated localStorage
  // yet on the very first render — impacts/patients are still the seed
  // arrays, so editingImpact/editingPatient resolve to undefined and the
  // useState initializers above lock in empty defaults. This effect re-syncs
  // every field once the real record becomes available post-hydration; it's
  // a no-op (same values) on the already-hydrated fast path.
  const editPrefilledRef = useRef(false);
  useEffect(() => {
    if (!editingImpact || editPrefilledRef.current) return;
    editPrefilledRef.current = true;
    const p = patients.find((pt) => pt.id === editingImpact.patientId);
    setMrn(p?.mrn ?? "");
    setEmployeeDepartment(
      editingImpact.submittingDepartment ?? (p ? departments.find((d) => d.id === p.department)?.name ?? "" : "")
    );
    // This impact's OWN admission episode — never the patient's shared
    // field, which may since reflect a different, later admission.
    setAdmissionDate(editingImpact.admissionDate ?? p?.admissionDate ?? "");
    setEventDate(editingImpact.eventDate);
    setPreviousStatus(editingImpact.previousStatus);
    setWhatChanged(editingImpact.whatChanged);
    setCurrentOutcome(editingImpact.currentOutcome);
    setSelectedCategories(
      editingImpact.categories && editingImpact.categories.length > 0 ? editingImpact.categories : [editingImpact.category]
    );
    setCategoryOtherText(editingImpact.categoryOtherText ?? "");
    setParticipatingDepartments(editingImpact.departments.length > 0 ? editingImpact.departments : [""]);
    setDescription(editingImpact.description);
    setDocumentationSource(editingImpact.documentationSource);
    setDocumentationSourceOtherText(editingImpact.documentationSourceOtherText ?? "");
    setEvidenceRef(editingImpact.evidenceRef ?? "");
    setSubmitters(
      editingImpact.submitters && editingImpact.submitters.length > 0
        ? editingImpact.submitters
        : editingImpact.submitter
        ? [editingImpact.submitter]
        : [{ ...EMPTY_SUBMITTER }]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingImpact, patients, departments]);

  // When the entered MRN exactly matches a patient already known to ATHARI,
  // pull in their saved details automatically — the fields stay fully editable.
  useEffect(() => {
    const trimmed = mrn.trim().toLowerCase();
    if (!trimmed) {
      setMatchedExisting(false);
      return;
    }
    const existing = patients.find((p) => p.mrn.trim().toLowerCase() === trimmed);
    if (existing) {
      setMatchedExisting(true);
      if (lastAutoFilledMrn.current !== trimmed) {
        lastAutoFilledMrn.current = trimmed;
        setPatientDepartment(existing.department);
        setCustomDepartmentName("");
        setAdmissionDate(existing.admissionDate);
      }
    } else {
      setMatchedExisting(false);
      lastAutoFilledMrn.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mrn, patients]);

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

  const toggleCategory = (value: ImpactCategory) =>
    setSelectedCategories((prev) => (prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]));

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
    setPreviousStatus("");
    setWhatChanged("");
    setCurrentOutcome("");
    setSelectedCategories([]);
    setCategoryOtherText("");
    setParticipatingDepartments([""]);
    setDescription("");
    setDocumentationSource(DOCUMENTATION_SOURCES[0]);
    setDocumentationSourceOtherText("");
    setEvidenceRef("");
    setDeclarationAccepted(false);
  };

  const departmentNameFor = (departmentId: string) =>
    departments.find((d) => d.id === departmentId)?.name ?? "";

  const finalizeSubmit = (
    applyEditsIfExisting: boolean,
    patientData: { mrn: string; departmentName: string; admissionDate: string }
  ) => {
    const departmentId = findOrCreateDepartment(patientData.departmentName);
    const patientId = findOrCreatePatient(
      { mrn: patientData.mrn, department: departmentId, admissionDate: patientData.admissionDate },
      { applyEditsIfExisting }
    );

    const trimmedDepartments = participatingDepartments.map((d) => d.trim()).filter(Boolean);
    const trimmedSubmitters = submitters.map((p) => ({
      name: p.name.trim(),
      phone: p.phone.trim(),
      email: p.email.trim(),
      jobTitle: p.jobTitle.trim(),
    }));

    const payload = {
      patientId,
      admissionDate: patientData.admissionDate,
      eventDate,
      previousStatus,
      whatChanged,
      currentOutcome,
      category: selectedCategories[0],
      categories: selectedCategories,
      categoryOtherText: selectedCategories.includes("other") ? categoryOtherText.trim() : undefined,
      departments: trimmedDepartments,
      submittingDepartment: patientData.departmentName,
      description,
      documentationSource,
      documentationSourceOtherText:
        documentationSource === OTHER_DOC_SOURCE ? documentationSourceOtherText.trim() : undefined,
      evidenceRef: evidenceRef || undefined,
      submitters: trimmedSubmitters,
      scope: contextScope ?? undefined,
      facility: contextFacility ?? undefined,
    };

    let impactNumber: string;
    if (editingImpact) {
      resubmitImpact(editingImpact.id, payload);
      impactNumber = editingImpact.impactNumber ?? "";
    } else {
      impactNumber = addImpact(payload);
    }
    setSubmittedImpactNumber(impactNumber);

    // Demo-only simulated SMS to the Primary Submitter (first in the list) —
    // see components/SmsSimulationToast.tsx. Purely visual, no real message.
    const primaryPhone = trimmedSubmitters[0]?.phone;
    if (isQrEntry && primaryPhone && impactNumber) {
      showSms({ event: editingImpact ? "resubmitted" : "submitted", impactNumber, phone: primaryPhone });
    }

    setPatientDepartment(departmentId);
    setCustomDepartmentName("");
    setSubmitted(true);
    if (editingImpact) {
      // The record's status just flipped away from "returned_for_revision",
      // which would otherwise make the dead-end guard above kick in on the
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);

    const isCustomDept = patientDepartment === OTHER_DEPARTMENT;
    const hasParticipatingDepartment = participatingDepartments.some((d) => d.trim());
    const isCustomDocSource = documentationSource === OTHER_DOC_SOURCE;

    if (
      !mrn.trim() ||
      (isQrEntry ? !employeeDepartment.trim() : !patientDepartment || (isCustomDept && !customDepartmentName.trim())) ||
      !admissionDate ||
      !previousStatus ||
      !whatChanged ||
      !currentOutcome ||
      selectedCategories.length === 0 ||
      (selectedCategories.includes("other") && !categoryOtherText.trim()) ||
      !hasParticipatingDepartment ||
      (isCustomDocSource && !documentationSourceOtherText.trim()) ||
      !submitters.every((p) => p.name.trim() && p.phone.trim() && p.email.trim() && p.jobTitle.trim())
    ) {
      setError(t("clinical.requiredFieldsError"));
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

    // Impact Date must fall within this Journey: never before the episode's
    // own admission date, and never in the future. Only checked at
    // submission time — existing/legacy records are never re-validated or
    // blocked from displaying, however they were originally entered.
    const todayIso = new Date().toISOString().slice(0, 10);
    if (eventDate < admissionDate) {
      setError(t("clinical.eventDateBeforeAdmission"));
      return;
    }
    if (eventDate > todayIso) {
      setError(t("clinical.eventDateFuture"));
      return;
    }

    const effectiveDepartmentName = isQrEntry
      ? employeeDepartment.trim()
      : isCustomDept
      ? customDepartmentName.trim()
      : departmentNameFor(patientDepartment);

    // A Patient Journey is identified by MRN + Admission Date, not MRN
    // alone — the same MRN can have multiple separate admission episodes
    // (see lib/types.ts's Impact.admissionDate). findOrCreatePatient below
    // still matches by MRN only (one Patient row per MRN, never duplicated
    // per admission), and each impact's own admissionDate is what actually
    // distinguishes its Journey — so there is no "conflicting patient data"
    // left to reconcile here: a different admission date for the same MRN
    // is simply a new Journey, submitted silently, with no prompt and no
    // hint to the employee that other impacts/journeys exist.
    finalizeSubmit(true, { mrn, departmentName: effectiveDepartmentName, admissionDate });
  };

  // The employee followed an Edit & Resubmit link for a request that's no
  // longer editable (already resubmitted from another tab, expired, or
  // otherwise moved on) — show a clear dead-end instead of a broken form.
  if (editImpactId && !submitted && (!editingImpact || editingImpact.status !== "returned_for_revision")) {
    return (
      <div>
        <Header
          title={t("clinical.editTitle")}
          subtitle={t("clinical.editSubtitle")}
          actions={isQrEntry ? <LanguageSwitcher /> : undefined}
        />
        <div className="p-5 lg:p-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-navy/5 bg-white p-6 text-center shadow-card">
            <p className="text-sm font-semibold text-rose-600">{t("clinical.expiredEditError")}</p>
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
        title={editingImpact ? t("clinical.editTitle") : t("clinical.title")}
        subtitle={editingImpact ? t("clinical.editSubtitle") : t("clinical.subtitle")}
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
          {editingImpact?.impactNumber && (
            <div className="rounded-xl2 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800">
              {tEditingImpactBanner(language, editingImpact.impactNumber)}
            </div>
          )}
          {submitted && (
            <div ref={successBannerRef} className="rounded-xl2 bg-emerald-50 px-4 py-4 text-emerald-700">
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="h-5 w-5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold">
                    {editingImpact ? t("clinical.resubmitSuccessMessage") : t("common.submissionSuccessTitle")}
                  </p>
                  {!editingImpact && (
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
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-navy">{t("clinical.patientInfo")}</h2>
              {/* Employee-facing (QR entry) never reveals that this MRN was
                  matched to an existing Patient Journey — matching still
                  happens silently (see the mrn/patients effect above), and
                  patient-level autofill (e.g. admission date) still applies;
                  there's just no visible notice about it. The internal
                  (non-QR) flow keeps this badge — useful, non-privacy-
                  sensitive feedback for staff doing manual data entry. */}
              {matchedExisting && !isQrEntry && (
                <span className="rounded-full bg-sky/15 px-3 py-1 text-xs font-semibold text-sky-dark">
                  {t("clinical.matchedExisting")}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy">{t("clinical.mrn")}</label>
                <input
                  value={mrn}
                  onChange={(e) => setMrn(e.target.value)}
                  placeholder={t("clinical.mrnPlaceholder")}
                  className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                />
              </div>
              {isQrEntry ? (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-navy">
                    {t("clinical.submittingDepartment")}
                  </label>
                  <input
                    value={employeeDepartment}
                    onChange={(e) => setEmployeeDepartment(e.target.value)}
                    placeholder={t("clinical.submittingDepartmentPlaceholder")}
                    className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-navy">{t("clinical.department")}</label>
                  <select
                    value={patientDepartment}
                    onChange={(e) => setPatientDepartment(e.target.value)}
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
                <label className="mb-1.5 block text-sm font-semibold text-navy">{t("clinical.admissionDate")}</label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                />
              </div>
              {!isQrEntry && patientDepartment === OTHER_DEPARTMENT && (
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-navy">{t("common.pleaseSpecifyLabel")}</label>
                  <input
                    value={customDepartmentName}
                    onChange={(e) => setCustomDepartmentName(e.target.value)}
                    placeholder={t("clinical.customDeptPlaceholder")}
                    className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-navy/40">{t("clinical.mrnHint")}</p>
          </div>

          <div className="sm:max-w-[calc(50%-0.625rem)]">
            <label className="mb-1.5 block text-sm font-semibold text-navy">{t("clinical.eventDate")}</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">{t("clinical.previousStatus")}</label>
              <input
                value={previousStatus}
                onChange={(e) => setPreviousStatus(e.target.value)}
                placeholder={t("clinical.previousStatusPlaceholder")}
                className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">{t("clinical.currentOutcome")}</label>
              <input
                value={currentOutcome}
                onChange={(e) => setCurrentOutcome(e.target.value)}
                placeholder={t("clinical.currentOutcomePlaceholder")}
                className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">{t("clinical.whatChanged")}</label>
            <textarea
              value={whatChanged}
              onChange={(e) => setWhatChanged(e.target.value)}
              rows={2}
              placeholder={t("clinical.whatChangedPlaceholder")}
              className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy">{t("clinical.impactType")}</label>
            <p className="mb-2 mt-0.5 text-xs text-navy/60">{t("clinical.impactTypeHint")}</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => toggleCategory(value)}
                  aria-pressed={selectedCategories.includes(value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedCategories.includes(value)
                      ? "border-sky bg-sky text-navy font-semibold"
                      : "border-navy/10 text-navy/60 hover:bg-bgsoft"
                  }`}
                >
                  {language === "en" ? CATEGORY_LABELS_EN[value] : label}
                </button>
              ))}
            </div>
            {selectedCategories.includes("other") && (
              <input
                value={categoryOtherText}
                onChange={(e) => setCategoryOtherText(e.target.value)}
                placeholder={t("clinical.impactTypeOtherPlaceholder")}
                className="mt-2.5 w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
              />
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">{t("clinical.participatingDepartments")}</label>
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
            <label className="mb-1.5 block text-sm font-semibold text-navy">{t("clinical.briefDescription")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t("clinical.briefDescriptionPlaceholder")}
              className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">{t("clinical.documentationSource")}</label>
              <select
                value={documentationSource}
                onChange={(e) => setDocumentationSource(e.target.value)}
                className="w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
              >
                {DOCUMENTATION_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {language === "en" ? DOCUMENTATION_SOURCE_LABELS_EN[s] ?? s : s}
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
                {t("clinical.attachEvidence")} <span className="font-normal text-navy/40">{t("clinical.attachEvidenceHint")}</span>
              </label>
              <input
                value={evidenceRef}
                onChange={(e) => setEvidenceRef(e.target.value)}
                placeholder={t("clinical.evidencePlaceholder")}
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
              onClick={() => router.push(editingImpact ? "/submit/track" : isQrEntry ? "/submit" : "/patients")}
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
