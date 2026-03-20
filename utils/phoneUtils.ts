import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Validates a phone number. 
 * If it doesn't start with '+', it tries to validate as a 10-digit Indian number (+91).
 * @param phone The phone number string to validate
 * @returns boolean
 */
export const validatePhone = (phone: string | undefined | null): boolean => {
    if (!phone) return false;
    const cleanPhone = phone.trim().replace(/\s/g, "");
    
    // If it starts with '+', validate as is
    if (cleanPhone.startsWith("+")) {
        return isValidPhoneNumber(cleanPhone);
    }
    
    // If length is 10, try with +91
    if (cleanPhone.length === 10) {
        return isValidPhoneNumber(`+91${cleanPhone}`);
    }
    
    // Fallback: try with '+' prefix
    return isValidPhoneNumber(`+${cleanPhone}`);
};

/**
 * Formats a phone number for backend submission.
 * Ensures it starts with '+' and defaults 10-digit numbers to +91.
 * @param phone The raw phone number string
 * @returns Formatted international phone number or original if invalid
 */
export const formatPhoneForSubmission = (phone: string | undefined | null): string => {
    if (!phone) return "";
    let cleanPhone = phone.trim().replace(/\s/g, "");
    
    if (cleanPhone.startsWith("+")) {
        return cleanPhone;
    }
    
    if (cleanPhone.length === 10) {
        return `+91${cleanPhone}`;
    }
    
    return `+${cleanPhone}`;
};

/**
 * Formats a phone number for display/pre-fill.
 * @param phone The phone number string
 * @returns Formatted phone number
 */
export const formatPhoneForDisplay = (phone: string | undefined | null): string => {
    if (!phone) return "";
    const formatted = formatPhoneForSubmission(phone);
    return formatted;
};

/**
 * Parses a phone number to extract country code and national number.
 */
export const parsePhone = (phone: string) => {
    const formatted = formatPhoneForSubmission(phone);
    const parsed = parsePhoneNumberFromString(formatted);
    if (parsed) {
        return {
            countryCode: `+${parsed.countryCallingCode}`,
            nationalNumber: parsed.nationalNumber as string,
            fullNumber: formatted
        };
    }
    return null;
};
