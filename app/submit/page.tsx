"use client";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ActivityIcon, BuildingIcon, LeafMark, NetworkIcon } from "@/components/icons";
import { facilities, getFacilitiesByScope, scopes } from "@/lib/clusterData";
import { facilityDisplayNameFor, scopeDisplayName } from "@/lib/i18n/entityNames";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { FACILITY_TYPE_LABELS_EN, tStepOf } from "@/lib/i18n/translations";
import { FacilityType, FACILITY_TYPE_LABELS } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Step = "scope" | "facilityType" | "facility" | "impactType";

const FACILITY_TYPE_ORDER: FacilityType[] = ["medical_city", "hospital", "phc"];

// Standalone public entry point (opened via QR code, mainly on phones). Walks
// the submitter through Scope -> Facility type -> Facility (or a manual PHC
// name) -> Impact type, then hands off to the existing internal
// forms — /submit/clinical and /submit/organizational — which already save as
// "pending" and show their own success message. Facility/scope context isn't
// stored on the Impact record yet (that lands with the Facility Level phase);
// it's only carried forward as a read-only banner. The lead/owning Department
// is collected once, inside the Clinical/Organizational form itself, as a
// required free-text field — it never changes what the form asks for, so the
// wizard doesn't collect or hand off a department at all.
// Bilingual per app/submit/layout.tsx's LanguageProvider — predefined scope
// and facility names get an English display name (lib/i18n/entityNames.ts)
// when language is "en"; canonical Arabic data in lib/clusterData.ts is never
// touched.
export default function SubmitPage() {
  const router = useRouter();
  const { t, language, dir } = useLanguage();

  const [step, setStep] = useState<Step>("scope");
  const [isClusterAdmin, setIsClusterAdmin] = useState(false);
  const [scopeId, setScopeId] = useState<string | null>(null);
  const [facilityType, setFacilityType] = useState<FacilityType | null>(null);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [phcName, setPhcName] = useState("");

  const forwardArrow = dir === "rtl" ? "←" : "→";

  const scope = scopes.find((s) => s.id === scopeId);
  // الإدارة التنفيذية للتجمع sits above the Scope/Facility layer entirely —
  // picking it at step 1 skips facility-type/facility selection and jumps
  // straight to impact type.
  const scopeLabel = isClusterAdmin ? t("wizard.healthCluster") : scope && scopeDisplayName(scope, language);
  // Only hide a facility TYPE when the scope has zero registered facilities
  // of it — e.g. "مدن طبية" only has a facility under نطاق الرياض, so it must
  // not be selectable (and lead to an empty facility list) under any other
  // scope. "مراكز الرعاية الصحية الأولية" (phc) is the one exception: it was
  // never backed by registered Facility records in the first place (see
  // clusterData.ts) — a PHC is always entered as free text on the next step
  // (see the "facility" step below, facilityType === "phc") — so it must
  // stay selectable in every scope regardless of what's registered.
  const availableFacilityTypes = useMemo(
    () =>
      scopeId
        ? FACILITY_TYPE_ORDER.filter(
            (type) => type === "phc" || getFacilitiesByScope(scopeId).some((f) => f.type === type)
          )
        : [],
    [scopeId]
  );
  const scopeFacilities = useMemo(
    () => (scopeId ? getFacilitiesByScope(scopeId).filter((f) => f.type === facilityType) : []),
    [scopeId, facilityType]
  );
  const chosenFacility = facilityId ? facilities.find((f) => f.id === facilityId) : undefined;
  const facilityDisplayName = isClusterAdmin
    ? t("wizard.clusterExecutiveAdministration")
    : facilityType === "phc"
    ? phcName.trim()
    : chosenFacility
    ? facilityDisplayNameFor(chosenFacility, language)
    : "";

  const steps: Step[] = isClusterAdmin
    ? ["scope", "impactType"]
    : ["scope", "facilityType", "facility", "impactType"];

  const goToForm = (track: "clinical" | "organizational") => {
    const params = new URLSearchParams();
    if (scopeLabel) params.set("scope", scopeLabel);
    if (facilityDisplayName) params.set("facility", facilityDisplayName);
    router.push(`/submit/${track}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const stepIndex = steps.indexOf(step);

  const goBack = () => {
    if (stepIndex === 0) return;
    setStep(steps[stepIndex - 1]);
  };

  return (
    <div className="min-h-screen bg-bgsoft px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex justify-center">
          <LanguageSwitcher />
        </div>

        <div className="mb-6 flex flex-col items-center text-center">
          <LeafMark className="h-[60px] w-[60px] text-sky" />
          <p className="mt-0.5 text-xl font-extrabold text-navy">
            أثري <span className="text-base font-normal text-navy/40">| ATHARI</span>
          </p>
        </div>

        <div className="rounded-2xl border border-navy/5 bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center justify-between">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="text-xs font-semibold text-sky-dark hover:underline"
              >
                {t("common.back")}
              </button>
            ) : (
              <span />
            )}
            <span className="text-[11px] font-semibold text-navy/40">{tStepOf(language, stepIndex + 1, steps.length)}</span>
          </div>

          {step === "scope" && (
            <div>
              <h1 className="mb-5 text-center text-lg font-extrabold text-navy">{t("wizard.selectScope")}</h1>
              <div className="space-y-2.5">
                {/* Cluster Executive Administration sits above the four
                    geographic scopes — it's a cluster-level entity, not a
                    fifth scope, so it keeps its own dashed-border styling
                    rather than joining the scope button list below. */}
                <div className="pb-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsClusterAdmin(true);
                      setScopeId(null);
                      setFacilityType(null);
                      setFacilityId(null);
                      setPhcName("");
                      setStep("impactType");
                    }}
                    className="flex w-full items-center justify-between rounded-xl2 border border-dashed border-navy/20 bg-bgsoft px-4 py-3.5 text-right text-sm font-bold text-navy transition-colors hover:border-sky hover:bg-sky/5"
                  >
                    {t("wizard.clusterExecutiveAdministration")}
                    <span className="text-navy/30">{forwardArrow}</span>
                  </button>
                </div>
                {scopes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setIsClusterAdmin(false);
                      setScopeId(s.id);
                      setFacilityType(null);
                      setFacilityId(null);
                      setPhcName("");
                      setStep("facilityType");
                    }}
                    className="flex w-full items-center justify-between rounded-xl2 border border-navy/10 bg-white px-4 py-3.5 text-right text-sm font-bold text-navy transition-colors hover:border-sky hover:bg-sky/5"
                  >
                    {scopeDisplayName(s, language)}
                    <span className="text-navy/30">{forwardArrow}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "facilityType" && (
            <div>
              <h1 className="mb-1 text-center text-lg font-extrabold text-navy">{t("wizard.facilityType")}</h1>
              <p className="mb-5 text-center text-xs text-navy/45">{scope && scopeDisplayName(scope, language)}</p>
              <div className="space-y-2.5">
                {availableFacilityTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFacilityType(type);
                      setFacilityId(null);
                      setPhcName("");
                      setStep("facility");
                    }}
                    className="flex w-full items-center justify-between rounded-xl2 border border-navy/10 bg-white px-4 py-3.5 text-right text-sm font-bold text-navy transition-colors hover:border-sky hover:bg-sky/5"
                  >
                    {language === "en" ? FACILITY_TYPE_LABELS_EN[type] : FACILITY_TYPE_LABELS[type]}
                    <span className="text-navy/30">{forwardArrow}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "facility" && facilityType === "phc" && (
            <div>
              <h1 className="mb-5 text-center text-lg font-extrabold text-navy">{t("wizard.phcName")}</h1>
              <input
                value={phcName}
                onChange={(e) => setPhcName(e.target.value)}
                placeholder={t("wizard.phcNamePlaceholder")}
                className="mb-5 w-full rounded-xl2 border border-navy/10 px-4 py-3 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
              />
              <button
                type="button"
                disabled={!phcName.trim()}
                onClick={() => setStep("impactType")}
                className="w-full rounded-xl2 bg-navy px-4 py-3 text-sm font-semibold text-white transition-opacity hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-30"
              >
                {t("common.continue")}
              </button>
            </div>
          )}

          {step === "facility" && facilityType !== "phc" && (
            <div>
              <h1 className="mb-1 text-center text-lg font-extrabold text-navy">{t("wizard.selectFacility")}</h1>
              <p className="mb-5 text-center text-xs text-navy/45">
                {scope && scopeDisplayName(scope, language)} —{" "}
                {facilityType && (language === "en" ? FACILITY_TYPE_LABELS_EN[facilityType] : FACILITY_TYPE_LABELS[facilityType])}
              </p>
              <div className="space-y-2.5">
                {scopeFacilities.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setFacilityId(f.id);
                      setStep("impactType");
                    }}
                    className="flex w-full items-center justify-between rounded-xl2 border border-navy/10 bg-white px-4 py-3.5 text-right text-sm font-bold text-navy transition-colors hover:border-sky hover:bg-sky/5"
                  >
                    {facilityDisplayNameFor(f, language)}
                    <span className="text-navy/30">{forwardArrow}</span>
                  </button>
                ))}
                {scopeFacilities.length === 0 && (
                  <p className="py-6 text-center text-xs text-navy/40">{t("wizard.noFacilitiesOfType")}</p>
                )}
              </div>
            </div>
          )}

          {step === "impactType" && (
            <div>
              <h1 className="mb-1 text-center text-lg font-extrabold text-navy">{t("wizard.impactTypeQuestion")}</h1>
              <p className="mb-5 text-center text-xs leading-5 text-navy/45">
                {scopeLabel} — {facilityDisplayName || "—"}
              </p>

              <div className="space-y-3">
                {/* Cluster Executive Administration is not a care-delivering
                    facility, so it never offers Clinical Impact — Organizational
                    Impact is the only option, consistent with its dashboard
                    figures (see getExecutiveAdministrationStats). */}
                {!isClusterAdmin && (
                  <button
                    type="button"
                    onClick={() => goToForm("clinical")}
                    className="flex w-full items-center gap-3 rounded-xl2 border border-navy/10 bg-white px-4 py-4 text-right transition-colors hover:border-sky hover:bg-sky/5"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky/15 text-sky-dark">
                      <ActivityIcon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-navy">{t("wizard.clinicalImpact")}</span>
                      <span className="block text-xs text-navy/45">{t("wizard.clinicalImpactDesc")}</span>
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => goToForm("organizational")}
                  className="flex w-full items-center gap-3 rounded-xl2 border border-navy/10 bg-white px-4 py-4 text-right transition-colors hover:border-sky hover:bg-sky/5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy/10 text-navy">
                    <BuildingIcon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-navy">{t("wizard.organizationalImpact")}</span>
                    <span className="block text-xs text-navy/45">{t("wizard.organizationalImpactDesc")}</span>
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {step === "scope" && (
          <div className="mt-4 text-center">
            <Link href="/submit/track" className="text-xs font-semibold text-sky-dark hover:underline">
              {t("common.trackImpactLink")}
            </Link>
          </div>
        )}

        {(scope || isClusterAdmin) && step !== "scope" && (
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-navy/35">
            <NetworkIcon className="h-3 w-3" />
            {isClusterAdmin ? scopeLabel : `${t("wizard.healthCluster")} · ${scopeLabel}`}
            {facilityDisplayName && ` · ${facilityDisplayName}`}
          </p>
        )}
      </div>
    </div>
  );
}
