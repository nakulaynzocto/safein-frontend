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
