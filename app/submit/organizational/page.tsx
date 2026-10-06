"use client";

// Mounts the exact same organizational impact form used internally at
// /org/add-impact — no duplicated form code. AppShell already strips all
// internal chrome for any path under /submit, and the form itself detects
// that context to send "إلغاء" back to /submit instead of /org/initiatives.
import OrgAddImpactForm from "@/app/org/add-impact/OrgAddImpactForm";
import { Suspense } from "react";

export default function SubmitOrganizationalPage() {
  return (
    <Suspense fallback={null}>
      <OrgAddImpactForm />
    </Suspense>
  );
}
