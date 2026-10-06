import { ComponentType, SVGProps } from "react";
import { ImpactCategory } from "./types";
import {
  ActivityIcon,
  WindIcon,
  BrainIcon,
  UtensilsIcon,
  BandageIcon,
  TrendingUpIcon,
  MessageCircleIcon,
  SparklesIcon,
} from "@/components/icons";

export const CATEGORY_ICONS: Record<ImpactCategory, ComponentType<SVGProps<SVGSVGElement>>> = {
  mobility: ActivityIcon,
  respiratory: WindIcon,
  neurological: BrainIcon,
  nutrition: UtensilsIcon,
  wound: BandageIcon,
  functional: TrendingUpIcon,
  communication: MessageCircleIcon,
  other: SparklesIcon,
};

// Shades within the navy → sky family, kept on-brand for charts and icon chips.
export const CATEGORY_COLORS: Record<ImpactCategory, string> = {
  mobility: "#3B8FBD",
  respiratory: "#0B2545",
  neurological: "#1F4E79",
  nutrition: "#7EC0E4",
  wound: "#13315C",
  functional: "#4FA8D8",
  communication: "#2F6690",
  other: "#AED9EA",
};
