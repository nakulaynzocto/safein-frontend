/**
 * Must match Gatekeeper-Visitor `src/constants/whatsappMeta.constants.ts` (template names & usage).
 */
export const WHATSAPP_META_TEMPLATE_LANGUAGE = "en" as const;

export interface WhatsAppParameter {
  index: number;
  label: string;
}

export interface WhatsAppMetaTemplateRow {
  name: string;
  usedFor: string;
  variables: string;
  params: WhatsAppParameter[];
}

export const WHATSAPP_META_TEMPLATES: WhatsAppMetaTemplateRow[] = [
  {
    name: "system_config_update",
    usedFor: "Settings: OTP to verify your Phone Number ID and access token during setup",
    variables: "{{1}} verification code, {{2}} company / app name",
    params: [
      { index: 1, label: "Verification Code (OTP)" },
      { index: 2, label: "Company / App Name" }
    ]
  },
  {
    name: "new_appointment",
    usedFor: "Employee: new pending appointment (approval link) and approved-flow employee summary",
    variables: "{{1}}–{{6}} employee name, visitor, date, time, link or N/A, company",
    params: [
      { index: 1, label: "Employee Name" },
      { index: 2, label: "Visitor Name" },
      { index: 3, label: "Date" },
      { index: 4, label: "Time" },
      { index: 5, label: "Action Link (Approve/Reject)" },
      { index: 6, label: "Company Name" }
    ]
  },
  {
    name: "appointment_confirmed",
    usedFor: "Visitor or employee: appointment approved / confirmed",
    variables: "{{1}}–{{5}} company, host, date, time, company (footer)",
    params: [
      { index: 1, label: "Company Name" },
      { index: 2, label: "Host (Employee) Name" },
      { index: 3, label: "Date" },
      { index: 4, label: "Time" },
      { index: 5, label: "Company Name (Footer)" }
    ]
  },
  {
    name: "visit_status_update",
    usedFor: "Visitor: appointment rejected / unavailable",
    variables: "{{1}} date, {{2}} company name",
    params: [
      { index: 1, label: "Visit Date" },
      { index: 2, label: "Company Name" }
    ]
  },
  {
    name: "visitor_invitation",
    usedFor: "Visitor: appointment booking link invitation",
    variables: "{{1}} employee, {{2}} company, {{3}} link, {{4}} expiry date",
    params: [
      { index: 1, label: "Employee Name" },
      { index: 2, label: "Company Name" },
      { index: 3, label: "Booking Link" },
      { index: 4, label: "Link Expiry Date" }
    ]
  },
  {
    name: "visitor_entry_pass",
    usedFor: "Visitor: special booking entry code",
    variables: "{{1}} company, {{2}} visitor name, {{3}} code, {{4}} date",
    params: [
      { index: 1, label: "Company Name" },
      { index: 2, label: "Visitor Name" },
      { index: 3, label: "Entry Code / Pass ID" },
      { index: 4, label: "Scheduled Date" }
    ]
  },
];

export const WHATSAPP_PLAIN_TEXT_NOTE = "QR visitor check-in OTP is sent as a plain text message (not a named template).";
