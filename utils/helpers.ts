export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function formatDateTime(date: string | Date, time?: string): string {
  const formattedDate = formatDate(date)
  if (time) {
    const formattedTime = formatTime(time)
    return `${formattedDate} at ${formattedTime}`
  }
  return formattedDate
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
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
 * Format currency amount (in cents/paise) to display format
 * @param amountInCents - Amount in cents/paise (e.g., 200 = ₹2)
 * @param currency - Currency code (e.g., 'inr', 'usd')
 * @param options - Optional formatting options
 * @returns Formatted currency string (e.g., "₹2")
 */
export function formatCurrency(
  amountInCents: number,
  currency: string = 'inr',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  }
): string {
  const amountInRupees = amountInCents / 100;
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    showSymbol = true,
  } = options || {};

  return new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency.toUpperCase(),
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amountInRupees);
}

/**
 * Format phone number to display format
 * @param phone - Phone number string
 * @param countryCode - Country code (default: '+91')
 * @returns Formatted phone number
 */
export function formatPhone(phone: string, countryCode: string = '+91'): string {
  if (!phone) return '';
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
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
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
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
  if (!name) return 'U';
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return 'U';
  
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param value - Value to check
 * @returns True if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Get status badge color based on status
 * @param status - Status string
 * @returns Tailwind CSS color class
 */
export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  
  if (statusLower === 'active' || statusLower === 'approved' || statusLower === 'completed' || statusLower === 'succeeded') {
    return 'bg-green-100 text-green-800';
  }
  if (statusLower === 'pending' || statusLower === 'processing') {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (statusLower === 'rejected' || statusLower === 'cancelled' || statusLower === 'failed' || statusLower === 'expired') {
    return 'bg-red-100 text-red-800';
  }
  if (statusLower === 'inactive' || statusLower === 'deleted') {
    return 'bg-gray-100 text-gray-800';
  }
  
  return 'bg-blue-100 text-blue-800';
}

/**
 * Calculate percentage
 * @param value - Current value
 * @param total - Total value
 * @param decimals - Number of decimal places (default: 0)
 * @returns Percentage string
 */
export function calculatePercentage(value: number, total: number, decimals: number = 0): string {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format file size to human readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}
