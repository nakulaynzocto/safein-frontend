"use client"

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import { SettingsCard } from "./SettingsCard"
import { InputField } from "@/components/common/input-field"
import { SelectField } from "@/components/common/select-field"
import { SettingsData } from "./settings.utils"

interface GeneralSettingsProps {
  register: UseFormRegister<SettingsData>
  errors: FieldErrors<SettingsData>
  watch: UseFormWatch<SettingsData>
  setValue: UseFormSetValue<SettingsData>
  control: Control<SettingsData>
}

export function GeneralSettings({ register, errors, control }: GeneralSettingsProps) {
  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  ]

  return (
    <SettingsCard
      title="General Settings"
      description="Basic company information and system preferences"
    >
      <div className="space-y-4">
        <InputField
          label="Company Name"
          placeholder="Enter company name"
          {...register("companyName", { required: "Company name is required" })}
          error={errors.companyName?.message}
        />
        
        <InputField
          label="Company Email"
          type="email"
          placeholder="Enter company email"
          {...register("companyEmail", { 
            required: "Company email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address"
            }
          })}
          error={errors.companyEmail?.message}
        />
        
        <InputField
          label="Company Phone"
          type="tel"
          placeholder="Enter company phone number"
          {...register("companyPhone")}
          error={errors.companyPhone?.message}
        />
        
        <InputField
          label="Company Address"
          placeholder="Enter company address"
          {...register("companyAddress")}
          error={errors.companyAddress?.message}
        />
        
        <Controller
          name="timezone"
          control={control}
          rules={{ required: "Timezone is required" }}
          render={({ field }) => (
            <SelectField
              label="Timezone"
              options={timezones}
              value={field.value}
              onChange={field.onChange}
              error={errors.timezone?.message}
            />
          )}
        />
      </div>
    </SettingsCard>
  )
}
