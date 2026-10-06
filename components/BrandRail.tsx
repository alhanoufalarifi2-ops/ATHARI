import ClusterLogo from "./ClusterLogo";
import { LeafMark } from "./icons";

function BrandIllustration() {
  return (
    <svg viewBox="0 0 240 150" className="w-full" preserveAspectRatio="xMidYMax slice">
      {/* layered waves: light sky -> sky -> deeper blue -> navy, elegant graduated steps */}
      <path d="M0 68 Q30 54 60 66 T120 65 T180 68 T240 61 V150 H0 Z" fill="#BFE0F5" opacity="0.6" />
      <path d="M0 88 Q32 74 65 86 T133 85 T200 89 T240 82 V150 H0 Z" fill="#6FB6DE" opacity="0.8" />
      <path d="M0 108 Q34 96 70 106 T140 105 T205 108 T240 103 V150 H0 Z" fill="#2F6690" />
      <path d="M0 126 Q36 116 72 124 T144 123 T208 126 T240 122 V150 H0 Z" fill="#0B2545" />

      {/* small building, sitting on the navy band */}
      <rect x="16" y="98" width="24" height="30" rx="2" fill="#F6F9FC" opacity="0.9" />
      <rect x="21" y="104" width="5" height="5" fill="#0B2545" opacity="0.55" />
      <rect x="31" y="104" width="5" height="5" fill="#0B2545" opacity="0.55" />
      <rect x="21" y="114" width="5" height="5" fill="#0B2545" opacity="0.55" />
      <rect x="31" y="114" width="5" height="5" fill="#0B2545" opacity="0.55" />

      {/* main hospital building with cross */}
      <rect x="48" y="83" width="45" height="45" rx="2" fill="#F6F9FC" />
      <rect x="55" y="91" width="6" height="6" fill="#0B2545" opacity="0.55" />
      <rect x="68" y="91" width="6" height="6" fill="#0B2545" opacity="0.55" />
      <rect x="81" y="91" width="6" height="6" fill="#0B2545" opacity="0.55" />
      <rect x="55" y="104" width="6" height="6" fill="#0B2545" opacity="0.55" />
      <rect x="81" y="104" width="6" height="6" fill="#0B2545" opacity="0.55" />
      <rect x="55" y="117" width="6" height="6" fill="#0B2545" opacity="0.55" />
      <rect x="81" y="117" width="6" height="6" fill="#0B2545" opacity="0.55" />
      <g transform="translate(70.5,106)">
        <rect x="-3" y="-9" width="6" height="18" rx="1.5" fill="#4FA8D8" />
        <rect x="-9" y="-3" width="18" height="6" rx="1.5" fill="#4FA8D8" />
      </g>

      {/* palm tree */}
      <rect x="198" y="110" width="4" height="18" fill="#F6F9FC" opacity="0.85" />
      <path d="M200 110c-1.5-8-7.5-13-15-15 2.5 7.5 7.5 12.5 15 15Z" fill="#BFE0F5" />
      <path d="M200 110c1.5-8 7.5-13 15-15-2.5 7.5-7.5 12.5-15 15Z" fill="#BFE0F5" />
      <path d="M200 107c-1-7 2.5-13 6.5-17 1 7-1 13.5-6.5 17Z" fill="#7EC0E4" />
    </svg>
  );
}

export default function BrandRail() {
  return (
    <aside className="relative hidden w-60 shrink-0 flex-col bg-gradient-to-b from-[#F2F9FE] via-[#BFE0F5] to-[#6FB6DE] lg:flex print:hidden">
      {/* Backdrop revealed by the header's rounded top-left corner, so BrandRail's own
          color appears to flow smoothly (via a real border-radius curve) into the header. */}
      <div aria-hidden className="pointer-events-none absolute left-full top-0 h-14 w-12 bg-[#F2F9FE]" />

      {/* Region 1 — organizational identity (Riyadh First Health Cluster), ~20-25% of column height */}
      <div className="flex basis-0 grow-[22] flex-col items-center border-b border-white/40 pt-[65px] text-center">
        <ClusterLogo width={215} />
      </div>

      {/* Region 2 — ATHARI, the visual centerpiece, ~45-50% of column height */}
      <div className="flex basis-0 grow-[48] flex-col items-center justify-center gap-2 px-6 text-center">
        <LeafMark className="h-[81px] w-[81px] text-navy" />
        <div>
          <div className="text-[45px] font-extrabold tracking-wide text-navy">أثري</div>
          <div className="mt-0.5 text-[17px] font-semibold tracking-[0.35em] text-sky-dark">ATHARI</div>
        </div>
        <p className="max-w-[195px] text-[15px] leading-7 text-navy/60">
          نوثّق الأثر، نحفظ الإنجاز، ونُبرز ما صنع الفرق
        </p>
      </div>

      {/* Region 3 — closing decoration, anchored to the bottom, ~30% */}
      <div className="relative flex min-h-[110px] basis-0 grow-[30] flex-col justify-end overflow-hidden">
        <BrandIllustration />
      </div>
    </aside>
  );
}
