"use client";

import CategoryBadge from "@/components/CategoryBadge";
import Header from "@/components/Header";
import OrgStatusBadge from "@/components/OrgStatusBadge";
import OrgTypeBadge from "@/components/OrgTypeBadge";
import RejectReasonModal from "@/components/RejectReasonModal";
import RevisionReasonModal from "@/components/RevisionReasonModal";
import SmsSimulationToast, { useSmsSimulation } from "@/components/SmsSimulationToast";
import StatusBadge from "@/components/StatusBadge";
import SubmitterInfoFields, { EMPTY_SUBMITTER } from "@/components/SubmitterInfoFields";
import { CheckCircleIcon, PlusCircleIcon, XIcon } from "@/components/icons";
import { certificateCode, recipientsOf } from "@/lib/certificates";
import { useAthariStore } from "@/lib/store";
import {
  CATEGORY_LABELS,
  DOCUMENTATION_SOURCES,
  ImpactCategory,
  ORG_DOCUMENTATION_SOURCES,
  PATIENT_STATUS_LABELS,
  SubmitterInfo,
} from "@/lib/types";
import { formatArabicDate, formatArabicDateTime } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const categories = Object.entries(CATEGORY_LABELS) as [ImpactCategory, string][];

export default function ReviewDetailPage() {
  const params = useParams<{ id: string }>();
  const role = useAthariStore((s) => s.role);
  const impacts = useAthariStore((s) => s.impacts);
  const organizationalImpacts = useAthariStore((s) => s.organizationalImpacts);
  const patients = useAthariStore((s) => s.patients);
  const initiatives = useAthariStore((s) => s.initiatives);
  const departments = useAthariStore((s) => s.departments);
  const reviewImpact = useAthariStore((s) => s.reviewImpact);
  const reviewOrganizationalImpact = useAthariStore((s) => s.reviewOrganizationalImpact);
  const updateImpact = useAthariStore((s) => s.updateImpact);
  const updateOrganizationalImpact = useAthariStore((s) => s.updateOrganizationalImpact);
  const requestImpactRevision = useAthariStore((s) => s.requestImpactRevision);
  const requestOrganizationalImpactRevision = useAthariStore((s) => s.requestOrganizationalImpactRevision);
  const expireOverdueRevisions = useAthariStore((s) => s.expireOverdueRevisions);

  // Lazy expiry (see lib/store.ts) — this page is one of the few places a
  // reviewer could be looking at a "returned_for_revision" record directly
  // (it never appears in ReviewQueue's tabs), so make sure its status is
  // current the moment this page loads.
  useEffect(() => {
    expireOverdueRevisions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clinical = impacts.find((i) => i.id === params.id);
  const org = !clinical ? organizationalImpacts.find((i) => i.id === params.id) : undefined;

  const [editing, setEditing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  // Multi-select: one or more predefined Clinical Impact Types. Falls back to
  // the legacy single `category` field for records created before multi-select.
  const [selectedCategories, setSelectedCategories] = useState<ImpactCategory[]>(
    clinical ? (clinical.categories && clinical.categories.length > 0 ? clinical.categories : [clinical.category]) : []
  );
  // Participating departments are free-text names (see lib/types.ts), never
  // department IDs — kept fully separate from the lead/owning department
  // (patient.department / initiative.department below, still ID-based).
  const initialParticipatingDepartments = clinical?.departments ?? org?.departments ?? [];
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
    initialParticipatingDepartments.length > 0 ? initialParticipatingDepartments : [""]
  );
  const [previousText, setPreviousText] = useState(clinical?.previousStatus ?? org?.previousState ?? "");
  const [middleText, setMiddleText] = useState(clinical?.whatChanged ?? org?.whatWasDone ?? "");
  const [outcomeText, setOutcomeText] = useState(clinical?.currentOutcome ?? org?.resultingChange ?? "");
  const [description, setDescription] = useState(clinical?.description ?? org?.description ?? "");
  const [documentationSource, setDocumentationSource] = useState(
    clinical?.documentationSource ?? org?.documentationSource ?? ""
  );
  const [referenceText, setReferenceText] = useState(clinical?.evidenceRef ?? org?.referenceNote ?? "");
  // submitters is the current shape; legacy records may only have the old
  // single `submitter` object, which we wrap into a one-person list purely
  // for display/edit here — never written back under the old key.
  const initialSubmitters: SubmitterInfo[] =
    clinical?.submitters ??
    org?.submitters ??
    (clinical?.submitter ? [clinical.submitter] : org?.submitter ? [org.submitter] : [{ ...EMPTY_SUBMITTER }]);
  const [selectedSubmitters, setSelectedSubmitters] = useState<SubmitterInfo[]>(initialSubmitters);
  const [metricName, setMetricName] = useState(org?.metricName ?? "");
  const [beforeValue, setBeforeValue] = useState(org?.beforeValue ?? "");
  const [afterValue, setAfterValue] = useState(org?.afterValue ?? "");

  // On a fresh (full) page load — as opposed to client-side navigation from
  // the Review Queue — the zustand persist middleware hasn't rehydrated
  // localStorage yet on the very first render: `clinical`/`org` both resolve
  // to undefined, and every useState initializer above (selectedCategories,
  // previousText, outcomeText, selectedSubmitters, ...) locks in its empty
  // fallback — a useState initializer only ever runs once, on mount, so
  // hydration finishing later does NOT update it on its own. Left alone,
  // that means: land on a review URL directly, click "تعديل" immediately,
  // and every field the reviewer didn't personally retype gets saved back as
  // empty — silently wiping real content. This effect re-syncs every
  // editable field from the record the FIRST time it becomes available
  // (whether that's this render, on the already-hydrated fast path, or a
  // later render once hydration catches up), and `formReady` gates the
  // "تعديل" button so editing can't even start until that sync has run.
  const formPrefilledRef = useRef(false);
  const [formReady, setFormReady] = useState(false);
  useEffect(() => {
    if ((!clinical && !org) || formPrefilledRef.current) return;
    formPrefilledRef.current = true;

    setSelectedCategories(
      clinical ? (clinical.categories && clinical.categories.length > 0 ? clinical.categories : [clinical.category]) : []
    );
    const departmentsSource = clinical?.departments ?? org?.departments ?? [];
    setSelectedDepartments(departmentsSource.length > 0 ? departmentsSource : [""]);
    setPreviousText(clinical?.previousStatus ?? org?.previousState ?? "");
    setMiddleText(clinical?.whatChanged ?? org?.whatWasDone ?? "");
    setOutcomeText(clinical?.currentOutcome ?? org?.resultingChange ?? "");
    setDescription(clinical?.description ?? org?.description ?? "");
    setDocumentationSource(clinical?.documentationSource ?? org?.documentationSource ?? "");
    setReferenceText(clinical?.evidenceRef ?? org?.referenceNote ?? "");
    setSelectedSubmitters(
      clinical?.submitters ??
        org?.submitters ??
        (clinical?.submitter ? [clinical.submitter] : org?.submitter ? [org.submitter] : [{ ...EMPTY_SUBMITTER }])
    );
    setMetricName(org?.metricName ?? "");
    setBeforeValue(org?.beforeValue ?? "");
    setAfterValue(org?.afterValue ?? "");
    setFormReady(true);
  }, [clinical, org]);

  // After a final review decision (Approve / Return for Revision / Not
  // Approved), the reviewer may have scrolled down to reach the action
  // buttons near the bottom of a long form — the "سجل القرار" card below
  // holds the actual confirmation (status, decision, reviewer reason, dates)
  // and can still be out of view even after the buttons themselves are
  // replaced by the "تم اتخاذ القرار..." notice. `justDecided` is flipped by
  // the action handlers below; this effect runs on the NEXT render, after
  // the store update has already committed and this card's content reflects
  // the new decision, so scrollIntoView measures the correct position.
  // behavior is "instant" (not "smooth"): globals.css sets
  // `html { scroll-behavior: smooth }`, and a smooth scrollIntoView here was
  // verified to sometimes never actually move the scroll position at all —
  // "instant" bypasses that CSS and reliably lands on the target every time,
  // which matters more here than an animated transition.
  const decisionCardRef = useRef<HTMLDivElement>(null);
  const [justDecided, setJustDecided] = useState(false);
  useEffect(() => {
    if (!justDecided) return;
    decisionCardRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
    setJustDecided(false);
  }, [justDecided]);

  // Demo-only simulated SMS notifications to the Primary Submitter — see
  // components/SmsSimulationToast.tsx. Approve/Reject/Return-for-Revision
  // fire it directly from their handlers below. "Revision deadline expired"
  // has no discrete user action to hook into (expiry is the lazy background
  // check above, which may have already flipped the status before this page
  // even mounted), so this fires once per page view whenever this record is
  // found in "closed_expired" — reliable and repeatable for a demo, unlike
  // trying to detect the exact render where the transition happened.
  const { sms, showSms, dismissSms } = useSmsSimulation();
  const expiredSmsShownRef = useRef(false);
  useEffect(() => {
    const current = clinical?.status ?? org?.status;
    const currentRecord = clinical ?? org;
    if (current === "closed_expired" && currentRecord && !expiredSmsShownRef.current) {
      const phone = currentRecord.submitters?.[0]?.phone ?? currentRecord.submitter?.phone;
      if (phone && currentRecord.impactNumber) {
        expiredSmsShownRef.current = true;
        showSms({ event: "closed_expired", impactNumber: currentRecord.impactNumber, phone });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinical?.status, org?.status]);

  if (role !== "admin") {
    return (
      <div>
        <Header title="طلب المراجعة" />
        <div className="p-5 lg:p-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
            هذه الصفحة مخصصة لدور «ATHARI Admin/Reviewer» فقط. استخدم مبدّل الدور أعلى الصفحة للاطّلاع عليها.
          </div>
        </div>
      </div>
    );
  }

  if (!clinical && !org) {
    return (
      <div>
        <Header title="طلب المراجعة" />
        <div className="p-6 text-navy/50">لم يتم العثور على هذا الطلب.</div>
      </div>
    );
  }

  const record = clinical ?? org!;
  const isPending = record.status === "pending";
  const patient = clinical ? patients.find((p) => p.id === clinical.patientId) : undefined;
  const initiative = org ? initiatives.find((i) => i.id === org.initiativeId) : undefined;
  const deptName = (id: string) => departments.find((d) => d.id === id)?.name ?? id;

  const addDept = () => setSelectedDepartments((prev) => [...prev, ""]);
  const updateDept = (index: number, value: string) =>
    setSelectedDepartments((prev) => prev.map((d, i) => (i === index ? value : d)));
  const removeDept = (index: number) =>
    setSelectedDepartments((prev) => prev.filter((_, i) => i !== index));

  const primarySubmitterPhone = record.submitters?.[0]?.phone ?? record.submitter?.phone;
  const triggerSms = (event: "approved" | "rejected" | "returned_for_revision") => {
    if (primarySubmitterPhone && record.impactNumber) {
      showSms({ event, impactNumber: record.impactNumber, phone: primarySubmitterPhone });
    }
  };

  const handleApprove = () => {
    if (clinical) reviewImpact(clinical.id, "approved");
    else if (org) reviewOrganizationalImpact(org.id, "approved");
    setJustDecided(true);
    triggerSms("approved");
  };

  const handleReject = (reason: string) => {
    if (clinical) reviewImpact(clinical.id, "rejected", reason);
    else if (org) reviewOrganizationalImpact(org.id, "rejected", reason);
    setShowRejectModal(false);
    setJustDecided(true);
    triggerSms("rejected");
  };

  const handleRequestRevision = (reason: string) => {
    if (clinical) requestImpactRevision(clinical.id, reason);
    else if (org) requestOrganizationalImpactRevision(org.id, reason);
    setShowRevisionModal(false);
    setJustDecided(true);
    triggerSms("returned_for_revision");
  };

  const handleSaveEdit = () => {
    const trimmedDepartments = selectedDepartments.map((d) => d.trim()).filter(Boolean);
    const trimmedSubmitters = selectedSubmitters
      .map((p) => ({
        name: p.name.trim(),
        phone: p.phone.trim(),
        email: p.email.trim(),
        jobTitle: p.jobTitle.trim(),
      }))
      .filter((p) => p.name || p.phone || p.email || p.jobTitle);
    if (clinical) {
      updateImpact(clinical.id, {
        previousStatus: previousText,
        whatChanged: middleText,
        currentOutcome: outcomeText,
        ...(selectedCategories.length > 0 ? { category: selectedCategories[0], categories: selectedCategories } : {}),
        departments: trimmedDepartments,
        description,
        documentationSource,
        evidenceRef: referenceText || undefined,
        submitters: trimmedSubmitters,
      });
    } else if (org) {
      updateOrganizationalImpact(org.id, {
        previousState: previousText,
        whatWasDone: middleText,
        resultingChange: outcomeText,
        departments: trimmedDepartments,
        description: description || undefined,
        documentationSource,
        referenceNote: referenceText || undefined,
        metricName: metricName || undefined,
        beforeValue: beforeValue || undefined,
        afterValue: afterValue || undefined,
        submitters: trimmedSubmitters,
      });
    }
    setEditing(false);
  };

  const inputClass =
    "w-full rounded-xl2 border px-3 py-2.5 text-sm outline-none transition-colors " +
    (editing
      ? "border-navy/10 focus:border-sky focus:ring-2 focus:ring-sky/20"
      : "border-transparent bg-transparent px-0 py-1 text-navy/70");

  return (
    <div>
      <SmsSimulationToast sms={sms} onDismiss={dismissSms} />
      <Header
        title={clinical ? "طلب أثر سريري" : "طلب أثر مؤسسي"}
        subtitle="تفاصيل الطلب والقرار"
        actions={
          <Link
            href={clinical ? "/review" : "/org/review"}
            className="text-xs font-semibold text-sky-dark hover:underline"
          >
            ← العودة لقائمة المراجعة
          </Link>
        }
      />

      <div className="space-y-5 p-5 lg:p-8">
        <div className="rounded-2xl border border-navy/5 bg-white p-5 shadow-card sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  clinical ? "bg-sky/15 text-sky-dark" : "bg-navy/10 text-navy"
                }`}
              >
                {clinical ? "سريري" : "مؤسسي"}
              </span>
              {clinical
                ? selectedCategories.map((c) => <CategoryBadge key={c} category={c} />)
                : initiative && <OrgTypeBadge type={initiative.type} />}
              {record.impactNumber && (
                <span
                  className="inline-flex items-center rounded-full bg-navy/10 px-2.5 py-0.5 text-[11px] font-bold text-navy"
                  dir="ltr"
                >
                  {record.impactNumber}
                </span>
              )}
            </div>
            {clinical ? <StatusBadge status={record.status} /> : <OrgStatusBadge status={record.status} />}
          </div>

          <div className="mb-5 border-b border-navy/5 pb-5">
            <SubmitterInfoFields
              value={selectedSubmitters}
              onChange={setSelectedSubmitters}
              disabled={!editing}
              inputClassName={inputClass}
            />
          </div>

          {clinical && patient && (
            <div className="mb-5 grid grid-cols-2 gap-4 rounded-xl2 bg-bgsoft p-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-navy/40">رقم الملف MRN</p>
                <p className="font-semibold text-navy">{patient.mrn}</p>
              </div>
              <div>
                <p className="text-xs text-navy/40">القسم / الإدارة المقدّمة للأثر</p>
                <p className="font-semibold text-navy">
                  {clinical.submittingDepartment ?? deptName(patient.department)}
                </p>
              </div>
              <div>
                <p className="text-xs text-navy/40">تاريخ الدخول (رحلة هذا الأثر)</p>
                <p className="font-semibold text-navy">
                  {formatArabicDate(clinical.admissionDate ?? patient.admissionDate)}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-navy/40">حالة المريض</p>
                <p className="font-semibold text-navy">{PATIENT_STATUS_LABELS[patient.status]}</p>
              </div>
            </div>
          )}

          {org && (
            <div className="mb-5 grid grid-cols-2 gap-4 rounded-xl2 bg-bgsoft p-4 text-sm sm:grid-cols-4">
              <div className="col-span-2">
                <p className="text-xs text-navy/40">المبادرة</p>
                <p className="font-semibold text-navy">{initiative?.name ?? "غير معروف"}</p>
              </div>
              <div>
                <p className="text-xs text-navy/40">قسم المبادرة</p>
                <p className="font-semibold text-navy">{initiative ? deptName(initiative.department) : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-navy/40">تاريخ البدء</p>
                <p className="font-semibold text-navy">{initiative ? formatArabicDate(initiative.startDate) : "—"}</p>
              </div>
            </div>
          )}

          <div className="mb-1 sm:max-w-[calc(50%-0.625rem)]">
            <label className="mb-1.5 block text-xs font-semibold text-navy/50">تاريخ الحدث</label>
            <p className="text-sm font-semibold text-navy">{formatArabicDate(record.eventDate)}</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-navy/50">
                {clinical ? "الحالة السابقة" : "التحدي/الوضع قبل التنفيذ"}
              </label>
              <input
                value={previousText}
                onChange={(e) => setPreviousText(e.target.value)}
                disabled={!editing}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-navy/50">
                {clinical ? "النتيجة الحالية" : "الأثر الناتج"}
              </label>
              <input
                value={outcomeText}
                onChange={(e) => setOutcomeText(e.target.value)}
                disabled={!editing}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold text-navy/50">
              {clinical ? "ما الذي تغيّر؟" : "ما الذي تم تنفيذه؟"}
            </label>
            <textarea
              value={middleText}
              onChange={(e) => setMiddleText(e.target.value)}
              disabled={!editing}
              rows={2}
              className={inputClass}
            />
          </div>

          {clinical && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold text-navy/50">نوع الأثر</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    disabled={!editing}
                    onClick={() =>
                      setSelectedCategories((prev) =>
                        prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
                      )
                    }
                    aria-pressed={selectedCategories.includes(value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-default ${
                      selectedCategories.includes(value)
                        ? "border-sky bg-sky text-navy font-semibold"
                        : "border-navy/10 text-navy/60 disabled:opacity-60"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {org && (
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-navy/50">المؤشر</label>
                <input
                  value={metricName}
                  onChange={(e) => setMetricName(e.target.value)}
                  disabled={!editing}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-navy/50">قبل</label>
                <input
                  value={beforeValue}
                  onChange={(e) => setBeforeValue(e.target.value)}
                  disabled={!editing}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-navy/50">بعد</label>
                <input
                  value={afterValue}
                  onChange={(e) => setAfterValue(e.target.value)}
                  disabled={!editing}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold text-navy/50">
              {clinical ? "الأقسام المشاركة" : "الأقسام المستفيدة"}
            </label>
            <div className="space-y-2">
              {selectedDepartments.map((dept, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={dept}
                    onChange={(e) => updateDept(index, e.target.value)}
                    disabled={!editing}
                    placeholder="اسم القسم"
                    className={inputClass}
                  />
                  {editing && selectedDepartments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDept(index)}
                      aria-label="إزالة القسم"
                      className="shrink-0 rounded-lg p-2 text-navy/40 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {editing && (
              <button
                type="button"
                onClick={addDept}
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-dark hover:underline"
              >
                <PlusCircleIcon className="h-3.5 w-3.5" />
                إضافة قسم آخر
              </button>
            )}
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold text-navy/50">وصف مختصر</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!editing}
              rows={2}
              className={inputClass}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-navy/50">مصدر التوثيق</label>
              {editing ? (
                <select
                  value={documentationSource}
                  onChange={(e) => setDocumentationSource(e.target.value)}
                  className={inputClass}
                >
                  {(clinical ? DOCUMENTATION_SOURCES : ORG_DOCUMENTATION_SOURCES).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-navy/70">{documentationSource}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-navy/50">
                {clinical ? "Evidence" : "المرجع"}
              </label>
              <input
                value={referenceText}
                onChange={(e) => setReferenceText(e.target.value)}
                disabled={!editing}
                placeholder="—"
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-navy/5 pt-5">
            {isPending && !editing && (
              <>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="inline-flex items-center gap-1.5 rounded-xl2 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  اعتماد الأثر
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  disabled={!formReady}
                  title={formReady ? undefined : "جارٍ تحميل بيانات الطلب..."}
                  className="rounded-xl2 border border-navy/10 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-bgsoft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl2 bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
                >
                  إرجاع للتعديل
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl2 bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
                >
                  <XIcon className="h-4 w-4" />
                  عدم اعتماد
                </button>
              </>
            )}
            {isPending && editing && (
              <>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="rounded-xl2 bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
                >
                  حفظ التعديل
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-xl2 border border-navy/10 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-bgsoft"
                >
                  إلغاء
                </button>
              </>
            )}
            {!isPending && (
              <p className="text-xs text-navy/40">
                تم اتخاذ القرار على هذا الطلب — لم يعد قابلًا للتعديل في هذه المرحلة من الـPrototype.
              </p>
            )}
          </div>
        </div>

        <div ref={decisionCardRef} className="rounded-2xl border border-navy/5 bg-white p-5 shadow-card sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-navy">سجل القرار</h2>
            {record.impactNumber && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/10 px-3 py-1 text-xs font-bold text-navy">
                رقم الأثر: <span dir="ltr">{record.impactNumber}</span>
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-xl2 bg-bgsoft p-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-navy/40">تاريخ الإرسال</p>
              <p className="font-semibold text-navy">{formatArabicDateTime(record.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-navy/40">الحالة</p>
              {clinical ? <StatusBadge status={record.status} /> : <OrgStatusBadge status={record.status} />}
            </div>
            <div>
              <p className="text-xs text-navy/40">تاريخ المراجعة</p>
              <p className="font-semibold text-navy">
                {record.reviewedAt ? formatArabicDateTime(record.reviewedAt) : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-navy/40">القرار</p>
              <p className="font-semibold text-navy">
                {record.status === "approved"
                  ? "اعتماد"
                  : record.status === "rejected"
                  ? "عدم اعتماد"
                  : record.status === "returned_for_revision"
                  ? "إرجاع للتعديل"
                  : record.status === "closed_expired"
                  ? "إغلاق تلقائي (انتهاء المهلة)"
                  : "—"}
              </p>
            </div>
            {record.reviewedAt && (
              <div>
                <p className="text-xs text-navy/40">المراجع / المعتمِد</p>
                <p className="font-semibold text-navy">مراجع أثري (ATHARI Admin/Reviewer)</p>
              </div>
            )}
          </div>
          {record.status === "approved" && record.impactNumber && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">تم اعتماد هذا الأثر.</p>
              {/* One independent certificate per credited person (creator +
                  contributors), each with its own verification code. */}
              <div className="flex flex-wrap gap-2">
                {recipientsOf(record).map((person, index) => (
                  <Link
                    key={index}
                    href={`/submit/certificate/${encodeURIComponent(certificateCode(record.impactNumber!, index))}`}
                    target="_blank"
                    className="rounded-xl2 bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-light"
                  >
                    {recipientsOf(record).length > 1 ? `شهادة: ${person.name}` : "شهادة الأثر"}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {record.status === "rejected" && record.rejectionReason && (
            <div className="mt-3 rounded-xl2 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <span className="font-semibold">سبب عدم الاعتماد: </span>
              {record.rejectionReason}
            </div>
          )}
          {(record.status === "returned_for_revision" || record.status === "closed_expired") && record.returnReason && (
            <div className="mt-3 rounded-xl2 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <span className="font-semibold">سبب الإرجاع للتعديل: </span>
              {record.returnReason}
              {record.revisionDeadline && (
                <p className="mt-1 text-xs text-amber-700">
                  الموعد النهائي لإعادة الإرسال: {formatArabicDateTime(record.revisionDeadline)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {showRejectModal && (
        <RejectReasonModal onCancel={() => setShowRejectModal(false)} onConfirm={handleReject} />
      )}
      {showRevisionModal && (
        <RevisionReasonModal onCancel={() => setShowRevisionModal(false)} onConfirm={handleRequestRevision} />
      )}
    </div>
  );
}
