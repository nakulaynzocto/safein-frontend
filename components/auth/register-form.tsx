"use client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputField } from "@/components/common/input-field"
import { LoadingSpinner } from "@/components/common/loading-spinner"
import { useAppDispatch } from "@/store/hooks"
import { useRegisterMutation } from "@/store/api/authApi"
import { setCredentials } from "@/store/slices/authSlice"
import { showError } from "@/utils/toaster"

const registerSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
})

type RegisterFormData = yup.InferType<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [register, { isLoading }] = useRegisterMutation()

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data
      const result = await register(registerData).unwrap()
      dispatch(setCredentials(result))
      router.push("/dashboard")
    } catch (error: any) {
      showError(error?.data?.message || error?.message || "Registration failed")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Sign up for your Gatekeeper account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            label="Full Name"
            placeholder="Enter your full name"
            error={errors.name?.message}
            {...registerField("name")}
          />

          <InputField
            label="Email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...registerField("email")}
          />

          <InputField
            label="Password"
            type="password"
            placeholder="Create a password"
            error={errors.password?.message}
            {...registerField("password")}
          />

          <InputField
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            {...registerField("confirmPassword")}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
