"use client";

import { Suspense } from "react";
import OrgAddImpactForm from "./OrgAddImpactForm";

export default function OrgAddImpactPage() {
  return (
    <Suspense fallback={null}>
      <OrgAddImpactForm />
    </Suspense>
  );
}
