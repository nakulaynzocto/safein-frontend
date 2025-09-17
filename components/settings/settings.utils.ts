export interface SettingsData {
  // General Settings
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  timezone: string
  
  // Notification Settings
  emailNotifications: boolean
  smsNotifications: boolean
  appointmentReminders: boolean
  reminderTime: string // minutes before appointment
  
  // Security Settings
  twoFactorAuth: boolean
  sessionTimeout: string // minutes
  passwordExpiry: string // days
  
  // Appearance Settings
  theme: 'light' | 'dark' | 'system'
  language: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  
  // Data Settings
  autoBackup: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  dataRetention: string // days
}

export const defaultSettings: SettingsData = {
  // General Settings
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
  timezone: 'UTC',
  
  // Notification Settings
  emailNotifications: true,
  smsNotifications: false,
  appointmentReminders: true,
  reminderTime: "30",
  
  // Security Settings
  twoFactorAuth: false,
  sessionTimeout: "60",
  passwordExpiry: "90",
  
  // Appearance Settings
  theme: 'system',
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  
  // Data Settings
  autoBackup: true,
  backupFrequency: 'weekly',
  dataRetention: "365",
}
