"use client";

import { useMemo } from "react";
import { ImpactRecords } from "./clusterStats";
import { useAthariStore } from "./store";

// The actual clinical + organizational records, handed to the lib/clusterStats
// functions — the single source behind every cluster/scope/facility figure.
export function useImpactRecords(): ImpactRecords {
  const impacts = useAthariStore((s) => s.impacts);
  const organizationalImpacts = useAthariStore((s) => s.organizationalImpacts);
  return useMemo(() => ({ impacts, organizationalImpacts }), [impacts, organizationalImpacts]);
}
