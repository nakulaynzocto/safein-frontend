"use client"

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import { SettingsCard } from "./settingsCard"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SelectField } from "@/components/common/selectField"
import { SettingsData } from "./settingsUtils"

interface NotificationSettingsProps {
  register: UseFormRegister<SettingsData>
  errors: FieldErrors<SettingsData>
  watch: UseFormWatch<SettingsData>
  setValue: UseFormSetValue<SettingsData>
  control: Control<SettingsData>
}

export function NotificationSettings({ register, errors, watch, setValue, control }: NotificationSettingsProps) {
  const emailNotifications = watch("emailNotifications")
  const smsNotifications = watch("smsNotifications")
  const appointmentReminders = watch("appointmentReminders")

  const reminderTimeOptions = [
    { value: "15", label: "15 minutes before" },
    { value: "30", label: "30 minutes before" },
    { value: "60", label: "1 hour before" },
    { value: "120", label: "2 hours before" },
    { value: "1440", label: "1 day before" },
  ]

  return (
    <SettingsCard
      title="Notification Settings"
      description="Configure how you receive notifications and reminders"
    >
      <div className="space-y-6">
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
              checked={emailNotifications}
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
              checked={smsNotifications}
              onCheckedChange={(checked) => setValue("smsNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="appointmentReminders">Appointment Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Send automatic reminders for upcoming appointments
              </p>
            </div>
            <Switch
              id="appointmentReminders"
              checked={appointmentReminders}
              onCheckedChange={(checked) => setValue("appointmentReminders", checked)}
            />
          </div>
        </div>

        {appointmentReminders && (
          <div className="space-y-2">
            <Controller
              name="reminderTime"
              control={control}
              rules={{ required: "Reminder time is required" }}
              render={({ field }) => (
                  <SelectField
                    label="Reminder Time"
                    options={reminderTimeOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.reminderTime?.message}
                    required
                  />
              )}
            />
          </div>
        )}
      </div>
    </SettingsCard>
  )
}
