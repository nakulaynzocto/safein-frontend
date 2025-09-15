"use client"

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form"
import { SelectField } from "@/components/common/select-field"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SettingsCard } from "./SettingsCard"
import { Shield } from "lucide-react"
import { SettingsData, sessionTimeouts, passwordPolicies } from "./settings.utils"

interface SecuritySettingsProps {
  register: UseFormRegister<SettingsData>
  errors: FieldErrors<SettingsData>
  watch: UseFormWatch<SettingsData>
  setValue: UseFormSetValue<SettingsData>
}

export function SecuritySettings({ register, errors, watch, setValue }: SecuritySettingsProps) {
  const watchedValues = watch()

  return (
    <SettingsCard icon={Shield} title="Security Settings">
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        <div className="space-y-2">
          <SelectField
            label="Session Timeout"
            placeholder="Select session timeout"
            options={sessionTimeouts}
            error={errors.sessionTimeout?.message}
            value={watch("sessionTimeout") || ""}
            onChange={(value) => setValue("sessionTimeout", value)}
          />
        </div>

        <div className="space-y-2">
          <SelectField
            label="Password Policy"
            placeholder="Select password policy"
            options={passwordPolicies}
            error={errors.passwordPolicy?.message}
            value={watch("passwordPolicy") || ""}
            onChange={(value) => setValue("passwordPolicy", value)}
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
    </SettingsCard>
  )
}
