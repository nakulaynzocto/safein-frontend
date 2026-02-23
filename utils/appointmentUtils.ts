/**
 * Appointment utility functions
 * Timeout logic is handled EXCLUSIVELY by the backend.
 * The backend injects `isTimedOut: true` for pending appointments
 * whose scheduledDate is before today midnight.
 */

import { Appointment } from "@/store/api/appointmentApi";

/**
 * Check if an appointment has timed out.
 * Reads `isTimedOut` from the backend response — no client-side date calculation.
 * Only pending appointments can be timed out (enforced server-side).
 */
export function isAppointmentTimedOut(appointment: Appointment): boolean {
    return !!appointment.isTimedOut;
}

/**
 * Filter out timed-out appointments from a list
 */
export function filterTimedOutAppointments(appointments: Appointment[]): Appointment[] {
    return appointments.filter((apt) => !apt.isTimedOut);
}

/**
 * Filter pending appointments excluding timed-out ones
 */
export function filterActivePendingAppointments(appointments: Appointment[]): Appointment[] {
    return appointments.filter((apt) => apt.status === "pending" && !apt.isTimedOut);
}

/**
 * Get the status display text for an appointment
 */
export function getAppointmentStatusDisplay(appointment: Appointment): string {
    if (appointment.isTimedOut) {
        return "Timeout";
    }
    return appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);
}
