import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputField } from "@/components/common/inputField"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { useAppDispatch } from "@/store/hooks"
import { useLoginMutation } from "@/store/api/authApi"
import { setCredentials } from "@/store/slices/authSlice"
import { routes } from "@/utils/routes"
import { showErrorToast, showSuccessToast } from "@/utils/toast"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { LogIn } from "lucide-react"

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // State to hold error message

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
      
      // Check if token exists and is valid
      if (!result.token || result.token === 'undefined') {
        throw new Error('No valid token received from server')
      }
      
      dispatch(setCredentials(result))
      setErrorMessage(null)
      
      // Redirect to dashboard after successful login
      router.push(routes.privateroute.DASHBOARD)
    } catch (error: any) {
      const message = error?.data?.message || error?.message || "Login failed"
      setErrorMessage(message) 
      // showError(message)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Sign in to your Gatekeeper account</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Display error message */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            label="Email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            required
            {...register("email")}
          />

          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            required
            {...register("password")}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Sign In
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