/**
 * Helper functions for form reset operations
 */
import { AppointmentFormData } from "./appointmentValidation";

/**
 * Get default form values
 */
export const getDefaultFormValues = (): AppointmentFormData => {
    return {
        visitorId: "",
        employeeId: "",
        purpose: "",
        appointmentDate: "",
        appointmentTime: "",
        notes: "",
        vehicleNumber: "",
        vehiclePhoto: "",
        accompanyingCount: 0,
    };
};

/**
 * Convert existing appointment to form values
 */
export const appointmentToFormValues = (existingAppointment: any): AppointmentFormData => {
    const appointmentDetails = existingAppointment.appointmentDetails;

    return {
        visitorId: existingAppointment.visitorId || "",
        employeeId: existingAppointment.employeeId || "",
        purpose: appointmentDetails?.purpose || "",
        appointmentDate: appointmentDetails?.scheduledDate
            ? new Date(appointmentDetails.scheduledDate).toISOString().split("T")[0]
            : "",
        appointmentTime: appointmentDetails?.scheduledTime || "",
        notes: appointmentDetails?.notes || "",
        vehicleNumber: appointmentDetails?.vehicleNumber || "",
        vehiclePhoto: appointmentDetails?.vehiclePhoto || "",
        accompanyingCount: existingAppointment.accompanyingCount ?? 0,
    };
};
