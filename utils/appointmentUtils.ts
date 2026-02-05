/**
 * Appointment utility functions
 * Common functions for handling appointment logic across the application
 */

import { Appointment } from "@/store/api/appointmentApi";

/**
 * Check if an appointment has timed out (scheduled DATE has passed)
 * Date-based timeout: Appointments are valid for the entire scheduled day
 * and timeout at midnight (00:00) of the NEXT day
 * Example: Appointment on 1/2/2026 at 2:00 AM will timeout on 2/2/2026 at 00:00
 * @param appointment - The appointment to check
 * @returns true if appointment date has passed, false otherwise
 */
export function isAppointmentTimedOut(appointment: Appointment): boolean {
    if (!appointment.appointmentDetails) return false;

    try {
        const scheduledDate = appointment.appointmentDetails.scheduledDate;
        const scheduledTime = appointment.appointmentDetails.scheduledTime;

        if (!scheduledDate || !scheduledTime) return false;

        // Parse the scheduled date and time
        let scheduledDateTime: Date;

        // Try multiple date parsing strategies
        if (scheduledDate.includes('T')) {
            // ISO format: "2026-02-05T19:10:00"
            scheduledDateTime = new Date(scheduledDate);
        } else if (scheduledDate.includes('-')) {
            // Format: "2026-02-05" with separate time "19:10"
            scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        } else if (scheduledDate.includes('/')) {
            // Format: "02/05/2026" or "05/02/2026"
            const parts = scheduledDate.split('/');
            const year = parts[2];
            const month = parts[0].length === 4 ? parts[1] : parts[0];
            const day = parts[0].length === 4 ? parts[0] : parts[1];
            scheduledDateTime = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${scheduledTime}`);
        } else {
            // Fallback: try standard Date parsing
            scheduledDateTime = new Date(`${scheduledDate} ${scheduledTime}`);
        }

        // Validate the date
        if (isNaN(scheduledDateTime.getTime())) {
            console.error('Invalid date:', { scheduledDate, scheduledTime });
            return false;
        }

        const now = new Date();

        // Get date only (without time) for comparison
        // This ensures appointments are valid for the entire scheduled day
        const scheduledDateOnly = new Date(
            scheduledDateTime.getFullYear(),
            scheduledDateTime.getMonth(),
            scheduledDateTime.getDate(),
            0, 0, 0, 0  // Set to 00:00:00 (midnight)
        );
        const currentDateOnly = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0, 0, 0, 0  // Set to 00:00:00 (midnight)
        );

        const isTimedOut = currentDateOnly.getTime() > scheduledDateOnly.getTime();

        return isTimedOut;
    } catch (error) {
        console.error("Error checking appointment timeout:", error, appointment);
        return false;
    }
}

/**
 * Filter out timed-out appointments from a list
 * @param appointments - Array of appointments to filter
 * @returns Array of appointments that haven't timed out
 */
export function filterTimedOutAppointments(appointments: Appointment[]): Appointment[] {
    return appointments.filter((apt) => !isAppointmentTimedOut(apt));
}

/**
 * Filter pending appointments excluding timed-out ones
 * @param appointments - Array of appointments to filter
 * @returns Array of pending appointments that haven't timed out
 */
export function filterActivePendingAppointments(appointments: Appointment[]): Appointment[] {
    return appointments.filter((apt) => {
        // Only include pending appointments
        if (apt.status !== "pending") return false;

        // Exclude timed-out appointments
        return !isAppointmentTimedOut(apt);
    });
}

/**
 * Get the status display text for an appointment
 * Automatically detects timeout status
 * @param appointment - The appointment to get status for
 * @returns Status display text
 */
export function getAppointmentStatusDisplay(appointment: Appointment): string {
    // Check if appointment has timed out
    if (appointment.status === "pending" && isAppointmentTimedOut(appointment)) {
        return "Timeout";
    }

    // Return the actual status
    return appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);
}
