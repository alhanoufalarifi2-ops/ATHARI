"use client";

import { useState } from "react";
import { XIcon } from "./icons";

// "إرجاع للتعديل" always requires the reviewer's reason/instructions —
// Confirm stays disabled until something is typed. Free-text rather than
// RejectReasonModal's canned-reason list, since this needs to carry actual
// instructions the employee will act on, not just a rejection category.
export default function RevisionReasonModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const canConfirm = reason.trim().length > 0;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-cardHover">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-navy">سبب الإرجاع للتعديل / تعليمات المراجع *</h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-navy/40 hover:bg-bgsoft"
            aria-label="إغلاق"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-3 text-xs leading-5 text-navy/50">
          سيُتاح للموظف تعديل الطلب وإعادة إرساله خلال ٧ أيام من تاريخ الإرجاع.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="اكتب التعديلات أو التوضيحات المطلوبة *"
          className="mb-4 w-full rounded-xl2 border border-navy/10 px-3 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
        />

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
            className="rounded-xl2 bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            تأكيد الإرجاع للتعديل
          </button>
        </div>
      </div>
    </div>
  );
}
