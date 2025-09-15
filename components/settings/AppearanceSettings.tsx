"use client"

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form"
import { SelectField } from "@/components/common/select-field"
import { SettingsCard } from "./SettingsCard"
import { Palette } from "lucide-react"
import { SettingsData, themes, languages } from "./settings.utils"

interface AppearanceSettingsProps {
  register: UseFormRegister<SettingsData>
  errors: FieldErrors<SettingsData>
  watch: UseFormWatch<SettingsData>
  setValue: UseFormSetValue<SettingsData>
}

export function AppearanceSettings({ register, errors, watch, setValue }: AppearanceSettingsProps) {
  return (
    <SettingsCard icon={Palette} title="Appearance Settings">
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        <div className="space-y-2">
          <SelectField
            label="Theme"
            placeholder="Select theme"
            options={themes}
            error={errors.theme?.message}
            value={watch("theme") || ""}
            onChange={(value) => setValue("theme", value)}
          />
        </div>

        <div className="space-y-2">
          <SelectField
            label="Language"
            placeholder="Select language"
            options={languages}
            error={errors.language?.message}
            value={watch("language") || ""}
            onChange={(value) => setValue("language", value)}
          />
        </div>
      </div>
    </SettingsCard>
  )
}
