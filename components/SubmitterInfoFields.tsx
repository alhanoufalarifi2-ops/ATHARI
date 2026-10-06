"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SubmitterInfo } from "@/lib/types";
import { ChangeEvent, useEffect, useState } from "react";
import { CheckCircleIcon, PlusCircleIcon, XIcon } from "./icons";

const DEFAULT_INPUT_CLASS =
  "w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20";

export const EMPTY_SUBMITTER: SubmitterInfo = { name: "", phone: "", email: "", jobTitle: "" };

// Demo-only OTP simulation for the Primary Submitter (index 0) — see
// PrimaryOtpDemo below. Never sends a real SMS or contacts any backend/API;
// the "code" is generated and displayed right here in the UI so a presenter
// can complete the flow without a real phone. Purely a prototype visual for
// executive demos, entirely local component state — nothing is persisted to
// the impact record.
function generateDemoCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function PrimaryOtpDemo({
  phone,
  onVerifiedChange,
}: {
  phone: string;
  // Reports verified/not-verified up to the form so it can refuse to submit
  // an impact whose Primary Submitter phone was never confirmed — see
  // AddImpactForm/OrgAddImpactForm's primaryOtpVerified gate in handleSubmit.
  onVerifiedChange?: (verified: boolean) => void;
}) {
  const { t } = useLanguage();
  const [stage, setStage] = useState<"idle" | "sent" | "verified">("idle");
  const [demoCode, setDemoCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [error, setError] = useState("");
  const [lastPhone, setLastPhone] = useState(phone);

  // If the number changes after being verified (or mid-flow), the demo
  // verification no longer applies to whatever is now typed — reset so the
  // presenter re-runs the flow for the new number, matching how a real OTP
  // flow would behave.
  if (phone !== lastPhone) {
    setLastPhone(phone);
    setStage("idle");
    setDemoCode("");
    setEnteredCode("");
    setError("");
  }

  // Cleanup (on every change, and on unmount) reports "not verified" first,
  // so the form never keeps thinking a stale verification still holds.
  useEffect(() => {
    onVerifiedChange?.(stage === "verified");
    return () => onVerifiedChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const handleSend = () => {
    setDemoCode(generateDemoCode());
    setEnteredCode("");
    setError("");
    setStage("sent");
  };

  const handleVerify = () => {
    if (enteredCode.trim() === demoCode) {
      setError("");
      setStage("verified");
    } else {
      setError(t("otp.invalidCode"));
    }
  };

  if (stage === "verified") {
    return (
      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircleIcon className="h-4 w-4" />
        {t("otp.verified")}
      </div>
    );
  }

  if (stage === "sent") {
    return (
      <div className="mt-2 space-y-2 rounded-xl2 border border-sky/30 bg-sky/5 p-3">
        <p className="text-xs font-semibold text-navy/70">{t("otp.codeSentTo")} {phone}</p>
        <p className="rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-navy/50">
          {t("otp.demoCodeHint")}: <span dir="ltr" className="font-extrabold tracking-widest text-navy">{demoCode}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={enteredCode}
            onChange={(e) => setEnteredCode(e.target.value)}
            placeholder={t("otp.codePlaceholder")}
            dir="ltr"
            className="w-40 rounded-xl2 border border-navy/10 px-3 py-2 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
          />
          <button
            type="button"
            onClick={handleVerify}
            className="rounded-xl2 bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-navy-light"
          >
            {t("otp.verify")}
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="text-xs font-semibold text-sky-dark hover:underline"
          >
            {t("otp.resend")}
          </button>
        </div>
        {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSend}
      disabled={!phone.trim()}
      className="mt-2 rounded-xl2 border border-navy/10 px-3 py-2 text-xs font-semibold text-navy hover:bg-bgsoft disabled:cursor-not-allowed disabled:opacity-40"
    >
      {t("otp.sendCode")}
    </button>
  );
}

// Shared by AddImpactForm, OrgAddImpactForm, and the review detail page —
// same SubmitterInfo[] shape saved onto the record every time, so a later
// return-for-edit/tracking phase has one contact model to work from. Each
// person's block renders in its own row, stacked vertically, never side by
// side, so the list stays readable on the QR submission page on mobile.
// Text is pulled from useLanguage()/t() so it switches to English within the
// employee-facing /submit journey (see app/submit/layout.tsx) while staying
// Arabic everywhere else, since those other call sites render outside a
// LanguageProvider.
export default function SubmitterInfoFields({
  value,
  onChange,
  disabled = false,
  title,
  inputClassName,
  enablePrimaryOtpDemo = false,
  onPrimaryOtpVerifiedChange,
}: {
  value: SubmitterInfo[];
  onChange: (value: SubmitterInfo[]) => void;
  disabled?: boolean;
  title?: string;
  inputClassName?: string;
  // Shows the demo-only OTP verification block under the Primary Submitter's
  // (index 0) phone number — see PrimaryOtpDemo above. Off by default so
  // internal/admin call sites (review detail page) render exactly as before.
  enablePrimaryOtpDemo?: boolean;
  // Required whenever enablePrimaryOtpDemo is on: reports the Primary
  // Submitter's verified/not-verified state so the form can refuse to submit
  // until it's true. See PrimaryOtpDemo above.
  onPrimaryOtpVerifiedChange?: (verified: boolean) => void;
}) {
  const { t } = useLanguage();
  const inputClass = inputClassName ?? DEFAULT_INPUT_CLASS;
  const resolvedTitle = title ?? t("submitter.title");

  const updatePerson = (index: number, key: keyof SubmitterInfo) => (e: ChangeEvent<HTMLInputElement>) =>
    onChange(value.map((person, i) => (i === index ? { ...person, [key]: e.target.value } : person)));
  const addPerson = () => onChange([...value, { ...EMPTY_SUBMITTER }]);
  const removePerson = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div>
      <h2 className="mb-3 text-sm font-bold text-navy">{resolvedTitle}</h2>
      <div className="space-y-5">
        {value.map((person, index) => (
          <div key={index} className={index > 0 ? "border-t border-navy/10 pt-5" : undefined}>
            <span className="mb-2.5 inline-block rounded-full bg-navy/10 px-2.5 py-0.5 text-[10px] font-semibold text-navy/60">
              {index === 0 ? t("submitter.primaryBadge") : t("submitter.contributorBadge")}
            </span>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy">{t("submitter.name")}</label>
                <input
                  value={person.name}
                  onChange={updatePerson(index, "name")}
                  disabled={disabled}
                  placeholder={t("submitter.namePlaceholder")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy">{t("submitter.phone")}</label>
                <input
                  value={person.phone}
                  onChange={updatePerson(index, "phone")}
                  disabled={disabled}
                  type="tel"
                  placeholder="05xxxxxxxx"
                  className={inputClass}
                />
                {index === 0 && enablePrimaryOtpDemo && !disabled && (
                  <PrimaryOtpDemo phone={person.phone} onVerifiedChange={onPrimaryOtpVerifiedChange} />
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy">{t("submitter.email")}</label>
                <input
                  value={person.email}
                  onChange={updatePerson(index, "email")}
                  disabled={disabled}
                  type="email"
                  placeholder="name@moh.gov.sa"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy">{t("submitter.jobTitle")}</label>
                <input
                  value={person.jobTitle}
                  onChange={updatePerson(index, "jobTitle")}
                  disabled={disabled}
                  placeholder={t("submitter.jobTitlePlaceholder")}
                  className={inputClass}
                />
              </div>
            </div>
            {!disabled && index > 0 && (
              <button
                type="button"
                onClick={() => removePerson(index)}
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:underline"
              >
                <XIcon className="h-3.5 w-3.5" />
                {t("submitter.remove")}
              </button>
            )}
          </div>
        ))}
      </div>
      {!disabled && (
        <button
          type="button"
          onClick={addPerson}
          className="mt-4 flex w-full items-center gap-1.5 border-t border-navy/10 pt-4 text-xs font-semibold text-sky-dark hover:underline"
        >
          <PlusCircleIcon className="h-3.5 w-3.5" />
          {t("submitter.addAnother")}
        </button>
      )}
    </div>
  );
}
