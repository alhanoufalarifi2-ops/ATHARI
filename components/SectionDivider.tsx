// Same navy bar style approved on the Executive Dashboard, reused here as a
// standalone component so both dashboards share one visual definition instead
// of duplicating the markup.
export default function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex h-[45px] items-center justify-center gap-5 rounded-xl2 bg-gradient-to-l from-navy to-navy-light px-8 shadow-card">
      <span className="h-px flex-1 bg-sky-light/40" />
      <h2 className="shrink-0 text-lg font-bold text-white">{title}</h2>
      <span className="h-px flex-1 bg-sky-light/40" />
    </div>
  );
}
