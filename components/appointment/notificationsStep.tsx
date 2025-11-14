"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { NotificationPreferences } from "@/store/api/appointmentApi"
import { Bell, Mail, MessageSquare, Clock } from "lucide-react"

const notificationsSchema = yup.object({
  smsSent: yup.boolean().required(),
  emailSent: yup.boolean().required(),
  whatsappSent: yup.boolean().required(),
  reminderSent: yup.boolean().required(),
})

type NotificationsFormData = yup.InferType<typeof notificationsSchema>

interface NotificationsStepProps {
  onComplete: (data: NotificationPreferences) => void
  onFinalSubmit?: () => void
  initialData?: NotificationPreferences | null
  disabled?: boolean
}

export function NotificationsStep({ 
  onComplete, 
  onFinalSubmit,
  initialData, 
  disabled = false 
}: NotificationsStepProps) {
  const [smsSent, setSmsSent] = useState(initialData?.smsSent || false)
  const [emailSent, setEmailSent] = useState(initialData?.emailSent || false)
  const [whatsappSent, setWhatsappSent] = useState(initialData?.whatsappSent || false)
  const [reminderSent, setReminderSent] = useState(initialData?.reminderSent || false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<NotificationsFormData>({
    resolver: yupResolver(notificationsSchema),
    defaultValues: {
      smsSent: initialData?.smsSent || false,
      emailSent: initialData?.emailSent || false,
      whatsappSent: initialData?.whatsappSent || false,
      reminderSent: initialData?.reminderSent || false,
    }
  })

  const onSubmit = (data: NotificationsFormData) => {
    const notifications: NotificationPreferences = {
      smsSent: data.smsSent,
      emailSent: data.emailSent,
      whatsappSent: data.whatsappSent,
      reminderSent: data.reminderSent,
    }
    onComplete(notifications)
    
    if (onFinalSubmit) {
      onFinalSubmit()
    }
  }

  const handleSmsChange = (checked: boolean) => {
    setSmsSent(checked)
    setValue("smsSent", checked)
  }

  const handleEmailChange = (checked: boolean) => {
    setEmailSent(checked)
    setValue("emailSent", checked)
  }

  const handleWhatsappChange = (checked: boolean) => {
    setWhatsappSent(checked)
    setValue("whatsappSent", checked)
  }

  const handleReminderChange = (checked: boolean) => {
    setReminderSent(checked)
    setValue("reminderSent", checked)
  }

  if (disabled) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Please complete Step 3 (Security Details) first</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* SMS Notification */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <Label htmlFor="sms-sent" className="text-base font-medium">
                  SMS Notification
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send SMS confirmation to visitor
                </p>
              </div>
            </div>
            <Switch
              id="sms-sent"
              checked={smsSent}
              onCheckedChange={handleSmsChange}
            />
          </div>

          {/* Email Notification */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-green-500" />
              <div>
                <Label htmlFor="email-sent" className="text-base font-medium">
                  Email Notification
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send email confirmation to visitor
                </p>
              </div>
            </div>
            <Switch
              id="email-sent"
              checked={emailSent}
              onCheckedChange={handleEmailChange}
            />
          </div>

          {/* WhatsApp Notification */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <Label htmlFor="whatsapp-sent" className="text-base font-medium">
                  WhatsApp Notification
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send WhatsApp message to visitor
                </p>
              </div>
            </div>
            <Switch
              id="whatsapp-sent"
              checked={whatsappSent}
              onCheckedChange={handleWhatsappChange}
            />
          </div>

          {/* Reminder Notification */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <Label htmlFor="reminder-sent" className="text-base font-medium">
                  Reminder Notification
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send appointment reminder before scheduled time
                </p>
              </div>
            </div>
            <Switch
              id="reminder-sent"
              checked={reminderSent}
              onCheckedChange={handleReminderChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${smsSent ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">
                SMS: {smsSent ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${emailSent ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">
                Email: {emailSent ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${whatsappSent ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">
                WhatsApp: {whatsappSent ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${reminderSent ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">
                Reminder: {reminderSent ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Submission Info */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to Submit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>All steps completed!</strong> Click the "Complete Registration & Submit" button below 
              to finalize the visitor registration with all the information provided.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" className="bg-green-600 hover:bg-green-700">
          Complete Registration & Submit
        </Button>
      </div>
    </form>
  )
}
