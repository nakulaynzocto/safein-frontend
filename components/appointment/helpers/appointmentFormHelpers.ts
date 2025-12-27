/**
 * Helper functions for appointment form operations
 */
import { AppointmentFormData } from "./appointmentValidation"

/**
 * Create appointment data for API submission
 */
export const createAppointmentPayload = (data: AppointmentFormData) => {
  return {
    employeeId: data.employeeId,
    visitorId: data.visitorId,
    accompanyingCount: data.accompanyingCount ?? 0,
    appointmentDetails: {
      purpose: data.purpose,
      scheduledDate: data.appointmentDate,
      scheduledTime: data.appointmentTime,
      duration: 60,
      meetingRoom: "Main Conference Room",
      notes: data.notes || "",
      vehicleNumber: data.vehicleNumber || "",
      vehiclePhoto: data.vehiclePhoto || ""
    },
    securityDetails: {
      badgeIssued: false,
      badgeNumber: "",
      securityClearance: false,
      securityNotes: ""
    },
    notifications: {
      smsSent: false,
      emailSent: false,
      whatsappSent: false,
      reminderSent: false
    }
  }
}

/**
 * Create update appointment data for API submission
 */
export const createUpdateAppointmentPayload = (
  data: AppointmentFormData,
  existingAppointment: any
) => {
  return {
    accompanyingCount: data.accompanyingCount ?? 0,
    appointmentDetails: {
      purpose: data.purpose,
      scheduledDate: data.appointmentDate,
      scheduledTime: data.appointmentTime,
      duration: existingAppointment?.appointmentDetails?.duration || 60,
      meetingRoom: existingAppointment?.appointmentDetails?.meetingRoom || "Main Conference Room",
      notes: data.notes || "",
      vehicleNumber: data.vehicleNumber || "",
      vehiclePhoto: data.vehiclePhoto || ""
    }
  }
}

/**
 * Format employee label for select option
 */
export const formatEmployeeLabel = (emp: any): string => {
  return `${emp.name} (${emp.status}) - ${emp.department}`
}

/**
 * Format employee search keywords
 */
export const formatEmployeeSearchKeywords = (emp: any): string => {
  return `${emp.name} ${emp.email ?? ""} ${emp.phone ?? ""} ${emp.department ?? ""} ${emp.designation ?? ""}`.trim()
}

/**
 * Format visitor label for select option
 */
export const formatVisitorLabel = (visitor: any): string => {
  return `${visitor.name} - ${visitor.email}`
}

/**
 * Format visitor search keywords
 */
export const formatVisitorSearchKeywords = (visitor: any): string => {
  return `${visitor.name} ${visitor.email ?? ""} ${visitor.phone ?? ""}`.trim()
}


