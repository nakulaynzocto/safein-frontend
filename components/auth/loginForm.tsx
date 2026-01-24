import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputField } from "@/components/common/inputField"
import { useAppDispatch } from "@/store/hooks"
import { useLoginMutation } from "@/store/api/authApi"
import { setCredentials } from "@/store/slices/authSlice"
import { routes } from "@/utils/routes"
import { showErrorToast, showSuccessToast } from "@/utils/toast"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

const loginSchema = yup.object({
  email: yup.string().email("Invalid email address").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
})

type LoginFormData = yup.InferType<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const [login, { isLoading }] = useLoginMutation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  })

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      showSuccessToast(message)
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('message')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [searchParams])

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data).unwrap()
      
      if (!result.token || result.token === 'undefined') {
        throw new Error('No valid token received from server')
      }
      
      if (!result.user) {
        throw new Error('No user data received from server')
      }
      
      dispatch(setCredentials(result))
      setErrorMessage(null)
      
      // According to documentation: After login, check subscription status
      // If no active subscription, redirect to subscription-plan page
      // If we were sent here with a `next` param, use that; otherwise go to subscription-plan
      const next = searchParams.get('next')
      // Always redirect to subscription-plan first (it will check subscription and redirect to dashboard if active)
      // No need for separate loader here - subscription-plan page will show loader
      const target = next || routes.publicroute.SUBSCRIPTION_PLAN
      window.location.replace(target)
    } catch (error: any) {
      const message = error?.data?.message || error?.message || "Login failed"
      setErrorMessage(message)
    }
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
        <CardTitle className="text-2xl text-brand">Welcome Back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription data-testid='login-error'>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            data-testid='email-input'
            label="Email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            required
            {...register("email")}
          />

          <InputField
            data-testid='password-input'
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            required
            {...register("password")}
          />

          <div className="flex items-center justify-end">
            <Link
              href={routes.publicroute.FORGOT_PASSWORD}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" data-testid='login-btn' className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href={routes.publicroute.REGISTER} className="text-primary hover:underline" prefetch={true}>
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}