"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InputField } from "@/components/common/input-field"
import { SelectField } from "@/components/common/select-field"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/common/loading-spinner"
import { showSuccess, showError } from "@/utils/toaster"
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Mail,
  Clock,
  Users
} from "lucide-react"

interface SettingsData {
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

const timezones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
]

const reminderTimes = [
  { value: "15", label: "15 minutes before" },
  { value: "30", label: "30 minutes before" },
  { value: "60", label: "1 hour before" },
  { value: "120", label: "2 hours before" },
  { value: "1440", label: "1 day before" },
]

const sessionTimeouts = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "120", label: "2 hours" },
  { value: "480", label: "8 hours" },
]

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
]

const backupFrequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

const dataRetentionPeriods = [
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "6 months" },
  { value: "365", label: "1 year" },
  { value: "never", label: "Never" },
]

export function SettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SettingsData>({
    defaultValues: {
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
  })

  const watchedValues = watch()

  const onSubmit = async (data: SettingsData) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      showSuccess("Settings saved successfully")
    } catch (error: any) {
      showError(error?.message || "Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-xl">General Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              <div className="space-y-2">
                <InputField
                  label="Company Name"
                  placeholder="Enter company name"
                  error={errors.companyName?.message}
                  {...register("companyName")}
                />
              </div>

              <div className="space-y-2">
                <InputField
                  label="Company Email"
                  type="email"
                  placeholder="Enter company email"
                  error={errors.companyEmail?.message}
                  {...register("companyEmail")}
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              <div className="space-y-2">
                <InputField
                  label="Company Phone"
                  placeholder="Enter company phone"
                  error={errors.companyPhone?.message}
                  {...register("companyPhone")}
                />
              </div>

              <div className="space-y-2">
                <SelectField
                  label="Timezone"
                  placeholder="Select timezone"
                  options={timezones}
                  error={errors.timezone?.message}
                  {...register("timezone")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-xl">Notification Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={watchedValues.emailNotifications}
                  onCheckedChange={(checked) => setValue("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via SMS
                  </p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={watchedValues.smsNotifications}
                  onCheckedChange={(checked) => setValue("smsNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="appointmentReminders">Appointment Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Send automatic appointment reminders
                  </p>
                </div>
                <Switch
                  id="appointmentReminders"
                  checked={watchedValues.appointmentReminders}
                  onCheckedChange={(checked) => setValue("appointmentReminders", checked)}
                />
              </div>
            </div>

            {watchedValues.appointmentReminders && (
              <div className="space-y-2">
                <SelectField
                  label="Reminder Time"
                  placeholder="Select reminder time"
                  options={reminderTimes}
                  error={errors.reminderTime?.message}
                  {...register("reminderTime")}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-xl">Security Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              <div className="space-y-2">
                <SelectField
                  label="Session Timeout"
                  placeholder="Select session timeout"
                  options={sessionTimeouts}
                  error={errors.sessionTimeout?.message}
                  {...register("sessionTimeout")}
                />
              </div>

              <div className="space-y-2">
                <SelectField
                  label="Password Policy"
                  placeholder="Select password policy"
                  options={[
                    { value: "weak", label: "Weak" },
                    { value: "medium", label: "Medium" },
                    { value: "strong", label: "Strong" },
                  ]}
                  error={errors.passwordPolicy?.message}
                  {...register("passwordPolicy")}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Enable two-factor authentication for enhanced security
                </p>
              </div>
              <Switch
                id="twoFactorAuth"
                checked={watchedValues.twoFactorAuth}
                onCheckedChange={(checked) => setValue("twoFactorAuth", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Palette className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-xl">Appearance Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              <div className="space-y-2">
                <SelectField
                  label="Theme"
                  placeholder="Select theme"
                  options={themes}
                  error={errors.theme?.message}
                  {...register("theme")}
                />
              </div>

              <div className="space-y-2">
                <SelectField
                  label="Language"
                  placeholder="Select language"
                  options={languages}
                  error={errors.language?.message}
                  {...register("language")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Database className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-xl">Data Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoBackup">Automatic Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup data at regular intervals
                </p>
              </div>
              <Switch
                id="autoBackup"
                checked={watchedValues.autoBackup}
                onCheckedChange={(checked) => setValue("autoBackup", checked)}
              />
            </div>

            {watchedValues.autoBackup && (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                <div className="space-y-2">
                  <SelectField
                    label="Backup Frequency"
                    placeholder="Select backup frequency"
                    options={backupFrequencies}
                    error={errors.backupFrequency?.message}
                    {...register("backupFrequency")}
                  />
                </div>

                <div className="space-y-2">
                  <SelectField
                    label="Data Retention Period"
                    placeholder="Select retention period"
                    options={dataRetentionPeriods}
                    error={errors.dataRetention?.message}
                    {...register("dataRetention")}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full sm:w-auto sm:min-w-[160px]"
            size="lg"
          >
            {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Save Settings
          </Button>
          <Button 
            type="button" 
            variant="outline"
            className="w-full sm:w-auto sm:min-w-[120px]"
            size="lg"
          >
            Reset to Default
          </Button>
        </div>
      </form>
    </div>
  )
}
