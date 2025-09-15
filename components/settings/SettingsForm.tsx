"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { showSuccess, showError } from "@/utils/toaster"
import { GeneralSettings } from "./GeneralSettings"
import { NotificationSettings } from "./NotificationSettings"
import { SecuritySettings } from "./SecuritySettings"
import { AppearanceSettings } from "./AppearanceSettings"
import { DataSettings } from "./DataSettings"
import { SettingsActions } from "./SettingsActions"
import { SettingsData, defaultSettings } from "./settings.utils"

export function SettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  
  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<SettingsData>({
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
        />
        
        <NotificationSettings 
          register={register} 
          errors={errors} 
          watch={watch} 
          setValue={setValue} 
        />
        
        <SecuritySettings 
          register={register} 
          errors={errors} 
          watch={watch} 
          setValue={setValue} 
        />
        
        <AppearanceSettings 
          register={register} 
          errors={errors} 
          watch={watch} 
          setValue={setValue} 
        />
        
        <DataSettings 
          register={register} 
          errors={errors} 
          watch={watch} 
          setValue={setValue} 
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
