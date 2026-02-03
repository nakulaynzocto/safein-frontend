/**
 * Reusable date utility functions
 * Centralized date formatting and manipulation functions
 */

import { format } from "date-fns";

/**
 * Format date to YYYY-MM-DD format (for API queries)
 */
export function formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Get default date range (today to today)
 */
export function getDefaultDateRange(): { startDate: string; endDate: string } {
    const today = new Date();
    return {
        startDate: formatDateForAPI(today),
        endDate: formatDateForAPI(today),
    };
}

/**
 * Get chart date range (last 365 days)
 */
export function getChartDateRange(): { startDate: string; endDate: string } {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 365);
    return {
        startDate: formatDateForAPI(start),
        endDate: formatDateForAPI(end),
    };
}

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(): number {
    return -new Date().getTimezoneOffset();
}

/**
 * Format date with date-fns format string
 * @param value - Date string, Date object, or null/undefined
 * @param formatStr - date-fns format string (e.g., "MMM dd, yyyy")
 * @param fallback - Fallback string if date is invalid (default: "N/A")
 * @returns Formatted date string
 */
export function formatDateWithPattern(
    value: string | Date | null | undefined,
    formatStr: string,
    fallback: string = "N/A"
): string {
    if (!value) return fallback;
    try {
        const date = typeof value === "string" ? new Date(value) : value;
        if (isNaN(date.getTime())) return fallback;
        return format(date, formatStr);
    } catch {
        return fallback;
    }
}

/**
 * Format date to long format (e.g., "Monday, January 1, 2024")
 */
export function formatDateLong(date: string | Date): string {
    if (!date) return "N/A";
    try {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return "N/A";
        return dateObj.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return "N/A";
    }
}

