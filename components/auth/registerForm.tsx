import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputField } from "@/components/common/inputField"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/inputOtp"
import { useAppDispatch } from "@/store/hooks"
import { useRegisterMutation, useVerifyOtpMutation, useResendOtpMutation } from "@/store/api/authApi"
import { setCredentials } from "@/store/slices/authSlice"
import { routes } from "@/utils/routes"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { CheckCircle, Mail, ArrowLeft } from "lucide-react"

const registerSchema = yup.object({
  companyName: yup.string().required("Company name is required"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
})

const otpSchema = yup.object({
  otp: yup.string().required("OTP is required").length(6, "OTP must be 6 digits"),
})

type RegisterFormData = yup.InferType<typeof registerSchema>
type OtpFormData = yup.InferType<typeof otpSchema>

type RegistrationStep = 'form' | 'otp' | 'success'

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const [register, { isLoading }] = useRegisterMutation()
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation()
  const [resendOtp, { isLoading: isResendingOtp }] = useResendOtpMutation()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('form')
  const [userEmail, setUserEmail] = useState<string>('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
  }, [currentStep])

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  })

  const [otpValue, setOtpValue] = useState<string>('')

  const {
    register: registerOtpField,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    setValue: setOtpValueForm,
  } = useForm<OtpFormData>({
    resolver: yupResolver(otpSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setSubmitError(null)
      const result = await register(data).unwrap()

      setUserEmail(data.email)
      setCurrentStep('otp')
    } catch (error: any) {
      let errorMessage = "Registration failed"

      if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      setSubmitError(errorMessage)
    }
  }

  const onOtpSubmit = async (data: OtpFormData) => {
    try {
      setOtpError(null)

      // Use otpValue state if form data is empty (for OTP component)
      const otpToVerify = data.otp || otpValue

      if (!otpToVerify || otpToVerify.length !== 6) {
        setOtpError("Please enter a valid 6-digit OTP")
        return
      }

      const result = await verifyOtp({
        email: userEmail,
        otp: otpToVerify
      }).unwrap()

      setUser(result.user)
      setToken(result.token)
      dispatch(setCredentials({ user: result.user, token: result.token }))

      setCurrentStep('success')
      // After successful verification, honour `next` param if present.
      // If no next is provided, send the user to the subscription-plan page so they can choose a plan,
      // instead of giving direct dashboard access without a subscription.
      const next = searchParams.get('next')
      const target = next || routes.privateroute.DASHBOARD
      router.push(target)
    } catch (error: any) {
      let errorMessage = "OTP verification failed. Please try again."

      if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }

      if (errorMessage.includes('expired')) {
        errorMessage = "OTP expired. Click Resend OTP."
      } else if (errorMessage.includes('incorrect') || errorMessage.includes('invalid')) {
        errorMessage = "OTP incorrect. Please try again."
      }

      setOtpError(errorMessage)
    }
  }

  const handleResendOtp = async () => {
    try {
      setOtpError(null)

      const result = await resendOtp({
        email: userEmail
      }).unwrap()

      setOtpError(null)
      showSuccessToast("OTP resent to your email")
    } catch (error: any) {
      let errorMessage = "Failed to resend OTP. Please try again."

      if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }

      setOtpError(errorMessage)
    }
  }

  const handleBackToForm = () => {
    setCurrentStep('form')
    setOtpError(null)
    setOtpValue('')
  }

  const handleOtpChange = async (value: string) => {
    setOtpValue(value)
    setOtpValueForm('otp', value, { shouldValidate: true })

    // Auto-verify when 6 digits are entered
    if (value.length === 6) {
      try {
        setOtpError(null)
        const result = await verifyOtp({
          email: userEmail,
          otp: value
        }).unwrap()

        setUser(result.user)
        setToken(result.token)
        dispatch(setCredentials({ user: result.user, token: result.token }))

        setCurrentStep('success')
        const next = searchParams.get('next')
        const target = next || routes.privateroute.DASHBOARD
        router.push(target)
      } catch (error: any) {
        let errorMessage = "OTP verification failed. Please try again."

        if (error?.data?.message) {
          errorMessage = error.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }

        if (errorMessage.includes('expired')) {
          errorMessage = "OTP expired. Click Resend OTP."
        } else if (errorMessage.includes('incorrect') || errorMessage.includes('invalid')) {
          errorMessage = "OTP incorrect. Please try again."
        }

        setOtpError(errorMessage)
        setOtpValue('') // Clear OTP on error
      }
    }
  }

  const handleGoToLogin = () => {
    router.push(`${routes.publicroute.LOGIN}?message=Registration successful. Please login to continue.`)
  }

  const handleGoToDashboard = () => {
    // On success, always send users to subscription-plan to pick/confirm a plan first.
    const next = searchParams.get('next')
    const target = next || routes.privateroute.DASHBOARD
    router.push(target)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(routes.publicroute.HOME)}
            className="text-muted-foreground hover:text-white hover:bg-[#3882a5]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1 flex justify-center">
            <img
              src="/aynzo-logo.svg"
              alt="Aynzo Logo"
              className="h-10 w-auto"
            />
          </div>
          <div className="w-20"></div>
        </div>
        <CardTitle className="text-2xl text-brand">
          {currentStep === 'success' ? 'Registration Complete!' :
            currentStep === 'otp' ? 'Verify Your Email' :
              'Sign Up'}
        </CardTitle>
        <CardDescription>
          {currentStep === 'success' ? 'Your account has been successfully created' :
            currentStep === 'otp' ? 'Enter the OTP sent to your email' :
              'Sign up for your account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Error Messages */}
        {submitError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {otpError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{otpError}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {currentStep === 'success' && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              OTP verified — your account has been created.
            </AlertDescription>
          </Alert>
        )}

        {/* OTP Sent Message */}
        {currentStep === 'otp' && (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              OTP sent to {userEmail}. Please enter it below to complete registration.
            </AlertDescription>
          </Alert>
        )}

        {/* Registration Form */}
        {currentStep === 'form' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <InputField
                label="Company Name"
                placeholder="Enter your company name"
                error={errors.companyName?.message}
                {...registerField("companyName")}
                required
              />

              <InputField
                label="Email"
                type="email"
                placeholder="Enter your email"
                error={errors.email?.message}
                {...registerField("email")}
                required
              />

              <InputField
                label="Password"
                type="password"
                placeholder="Create a password"
                error={errors.password?.message}
                {...registerField("password")}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
        )}

        {/* OTP Verification Form */}
        {currentStep === 'otp' && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={handleBackToForm}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Registration
            </Button>

            <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Enter Verification Code
                </label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otpValue}
                    onChange={handleOtpChange}
                    containerClassName="gap-2 md:gap-3"
                  >
                    <InputOTPGroup className="gap-2 md:gap-3">
                      <InputOTPSlot index={0} className="h-12 w-12 md:h-14 md:w-14 text-lg md:text-xl font-semibold border-2 rounded-lg transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                      <InputOTPSlot index={1} className="h-12 w-12 md:h-14 md:w-14 text-lg md:text-xl font-semibold border-2 rounded-lg transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                      <InputOTPSlot index={2} className="h-12 w-12 md:h-14 md:w-14 text-lg md:text-xl font-semibold border-2 rounded-lg transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                      <InputOTPSlot index={3} className="h-12 w-12 md:h-14 md:w-14 text-lg md:text-xl font-semibold border-2 rounded-lg transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                      <InputOTPSlot index={4} className="h-12 w-12 md:h-14 md:w-14 text-lg md:text-xl font-semibold border-2 rounded-lg transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                      <InputOTPSlot index={5} className="h-12 w-12 md:h-14 md:w-14 text-lg md:text-xl font-semibold border-2 rounded-lg transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {otpErrors.otp?.message && (
                  <p className="text-sm text-destructive mt-1">{otpErrors.otp.message}</p>
                )}
                {otpError && (
                  <p className="text-sm text-destructive mt-1">{otpError}</p>
                )}
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isVerifyingOtp || otpValue.length !== 6}>
                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="link"
                onClick={handleResendOtp}
                className="text-sm"
                disabled={isResendingOtp}
              >
                {isResendingOtp ? "Resending..." : "Didn't receive OTP? Resend"}
              </Button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {currentStep === 'success' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Your account has been created successfully! You can now access your dashboard or login later.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleGoToDashboard} className="flex-1">
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={handleGoToLogin} className="flex-1">
                Login Later
              </Button>
            </div>
          </div>
        )}

        {/* Login Link */}
        {currentStep === 'form' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href={routes.publicroute.LOGIN} className="text-primary hover:underline" prefetch={true}>
                Sign in
              </Link>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
