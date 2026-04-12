/**
 * Must match Gatekeeper-Visitor `src/constants/whatsappMeta.constants.ts` (template names & usage).
 */
export const WHATSAPP_META_TEMPLATE_LANGUAGE = "en" as const;

export interface WhatsAppMetaTemplateRow {
  name: string;
  usedFor: string;
  variables: string;
}

export const WHATSAPP_META_TEMPLATES: WhatsAppMetaTemplateRow[] = [
  {
    name: "system_config_update",
    usedFor:
      "Settings: OTP to verify your Phone Number ID and access token during setup",
    variables: "{{1}} verification code, {{2}} company / app name",
  },
  {
    name: "new_appointment",
    usedFor:
      "Employee: new pending appointment (approval link) and approved-flow employee summary",
    variables:
      "{{1}}–{{6}} employee name, visitor, date, time, link or N/A, company",
  },
  {
    name: "appointment_confirmed",
    usedFor: "Visitor or employee: appointment approved / confirmed",
    variables: "{{1}}–{{5}} company, host, date, time, company (footer)",
  },
  {
    name: "visit_status_update",
    usedFor: "Visitor: appointment rejected / unavailable",
    variables: "{{1}} date, {{2}} company name",
  },
  {
    name: "visitor_invitation",
    usedFor: "Visitor: appointment booking link invitation",
    variables: "{{1}} employee, {{2}} company, {{3}} link, {{4}} expiry date",
  },
  {
    name: "visitor_entry_pass",
    usedFor: "Visitor: special booking entry code",
    variables: "{{1}} company, {{2}} visitor name, {{3}} code, {{4}} date",
  },
];

export const WHATSAPP_PLAIN_TEXT_NOTE =
  "QR visitor check-in OTP is sent as a plain text message (not a named template).";
