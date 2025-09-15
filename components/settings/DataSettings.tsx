"use client"

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form"
import { SelectField } from "@/components/common/select-field"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SettingsCard } from "./SettingsCard"
import { Database } from "lucide-react"
import { SettingsData, backupFrequencies, dataRetentionPeriods } from "./settings.utils"

interface DataSettingsProps {
  register: UseFormRegister<SettingsData>
  errors: FieldErrors<SettingsData>
  watch: UseFormWatch<SettingsData>
  setValue: UseFormSetValue<SettingsData>
}

export function DataSettings({ register, errors, watch, setValue }: DataSettingsProps) {
  const watchedValues = watch()

  return (
    <SettingsCard icon={Database} title="Data Settings">
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
              value={watch("backupFrequency") || ""}
              onChange={(value) => setValue("backupFrequency", value)}
            />
          </div>

          <div className="space-y-2">
            <SelectField
              label="Data Retention Period"
              placeholder="Select retention period"
              options={dataRetentionPeriods}
              error={errors.dataRetention?.message}
              value={watch("dataRetention") || ""}
              onChange={(value) => setValue("dataRetention", value)}
            />
          </div>
        </div>
      )}
    </SettingsCard>
  )
}
