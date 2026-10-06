"use client";

import ClusterLogo from "@/components/ClusterLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { BuildingIcon, CalendarIcon, CheckCircleIcon, ClipboardCheckIcon, LeafMark, PrinterIcon } from "@/components/icons";
import { facilities } from "@/lib/clusterData";
import { FACILITY_NAMES_EN, facilityDisplayNameFor } from "@/lib/i18n/entityNames";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { certificateCode, parseCertificateCode, recipientsOf } from "@/lib/certificates";
import { useAthariStore } from "@/lib/store";
import { useParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

// Prototype-only verification QR — encodes nothing but the existing Impact
// Number in a URL to this same certificate route. No MRN, patient data,
// submitter phone, OTP, or reviewer information is ever included. Uses the
// `qrcode` package already vetted/used elsewhere in this project (see
// scripts/generate-qr.mjs) rather than adding a new dependency.
function VerificationQr({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState("");
  useEffect(() => {
    let cancelled = false;
    import("qrcode")
      .then((mod) =>
        mod.default.toDataURL(url, { margin: 1, width: 160, color: { dark: "#0B2545", light: "#FFFFFF" } })
      )
      .then((data) => {
        if (!cancelled) setDataUrl(data);
      })
      .catch(() => {
        // Prototype-only convenience feature — if QR generation fails for any
        // reason, the certificate itself (and the plain-text Impact Number
        // right below it) remains fully valid without it.
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!dataUrl) return <div className="h-[64px] w-[64px] shrink-0 rounded-lg bg-bgsoft" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="QR" className="h-[64px] w-[64px] shrink-0 rounded-md" />;
}

// One footer segment — icon, small label, value. Kept uniform so the lower
// area reads as a single refined band rather than a data table.
function FooterItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-3 text-center">
      <span className="text-navy/60">{icon}</span>
      <span className="text-[9px] font-semibold uppercase tracking-wide text-navy/65">{label}</span>
      <span className="max-w-[120px] text-[11.5px] font-bold leading-snug text-navy">{value}</span>
    </div>
  );
}

function FooterDivider() {
  return <span className="mx-1 hidden h-11 w-px shrink-0 bg-navy/[0.12] sm:block" />;
}

// record.facility is stored as a plain display-name string, fixed at
// whichever language the employee was using when they submitted (see
// app/submit/page.tsx) — it's never re-translated after that. To show it in
// the certificate's active toggle language, match it back to the canonical
// Facility record (by either its Arabic or English name) and re-derive the
// name via the existing facilityDisplayNameFor helper. A manually-typed PHC
// / Cluster Executive Administration name has no canonical entry and is
// shown exactly as typed, in both languages — the same convention already
// used everywhere else in the app (see lib/i18n/entityNames.ts).
function localizedFacilityName(value: string | undefined, language: "ar" | "en"): string | undefined {
  if (!value) return value;
  const facility = facilities.find((f) => f.name === value || FACILITY_NAMES_EN[f.id] === value);
  return facility ? facilityDisplayNameFor(facility, language) : value;
}

function formatDate(iso: string | undefined, language: "ar" | "en"): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function ImpactCertificatePage() {
  const params = useParams<{ impactNumber: string }>();
  const { dir, language } = useLanguage();
  const isAr = language === "ar";

  const impacts = useAthariStore((s) => s.impacts);
  const organizationalImpacts = useAthariStore((s) => s.organizationalImpacts);

  // The route parameter is a per-person verification code (see
  // lib/certificates.ts) — or a bare Impact Number from older links, which
  // resolves to the creator's certificate.
  const { impactNumber, index: recipientIndex } = parseCertificateCode(decodeURIComponent(params.impactNumber ?? ""));
  const clinical = impacts.find((i) => i.impactNumber === impactNumber);
  const org = !clinical ? organizationalImpacts.find((i) => i.impactNumber === impactNumber) : undefined;
  const record = clinical ?? org;
  const recipient = record ? recipientsOf(record)[recipientIndex] : undefined;
  const verificationCode = certificateCode(impactNumber, recipientIndex);

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/submit/certificate/${encodeURIComponent(verificationCode)}`
      : "";

  // A certificate only ever exists for an Approved record — never Pending,
  // Returned for Revision, Not Approved, or Closed/Expired, and never for an
  // unknown Impact Number. Direct access otherwise renders no certificate
  // content at all, regardless of what (if anything) actually exists behind
  // that number.
  if (!record || record.status !== "approved" || !recipient) {
    return (
      <div dir={dir} className="flex min-h-screen items-center justify-center bg-bgsoft p-6">
        <div className="max-w-sm rounded-2xl border border-navy/10 bg-white p-8 text-center shadow-card">
          <p className="text-sm font-semibold text-navy/60">
            {isAr ? "لا توجد شهادة متاحة لهذا الأثر." : "No certificate is available for this impact."}
          </p>
        </div>
      </div>
    );
  }

  // The certificate recognizes the employee's approved impact, not the
  // patient — a Clinical certificate never reads patient name, MRN,
  // admission date, diagnosis, or any other patient-identifying field, and
  // none of that is present anywhere in this component (including the QR,
  // which encodes only the Impact Number). The record is intentionally read
  // only for the handful of fields the certificate now shows — no patient or
  // department lookups are needed at all.
  const footerItems: { key: string; node: ReactNode }[] = [
    {
      key: "qr",
      node: (
        <div className="flex flex-col items-center gap-1 px-3">
          <VerificationQr url={verifyUrl} />
          <span className="text-[9px] font-semibold text-navy/65">{isAr ? "التحقق من الأثر" : "Verify Impact"}</span>
          <span dir="ltr" className="text-[8.5px] font-bold tracking-wide text-navy/75">
            {verificationCode}
          </span>
        </div>
      ),
    },
  ];
  if (record.facility) {
    footerItems.push({
      key: "facility",
      node: (
        <FooterItem
          icon={<BuildingIcon className="h-4 w-4" />}
          label={isAr ? "المنشأة" : "Facility"}
          value={localizedFacilityName(record.facility, language) ?? record.facility}
        />
      ),
    });
  }
  footerItems.push({
    key: "number",
    node: (
      <FooterItem
        icon={<ClipboardCheckIcon className="h-4 w-4" />}
        label={isAr ? "رقم الأثر" : "Impact Number"}
        value={record.impactNumber ?? "—"}
      />
    ),
  });
  footerItems.push({
    key: "date",
    node: (
      <FooterItem
        icon={<CalendarIcon className="h-4 w-4" />}
        label={isAr ? "تاريخ الاعتماد" : "Approval Date"}
        value={formatDate(record.reviewedAt, language)}
      />
    ),
  });
  footerItems.push({
    key: "approved",
    node: (
      <div className="flex flex-col items-center gap-1 px-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-emerald-500/60 text-emerald-700 ring-4 ring-emerald-500/10">
          <CheckCircleIcon className="h-5 w-5" />
        </span>
        <span className="text-[10px] font-bold text-emerald-700">{isAr ? "معتمد" : "Approved"}</span>
      </div>
    ),
  });

  return (
    <div dir={dir} className="min-h-screen bg-bgsoft p-4 sm:p-6 print:min-h-0 print:bg-white print:p-0">
      {/* Certificate prints as A4 landscape — overrides the app-wide portrait
          @page rule (app/globals.css) only while this route is on screen, so
          every other report keeps printing portrait. print:min-h-0 above
          cancels min-h-screen's min-height:100vh for print: `vh` in a print
          context is unreliable across browsers (it can resolve against the
          full paper size, a stale screen viewport, or the printable area
          depending on engine/version) and was the real cause of a second
          page — the certificate's own explicit mm-based sizing below is the
          only height source that should apply while printing. */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          /* Browsers skip background colors/borders on print by default,
             so without this the certificate would print washed-out —
             navy/sky panels and borders turning plain white — instead of
             matching what the screen shows. */
          html, body, * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            margin: 0 !important;
            background: #FFFFFF !important;
          }
        }
      `}</style>

      <div className="mx-auto mb-4 flex max-w-2xl justify-end print:hidden">
        <LanguageSwitcher />
      </div>

      {/* print:max-h-[178mm] + the existing overflow-hidden together are a
          hard backstop: the printable area at the @page margins above is
          exactly 190mm tall, but real browser print rasterizers (rounding,
          font metrics, and any reserved space if a viewer's own "Headers and
          footers" print-dialog option is left on) can differ slightly from
          any simulated measurement, so the target is 178mm — a deliberate
          ~12mm safety margin — never the full 190mm ceiling. Content is
          verified (see the certificate task history) to fit well within
          this budget even for stress-test-length names/facilities, so nothing
          is ever actually clipped by the cap; it only guarantees a second
          page can never occur even if some future edit nudges the content
          taller. */}
      <div className="relative mx-auto max-w-2xl overflow-hidden rounded-xl2 border border-navy/15 bg-white shadow-card print:max-w-[1040px] print:min-h-[178mm] print:max-h-[178mm] print:border print:shadow-none">
        {/* Restrained ATHARI frame + a single, barely-there watermark — the
            leaf reads as a quiet brand cue here, not an illustration, so
            there is no second decorative corner mark. */}
        <div className="pointer-events-none absolute inset-[7px] rounded-[0.85rem] border border-navy/[0.12]" />
        <LeafMark className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 text-navy/[0.012]" />

        {/* print:! forces these to win over the sm: padding above regardless
            of Tailwind's variant ordering — printing at A4 landscape width
            also matches the sm: breakpoint, so both would otherwise compete
            for the same padding-top/bottom declarations. On screen this stays
            a normal stacked block (unchanged); only in print does it become a
            column matching the outer card's print:min-h-[178mm]/max-h-[178mm]
            above (the safety-margined slice of the A4-landscape printable
            area), so the centered title/recipient group below can absorb the
            leftover space instead of everything bunching at the top. */}
        <div className="relative px-7 pb-9 pt-8 sm:px-12 sm:pb-11 sm:pt-9 print:!flex print:!min-h-[178mm] print:!max-h-[178mm] print:!flex-col print:!px-16 print:!pb-6 print:!pt-6">
          {/* Header: ATHARI (primary identity) + Riyadh First Health Cluster (institutional identity).
              Cluster logo sized ~2.3x its prior 92px width (ClusterLogo scales
              height automatically from its own aspect ratio, so it grows
              without any crop/stretch) — the opposite-side spacer is widened
              to the same value so the centered ATHARI lockup stays truly
              centered, not just the logo itself. */}
          <div className="flex items-start justify-between gap-4">
            <div className="w-[210px]" aria-hidden />
            <div className="flex flex-1 flex-col items-center text-center">
              <LeafMark className="h-9 w-9 text-sky sm:h-10 sm:w-10" />
              <p className="mt-2 text-sm font-extrabold text-navy" dir="ltr">
                أثري <span className="font-normal text-navy/65">| ATHARI</span>
              </p>
            </div>
            <div className="flex w-[210px] shrink-0 justify-end">
              <ClusterLogo width={210} />
            </div>
          </div>

          <div className="mx-auto mt-4 h-px w-12 bg-navy/20" />

          {/* Title + recipient, as one group — on screen this stacks normally
              right after the header; in print (print:flex-1 on a flex-col
              ancestor) it grows to absorb the leftover page height and
              print:justify-center centers the group within it, so the title
              and recipient land in the true vertical middle of the page
              instead of sitting compressed at the top with the rest of the
              A4 sheet left empty below the footer. */}
          <div className="print:flex print:flex-1 print:flex-col print:justify-center">
            {/* Certificate title — bilingual brand lockup, not toggled by language */}
            <div className="mt-4 text-center print:mt-0">
              <h1 className="text-[29px] font-extrabold tracking-tight text-navy">شهادة أثر</h1>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/65">
                Impact Certificate
              </p>
            </div>

            {/* Hero: recognition of the employee — the strongest element on the page */}
            <div className="mt-6 text-center">
              <p className="text-[13px] text-navy/65">
                {isAr ? "تُمنح هذه الشهادة إلى" : "This certificate is presented to"}
              </p>
              <p className="mx-auto mt-2.5 max-w-xl break-words text-[34px] font-extrabold leading-[1.15] tracking-tight text-navy sm:text-[38px]">
                {recipient.name || "—"}
              </p>
              <div className="mx-auto mt-3 h-[2px] w-20 rounded-full bg-navy/60" />
              <p className="mx-auto mt-4 max-w-sm text-[13.5px] leading-6 text-navy/70">
                {isAr
                  ? "تقديرًا للمساهمة في تحقيق أثر إيجابي وموثّق، تمت مراجعته واعتماده عبر منصة أثري."
                  : "In recognition of their contribution toward a documented positive impact, reviewed and approved through the ATHARI platform."}
              </p>
            </div>
          </div>

          {/* Footer — verification held in one bordered, official-feeling panel
              rather than a loose row, so it reads as a distinct block: facility,
              identifiers, approval, and QR verification together. In print,
              the print:flex-1 group above already pushes this block down
              toward the bottom third of the page; print:mt-8 adds a touch
              more breathing room above it now that the page has room to give. */}
          <div className="mt-4 rounded-xl2 border border-navy/[0.12] bg-bgsoft/70 px-4 py-2 sm:px-6 print:mt-8">
            <div className="flex flex-wrap items-center justify-center gap-y-4">
              {footerItems.map((item, i) => (
                <div key={item.key} className="flex items-center">
                  {i > 0 && <FooterDivider />}
                  {item.node}
                </div>
              ))}
            </div>
          </div>

          {/* Platform statement — shown once, follows the active language, and
              sits close to the bottom edge of the certificate frame in print. */}
          <div className="mt-4 text-center print:mt-6">
            <p className="text-[11px] font-medium text-navy/65">
              {isAr
                ? "نوثّق الأثر، نحفظ الإنجاز، ونُبرز ما صنع الفرق"
                : "Documenting impact, preserving achievement, and highlighting what made the difference."}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-2xl text-center print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl2 bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-navy-light"
        >
          <PrinterIcon className="h-4 w-4" />
          {isAr ? "طباعة / حفظ PDF" : "Print / Save PDF"}
        </button>
        {/* Browser-controlled setting — no webpage/CSS can toggle this for the
            user; it lives in the print dialog itself. Styled as a visible
            callout (not a faint footnote) since skipping it is exactly what
            makes a printed certificate show the browser's own date/title/URL/
            page-number instead of looking like a standalone document. */}
        <div className="mx-auto mt-3 max-w-md rounded-xl2 border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800">
          {isAr
            ? "قبل الطباعة: أوقف خيار \"العناوين والتذييلات\" (Headers and footers) من \"مزيد من الإعدادات\" في نافذة الطباعة، وإلا ستظهر بيانات المتصفح (التاريخ والرابط ورقم الصفحة) حول الشهادة."
            : 'Before printing: turn off "Headers and footers" under "More settings" in the print dialog, otherwise the browser\'s own date, URL, and page number will appear around the certificate.'}
        </div>
      </div>
    </div>
  );
}
