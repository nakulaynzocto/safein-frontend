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
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Manage your notification preferences
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Control how you receive appointment notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="email-enabled" className="text-base font-medium flex items-center gap-2 cursor-pointer">
                  <Mail className="h-4 w-4 text-primary" />
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive appointment notifications via email
                </p>
              </div>
              <Switch
                id="email-enabled"
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="whatsapp-enabled" className="text-base font-medium flex items-center gap-2 cursor-pointer">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  WhatsApp Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via WhatsApp Cloud API
                </p>
              </div>
              <Switch
                id="whatsapp-enabled"
                checked={whatsappEnabled}
                onCheckedChange={setWhatsappEnabled}
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="sms-enabled" className="text-base font-medium flex items-center gap-2 cursor-pointer">
                  <Phone className="h-4 w-4 text-blue-600" />
                  SMS Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive appointment notifications via SMS
                </p>
              </div>
              <Switch
                id="sms-enabled"
                checked={smsEnabled}
                onCheckedChange={setSmsEnabled}
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
    </div>
  )
}



