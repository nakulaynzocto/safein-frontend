"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InputField } from "@/components/common/inputField"
import { TextareaField } from "@/components/common/textareaField"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SecurityDetails } from "@/store/api/appointmentApi"
import { Shield, Badge, CheckCircle, FileText } from "lucide-react"

const securityDetailsSchema = yup.object({
  badgeIssued: yup.boolean().required(),
  badgeNumber: yup.string().when('badgeIssued', {
    is: true,
    then: (schema) => schema.required('Badge number is required when badge is issued'),
    otherwise: (schema) => schema.optional(),
  }),
  securityClearance: yup.boolean().required(),
  securityNotes: yup.string().required('Security notes are required'),
})

type SecurityDetailsFormData = {
  badgeIssued: boolean
  badgeNumber?: string
  securityClearance: boolean
  securityNotes: string
}

interface SecurityDetailsStepProps {
  onComplete: (data: SecurityDetails) => void
  initialData?: SecurityDetails | null
  disabled?: boolean
}

export function SecurityDetailsStep({ 
  onComplete, 
  initialData, 
  disabled = false 
}: SecurityDetailsStepProps) {
  const [badgeIssued, setBadgeIssued] = useState(initialData?.badgeIssued || false)
  const [securityClearance, setSecurityClearance] = useState(initialData?.securityClearance || false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SecurityDetailsFormData>({
    defaultValues: {
      badgeIssued: initialData?.badgeIssued || false,
      badgeNumber: initialData?.badgeNumber || "",
      securityClearance: initialData?.securityClearance || false,
      securityNotes: initialData?.securityNotes || "",
    }
  })

  const onSubmit = (data: SecurityDetailsFormData) => {
    const securityDetails: SecurityDetails = {
      badgeIssued: data.badgeIssued,
      badgeNumber: data.badgeNumber || "",
      securityClearance: data.securityClearance,
      securityNotes: data.securityNotes,
    }
    onComplete(securityDetails)
  }

  const handleBadgeIssuedChange = (checked: boolean) => {
    setBadgeIssued(checked)
    setValue("badgeIssued", checked)
    if (!checked) {
      setValue("badgeNumber", "")
    }
  }

  const handleSecurityClearanceChange = (checked: boolean) => {
    setSecurityClearance(checked)
    setValue("securityClearance", checked)
  }

  if (disabled) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Please complete Step 2 (Appointment Details) first</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Badge Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge className="h-5 w-5" />
            Badge Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="badge-issued"
              checked={badgeIssued}
              onCheckedChange={handleBadgeIssuedChange}
            />
            <Label htmlFor="badge-issued">Badge has been issued to visitor</Label>
          </div>

          {badgeIssued && (
            <InputField
              label="Badge Number"
              placeholder="Enter badge number"
              error={errors.badgeNumber?.message}
              {...register("badgeNumber")}
              required
            />
          )}
        </CardContent>
      </Card>

      {/* Security Clearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Security Clearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="security-clearance"
              checked={securityClearance}
              onCheckedChange={handleSecurityClearanceChange}
            />
            <Label htmlFor="security-clearance">Security clearance granted</Label>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Security Clearance Checklist:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Visitor ID verified</li>
              <li>• Background check completed</li>
              <li>• Purpose of visit validated</li>
              <li>• No security concerns identified</li>
              <li>• Access permissions granted</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Security Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Security Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <TextareaField
              label="Security Notes"
              placeholder="Enter security notes, observations, or special instructions..."
              className="min-h-[100px]"
              {...register("securityNotes")}
              error={errors.securityNotes?.message}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Officer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Officer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This section should be completed by the security officer 
              responsible for visitor verification and badge issuance. All security protocols 
              must be followed according to company policy.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Complete Step 3 - Proceed to Notifications
        </Button>
      </div>
    </form>
  )
}
