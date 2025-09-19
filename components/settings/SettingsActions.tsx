"use client"

import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/common/loadingSpinner"

interface SettingsActionsProps {
  isLoading: boolean
  onSave: () => void
  onReset: () => void
}

export function SettingsActions({ isLoading, onSave, onReset }: SettingsActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-4">
      <Button 
        type="button"
        onClick={onSave}
        disabled={isLoading}
        className="w-full sm:w-auto sm:min-w-[160px]"
        size="lg"
      >
        {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
        Save Settings
      </Button>
      <Button 
        type="button" 
        variant="outline"
        onClick={onReset}
        className="w-full sm:w-auto sm:min-w-[120px]"
        size="lg"
      >
        Reset to Default
      </Button>
    </div>
  )
}
