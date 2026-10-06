"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { smsSimulationBody, smsSimulationLabel, smsSimulationSentTo } from "@/lib/i18n/translations";
import { ReviewHistoryEventType } from "@/lib/types";
import { useEffect, useState } from "react";
import { MessageCircleIcon, XIcon } from "./icons";

interface SmsPayload {
  event: ReviewHistoryEventType;
  impactNumber: string;
  phone: string;
}

// Executive-demo visual only — no real SMS provider, backend, or API is ever
// contacted. `useSmsSimulation()` gives each page a `showSms(...)` call to
// fire after a status-changing action; `<SmsSimulationToast />` renders the
// resulting phone-notification-style preview. Entirely local component
// state, so it can never interfere with the existing success banner,
// Decision Record, Track Impact, or navigation on the page that renders it.
export function useSmsSimulation() {
  const [sms, setSms] = useState<SmsPayload | null>(null);

  useEffect(() => {
    if (!sms) return;
    // Long enough to be clearly noticed mid-presentation, short enough to
    // get out of the way on its own.
    const timer = setTimeout(() => setSms(null), 10000);
    return () => clearTimeout(timer);
  }, [sms]);

  return {
    sms,
    showSms: (payload: SmsPayload) => setSms(payload),
    dismissSms: () => setSms(null),
  };
}

export default function SmsSimulationToast({
  sms,
  onDismiss,
}: {
  sms: SmsPayload | null;
  onDismiss: () => void;
}) {
  const { language } = useLanguage();

  if (!sms) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4 sm:inset-x-auto sm:end-4 sm:justify-end">
      <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-navy/10 bg-white p-3 shadow-cardHover">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            {smsSimulationLabel(language)}
          </span>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={language === "ar" ? "إغلاق" : "Dismiss"}
            className="rounded-lg p-0.5 text-navy/40 hover:bg-bgsoft hover:text-navy"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-2 flex items-start gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky to-sky-dark text-white">
            <MessageCircleIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-extrabold text-navy" dir="ltr">
                أثري | ATHARI
              </p>
              <span className="shrink-0 text-[10px] text-navy/40" dir="ltr">
                {smsSimulationSentTo(language, sms.phone)}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-line text-xs leading-5 text-navy/70">
              {smsSimulationBody(sms.event, language, sms.impactNumber)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
