"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/store/api/settingsApi"
import { toast } from "sonner"
import { Loader2, Mail, MessageSquare, Phone, Save } from "lucide-react"

export function SettingsPageContent() {
  const { data: settings, isLoading, error } = useGetSettingsQuery()
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation()

  const [emailEnabled, setEmailEnabled] = useState(true)
  const [whatsappEnabled, setWhatsappEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)

  useEffect(() => {
    if (settings) {
      setEmailEnabled(settings.notifications?.emailEnabled ?? true)
      setWhatsappEnabled(settings.notifications?.whatsappEnabled ?? true)
      setSmsEnabled(settings.notifications?.smsEnabled ?? false)
    }
  }, [settings])

  const handleSave = async () => {
    try {
      await updateSettings({
        notifications: {
          emailEnabled,
          whatsappEnabled,
          smsEnabled,
        },
      }).unwrap()

      toast.success("Settings updated successfully!")
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update settings")
    }
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">Failed to load settings</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="w-full">
        <CardHeader className="pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription className="text-sm">
            Control how you receive appointment notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="space-y-0.5 flex-1 w-full sm:w-auto">
              <Label htmlFor="email-enabled" className="text-sm sm:text-base font-medium flex items-center gap-2 cursor-pointer">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                Email Notifications
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Receive appointment notifications via email
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
              className="self-start sm:self-auto"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="space-y-0.5 flex-1 w-full sm:w-auto">
              <Label htmlFor="whatsapp-enabled" className="text-sm sm:text-base font-medium flex items-center gap-2 cursor-pointer">
                <MessageSquare className="h-4 w-4 text-green-600 flex-shrink-0" />
                WhatsApp Notifications
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Receive notifications via WhatsApp Cloud API
              </p>
            </div>
            <Switch
              id="whatsapp-enabled"
              checked={whatsappEnabled}
              onCheckedChange={setWhatsappEnabled}
              className="self-start sm:self-auto"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="space-y-0.5 flex-1 w-full sm:w-auto">
              <Label htmlFor="sms-enabled" className="text-sm sm:text-base font-medium flex items-center gap-2 cursor-pointer">
                <Phone className="h-4 w-4 text-blue-600 flex-shrink-0" />
                SMS Notifications
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Receive appointment notifications via SMS
              </p>
            </div>
            <Switch
              id="sms-enabled"
              checked={smsEnabled}
              onCheckedChange={setSmsEnabled}
              className="self-start sm:self-auto"
            />
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



