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
            <div className="w-full">
                <div className="mb-10 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 shadow-lg shadow-green-100/50">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Reset Successful</h1>
                    <p className="text-muted-foreground text-lg">Your password has been updated</p>
                </div>

                <div className="space-y-6">
                    <Alert className="border-green-100 bg-green-50 rounded-xl">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-900 font-medium">
                            You can now sign in with your new password. Redirecting to login page...
                        </AlertDescription>
                    </Alert>

                    <Button
                        className="w-full h-12 rounded-xl font-bold bg-[#3882a5] hover:bg-[#2c6a88]"
                        onClick={() => router.push(routes.publicroute.LOGIN)}
                    >
                        Go to Sign In
                    </Button>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="w-full">
                <div className="mb-10 text-center lg:text-left">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Invalid Reset Link</h1>
                    <p className="text-muted-foreground text-lg">The password reset link is invalid or has expired</p>
                </div>

                <div className="space-y-6">
                    <Alert variant="destructive" className="border-red-100 bg-red-50 text-red-900 rounded-xl">
                        <AlertDescription>
                            {submitError || "Please request a new password reset link."}
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <Button
                            className="w-full h-12 rounded-xl font-bold bg-[#3882a5] hover:bg-[#2c6a88]"
                            onClick={() => router.push(routes.publicroute.FORGOT_PASSWORD)}
                        >
                            Request New Reset Link
                        </Button>
                        <div className="text-center pt-2">
                            <Link
                                href={routes.publicroute.LOGIN}
                                className="text-[#3882a5] font-bold hover:underline flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-10">
                <div className="mb-6 flex justify-center">
                    <div className="bg-[#3882a5]/10 flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner">
                        <Lock className="text-[#3882a5] h-8 w-8" />
                    </div>
                </div>
                <div className="space-y-2 text-center lg:text-left">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Secure Your Account</h1>
                    <p className="text-muted-foreground text-lg">Enter your new strong password below</p>
                </div>
            </div>

            <div className="space-y-6">
                {submitError && (
                    <Alert variant="destructive" className="border-red-100 bg-red-50 text-red-900 rounded-xl">
                        <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <InputField
                            label="New Password"
                            type="password"
                            placeholder="Min. 8 characters with numbers"
                            error={errors.newPassword?.message}
                            required
                            {...register("newPassword")}
                            className="h-12 rounded-xl border-gray-200 focus:border-[#3882a5]"
                        />

                        <InputField
                            label="Confirm Password"
                            type="password"
                            placeholder="Must match new password"
                            error={errors.confirmPassword?.message}
                            required
                            {...register("confirmPassword")}
                            className="h-12 rounded-xl border-gray-200 focus:border-[#3882a5]"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 rounded-xl font-bold bg-[#3882a5] hover:bg-[#2c6a88] text-white shadow-lg shadow-blue-500/20"
                        disabled={isLoading}
                    >
                        {isLoading ? "Resetting..." : "Update Password"}
                    </Button>
                </form>

                <div className="text-center pt-2">
                    <Link
                        href={routes.publicroute.LOGIN}
                        className="text-[#3882a5] font-bold hover:underline flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
