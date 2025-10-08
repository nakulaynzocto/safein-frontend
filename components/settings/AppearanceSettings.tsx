"use client"

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import { SettingsCard } from "./settingsCard"
import { SelectField } from "@/components/common/selectField"
import { SettingsData } from "./settingsUtils"

interface AppearanceSettingsProps {
  register: UseFormRegister<SettingsData>
  errors: FieldErrors<SettingsData>
  watch: UseFormWatch<SettingsData>
  setValue: UseFormSetValue<SettingsData>
  control: Control<SettingsData>
}

export function AppearanceSettings({ register, errors, control }: AppearanceSettingsProps) {
  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ]

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
  ]

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
  ]

  const timeFormatOptions = [
    { value: '12h', label: '12-hour (AM/PM)' },
    { value: '24h', label: '24-hour' },
  ]

  return (
    <SettingsCard
      title="Appearance Settings"
      description="Customize the look and feel of your application"
    >
      <div className="space-y-4">
        <Controller
          name="theme"
          control={control}
          rules={{ required: "Theme is required" }}
          render={({ field }) => (
              <SelectField
                label="Theme"
                options={themeOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.theme?.message}
                required
              />
          )}
        />
        
        <Controller
          name="language"
          control={control}
          rules={{ required: "Language is required" }}
          render={({ field }) => (
              <SelectField
                label="Language"
                options={languageOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.language?.message}
                required
              />
          )}
        />
        
        <Controller
          name="dateFormat"
          control={control}
          rules={{ required: "Date format is required" }}
          render={({ field }) => (
              <SelectField
                label="Date Format"
                options={dateFormatOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.dateFormat?.message}
                required
              />
          )}
        />
        
        <Controller
          name="timeFormat"
          control={control}
          rules={{ required: "Time format is required" }}
          render={({ field }) => (
              <SelectField
                label="Time Format"
                options={timeFormatOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.timeFormat?.message}
                required
              />
          )}
        />
      </div>
    </SettingsCard>
  )
}
