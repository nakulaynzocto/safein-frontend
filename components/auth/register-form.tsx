"use client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputField } from "@/components/common/input-field"
import { LoadingSpinner } from "@/components/common/loading-spinner"
import { useAppDispatch } from "@/store/hooks"
import { useRegisterMutation } from "@/store/api/authApi"
import { routes } from "@/utils/routes"

const registerSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  phoneNumber: yup.string().required("Phone number is required"),
  dateOfBirth: yup.date().required("Date of birth is required"),
  gender: yup.string().oneOf(["male", "female", "other"], "Invalid gender").required("Gender is required"),
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
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setSubmitError(null) // Clear any previous errors
      const { confirmPassword, ...registerData } = data
      // Convert dateOfBirth to string format
      const formattedData = {
        ...registerData,
        dateOfBirth: registerData.dateOfBirth.toISOString().split('T')[0]
      }
      const result = await register(formattedData).unwrap()

      router.push(`${routes.publicroute.LOGIN}?message=Registration successful. Please login to continue.`)
    } catch (error: any) {
      let errorMessage = "Registration failed"

      if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      setSubmitError(errorMessage)
      // showError(errorMessage)
    }
  }

  return (
    <Card className="w-full max-w-2xl"> {/* wider card for 2-column form */}
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Sign up for your Gatekeeper account</CardDescription>
      </CardHeader>
      <CardContent>
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm transition-opacity duration-500 ease-in-out opacity-100 animate-fadeIn">
            <p className="text-sm font-medium text-red-600">{submitError}</p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="First Name"
              placeholder="Enter your first name"
              error={errors.firstName?.message}
              {...registerField("firstName")}
            />

            <InputField
              label="Last Name"
              placeholder="Enter your last name"
              error={errors.lastName?.message}
              {...registerField("lastName")}
            />

            <InputField
              label="Email"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...registerField("email")}
            />

            <InputField
              label="Phone Number"
              placeholder="Enter your phone number"
              error={errors.phoneNumber?.message}
              {...registerField("phoneNumber")}
            />

            <InputField
              label="Date of Birth"
              type="date"
              error={errors.dateOfBirth?.message}
              {...registerField("dateOfBirth")}
            />

            <div>
              <label className="block text-sm font-medium">Gender</label>
              <select
                className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm"
                {...registerField("gender")}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender?.message && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>

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
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={routes.publicroute.LOGIN} className="text-primary hover:underline" prefetch={true}>
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
