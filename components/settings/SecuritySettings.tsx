"use client"

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import { SettingsCard } from "./SettingsCard"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SelectField } from "@/components/common/select-field"
import { SettingsData } from "./settings.utils"

interface SecuritySettingsProps {
  register: UseFormRegister<SettingsData>
  errors: FieldErrors<SettingsData>
  watch: UseFormWatch<SettingsData>
  setValue: UseFormSetValue<SettingsData>
  control: Control<SettingsData>
}

export function SecuritySettings({ register, errors, watch, setValue, control }: SecuritySettingsProps) {
  const twoFactorAuth = watch("twoFactorAuth")

  const sessionTimeoutOptions = [
    { value: "15", label: "15 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "60", label: "1 hour" },
    { value: "120", label: "2 hours" },
    { value: "480", label: "8 hours" },
  ]

  const passwordExpiryOptions = [
    { value: "30", label: "30 days" },
    { value: "60", label: "60 days" },
    { value: "90", label: "90 days" },
    { value: "180", label: "6 months" },
    { value: "365", label: "1 year" },
  ]

  return (
    <SettingsCard
      title="Security Settings"
      description="Configure security preferences and authentication settings"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="twoFactorAuth"
              checked={twoFactorAuth}
              onCheckedChange={(checked) => setValue("twoFactorAuth", checked)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Controller
            name="sessionTimeout"
            control={control}
            rules={{ required: "Session timeout is required" }}
            render={({ field }) => (
              <SelectField
                label="Session Timeout"
                options={sessionTimeoutOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.sessionTimeout?.message}
              />
            )}
          />
          
          <Controller
            name="passwordExpiry"
            control={control}
            rules={{ required: "Password expiry is required" }}
            render={({ field }) => (
              <SelectField
                label="Password Expiry"
                options={passwordExpiryOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.passwordExpiry?.message}
              />
            )}
          />
        </div>
      </div>
    </SettingsCard>
  )
}
