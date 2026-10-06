import { BuildingIcon, HeartIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="flex flex-col-reverse items-center gap-1.5 bg-gradient-to-l from-navy-light to-navy px-4 py-2 text-center text-[11px] leading-4 text-white/70 sm:flex-row sm:justify-between sm:gap-4 sm:px-6 sm:text-right print:hidden">
      <p>© {new Date().getFullYear()} مستشفى الرعاية المديدة. جميع الحقوق محفوظة</p>
      <div className="flex items-center gap-2">
        <BuildingIcon className="h-3.5 w-3.5 shrink-0 text-sky-light" />
        <span>
          تجمع الرياض الصحي الأول{" "}
          <span className="text-white/40">Riyadh First Health Cluster</span>
        </span>
      </div>
      <p className="flex items-center gap-1.5">
        <HeartIcon className="h-3 w-3 shrink-0 text-sky-light" />
        جودة الرعاية ... أثر يبقى
      </p>
    </footer>
  );
}
