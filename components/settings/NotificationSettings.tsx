"use client"

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form"
import { SelectField } from "@/components/common/select-field"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SettingsCard } from "./SettingsCard"
import { Bell } from "lucide-react"
import { SettingsData, reminderTimes } from "./settings.utils"

interface NotificationSettingsProps {
  register: UseFormRegister<SettingsData>
  errors: FieldErrors<SettingsData>
  watch: UseFormWatch<SettingsData>
  setValue: UseFormSetValue<SettingsData>
}

export function NotificationSettings({ register, errors, watch, setValue }: NotificationSettingsProps) {
  const watchedValues = watch()

  return (
    <SettingsCard icon={Bell} title="Notification Settings">
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
            value={watch("reminderTime") || ""}
            onChange={(value) => setValue("reminderTime", value)}
          />
        </div>
      )}
    </SettingsCard>
  )
}
