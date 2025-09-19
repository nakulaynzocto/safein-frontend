"use client"

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import { SettingsCard } from "./settingsCard"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SelectField } from "@/components/common/selectField"
import { SettingsData } from "./settingsUtils"

interface DataSettingsProps {
  register: UseFormRegister<SettingsData>
  errors: FieldErrors<SettingsData>
  watch: UseFormWatch<SettingsData>
  setValue: UseFormSetValue<SettingsData>
  control: Control<SettingsData>
}

export function DataSettings({ register, errors, watch, setValue, control }: DataSettingsProps) {
  const autoBackup = watch("autoBackup")

  const backupFrequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ]

  const dataRetentionOptions = [
    { value: "30", label: '30 days' },
    { value: "90", label: '90 days' },
    { value: "180", label: '6 months' },
    { value: "365", label: '1 year' },
    { value: "730", label: '2 years' },
    { value: "1095", label: '3 years' },
  ]

  return (
    <SettingsCard
      title="Data Settings"
      description="Configure data backup and retention policies"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoBackup">Automatic Backup</Label>
              <p className="text-sm text-muted-foreground">
                Automatically backup your data on a schedule
              </p>
            </div>
            <Switch
              id="autoBackup"
              checked={autoBackup}
              onCheckedChange={(checked) => setValue("autoBackup", checked)}
            />
          </div>
        </div>

        {autoBackup && (
          <div className="space-y-4">
            <Controller
              name="backupFrequency"
              control={control}
              rules={{ required: "Backup frequency is required" }}
              render={({ field }) => (
                <SelectField
                  label="Backup Frequency"
                  options={backupFrequencyOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.backupFrequency?.message}
                />
              )}
            />
          </div>
        )}

        <div className="space-y-4">
          <Controller
            name="dataRetention"
            control={control}
            rules={{ required: "Data retention period is required" }}
            render={({ field }) => (
              <SelectField
                label="Data Retention Period"
                options={dataRetentionOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.dataRetention?.message}
              />
            )}
          />
        </div>
      </div>
    </SettingsCard>
  )
}
