/**
 * Validation schema for appointment form
 */
import * as yup from "yup";

export const appointmentSchema = yup.object({
    visitorId: yup.string().trim().required("Please select a visitor"),
    employeeId: yup.string().trim().required("Please select an employee"),
    purpose: yup.string().trim().required("Purpose of visit is required").min(5, "Purpose must be at least 5 characters"),
    appointmentDate: yup
        .string()
        .required("Appointment date is required")
        .test("future-date", "Scheduled date cannot be in the past", function (value) {
            if (!value) return false;
            try {
                let dStr = value;
                if (value.includes("/")) {
                    const [d, m, y] = value.split("/");
                    dStr = `${y}-${m}-${d}`;
                }
                const selectedDate = new Date(dStr + "T00:00:00");
                if (isNaN(selectedDate.getTime())) return false;

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                return selectedDate >= today;
            } catch (error) {
                return false;
            }
        }),
    appointmentTime: yup
        .string()
        .required("Appointment time is required")
        .test("future-time", "Scheduled time cannot be in the past", function (value) {
            if (!value) return false;
            const appointmentDate = this.parent.appointmentDate;
            if (!appointmentDate) return true;

            try {
                let dStr = appointmentDate;
                if (appointmentDate.includes("/")) {
                    const [d, m, y] = appointmentDate.split("/");
                    dStr = `${y}-${m}-${d}`;
                }
                const selectedDateTime = new Date(`${dStr}T${value}`);
                if (isNaN(selectedDateTime.getTime())) return true;

                const now = new Date();
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const selectedDate = new Date(dStr + "T00:00:00");
                selectedDate.setHours(0, 0, 0, 0);

                if (selectedDate.getTime() === today.getTime()) {
                    return selectedDateTime > now;
                }
                return true;
            } catch (error) {
                return true;
            }
        }),
    accompanyingCount: yup
        .number()
        .typeError("Please enter a valid number")
        .min(0, "Additional visitors cannot be negative")
        .max(20, "Additional visitors cannot exceed 20")
        .default(0),
    notes: yup.string().trim().optional().default(""),
    vehicleNumber: yup.string().trim().optional().default(""),
    vehiclePhoto: yup.string().trim().optional().default(""),
});

export type AppointmentFormData = yup.InferType<typeof appointmentSchema>;
