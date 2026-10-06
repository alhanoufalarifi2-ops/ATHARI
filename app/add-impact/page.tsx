"use client";

import { Suspense } from "react";
import AddImpactForm from "./AddImpactForm";

export default function AddImpactPage() {
  return (
    <Suspense fallback={null}>
      <AddImpactForm />
    </Suspense>
  );
}
