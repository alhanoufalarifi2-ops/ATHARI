"use client";

// Mounts the exact same clinical impact form used internally at /add-impact —
// no duplicated form code. AppShell already strips all internal chrome for
// any path under /submit, and the form itself detects that context to send
// "إلغاء" back to /submit instead of /patients.
import AddImpactForm from "@/app/add-impact/AddImpactForm";
import { Suspense } from "react";

export default function SubmitClinicalPage() {
  return (
    <Suspense fallback={null}>
      <AddImpactForm />
    </Suspense>
  );
}
