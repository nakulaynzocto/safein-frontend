// ---------- Settings Utils ----------

export interface SettingsData {
  // General Settings
  companyName: string
  companyEmail: string
  companyPhone: string
  timezone: string
  
  // Notification Settings
  emailNotifications: boolean
  smsNotifications: boolean
  appointmentReminders: boolean
  reminderTime: string
  
  // Security Settings
  sessionTimeout: string
  passwordPolicy: string
  twoFactorAuth: boolean
  
  // Appearance Settings
  theme: string
  language: string
  
  // Data Settings
  autoBackup: boolean
  backupFrequency: string
  dataRetention: string
}

export const timezones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
]

export const reminderTimes = [
  { value: "15", label: "15 minutes before" },
  { value: "30", label: "30 minutes before" },
  { value: "60", label: "1 hour before" },
  { value: "120", label: "2 hours before" },
  { value: "1440", label: "1 day before" },
]

export const sessionTimeouts = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "120", label: "2 hours" },
  { value: "480", label: "8 hours" },
]

export const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

export const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
]

export const backupFrequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

export const dataRetentionPeriods = [
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "6 months" },
  { value: "365", label: "1 year" },
  { value: "never", label: "Never" },
]

export const passwordPolicies = [
  { value: "weak", label: "Weak" },
  { value: "medium", label: "Medium" },
  { value: "strong", label: "Strong" },
]

export const defaultSettings: SettingsData = {
  companyName: "Visitor Management System",
  companyEmail: "admin@company.com",
  companyPhone: "+1 (555) 123-4567",
  timezone: "America/New_York",
  emailNotifications: true,
  smsNotifications: false,
  appointmentReminders: true,
  reminderTime: "30",
  sessionTimeout: "60",
  passwordPolicy: "strong",
  twoFactorAuth: false,
  theme: "system",
  language: "en",
  autoBackup: true,
  backupFrequency: "weekly",
  dataRetention: "90",
}
