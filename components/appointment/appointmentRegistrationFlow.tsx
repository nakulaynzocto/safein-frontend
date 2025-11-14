"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, ArrowLeft, ArrowRight } from "lucide-react"
import { VisitorDetailsStep } from "../visitor/visitorRegister"
import { AppointmentDetailsStep } from "./appointmentDetailsStep"
import { SecurityDetailsStep } from "./securityDetailsStep"
import { NotificationsStep } from "./notificationsStep"
import { 
  VisitorDetails, 
  AppointmentDetails, 
  SecurityDetails, 
  NotificationPreferences,
  CreateAppointmentRequest 
} from "@/store/api/appointmentApi"
import { useCreateAppointmentMutation } from "@/store/api/appointmentApi"
import { useCreateVisitorMutation } from "@/store/api/visitorApi"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { routes } from "@/utils/routes"
import { generateId } from "@/utils/helpers"

interface Step {
  id: number
  title: string
  description: string
  completed: boolean
  current: boolean
}

export function appointmentRegistrationFlow() {
  const router = useRouter()
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation()
  const [createVisitor] = useCreateVisitorMutation()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  
  const [visitorId, setVisitorId] = useState<string>("")
  const [visitorDetails, setVisitorDetails] = useState<VisitorDetails | null>(null)
  const [accompaniedBy, setAccompaniedBy] = useState<any>(null)
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null)
  const [securityDetails, setSecurityDetails] = useState<SecurityDetails | null>(null)
  const [notifications, setNotifications] = useState<NotificationPreferences | null>(null)
  const [employeeId, setEmployeeId] = useState<string>("")

  const steps: Step[] = useMemo(() => [
    {
      id: 1,
      title: "Visitor Details",
      description: "Enter visitor information",
      completed: completedSteps.includes(1),
      current: currentStep === 1
    },
    {
      id: 2,
      title: "Appointment Details",
      description: "Provide appointment information",
      completed: completedSteps.includes(2),
      current: currentStep === 2
    },
    {
      id: 3,
      title: "Security Details",
      description: "Security officer information",
      completed: completedSteps.includes(3),
      current: currentStep === 3
    },
    {
      id: 4,
      title: "Notifications",
      description: "Select notification preferences",
      completed: completedSteps.includes(4),
      current: currentStep === 4
    }
  ], [completedSteps, currentStep])

  const progressPercentage = (completedSteps.length / steps.length) * 100

  const handleStepComplete = async (stepId: number, data: any, accompaniedByData?: any) => {
    
    switch (stepId) {
      case 1:
        try {
          const createdVisitor = await createVisitor(data).unwrap()
          setVisitorId(createdVisitor._id)
          setVisitorDetails(data)
          setAccompaniedBy(accompaniedByData)
          showSuccessToast("Visitor created successfully!")
        } catch (error: any) {
          showErrorToast(error?.data?.message || "Failed to create visitor")
          return // Don't proceed if visitor creation fails
        }
        break
      case 2:
        setAppointmentDetails(data)
        break
      case 3:
        setSecurityDetails(data)
        break
      case 4:
        setNotifications(data)
        break
    }

    setCompletedSteps(prev => {
      if (!prev.includes(stepId)) {
        const newCompleted = [...prev, stepId].sort()
        return newCompleted
      }
      return prev
    })

    if (stepId < steps.length) {
      setCurrentStep(stepId + 1)
    }
  }

  const handleFinalSubmit = async () => {
    if (!visitorId || !appointmentDetails || !securityDetails || !notifications || !employeeId) {
      showErrorToast("Please complete all steps before submitting")
      return
    }

    try {
      const payload: CreateAppointmentRequest = {
        appointmentId: generateId(),
        employeeId,
        visitorId,
        accompaniedBy: accompaniedBy || null,
        checkInTime: new Date().toISOString(), // Auto-set check-in time on creation
        appointmentDetails,
        securityDetails,
        notifications
      }

      await createAppointment(payload).unwrap()
      showSuccessToast("Visitor registration completed successfully!")
      router.push(routes.privateroute.APPOINTMENTLIST)
    } catch (error: any) {
      showErrorToast(error?.data?.message || "Failed to register visitor")
    }
  }

  const canProceedToNext = () => {
    return completedSteps.includes(currentStep)
  }

  const canSubmit = () => {
    return completedSteps.length === steps.length && 
           visitorId && 
           appointmentDetails && 
           securityDetails && 
           notifications && 
           employeeId
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <VisitorDetailsStep
            onComplete={(data: VisitorDetails, accompaniedByData?: any) => handleStepComplete(1, data, accompaniedByData)}
            initialData={visitorDetails}
          />
        )
      case 2:
        return (
          <AppointmentDetailsStep
            onComplete={(data: AppointmentDetails) => handleStepComplete(2, data)}
            initialData={appointmentDetails}
            onEmployeeSelect={setEmployeeId}
            disabled={!completedSteps.includes(1)}
          />
        )
      case 3:
        return (
          <SecurityDetailsStep
            onComplete={(data: SecurityDetails) => handleStepComplete(3, data)}
            initialData={securityDetails}
            disabled={!completedSteps.includes(2)}
          />
        )
      case 4:
        return (
          <NotificationsStep
            onComplete={(data: NotificationPreferences) => handleStepComplete(4, data)}
            onFinalSubmit={handleFinalSubmit}
            initialData={notifications}
            disabled={!completedSteps.includes(3)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{completedSteps.length} of {steps.length} steps completed</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Steps Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  step.current
                    ? "border-primary bg-primary/10 shadow-md"
                    : step.completed
                    ? "border-green-500 bg-green-50 hover:bg-green-100"
                    : "border-muted bg-muted/20 hover:bg-muted/30"
                }`}
                onClick={() => {
                  if (step.completed || step.current) {
                    setCurrentStep(step.id)
                  }
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  {step.completed ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : step.current ? (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-white"></div>
                    </div>
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                  <Badge 
                    variant={step.current ? "default" : step.completed ? "secondary" : "outline"}
                    className={step.current ? "bg-primary text-primary-foreground" : ""}
                  >
                    Step {step.id}
                  </Badge>
                </div>
                <h3 className={`font-semibold ${step.current ? "text-primary" : ""}`}>
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {step.completed && (
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    ✓ Completed
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="default" className="text-lg px-3 py-1">
              Step {currentStep}
            </Badge>
            <span className="text-xl font-semibold">{steps[currentStep - 1]?.title}</span>
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {steps[currentStep - 1]?.description}
          </p>
        </CardHeader>
        <CardContent>
          {renderCurrentStep()}
        </CardContent>
      </Card>

    </div>
  )
}
