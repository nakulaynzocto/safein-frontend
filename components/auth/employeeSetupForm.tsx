"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputField } from "@/components/common/inputField";
import { useSetupEmployeePasswordMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { routes } from "@/utils/routes";
import { CheckCircle, UserCheck, ArrowLeft } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

const employeeSetupSchema = yup.object({
    newPassword: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("newPassword")], "Passwords must match")
        .required("Please confirm your password"),
});

type EmployeeSetupFormData = yup.InferType<typeof employeeSetupSchema>;

export function EmployeeSetupForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const [setupPassword, { isLoading }] = useSetupEmployeePasswordMutation();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const tokenParam = searchParams.get("token");
        if (!tokenParam) {
            setSubmitError("Invalid or missing setup token. Please check your email for the correct link.");
        } else {
            setToken(tokenParam);
        }
    }, [searchParams]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EmployeeSetupFormData>({
        resolver: yupResolver(employeeSetupSchema),
    });

    const onSubmit = async (data: EmployeeSetupFormData) => {
        if (!token) {
            setSubmitError("Invalid setup token");
            return;
        }

        try {
            setSubmitError(null);
            const result = await setupPassword({
                token,
                newPassword: data.newPassword,
            }).unwrap();

            // Save credentials to Redux
            if (result.token && result.user) {
                dispatch(setCredentials(result));
                showSuccessToast("Password set up successfully! Account activated.");
                setIsSuccess(true);

                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    router.push(routes.privateroute.DASHBOARD);
                }, 2000);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error: any) {
            let errorMessage = "Failed to set up password";

            if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            setSubmitError(errorMessage);
            showErrorToast(errorMessage);
        }
    };

    if (isSuccess) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-brand text-2xl">Account Activated!</CardTitle>
                    <CardDescription>Your password has been set up successfully</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            Your account is now active. Redirecting to your dashboard...
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (!token) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-brand text-2xl">Invalid Setup Link</CardTitle>
                    <CardDescription>The setup link is invalid or has expired</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <AlertDescription>
                            {submitError || "Please contact your administrator for a new setup link."}
                        </AlertDescription>
                    </Alert>

                    <Button className="w-full" onClick={() => router.push(routes.publicroute.LOGIN)}>
                        Go to Sign In
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                    <div className="bg-brand/10 flex h-12 w-12 items-center justify-center rounded-full">
                        <UserCheck className="text-brand h-6 w-6" />
                    </div>
                </div>
                <CardTitle className="text-brand text-2xl">Set Up Your Account</CardTitle>
                <CardDescription>Create a password to activate your employee account</CardDescription>
            </CardHeader>
            <CardContent>
                {submitError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <InputField
                        label="New Password"
                        type="password"
                        placeholder="Enter your new password (min 6 characters)"
                        error={errors.newPassword?.message}
                        required
                        {...register("newPassword")}
                    />

                    <InputField
                        label="Confirm Password"
                        type="password"
                        placeholder="Confirm your new password"
                        error={errors.confirmPassword?.message}
                        required
                        {...register("confirmPassword")}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Setting up..." : "Set Up Password"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Button
                        variant="ghost"
                        onClick={() => router.push(routes.publicroute.LOGIN)}
                        className="text-muted-foreground hover:text-primary flex items-center justify-center gap-2 text-sm transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sign In
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

