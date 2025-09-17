"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { showSuccess, showError } from "@/utils/toaster"
import { GeneralSettings } from "@/components/settings/GeneralSettings"
import { NotificationSettings } from "@/components/settings/NotificationSettings"
import { SecuritySettings } from "@/components/settings/SecuritySettings"
import { AppearanceSettings } from "@/components/settings/AppearanceSettings"
import { DataSettings } from "@/components/settings/DataSettings"
import { SettingsActions } from "@/components/settings/SettingsActions"
import { SettingsData, defaultSettings } from "@/components/settings/settings.utils"

export function SettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  
  const { register, handleSubmit, watch, setValue, control, formState: { errors }, reset } = useForm<SettingsData>({
    defaultValues: defaultSettings
  })

  const onSubmit = async (data: SettingsData) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      showSuccess("Settings saved successfully")
    } catch (error: any) {
      showError(error?.message || "Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    reset(defaultSettings)
    showSuccess("Settings reset to default values")
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <GeneralSettings 
          register={register} 
          errors={errors} 
          watch={watch} 
          setValue={setValue} 
          control={control}
        />
        
        <NotificationSettings 
          register={register} 
          errors={errors} 
          watch={watch} 
          setValue={setValue} 
          control={control}
        />
        
        <SecuritySettings 
          register={register} 
          errors={errors} 
          watch={watch} 
          setValue={setValue} 
          control={control}
        />
        
        <AppearanceSettings 
          register={register} 
          errors={errors} 
          watch={watch} 
          setValue={setValue} 
          control={control}
        />
        
        <DataSettings 
          register={register} 
          errors={errors} 
          watch={watch} 
          setValue={setValue} 
          control={control}
        />

        <SettingsActions 
          isLoading={isLoading}
          onSave={handleSubmit(onSubmit)}
          onReset={handleReset}
        />
      </form>
    </div>
  )
}
