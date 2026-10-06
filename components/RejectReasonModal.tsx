"use client";

import { useState } from "react";
import { XIcon } from "./icons";

const REASON_OPTIONS = [
  "لا يمثل أثرًا واضحًا",
  "البيانات غير مكتملة",
  "يحتاج إلى معلومات إضافية",
  "الأثر موثّق مسبقًا",
  "أخرى",
];
const OTHER_REASON = "أخرى";

// "عدم اعتماد" always requires a reason — Confirm stays disabled until one is
// picked (and, for "أخرى", until custom text is entered too).
export default function RejectReasonModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState("");

  const isOther = selected === OTHER_REASON;
  const canConfirm = selected !== null && (!isOther || customReason.trim().length > 0);

  const handleConfirm = () => {
    if (!canConfirm || !selected) return;
    onConfirm(isOther ? customReason.trim() : selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-cardHover">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-navy">سبب عدم الاعتماد *</h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-navy/40 hover:bg-bgsoft"
            aria-label="إغلاق"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 space-y-2">
          {REASON_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSelected(option)}
              className={`flex w-full items-center justify-between rounded-xl2 border px-3.5 py-2.5 text-right text-sm font-medium transition-colors ${
                selected === option
                  ? "border-rose-500 bg-rose-50 text-rose-700"
                  : "border-navy/10 text-navy/70 hover:bg-bgsoft"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {isOther && (
          <textarea
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            rows={3}
            placeholder="اكتب السبب *"
            className="mb-4 w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
          />
        )}

        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl2 border border-navy/10 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-bgsoft"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="rounded-xl2 bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            تأكيد عدم الاعتماد
          </button>
        </div>
      </div>
    </div>
  );
}
