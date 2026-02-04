/**
 * Reusable error handling utilities
 */

export interface ErrorDisplayProps {
    title: string;
    message: string;
    onRetry?: () => void;
    retryLabel?: string;
    showReload?: boolean;
}

/**
 * Extract error message from various error formats
 */
export function getErrorMessage(error: any): string {
    if (!error) return "An unknown error occurred";

    if (typeof error === "string") return error;

    if (error?.data?.message) return error.data.message;
    if (error?.message) return error.message;
    if (error?.error) return error.error;

    return "An unknown error occurred";
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
    return error?.status === "FETCH_ERROR" ||
        error?.message?.includes("network") ||
        error?.message?.includes("Network");
}

