import { CLUSTER_EXECUTIVE_ADMINISTRATION_NAME, CLUSTER_EXECUTIVE_ADMINISTRATION_NAME_EN } from "@/lib/clusterData";
import { ImpactCategory, ImpactStatus, OrgImpactType, ReviewHistoryActor, ReviewHistoryEventType } from "@/lib/types";

// Bilingual support for the employee-facing ATHARI submission journey only
// (/submit and everything under it). Internal/admin/reviewer screens keep
// using the Arabic strings directly from lib/types.ts and never import this
// module, so they are completely unaffected by this file's existence.
export type Language = "ar" | "en";

export const translations = {
  // Common — reused across the wizard and both forms
  "common.back": { ar: "→ رجوع", en: "← Back" },
  "common.continue": { ar: "متابعة", en: "Continue" },
  "common.cancel": { ar: "إلغاء", en: "Cancel" },
  "common.submitForReview": { ar: "إرسال للمراجعة", en: "Submit for Review" },
  "common.optional": { ar: "اختياري", en: "optional" },
  "common.selectDepartment": { ar: "اختر القسم", en: "Select Department" },
  "common.other": { ar: "أخرى", en: "Other" },
  "common.pleaseSpecify": { ar: "يرجى التحديد", en: "Please specify" },
  "common.pleaseSpecifyLabel": { ar: "يرجى التحديد *", en: "Please specify *" },
  "common.departmentName": { ar: "اسم القسم", en: "Department name" },
  "common.removeDepartment": { ar: "إزالة القسم", en: "Remove department" },
  "common.addAnotherDepartment": { ar: "إضافة قسم آخر", en: "Add Another Department" },
  "common.change": { ar: "تغيير", en: "Change" },
  "common.impactNumberLabel": { ar: "رقم الأثر", en: "Impact Number" },
  "common.keepNumberForTracking": {
    ar: "احتفظ برقم الأثر لمتابعة حالة الطلب.",
    en: "Please keep your Impact Number to track your submission.",
  },
  "common.trackImpactLink": { ar: "متابعة الأثر", en: "Track Impact" },
  "common.submissionSuccessTitle": { ar: "تم إرسال أثرك بنجاح", en: "Your impact has been submitted successfully." },
  "common.submissionSuccessThanks": {
    ar: "شكرًا لمساهمتك في توثيق الأثر وإبراز الإنجاز.",
    en: "Thank you for helping document impact and highlight achievement.",
  },
  "common.copy": { ar: "نسخ", en: "Copy" },
  "common.copied": { ar: "تم النسخ", en: "Copied" },

  // /submit wizard
  "wizard.selectScope": { ar: "اختر النطاق", en: "Select Scope" },
  "wizard.facilityType": { ar: "نوع المنشأة", en: "Facility Type" },
  "wizard.selectFacility": { ar: "اختر المنشأة", en: "Select Facility" },
  "wizard.noFacilitiesOfType": {
    ar: "لا توجد منشآت من هذا النوع مسجّلة لهذا النطاق حاليًا.",
    en: "No facilities of this type are currently registered for this scope.",
  },
  "wizard.phcName": { ar: "اسم مركز الرعاية الصحية الأولية", en: "Primary Healthcare Center Name" },
  "wizard.phcNamePlaceholder": { ar: "اكتب اسم المركز", en: "Type the center's name" },
  "wizard.departmentPlaceholder": { ar: "اكتب اسم القسم أو الإدارة", en: "Type the department or unit name" },
  "wizard.clusterExecutiveAdministration": { ar: CLUSTER_EXECUTIVE_ADMINISTRATION_NAME, en: CLUSTER_EXECUTIVE_ADMINISTRATION_NAME_EN },
  "wizard.impactTypeQuestion": {
    ar: "ما نوع الأثر الذي ترغب في تسجيله؟",
    en: "What type of impact would you like to record?",
  },
  "wizard.clinicalImpact": { ar: "الأثر السريري", en: "Clinical Impact" },
  "wizard.clinicalImpactDesc": {
    ar: "أثر متعلق برحلة مريض ونتيجته العلاجية",
    en: "Impact related to a patient's care journey and clinical outcome",
  },
  "wizard.organizationalImpact": { ar: "الأثر المؤسسي", en: "Organizational Impact" },
  "wizard.organizationalImpactDesc": {
    ar: "أثر ناتج عن مبادرة أو مشروع أو برنامج",
    en: "Impact resulting from an initiative, project, or program",
  },
  "wizard.healthCluster": { ar: "التجمع الصحي", en: "Health Cluster" },

  // Clinical form (AddImpactForm)
  "clinical.title": { ar: "إضافة أثر", en: "Add Impact" },
  "clinical.subtitle": { ar: "توثيق نتيجة سريرية جديدة لأحد المرضى", en: "Document a new clinical outcome for a patient" },
  "clinical.requiredFieldsError": {
    ar: "يرجى استكمال جميع الحقول الإلزامية قبل إرسال الأثر.",
    en: "Please complete all required fields before submitting the impact.",
  },
  "clinical.patientInfo": { ar: "بيانات المريض", en: "Patient Information" },
  "clinical.matchedExisting": {
    ar: "تم العثور على مريض مسجّل بهذا الملف — تم تعبئة بياناته تلقائيًا، ويمكن تعديلها عند الحاجة",
    en: "A registered patient was found with this file number — their details were filled in automatically and can be edited if needed",
  },
  "clinical.mrn": { ar: "رقم الملف MRN *", en: "File Number (MRN) *" },
  "clinical.mrnPlaceholder": { ar: "مثال: MRN-10234", en: "e.g., MRN-10234" },
  "clinical.department": { ar: "القسم *", en: "Department *" },
  // Employee-facing (QR entry) label only — clarifies this is the
  // department/administration SUBMITTING the impact, not the patient's
  // inpatient/ward location. The internal (non-QR) dropdown above keeps
  // using "clinical.department" — it selects the patient's own lead
  // department, a different, legitimate concept for internal manual entry.
  "clinical.submittingDepartment": {
    ar: "القسم / الإدارة المقدّمة للأثر*",
    en: "Submitting Department / Administration*",
  },
  "clinical.submittingDepartmentPlaceholder": {
    ar: "اكتب اسم القسم أو الإدارة التي تسجّل هذا الأثر",
    en: "Enter the department or administration submitting this impact",
  },
  "clinical.admissionDate": { ar: "تاريخ الدخول *", en: "Admission Date *" },
  // Impact Date validation — checked only at submission time (new
  // submissions and Edit & Resubmit); existing/legacy records are never
  // re-validated or blocked from displaying.
  "clinical.eventDateBeforeAdmission": {
    ar: "لا يمكن أن يكون تاريخ الأثر قبل تاريخ دخول المريض.",
    en: "Impact Date cannot be earlier than the patient's admission date.",
  },
  "clinical.eventDateFuture": {
    ar: "لا يمكن أن يكون تاريخ الأثر تاريخًا مستقبليًا.",
    en: "Impact Date cannot be a future date.",
  },
  // Organizational counterparts — same submission-time-only rule as above:
  // existing/legacy records are never re-validated or blocked from displaying.
  "org.eventDateBeforeStart": {
    ar: "لا يمكن أن يكون تاريخ الأثر قبل تاريخ بدء المبادرة.",
    en: "Impact Date cannot be earlier than the initiative's start date.",
  },
  "org.eventDateFuture": {
    ar: "لا يمكن أن يكون تاريخ الأثر تاريخًا مستقبليًا.",
    en: "Impact Date cannot be a future date.",
  },
  "clinical.mrnHint": {
    ar: "يُستخدم رقم الملف الطبي لربط الأثر برحلة المريض، مع بقاء كل أثر مسجّلًا ومستقلًا برقم وحالة مراجعة خاصة به.",
    en: "The Medical Record Number is used to link the impact to the patient journey, while each impact remains independently recorded with its own Impact Number and review status.",
  },
  "clinical.customDeptPlaceholder": { ar: "مثال: مكافحة العدوى", en: "e.g., Infection Control" },
  "clinical.eventDate": { ar: "تاريخ الحدث *", en: "Event Date *" },
  "clinical.previousStatus": { ar: "الحالة السابقة *", en: "Previous Status *" },
  "clinical.previousStatusPlaceholder": { ar: "مثال: طريح الفراش", en: "e.g., Bedridden" },
  "clinical.currentOutcome": { ar: "النتيجة الحالية *", en: "Current Outcome *" },
  "clinical.currentOutcomePlaceholder": { ar: "مثال: الجلوس بمساعدة", en: "e.g., Sitting with assistance" },
  "clinical.whatChanged": { ar: "ما الذي تغيّر؟ *", en: "What Changed? *" },
  "clinical.whatChangedPlaceholder": {
    ar: "صف التدخل أو التطور الذي أدى إلى هذه النتيجة",
    en: "Describe the intervention or development that led to this outcome",
  },
  "clinical.impactType": { ar: "نوع الأثر *", en: "Impact Type *" },
  "clinical.impactTypeHint": { ar: "يمكنك اختيار أكثر من خيار", en: "You can select more than one option" },
  "clinical.impactTypeOtherPlaceholder": {
    ar: "أخرى — اكتب نوع الأثر إذا لم يكن موجودًا أعلاه",
    en: "Other — type the impact type if it isn't listed above",
  },
  "clinical.participatingDepartments": {
    ar: "الأقسام المشاركة في هذا الأثر *",
    en: "Departments Participating in This Impact *",
  },
  "clinical.briefDescription": { ar: "وصف مختصر", en: "Brief Description" },
  "clinical.briefDescriptionPlaceholder": {
    ar: "تفاصيل إضافية حول الأثر السريري",
    en: "Additional details about the clinical impact",
  },
  "clinical.documentationSource": {
    ar: "مصدر التوثيق من السجل الطبي *",
    en: "Documentation Source from Medical Record *",
  },
  "clinical.attachEvidence": { ar: "إرفاق Evidence", en: "Attach Evidence" },
  "clinical.attachEvidenceHint": { ar: "(اختياري — اسم ملف/مرجع)", en: "(optional — file name/reference)" },
  "clinical.evidencePlaceholder": { ar: "مثال: تقرير-PT-2026-06-10.pdf", en: "e.g., PT-Report-2026-06-10.pdf" },
  "clinical.conflictTitle": { ar: "تم تعديل بيانات مريض مسجل مسبقًا", en: "Existing Patient Information Was Changed" },
  "clinical.conflictBody": {
    ar: "هل تريد اعتماد التعديلات على بيانات المريض؟",
    en: "Do you want to apply these changes to the patient's data?",
  },
  "clinical.keepExisting": { ar: "الاحتفاظ بالبيانات الحالية", en: "Keep Existing Data" },
  "clinical.applyEdits": { ar: "اعتماد التعديل", en: "Apply Changes" },
  "clinical.editTitle": { ar: "تعديل وإعادة إرسال الأثر", en: "Edit & Resubmit Impact" },
  "clinical.editSubtitle": {
    ar: "عدّل الحقول المطلوبة أدناه ثم أعد الإرسال للمراجعة",
    en: "Edit the required fields below, then resubmit for review",
  },
  "clinical.resubmitSuccessMessage": {
    ar: "تم إرسال التعديل بنجاح، وعاد الطلب إلى حالة «قيد المراجعة».",
    en: "Your changes were resubmitted successfully, and the request is back to «Under Review».",
  },
  "clinical.expiredEditError": {
    ar: "انتهت مهلة تعديل هذا الطلب، ولم يعد قابلاً للتعديل.",
    en: "The revision deadline for this request has expired — it can no longer be edited.",
  },

  // Organizational form (OrgAddImpactForm)
  "org.title": { ar: "إضافة أثر مؤسسي", en: "Add Organizational Impact" },
  "org.subtitle": {
    ar: "توثيق الأثر الناتج عن مبادرة أو مشروع أو برنامج",
    en: "Document the impact resulting from an initiative, project, or program",
  },
  "org.selectInitiativeError": {
    ar: "يرجى اختيار مبادرة من القائمة أو إنشاء مبادرة جديدة.",
    en: "Please select an initiative from the list or create a new one.",
  },
  "org.newInitiativeError": {
    ar: "يرجى تعبئة جميع بيانات المبادرة الجديدة.",
    en: "Please fill in all the new initiative details.",
  },
  "org.requiredFieldsError": {
    ar: "يرجى استكمال جميع الحقول الإلزامية قبل إرسال الأثر.",
    en: "Please complete all required fields before submitting the impact.",
  },
  "org.initiativeInfo": { ar: "بيانات المبادرة", en: "Initiative Information" },
  "org.selectExistingInitiative": { ar: "اختيار مبادرة موجودة", en: "Select Existing Initiative" },
  "org.createNewInitiative": { ar: "إنشاء مبادرة جديدة", en: "Create New Initiative" },
  "org.searchInitiativePlaceholder": {
    ar: "ابحث باسم المبادرة أو المشروع...",
    en: "Search by initiative or project name...",
  },
  "org.noMatchingInitiatives": { ar: "لا توجد مبادرات مطابقة.", en: "No matching initiatives found." },
  "org.initiativeName": { ar: "اسم المبادرة/المشروع *", en: "Initiative/Project Name *" },
  "org.initiativeNamePlaceholder": {
    ar: "مثال: برنامج مكافحة العدوى 2026",
    en: "e.g., Infection Control Program 2026",
  },
  "org.responsibleDepartment": { ar: "القسم المسؤول *", en: "Responsible Department *" },
  "org.initiativeType": { ar: "نوع المبادرة *", en: "Initiative Type *" },
  "org.startDate": { ar: "تاريخ البدء *", en: "Start Date *" },
  "org.customDeptPlaceholder": { ar: "مثال: مكافحة العدوى", en: "e.g., Infection Control" },
  "org.eventDate": { ar: "تاريخ الأثر/القياس *", en: "Impact/Measurement Date *" },
  "org.previousState": { ar: "التحدي أو الوضع قبل التنفيذ *", en: "Challenge or Situation Before Implementation *" },
  "org.previousStatePlaceholder": {
    ar: "مثال: لا يوجد بروتوكول موحّد لمكافحة العدوى في القسم",
    en: "e.g., No unified infection-control protocol in the department",
  },
  "org.whatWasDone": { ar: "ما الذي تم تنفيذه؟ *", en: "What Was Implemented? *" },
  "org.whatWasDonePlaceholder": {
    ar: "صف الإجراء أو المبادرة التي نُفّذت",
    en: "Describe the action or initiative that was implemented",
  },
  "org.resultingChange": { ar: "ما الذي تغيّر نتيجةً لذلك؟ *", en: "What Changed as a Result? *" },
  "org.resultingChangePlaceholder": {
    ar: "صف الأثر أو النتيجة الفعلية، وليس النشاط نفسه",
    en: "Describe the actual impact or outcome, not the activity itself",
  },
  "org.metricName": { ar: "المؤشر أو النتيجة القابلة للقياس", en: "Metric or Measurable Result" },
  "org.metricNamePlaceholder": { ar: "مثال: معدل العدوى المكتسبة", en: "e.g., Hospital-acquired infection rate" },
  "org.beforeValue": { ar: "القيمة قبل", en: "Value Before" },
  "org.beforeValuePlaceholder": { ar: "مثال: 8%", en: "e.g., 8%" },
  "org.afterValue": { ar: "القيمة بعد", en: "Value After" },
  "org.afterValuePlaceholder": { ar: "مثال: 3%", en: "e.g., 3%" },
  "org.participatingDepartments": {
    ar: "الأقسام المشاركة/المستفيدة *",
    en: "Participating/Beneficiary Departments *",
  },
  "org.briefDescription": { ar: "وصف مختصر", en: "Brief Description" },
  "org.briefDescriptionPlaceholder": {
    ar: "تفاصيل إضافية حول الأثر المؤسسي",
    en: "Additional details about the organizational impact",
  },
  "org.documentationSource": { ar: "مصدر التوثيق *", en: "Documentation Source *" },
  "org.referenceNote": { ar: "مرجع التوثيق", en: "Documentation Reference" },
  "org.referenceNoteHint": {
    ar: "(اختياري — اسم التقرير أو رقمه/تاريخه)",
    en: "(optional — report name, number, or date)",
  },
  "org.referenceNotePlaceholder": {
    ar: "مثال: محضر اجتماع الجودة — 2026/06/10",
    en: "e.g., Quality Committee Minutes — 2026/06/10",
  },
  "org.editTitle": { ar: "تعديل وإعادة إرسال الأثر", en: "Edit & Resubmit Impact" },
  "org.editSubtitle": {
    ar: "عدّل الحقول المطلوبة أدناه ثم أعد الإرسال للمراجعة",
    en: "Edit the required fields below, then resubmit for review",
  },
  "org.resubmitSuccessMessage": {
    ar: "تم إرسال التعديل بنجاح، وعاد الطلب إلى حالة «قيد المراجعة».",
    en: "Your changes were resubmitted successfully, and the request is back to «Under Review».",
  },
  "org.expiredEditError": {
    ar: "انتهت مهلة تعديل هذا الطلب، ولم يعد قابلاً للتعديل.",
    en: "The revision deadline for this request has expired — it can no longer be edited.",
  },

  // Shared submitter-person block (SubmitterInfoFields)
  "submitter.title": { ar: "بيانات مقدمي الأثر", en: "Impact Submitter Information" },
  "submitter.name": { ar: "الاسم *", en: "Name *" },
  "submitter.namePlaceholder": { ar: "الاسم الكامل", en: "Full name" },
  "submitter.phone": { ar: "رقم الجوال *", en: "Phone Number *" },
  "submitter.email": { ar: "البريد الإلكتروني *", en: "Email Address *" },
  "submitter.jobTitle": { ar: "الوظيفة *", en: "Job Title *" },
  "submitter.jobTitlePlaceholder": { ar: "المسمى الوظيفي", en: "Job title" },
  "submitter.remove": { ar: "حذف", en: "Remove" },
  "submitter.addAnother": { ar: "إضافة شخص آخر", en: "Add Another Person" },
  "submitter.primaryBadge": { ar: "منشئ الأثر", en: "Created by" },
  "submitter.contributorBadge": { ar: "مساهم", en: "Contributor" },
  "track.certificateFor": { ar: "شهادة", en: "Certificate" },

  // OTP verification — demo/prototype simulation only for the Primary
  // Submitter's mobile number (see components/SubmitterInfoFields.tsx). No
  // real SMS is ever sent; the "code" is generated and shown right in the UI.
  "otp.sendCode": { ar: "إرسال رمز التحقق", en: "Send verification code" },
  "otp.codeSentTo": { ar: "تم إرسال رمز تحقق تجريبي إلى", en: "A demo verification code was sent to" },
  "otp.demoCodeHint": { ar: "رمز العرض التجريبي", en: "Demo code" },
  "otp.codePlaceholder": { ar: "أدخل الرمز المكوّن من 6 أرقام", en: "Enter the 6-digit code" },
  "otp.verify": { ar: "تحقق", en: "Verify" },
  "otp.resend": { ar: "إعادة الإرسال", en: "Resend" },
  "otp.verified": { ar: "تم التحقق", en: "Verified" },
  "otp.invalidCode": { ar: "الرمز غير صحيح، يرجى المحاولة مرة أخرى", en: "Incorrect code, please try again" },
  "otp.verificationRequiredError": {
    ar: "يرجى التحقق من رقم الجوال قبل إرسال الأثر.",
    en: "Please verify your phone number before submitting the impact.",
  },

  // Mandatory declaration
  "declaration.text": {
    ar: "أقر بصحة المعلومات المسجلة، وألتزم بتوفير المستندات أو المصادر الداعمة للأثر عند طلبها للمراجعة والتحقق.",
    en: "I confirm that the information provided is accurate and agree to provide supporting documents or sources for the impact upon request for review and verification.",
  },
  "declaration.requiredError": {
    ar: "يجب الموافقة على إقرار صحة المعلومات قبل إرسال الطلب.",
    en: "You must agree to the accuracy declaration before submitting.",
  },

  // Track Impact (/submit/track) — employee-facing lookup by Impact Number +
  // mobile number, and its result view.
  "track.title": { ar: "متابعة الأثر", en: "Track Impact" },
  "track.subtitle": {
    ar: "ابحث برقم الأثر ورقم الجوال لمعرفة حالة الطلب",
    en: "Search by Impact Number and mobile number to check your request's status",
  },
  "track.impactNumberField": { ar: "رقم الأثر *", en: "Impact Number *" },
  "track.impactNumberPlaceholder": { ar: "مثال: ATH-2026-00124", en: "e.g., ATH-2026-00124" },
  "track.mobileField": { ar: "رقم الجوال *", en: "Mobile Number *" },
  "track.mobilePlaceholder": { ar: "05xxxxxxxx", en: "05xxxxxxxx" },
  "track.searchButton": { ar: "بحث", en: "Search" },
  "track.searchAnother": { ar: "بحث عن أثر آخر", en: "Search for another impact" },
  "track.requiredFieldsError": {
    ar: "يرجى إدخال رقم الأثر ورقم الجوال.",
    en: "Please enter both the Impact Number and mobile number.",
  },
  "track.notFound": {
    ar: "لم يتم العثور على أثر مطابق لرقم الأثر ورقم الجوال المدخلين. يرجى التحقق من الرقمين والمحاولة مجددًا.",
    en: "No impact matches the Impact Number and mobile number entered. Please check both and try again.",
  },
  "track.typeLabel": { ar: "نوع الأثر", en: "Impact Type" },
  "track.typeClinical": { ar: "سريري", en: "Clinical" },
  "track.typeOrganizational": { ar: "مؤسسي", en: "Organizational" },
  "track.categoryLabel": { ar: "نوع الأثر السريري", en: "Clinical Impact Type" },
  "track.facilityLabel": { ar: "المنشأة", en: "Facility" },
  "track.departmentLabel": { ar: "القسم / الإدارة", en: "Department / Unit" },
  "track.submissionDateLabel": { ar: "تاريخ الإرسال", en: "Submission Date" },
  "track.statusLabel": { ar: "الحالة الحالية", en: "Current Status" },
  "track.timelineTitle": { ar: "سجل المراجعة", en: "Review History" },
  "track.reviewerReasonLabel": { ar: "تعليمات المراجع", en: "Reviewer Instructions" },
  "track.returnDateLabel": { ar: "تاريخ الإرجاع", en: "Return Date" },
  "track.revisionDeadlineLabel": { ar: "الموعد النهائي للتعديل", en: "Revision Deadline" },
  "track.revisionInstructionNote": {
    ar: "يرجى استكمال التعديلات المطلوبة وإعادة إرسال الأثر خلال 7 أيام من تاريخ الإعادة.",
    en: "Please complete the requested revisions and resubmit the impact within 7 days from the return date.",
  },
  "track.rejectionReasonLabel": { ar: "سبب عدم الاعتماد", en: "Reason for Not Approved" },
  "track.editResubmitButton": { ar: "تعديل وإعادة الإرسال", en: "Edit & Resubmit" },
  "track.expiredNotice": {
    ar: "انتهت مهلة التعديل. تم إغلاق الطلب لعدم استكمال التعديلات خلال المهلة المحددة.",
    en: "The revision deadline has expired. The request was closed because the requested revisions were not completed within the specified period.",
  },
  "track.backToSubmit": { ar: "→ العودة لصفحة تسجيل الأثر", en: "← Back to submission page" },
  "track.certificateButton": { ar: "شهادة الأثر", en: "Impact Certificate" },
} as const;

export type TranslationKey = keyof typeof translations;

export function translate(language: Language, key: TranslationKey): string {
  return translations[key][language];
}

// Interpolated strings that don't fit the flat key/value dictionary above.
export function tStepOf(language: Language, current: number, total: number): string {
  return language === "ar" ? `الخطوة ${current} من ${total}` : `Step ${current} of ${total}`;
}

export function tCreateNewInitiativeWithQuery(language: Language, query: string): string {
  if (!query) return language === "ar" ? "+ إنشاء مبادرة جديدة" : "+ Create New Initiative";
  return language === "ar"
    ? `+ إنشاء مبادرة جديدة باسم "${query}"`
    : `+ Create New Initiative named "${query}"`;
}

export function tStartedOn(language: Language, dateText: string): string {
  return language === "ar" ? `بدأت ${dateText}` : `Started ${dateText}`;
}

// Track Impact's "editing impact ATH-2026-00124" context banner.
export function tEditingImpactBanner(language: Language, impactNumber: string): string {
  return language === "ar"
    ? `أنت تعدّل الأثر رقم ${impactNumber} — سيُعاد إرساله للمراجعة بنفس الرقم.`
    : `You are editing impact ${impactNumber} — it will be resubmitted for review under the same number.`;
}

// Track Impact's remaining-time note under the revision deadline. Once the
// deadline has passed, expireOverdueRevisions() flips the record to
// "closed_expired" before this would ever be shown, so this only ever
// renders a non-negative day count.
export function tDaysRemaining(language: Language, days: number): string {
  if (language === "ar") {
    return days <= 0 ? "ينتهي اليوم" : `متبقٍ ${days} ${days === 1 ? "يوم" : "أيام"}`;
  }
  return days <= 0 ? "Due today" : `${days} day${days === 1 ? "" : "s"} remaining`;
}

// Generic-vocabulary lookups — the values below are category/type/source
// LABELS (fixed vocabulary), never specific facility/department/initiative
// NAMES, so translating them does not run afoul of "preserve official entity
// names as stored". The underlying stored value (an id, or — for the two
// documentation-source lists — the canonical Arabic string used as both value
// and label) never changes; only what's displayed to an English-mode reader
// does.
export const CATEGORY_LABELS_EN: Record<ImpactCategory, string> = {
  mobility: "Mobility & Rehabilitation",
  respiratory: "Respiratory",
  neurological: "Neurological",
  nutrition: "Nutrition & Swallowing",
  wound: "Wound Healing",
  functional: "Functional Independence",
  communication: "Communication",
  other: "Other Significant Outcome",
};

export const ORG_IMPACT_TYPE_LABELS_EN: Record<OrgImpactType, string> = {
  project: "Project or Initiative",
  training: "Training Program",
  policy: "New/Updated Policy or Procedure",
  quality: "Quality Improvement Project",
  innovation: "Innovation",
  process: "Process or Service Improvement",
  other: "Other",
};

export const DOCUMENTATION_SOURCE_LABELS_EN: Record<string, string> = {
  "ملاحظات التمريض": "Nursing Notes",
  "ملاحظات الطبيب المعالج": "Attending Physician Notes",
  "تقرير العلاج الطبيعي": "Physical Therapy Report",
  "تقرير أخصائي التغذية": "Nutrition Specialist Report",
  "تقرير علاج النطق والبلع": "Speech & Swallowing Therapy Report",
  "الملف الطبي الإلكتروني": "Electronic Medical Record",
  "تقرير العلاج التنفسي": "Respiratory Therapy Report",
  "أخرى": "Other",
};

export const ORG_DOCUMENTATION_SOURCE_LABELS_EN: Record<string, string> = {
  "تقرير مبادرة": "Initiative Report",
  "تقرير أداء": "Performance Report",
  "محضر اجتماع": "Meeting Minutes",
  "نتائج استبيان": "Survey Results",
  "تقرير جودة": "Quality Report",
  "سياسة/إجراء": "Policy/Procedure",
  "أخرى": "Other",
};

export const FACILITY_TYPE_LABELS_EN: Record<string, string> = {
  hospital: "Hospital",
  medical_city: "Medical City",
  phc: "Primary Healthcare Center (PHC)",
};

// Employee-facing status wording for Track Impact — intentionally separate
// from IMPACT_STATUS_LABELS/ORG_IMPACT_STATUS_LABELS in lib/types.ts (which
// stay exactly as the reviewer/admin screens have always shown them). Only
// this bilingual lookup is used on /submit/track.
export const TRACK_STATUS_LABELS: Record<ImpactStatus, { ar: string; en: string }> = {
  pending: { ar: "قيد المراجعة", en: "Under Review" },
  approved: { ar: "معتمد", en: "Approved" },
  rejected: { ar: "غير معتمد", en: "Not Approved" },
  returned_for_revision: { ar: "بحاجة إلى تعديل", en: "Returned for Revision" },
  closed_expired: { ar: "مغلق – انتهت مهلة التعديل", en: "Closed – Revision Deadline Expired" },
};

// Labels for each stage in the Track Impact timeline — only stages that
// actually happened (present in reviewHistory, or synthesized from
// status/createdAt for legacy records) are ever rendered.
export const TIMELINE_EVENT_LABELS: Record<ReviewHistoryEventType, { ar: string; en: string }> = {
  submitted: { ar: "تم الإرسال", en: "Submitted" },
  returned_for_revision: { ar: "أُرجع للتعديل", en: "Returned for Revision" },
  resubmitted: { ar: "أُعيد الإرسال", en: "Resubmitted" },
  edited: { ar: "تعديل من المراجع", en: "Edited by Reviewer" },
  approved: { ar: "معتمد", en: "Approved" },
  rejected: { ar: "غير معتمد", en: "Not Approved" },
  closed_expired: { ar: "أُغلق تلقائيًا (انتهاء المهلة)", en: "Closed automatically (deadline expired)" },
};

// Who acted, shown as a small tag next to a "resubmitted"/"edited" timeline
// entry (see ReviewHistoryActor in lib/types.ts).
export const ACTOR_LABELS: Record<ReviewHistoryActor, { ar: string; en: string }> = {
  submitter: { ar: "مقدّم الطلب", en: "Submitter" },
  reviewer: { ar: "المراجع", en: "Reviewer" },
};

// Bilingual display labels for the internal field keys recorded in a
// ReviewHistoryFieldChange (see lib/store.ts's buildClinicalFieldChanges /
// buildOrgFieldChanges). previousValue/newValue themselves are stored
// already-formatted and are never re-translated — only the field name is
// localized here, matching how TIMELINE_EVENT_LABELS only localizes the
// stage name and not free-text reasons.
export const AUDIT_FIELD_LABELS: Record<string, { ar: string; en: string }> = {
  previousStatus: { ar: "الحالة السابقة", en: "Previous Status" },
  whatChanged: { ar: "ما الذي تغيّر", en: "What Changed" },
  currentOutcome: { ar: "النتيجة الحالية", en: "Current Outcome" },
  eventDate: { ar: "تاريخ الأثر", en: "Impact Date" },
  categories: { ar: "نوع الأثر", en: "Impact Type" },
  categoryOtherText: { ar: "نوع الأثر (أخرى)", en: "Impact Type (Other)" },
  departments: { ar: "الأقسام المشاركة", en: "Participating Departments" },
  submittingDepartment: { ar: "الإدارة المقدّمة للأثر", en: "Submitting Department" },
  description: { ar: "وصف مختصر", en: "Description" },
  documentationSource: { ar: "مصدر التوثيق", en: "Documentation Source" },
  documentationSourceOtherText: { ar: "مصدر التوثيق (أخرى)", en: "Documentation Source (Other)" },
  evidenceRef: { ar: "المرجع / الدليل", en: "Evidence Reference" },
  submitters: { ar: "المقدّمون", en: "Submitters" },
  previousState: { ar: "الوضع قبل التنفيذ", en: "Previous State" },
  whatWasDone: { ar: "ما الذي تم تنفيذه", en: "What Was Done" },
  resultingChange: { ar: "الأثر الناتج", en: "Resulting Change" },
  metricName: { ar: "المؤشر", en: "Metric" },
  beforeValue: { ar: "قبل", en: "Before" },
  afterValue: { ar: "بعد", en: "After" },
  referenceNote: { ar: "المرجع", en: "Reference" },
};

// Simulated mobile SMS notifications — executive-demo visual only (see
// components/SmsSimulationToast.tsx). No real SMS provider, backend, or API
// is ever involved; this is purely local, in-browser content shown to
// illustrate "what the employee would receive on their phone in production."
// Goes to the Primary Submitter only. Deliberately excludes patient MRN and
// detailed reviewer reasons — status + a short instruction only.
export function smsSimulationLabel(language: Language): string {
  return language === "ar" ? "محاكاة رسالة نصية" : "Demo SMS";
}

export function smsSimulationSentTo(language: Language, phone: string): string {
  return language === "ar" ? `إلى ${phone}` : `To ${phone}`;
}

export function smsSimulationBody(
  event: ReviewHistoryEventType,
  language: Language,
  impactNumber: string
): string {
  const messages: Record<ReviewHistoryEventType, { ar: string; en: string }> = {
    submitted: {
      ar: `تم استلام أثرك رقم ${impactNumber} بنجاح وهو الآن قيد المراجعة عبر منصة أثري.`,
      en: `Your impact ${impactNumber} has been received and is now under review via the ATHARI platform.`,
    },
    resubmitted: {
      ar: `تم إعادة إرسال الأثر رقم ${impactNumber} بنجاح وهو الآن قيد المراجعة.`,
      en: `Impact ${impactNumber} was resubmitted successfully and is now under review.`,
    },
    returned_for_revision: {
      ar: `الأثر رقم ${impactNumber} بحاجة إلى تعديل. يرجى مراجعة الملاحظات واستكمال التعديل خلال 7 أيام عبر منصة أثري.`,
      en: `Impact ${impactNumber} needs revision. Please review the notes and complete the changes within 7 days via the ATHARI platform.`,
    },
    approved: {
      ar: `تم اعتماد أثرك رقم ${impactNumber} بنجاح. يمكنك متابعة تفاصيل الأثر عبر منصة أثري.`,
      en: `Your impact ${impactNumber} has been approved. You can view the details via the ATHARI platform.`,
    },
    rejected: {
      ar: `لم يتم اعتماد الأثر رقم ${impactNumber}. يمكنك متابعة التفاصيل عبر منصة أثري.`,
      en: `Impact ${impactNumber} was not approved. You can view the details via the ATHARI platform.`,
    },
    closed_expired: {
      ar: `انتهت مهلة تعديل الأثر رقم ${impactNumber} وتم إغلاقه. يمكنك متابعة الحالة عبر منصة أثري.`,
      en: `The revision deadline for impact ${impactNumber} has expired and it has been closed. You can check the status via the ATHARI platform.`,
    },
    // Never actually triggered today — the reviewer's inline edit of a
    // pending request (see lib/store.ts) doesn't fire a demo SMS, only
    // decision actions (approve/reject/return) and resubmission do. Present
    // only so this Record stays exhaustive over ReviewHistoryEventType.
    edited: {
      ar: `تم تحديث بيانات الأثر رقم ${impactNumber}.`,
      en: `Impact ${impactNumber} details were updated.`,
    },
  };
  return messages[event][language];
}
