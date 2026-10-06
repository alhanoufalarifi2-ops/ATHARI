"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAthariStore } from "@/lib/store";
import {
  ActivityIcon,
  BuildingIcon,
  ClipboardCheckIcon,
  FileBarChartIcon,
  HomeIcon,
  LayersIcon,
  LeafMark,
  PlusCircleIcon,
  UsersIcon,
  XIcon,
} from "./icons";

const clinicalLinks = [
  { href: "/dashboard", label: "الرئيسية", icon: HomeIcon },
  { href: "/patients", label: "المرضى", icon: UsersIcon },
  { href: "/add-impact", label: "إضافة أثر", icon: PlusCircleIcon },
  { href: "/review", label: "قائمة المراجعة", icon: ClipboardCheckIcon, adminOnly: true },
  { href: "/reports", label: "التقارير", icon: FileBarChartIcon },
];

const orgLinks = [
  { href: "/org/dashboard", label: "الرئيسية", icon: HomeIcon },
  { href: "/org/initiatives", label: "المبادرات", icon: BuildingIcon },
  { href: "/org/add-impact", label: "إضافة أثر مؤسسي", icon: PlusCircleIcon },
  { href: "/org/review", label: "قائمة المراجعة", icon: ClipboardCheckIcon, adminOnly: true },
  { href: "/org/reports", label: "التقارير", icon: FileBarChartIcon },
];

type MainSection = "executive" | "clinical" | "organizational";

// اللوحة التنفيذية مستوى أعلى مستقل يجمع الأثر السريري والمؤسسي معًا — وليست
// جزءًا من أي من المسارين، لذلك لا تملك قائمة فرعية خاصة بها.
function getActiveSection(pathname: string | null): MainSection {
  if (pathname?.startsWith("/org")) return "organizational";
  if (pathname?.startsWith("/cluster")) return "executive";
  return "clinical";
}

function MainNav({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const setActiveTrack = useAthariStore((s) => s.setActiveTrack);
  const section = getActiveSection(pathname);

  const goTo = (target: MainSection) => {
    if (target === "executive") {
      router.push("/cluster/dashboard");
    } else if (target === "clinical") {
      setActiveTrack("clinical");
      router.push("/dashboard");
    } else {
      setActiveTrack("organizational");
      router.push("/org/dashboard");
    }
    onNavigate?.();
  };

  const items: { key: MainSection; label: string; icon: typeof LayersIcon }[] = [
    { key: "executive", label: "اللوحة التنفيذية", icon: LayersIcon },
    { key: "clinical", label: "الأثر السريري", icon: ActivityIcon },
    { key: "organizational", label: "الأثر المؤسسي", icon: BuildingIcon },
  ];

  return (
    <div className="space-y-1.5 border-b border-navy/5 px-3 pb-3 pt-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => goTo(item.key)}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all ${
              section === item.key
                ? "bg-gradient-to-l from-sky-dark via-sky to-sky-light text-white font-semibold shadow-cardHover"
                : "border border-navy/10 text-navy/70 hover:bg-bgsoft"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const role = useAthariStore((s) => s.role);
  const section = getActiveSection(pathname);
  const links = section === "organizational" ? orgLinks : section === "clinical" ? clinicalLinks : [];
  const homeHref = links[0]?.href;

  return (
    <>
      <MainNav onNavigate={onNavigate} />
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          if (link.adminOnly && role !== "admin") return null;
          const active =
            pathname === link.href || (link.href !== homeHref && pathname?.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all ${
                active
                  ? "bg-gradient-to-l from-sky-dark via-sky to-sky-light text-white font-semibold shadow-cardHover"
                  : "text-navy/70 hover:bg-bgsoft hover:text-navy"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <aside className="sticky top-14 hidden max-h-[calc(100vh-3.5rem)] w-[190px] shrink-0 flex-col overflow-y-auto border-e border-navy/5 bg-white md:flex print:hidden">
        <NavLinks />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden print:hidden">
          <div className="absolute inset-0 bg-navy/40" onClick={onClose} aria-hidden />
          <aside className="absolute inset-y-0 end-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-navy/5 px-5 py-4">
              <div className="flex items-center gap-2">
                <LeafMark className="h-6 w-6 text-sky" />
                <span className="text-sm font-bold text-navy">
                  أثري <span className="font-normal text-navy/40">| ATHARI</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-navy/60 hover:bg-bgsoft"
                aria-label="إغلاق القائمة"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
