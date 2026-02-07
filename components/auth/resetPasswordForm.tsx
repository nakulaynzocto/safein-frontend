"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputField } from "@/components/common/inputField";
import { useResetPasswordMutation } from "@/store/api/authApi";
import { routes } from "@/utils/routes";
import { CheckCircle, Lock, ArrowLeft } from "lucide-react";

const resetPasswordSchema = yup.object({
    newPassword: yup
        .string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
            "Password must contain at least one capital letter, one lower case letter, and one number"
        ),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("newPassword")], "Passwords must match")
        .required("Please confirm your password"),
});

type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [resetPassword, { isLoading }] = useResetPasswordMutation();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const tokenParam = searchParams.get("token");
        if (!tokenParam) {
            setSubmitError("Invalid or missing reset token. Please request a new password reset link.");
        } else {
            setToken(tokenParam);
        }
    }, [searchParams]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: yupResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            setSubmitError("Invalid reset token");
            return;
        }

        try {
            setSubmitError(null);
            await resetPassword({
                token,
                newPassword: data.newPassword,
            }).unwrap();
            setIsSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push(routes.publicroute.LOGIN);
            }, 3000);
        } catch (error: any) {
            let errorMessage = "Failed to reset password";

            if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            setSubmitError(errorMessage);
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
                    <CardTitle className="text-brand text-2xl">Password Reset Successful</CardTitle>
                    <CardDescription>Your password has been successfully reset</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            You can now sign in with your new password. Redirecting to login page...
                        </AlertDescription>
                    </Alert>

                    <Button className="w-full" onClick={() => router.push(routes.publicroute.LOGIN)}>
                        Go to Sign In
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!token) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-brand text-2xl">Invalid Reset Link</CardTitle>
                    <CardDescription>The password reset link is invalid or has expired</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <AlertDescription>
                            {submitError || "Please request a new password reset link."}
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Button className="w-full" onClick={() => router.push(routes.publicroute.FORGOT_PASSWORD)}>
                            Request New Reset Link
                        </Button>
                        <Link
                            href={routes.publicroute.LOGIN}
                            className="text-muted-foreground hover:text-primary flex items-center justify-center gap-2 text-sm transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Sign In
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                    <div className="bg-brand/10 flex h-12 w-12 items-center justify-center rounded-full">
                        <Lock className="text-brand h-6 w-6" />
                    </div>
                </div>
                <CardTitle className="text-brand text-2xl">Reset Your Password</CardTitle>
                <CardDescription>Enter your new password below</CardDescription>
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
                        placeholder="Enter your new password"
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
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href={routes.publicroute.LOGIN}
                        className="text-muted-foreground hover:text-primary flex items-center justify-center gap-2 text-sm transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sign In
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
