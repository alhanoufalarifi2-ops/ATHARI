import { ComponentType, SVGProps } from "react";
import { OrgImpactType } from "./types";
import {
  LayersIcon,
  UsersIcon,
  ClipboardCheckIcon,
  TrophyIcon,
  SparklesIcon,
  TrendingUpIcon,
  FileBarChartIcon,
} from "@/components/icons";

export const ORG_TYPE_ICONS: Record<OrgImpactType, ComponentType<SVGProps<SVGSVGElement>>> = {
  project: LayersIcon,
  training: UsersIcon,
  policy: ClipboardCheckIcon,
  quality: TrophyIcon,
  innovation: SparklesIcon,
  process: TrendingUpIcon,
  other: FileBarChartIcon,
};

// Shades within the navy → sky family, kept on-brand and visually distinct
// from the clinical category palette while staying in the same identity.
export const ORG_TYPE_COLORS: Record<OrgImpactType, string> = {
  project: "#0B2545",
  training: "#3B8FBD",
  policy: "#1F4E79",
  quality: "#4FA8D8",
  innovation: "#7EC0E4",
  process: "#2F6690",
  other: "#AED9EA",
};
