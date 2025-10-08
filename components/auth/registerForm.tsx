import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputField } from "@/components/common/inputField"
import { SelectField } from "@/components/common/selectField"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { useAppDispatch } from "@/store/hooks"
import { useRegisterMutation } from "@/store/api/authApi"
import { routes } from "@/utils/routes"
import { UserPlus } from "lucide-react"

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
    watch,
    setValue,
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
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Sign up for your Gatekeeper account</CardDescription>
      </CardHeader>
      <CardContent>
        {submitError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="First Name"
              placeholder="Enter your first name"
              error={errors.firstName?.message}
              {...registerField("firstName")}
              required
            />

            <InputField
              label="Last Name"
              placeholder="Enter your last name"
              error={errors.lastName?.message}
              {...registerField("lastName")}
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
              label="Phone Number"
              placeholder="Enter your phone number"
              error={errors.phoneNumber?.message}
              {...registerField("phoneNumber")}
              required
            />

            <InputField
              label="Date of Birth"
              type="date"
              error={errors.dateOfBirth?.message}
              {...registerField("dateOfBirth")}
              required
            />

            <SelectField
              label="Gender"
              placeholder="Select gender"
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" }
              ]}
              error={errors.gender?.message}
              value={watch("gender") || ""}
              onChange={(value) => setValue("gender", value as "male" | "female" | "other")}
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

            <InputField
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...registerField("confirmPassword")}
              required
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
