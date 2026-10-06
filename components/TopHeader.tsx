"use client";

import { useAthariStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BellIcon, HelpCircleIcon, LeafMark, MenuIcon, UsersIcon } from "./icons";
import RoleSwitcher from "./RoleSwitcher";

export default function TopHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const role = useAthariStore((s) => s.role);
  const impacts = useAthariStore((s) => s.impacts);
  const organizationalImpacts = useAthariStore((s) => s.organizationalImpacts);
  const clinicalPendingCount = impacts.filter((i) => i.status === "pending").length;
  const orgPendingCount = organizationalImpacts.filter((i) => i.status === "pending").length;
  const pendingCount = clinicalPendingCount + orgPendingCount;

  const [notifOpen, setNotifOpen] = useState(false);

  // Clinical and Organizational review stay two independent queues, so the
  // bell can't jump straight to "the" review page — it opens a small menu
  // that routes to whichever track the reviewer picks.
  const goToReview = (path: string) => {
    setNotifOpen(false);
    router.push(path);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 bg-gradient-to-l from-navy to-navy-light px-4 text-white shadow-sm print:hidden md:px-6 lg:rounded-tl-[40px]">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 hover:bg-white/10 md:hidden"
          aria-label="فتح القائمة"
        >
          <MenuIcon className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <LeafMark className="h-6 w-6 text-sky-light" />
          <div className="leading-tight">
            <div className="text-base font-bold">
              أثري <span className="font-normal text-white/50">| ATHARI</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 lg:pe-6">
        <div className="relative">
          <button
            className="relative rounded-full p-1.5 hover:bg-white/10"
            title={
              role === "admin" && pendingCount > 0
                ? `لديك ${pendingCount} ${pendingCount === 1 ? "طلب" : "طلبات"} تحتاج إلى مراجعة`
                : "الإشعارات"
            }
            aria-label="الإشعارات"
            type="button"
            onClick={() => role === "admin" && setNotifOpen((v) => !v)}
          >
            <BellIcon className="h-4 w-4" />
            {role === "admin" && pendingCount > 0 && (
              <span className="absolute -top-0.5 -end-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-sky px-1 text-[9px] font-bold text-navy">
                {pendingCount}
              </span>
            )}
          </button>

          {notifOpen && role === "admin" && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
              <div className="absolute start-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl2 border border-navy/10 bg-white text-navy shadow-cardHover">
                <button
                  type="button"
                  onClick={() => goToReview("/review")}
                  className="flex w-full items-center justify-between px-4 py-3 text-right text-xs font-semibold hover:bg-bgsoft"
                >
                  <span>الأثر السريري</span>
                  <span className="text-navy/40">{clinicalPendingCount} طلبات</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToReview("/org/review")}
                  className="flex w-full items-center justify-between border-t border-navy/5 px-4 py-3 text-right text-xs font-semibold hover:bg-bgsoft"
                >
                  <span>الأثر المؤسسي</span>
                  <span className="text-navy/40">{orgPendingCount} طلبات</span>
                </button>
              </div>
            </>
          )}
        </div>
        <button
          className="hidden rounded-full p-1.5 hover:bg-white/10 sm:block"
          title="مساعدة"
          aria-label="مساعدة"
          type="button"
        >
          <HelpCircleIcon className="h-4 w-4" />
        </button>

        <div className="hidden h-5 w-px bg-white/15 sm:block" />

        <RoleSwitcher />

        <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 sm:flex">
          <UsersIcon className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
