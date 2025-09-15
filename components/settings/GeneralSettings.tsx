"use client"

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form"
import { InputField } from "@/components/common/input-field"
import { SelectField } from "@/components/common/select-field"
import { SettingsCard } from "./SettingsCard"
import { Settings, Mail, Phone, Clock } from "lucide-react"
import { SettingsData, timezones } from "./settings.utils"

interface GeneralSettingsProps {
  register: UseFormRegister<SettingsData>
  errors: FieldErrors<SettingsData>
  watch: UseFormWatch<SettingsData>
  setValue: UseFormSetValue<SettingsData>
}

export function GeneralSettings({ register, errors, watch, setValue }: GeneralSettingsProps) {
  return (
    <SettingsCard icon={Settings} title="General Settings">
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
            value={watch("timezone") || ""}
            onChange={(value) => setValue("timezone", value)}
          />
        </div>
      </div>
    </SettingsCard>
  )
}
