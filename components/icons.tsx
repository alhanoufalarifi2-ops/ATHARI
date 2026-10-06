import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 6h17M3.5 12h17M3.5 18h17" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3.5v-5.5h3V20H17a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 19.5c.7-3.2 3-5 5.5-5s4.8 1.8 5.5 5" />
      <path d="M15.5 5.8c1.4.4 2.4 1.6 2.4 3.1 0 1.4-.9 2.6-2.2 3.1" />
      <path d="M15.2 14.6c2.2.5 3.8 2.2 4.3 4.9" />
    </svg>
  );
}

export function PlusCircleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  );
}

export function ClipboardCheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="4.5" width="12" height="16" rx="2" />
      <path d="M9 4.5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5" />
      <path d="m9 13 2 2 4-4.5" />
    </svg>
  );
}

export function FileBarChartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z" />
      <path d="M14 3.5V8h4.3" />
      <path d="M9.5 17v-3M12.5 17v-5M15.5 17v-2" />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 10.5a6 6 0 1 1 12 0c0 3.6 1 5 1.5 5.8H4.5C5 15.5 6 14.1 6 10.5Z" />
      <path d="M10 19.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function HelpCircleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M9.7 9.3a2.3 2.3 0 1 1 3.4 2c-.8.5-1.1 1-1.1 2" />
      <path d="M12 16.7v.1" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none">
      <path d="M12 20.2 4.9 13c-2-2-2-5.1 0-7 1.9-1.9 4.9-1.7 6.5.4l.6.8.6-.8c1.6-2.1 4.6-2.3 6.5-.4 2 1.9 2 5 0 7L12 20.2Z" />
    </svg>
  );
}

export function BuildingIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="4" width="9" height="16" rx="1" />
      <rect x="14.5" y="9.5" width="5.5" height="10.5" rx="1" />
      <path d="M7 7.5h.01M10 7.5h.01M7 11h.01M10 11h.01M7 14.5h.01M10 14.5h.01" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4v11.5M8 12l4 4 4-4" />
      <path d="M5 19.5h14" />
    </svg>
  );
}

export function PrinterIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 8.5V4h10v4.5" />
      <rect x="4" y="8.5" width="16" height="8" rx="1.5" />
      <path d="M7 15.5h10V20H7v-4.5Z" />
    </svg>
  );
}

export function ActivityIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 12h3.5l2-6 4 12 2-9 1.5 3H20.5" />
    </svg>
  );
}

export function WindIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 8h10a2.25 2.25 0 1 0-2.1-3" />
      <path d="M3.5 12.5h13.7a2.25 2.25 0 1 1-2.1 3" />
      <path d="M3.5 17h7.8a2 2 0 1 1-1.9 2.6" />
    </svg>
  );
}

export function BrainIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9.5 4.5a2.5 2.5 0 0 0-2.5 2.5v.3A2.7 2.7 0 0 0 5.5 9.8v.7a2.6 2.6 0 0 0-1 4.6 2.7 2.7 0 0 0 2.6 3.4h1.4a2 2 0 0 0 2-2V7a2.5 2.5 0 0 0-1-2.5Z" />
      <path d="M14.5 4.5A2.5 2.5 0 0 1 17 7v.3a2.7 2.7 0 0 1 1.5 2.5v.7a2.6 2.6 0 0 1 1 4.6 2.7 2.7 0 0 1-2.6 3.4h-1.4a2 2 0 0 1-2-2V7a2.5 2.5 0 0 1 1-2.5Z" />
    </svg>
  );
}

export function UtensilsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3.5v7.2a2 2 0 0 0 2 2v7.8M6 3.5v7.2M8 3.5v7.2M6 3.5H8" />
      <path d="M6 3.5c-1.2 0-2 1-2 2.5v4.7" />
      <path d="M17 3.5c-1.7 0-3 1.9-3 5s1.3 5 3 5v7" />
    </svg>
  );
}

export function BandageIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)" />
      <path d="m9.5 9.5 5 5" strokeDasharray="1.5 2" />
      <circle cx="8.2" cy="8.2" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="15.8" cy="15.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TrendingUpIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 17 9 11.5l3.5 3.5L20.5 7" />
      <path d="M15 7h5.5v5.5" />
    </svg>
  );
}

export function MessageCircleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12a8 8 0 1 1 3.4 6.5L4 19.5l1-3.2A7.9 7.9 0 0 1 4 12Z" />
    </svg>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 13.3 8l4.5 1.3-4.5 1.3L12 15l-1.3-4.4-4.5-1.3L10.7 8Z" />
      <path d="M18.5 15.5 19 17l1.5.5L19 18l-.5 1.5-.5-1.5L16.5 17l1.5-.5Z" />
    </svg>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 4.5h10v4.5a5 5 0 0 1-10 0V4.5Z" />
      <path d="M7 5.5h-2a2.5 2.5 0 0 0 2.5 2.5M17 5.5h2a2.5 2.5 0 0 1-2.5 2.5" />
      <path d="M12 14v3M9 20.5h6M9.5 20.5c0-1.8.7-2.8 2.5-3 1.8.2 2.5 1.2 2.5 3" />
    </svg>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m12 3.5 8 4.5-8 4.5-8-4.5 8-4.5Z" />
      <path d="m4 12 8 4.5 8-4.5" />
      <path d="m4 15.8 8 4.5 8-4.5" />
    </svg>
  );
}

export function PercentIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 19 19 5" />
      <circle cx="7" cy="7" r="2.25" />
      <circle cx="17" cy="17" r="2.25" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="m8.5 12.3 2.3 2.3 4.7-5" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m19.5 19.5-4.3-4.3" />
    </svg>
  );
}

export function NetworkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="5" r="2.25" />
      <circle cx="5" cy="17.5" r="2.25" />
      <circle cx="19" cy="17.5" r="2.25" />
      <path d="M12 7.25V12M12 12 6.6 15.6M12 12l5.4 3.6" />
    </svg>
  );
}

export function LeafMark(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path
        d="M24 42V20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24 20c0-8 6-14 14-15-1 8-6 14-14 15Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M24 27c0-7-5.5-12.5-13-13.5 1 7.5 5.5 12.5 13 13.5Z"
        fill="currentColor"
      />
      <path
        d="M24 35c0-6 4.5-10.5 11-11.5-1 6-4.5 10.5-11 11.5Z"
        fill="currentColor"
        opacity="0.75"
      />
    </svg>
  );
}
