"use client";

import { useAthariStore } from "@/lib/store";

export default function RoleSwitcher() {
  const role = useAthariStore((s) => s.role);
  const setRole = useAthariStore((s) => s.setRole);

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-white/10 p-0.5 text-[11px]">
      <button
        onClick={() => setRole("contributor")}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          role === "contributor" ? "bg-white text-navy font-semibold shadow" : "text-white/70 hover:bg-white/10"
        }`}
      >
        <span className="hidden sm:inline">مساهم (Contributor)</span>
        <span className="sm:hidden">مساهم</span>
      </button>
      <button
        onClick={() => setRole("admin")}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          role === "admin" ? "bg-sky text-navy font-semibold shadow" : "text-white/70 hover:bg-white/10"
        }`}
      >
        <span className="hidden sm:inline">مسؤول المراجعة (Admin)</span>
        <span className="sm:hidden">مسؤول</span>
      </button>
    </div>
  );
}
