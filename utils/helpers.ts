import { User } from "@/store/api/authApi";

export function formatDate(date: string | Date): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

export function formatTime(time: string): string {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = Number.parseInt(hours, 10);
    const min = Number.parseInt(minutes, 10);
    // Convert to 12-hour format with AM/PM
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12; // Convert 0 to 12, 13-23 to 1-11
    const displayMinutes = min.toString().padStart(2, "0");
    return `${displayHour}:${displayMinutes}${ampm}`;
}

export function formatDateTime(date: string | Date, time?: string): string {
    const formattedDate = formatDate(date);
    if (time) {
        const formattedTime = formatTime(time);
        return `${formattedDate} ${formattedTime}`;
    }
    return formattedDate;
}

export function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateId(): string {
    return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
}

export const createUrlParams = (urlData: Record<string, any>): string => {
    let datasize = Object.keys(urlData)?.length;
    const keys = Object.keys(urlData);
    let search = "";
    if (datasize) {
        keys.forEach((key) => {
            if (urlData[key] !== null && urlData[key] !== "" && urlData[key] !== undefined) {
                search += `${key}=${urlData[key]}&`;
            }
        });
        return search?.substring(0, search.length - 1);
    }
    return "";
};

/**
 * Format currency amount to display format
 * @param amount - Amount in rupees (e.g., 5999 = ₹5999)
 * @param currency - Currency code (e.g., 'inr', 'usd')
 * @param options - Optional formatting options
 * @returns Formatted currency string (e.g., "₹5,999")
 */
export function formatCurrency(
    amount: number,
    currency: string = "inr",
    options?: {
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
        showSymbol?: boolean;
    },
): string {
    const { minimumFractionDigits = 0, maximumFractionDigits = 0, showSymbol = true } = options || {};

    return new Intl.NumberFormat("en-IN", {
        style: showSymbol ? "currency" : "decimal",
        currency: currency.toUpperCase(),
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(amount);
}

/**
 * Format phone number to display format
 * @param phone - Phone number string
 * @param countryCode - Country code (default: '+91')
 * @returns Formatted phone number
 */
export function formatPhone(phone: string, countryCode: string = "+91"): string {
    if (!phone) return "";
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");
    // Format Indian phone numbers (10 digits)
    if (digits.length === 10) {
        return `${countryCode} ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    // Return as is if not 10 digits
    return phone;
}

/**
 * Format name with proper capitalization
 * @param name - Name string
 * @returns Formatted name with first letter of each word capitalized
 */
export function formatName(name: string): string {
    if (!name) return "";
    return name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = "..."): string {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Get initials from name
 * @param name - Full name
 * @param maxInitials - Maximum number of initials (default: 2)
 * @returns Initials string (e.g., "JD" for "John Doe")
 */
export function getInitials(name: string, maxInitials: number = 2): string {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length === 0) return "U";

    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    return words
        .slice(0, maxInitials)
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param value - Value to check
 * @returns True if value is empty
 */
export function isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    return false;
}

/**
 * Get status badge color based on status
 * @param status - Status string
 * @returns Tailwind CSS color class
 */
export function getStatusColor(status: string): string {
    const statusLower = status.toLowerCase();

    if (
        statusLower === "active" ||
        statusLower === "approved" ||
        statusLower === "completed" ||
        statusLower === "succeeded"
    ) {
        return "bg-green-100 text-green-800";
    }
    if (statusLower === "pending" || statusLower === "processing") {
        return "bg-yellow-100 text-yellow-800";
    }
    if (
        statusLower === "rejected" ||
        statusLower === "cancelled" ||
        statusLower === "failed" ||
        statusLower === "expired"
    ) {
        return "bg-red-100 text-red-800";
    }
    if (statusLower === "inactive" || statusLower === "deleted") {
        return "bg-gray-100 text-gray-800";
    }

    return "bg-blue-100 text-blue-800";
}

/**
 * Calculate percentage
 * @param value - Current value
 * @param total - Total value
 * @param decimals - Number of decimal places (default: 0)
 * @returns Percentage string
 */
export function calculatePercentage(value: number, total: number, decimals: number = 0): string {
    if (total === 0) return "0%";
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format file size to human readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function getRelativeTime(date: string | Date): string {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Appointment interface for status calculation
 */
interface AppointmentForStatus {
    appointmentDetails?: {
        scheduledDate?: string | Date;
        scheduledTime?: string;
    };
    status?: string;
}

/**
 * Get appointment date-time as Date object
 * @param appointment - Appointment object with appointmentDetails
 * @returns Date object or null if invalid
 */
export function getAppointmentDateTime(appointment: AppointmentForStatus): Date | null {
    // Check if both date and time are available
    if (!appointment.appointmentDetails?.scheduledDate) return null;

    try {
        // Parse the scheduled date (separate field)
        const dateStr = appointment.appointmentDetails.scheduledDate;
        let datePart: string;

        if (typeof dateStr === "string") {
            // Extract date part (YYYY-MM-DD format)
            if (dateStr.includes("T")) {
                datePart = dateStr.split("T")[0];
            } else if (dateStr.includes(" ")) {
                datePart = dateStr.split(" ")[0];
            } else {
                datePart = dateStr;
            }
        } else {
            // If it's a Date object, convert to ISO and extract date part
            datePart = dateStr.toISOString().split("T")[0];
        }

        // Parse date components
        const [year, month, day] = datePart.split("-").map(Number);
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            return null;
        }

        // Create base date object with date only (time will be set from scheduledTime)
        let scheduledDateTime = new Date(year, month - 1, day, 0, 0, 0, 0);

        // Parse the scheduled time (separate field) - format: HH:MM (24-hour format)
        if (appointment.appointmentDetails.scheduledTime) {
            const timeStr = appointment.appointmentDetails.scheduledTime.trim();
            let hours = 0;
            let minutes = 0;

            if (timeStr.includes(":")) {
                // Format: HH:MM or HH:MM AM/PM
                const timeParts = timeStr.split(":");
                hours = parseInt(timeParts[0], 10) || 0;
                const minutesPart = timeParts[1] ? timeParts[1].trim() : "0";

                // Check if it's 12-hour format (AM/PM)
                if (minutesPart.includes("AM") || minutesPart.includes("PM")) {
                    const mins = minutesPart.replace(/[APM]/gi, "").trim();
                    minutes = parseInt(mins, 10) || 0;

                    // Convert to 24-hour format
                    if (minutesPart.toUpperCase().includes("PM") && hours !== 12) {
                        hours += 12;
                    }
                    if (minutesPart.toUpperCase().includes("AM") && hours === 12) {
                        hours = 0;
                    }
                } else {
                    // 24-hour format: HH:MM
                    minutes = parseInt(minutesPart, 10) || 0;
                }
            } else {
                // No colon, try to parse as single number
                const numTime = parseInt(timeStr.replace(/[APM]/gi, "").trim(), 10) || 0;
                hours = numTime;
                minutes = 0;

                // Handle AM/PM if present
                if (timeStr.toUpperCase().includes("PM") && hours !== 12) {
                    hours += 12;
                }
                if (timeStr.toUpperCase().includes("AM") && hours === 12) {
                    hours = 0;
                }
            }

            // Validate and set hours and minutes
            if (hours < 0 || hours > 23) hours = 0;
            if (minutes < 0 || minutes > 59) minutes = 0;

            // Set the time on the date object
            scheduledDateTime.setHours(hours, minutes, 0, 0);
        } else {
            // If no time provided, set to end of day
            scheduledDateTime.setHours(23, 59, 59, 0);
        }

        return scheduledDateTime;
    } catch (error) {
        // Fallback: try to parse just the date
        try {
            const dateStr = appointment.appointmentDetails.scheduledDate;
            let datePart: string;

            if (typeof dateStr === "string") {
                datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.split(" ")[0];
            } else {
                datePart = dateStr.toISOString().split("T")[0];
            }

            const [year, month, day] = datePart.split("-").map(Number);
            if (isNaN(year) || isNaN(month) || isNaN(day)) {
                return null;
            }

            const appointmentDate = new Date(year, month - 1, day);
            // If time is available, try to use it
            if (appointment.appointmentDetails.scheduledTime) {
                const timeStr = appointment.appointmentDetails.scheduledTime.trim();
                if (timeStr.includes(":")) {
                    const [h, m] = timeStr
                        .split(":")
                        .map((part) => parseInt(part.replace(/[APM]/gi, "").trim(), 10) || 0);
                    let hours = h;
                    let minutes = m;

                    // Handle AM/PM
                    if (timeStr.toUpperCase().includes("PM") && hours !== 12) {
                        hours += 12;
                    }
                    if (timeStr.toUpperCase().includes("AM") && hours === 12) {
                        hours = 0;
                    }

                    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                        appointmentDate.setHours(hours, minutes, 0, 0);
                        return appointmentDate;
                    }
                }
            }

            // Default to end of day if time parsing fails
            appointmentDate.setHours(23, 59, 59, 0);
            return appointmentDate;
        } catch (e) {
            return null;
        }
    }
}

/**
 * Check if appointment is timed out (scheduled DATE has passed)
 * Date-based timeout: Appointments are valid for the entire scheduled day
 * and timeout at midnight (00:00) of the NEXT day
 * Example: Appointment on 1/2/2026 at 2:00 AM will timeout on 2/2/2026 at 00:00
 * @param appointment - Appointment object with appointmentDetails
 * @returns True if scheduled date has passed (next day or later)
 */
export function isAppointmentTimedOut(appointment: AppointmentForStatus): boolean {
    const scheduledDateTime = getAppointmentDateTime(appointment);
    if (!scheduledDateTime) return false;

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


    // Check if current date is after scheduled date (next day or later)
    // Example: If appointment is for 1/2/2026, it will timeout on 2/2/2026 at 00:00
    return currentDateOnly.getTime() > scheduledDateOnly.getTime();
}

/**
 * Get the effective status for an appointment (handles timeout logic)
 * @param appointment - Appointment object with status and appointmentDetails
 * @returns Effective status string
 */
export function getAppointmentStatus(appointment: AppointmentForStatus): string {
    const status = appointment.status || "pending";

    // Only show 'time_out' if:
    // 1. Status is 'pending' (not approved/rejected/completed)
    // 2. Both scheduledDate and scheduledTime are available
    // 3. Current date is after scheduled date (next day or later)
    // Example: If appointment is for 1/1/2026, it will timeout on 2/1/2026
    if (status === "pending") {
        // Check if both date and time are available
        if (!appointment.appointmentDetails?.scheduledDate || !appointment.appointmentDetails?.scheduledTime) {
            return status;
        }

        const scheduledDateTime = getAppointmentDateTime(appointment);
        if (scheduledDateTime) {
            const now = new Date();

            // Get date only (without time) for comparison
            const scheduledDateOnly = new Date(
                scheduledDateTime.getFullYear(),
                scheduledDateTime.getMonth(),
                scheduledDateTime.getDate()
            );
            const currentDateOnly = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

            // Check if current date is after scheduled date (next day or later)
            // If appointment is for 1/1/2026, it will timeout on 2/1/2026
            if (currentDateOnly.getTime() > scheduledDateOnly.getTime()) {
                return "time_out";
            }
        }
    }

    return status;
}

export function getAppointmentStatsKey(
    status: string,
): "pendingAppointments" | "approvedAppointments" | "rejectedAppointments" | "completedAppointments" {
    const statusLower = status.toLowerCase();
    const statusMap: Record<
        string,
        "pendingAppointments" | "approvedAppointments" | "rejectedAppointments" | "completedAppointments"
    > = {
        pending: "pendingAppointments",
        approved: "approvedAppointments",
        scheduled: "approvedAppointments",
        rejected: "rejectedAppointments",
        cancelled: "rejectedAppointments",
        completed: "completedAppointments",
        checked_in: "completedAppointments",
    };

    return statusMap[statusLower] ?? "pendingAppointments";
}

/**
 * Check if a user is an employee
 * Checks multiple conditions:
 * 1. user.role === 'employee' (legacy field)
 * 2. user.roles?.includes('employee') (preferred field)
 * 3. user.employeeId exists and is not empty
 * 
 * @param user - User object to check
 * @returns true if user is an employee, false otherwise
 */
export function isEmployee(user: User | null | undefined): boolean {
    if (!user) {
        return false;
    }

    // Check legacy role field
    if (user.role === 'employee') {
        return true;
    }

    // Check roles array (preferred method)
    if (user.roles?.includes('employee')) {
        return true;
    }

    // Check if employeeId exists and is not empty
    if (user.employeeId && user.employeeId.trim() !== '') {
        return true;
    }

    return false;
}
