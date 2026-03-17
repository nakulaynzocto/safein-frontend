"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputField } from "@/components/common/inputField";
import { useResetPasswordMutation } from "@/store/api/authApi";
import { routes } from "@/utils/routes";
import { CheckCircle, Lock, ArrowLeft, Loader2, ShieldAlert } from "lucide-react";

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
                router.replace(routes.publicroute.LOGIN);
            }, 3000);
        } catch (error: any) {
            setSubmitError(error?.data?.message || error?.message || "Failed to reset password");
        }
    };

    if (isSuccess) {
        return (
            <div className="w-full animate-in zoom-in duration-500 flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-24 w-24 rounded-full bg-[#3882a5]/5 flex items-center justify-center border-4 border-[#3882a5]/10 shadow-xl shadow-[#3882a5]/10">
                    <CheckCircle className="h-12 w-12 text-[#3882a5]" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-[#074463] tracking-tight">Reset Successful!</h1>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto">
                        Your password has been updated. You'll be redirected to login shortly.
                    </p>
                </div>
                <div className="w-full space-y-4 pt-4">
                    <Alert className="border-[#3882a5]/10 bg-[#3882a5]/5 rounded-2xl">
                        <AlertDescription className="text-[#3882a5] font-bold">
                            You can now sign in with your new password.
                        </AlertDescription>
                    </Alert>
                    <Button
                        className="w-full h-12 rounded-xl font-black bg-[#3882a5] hover:bg-[#2c6a88] text-white"
                        onClick={() => router.replace(routes.publicroute.LOGIN)}
                    >
                        Go to Sign In
                    </Button>
                </div>
            </div>
        );
    }

    if (!token && !isLoading) {
        return (
            <div className="w-full animate-in fade-in duration-500">
                <div className="mb-10 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                            <ShieldAlert className="h-10 w-10 text-red-500" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-[#074463] tracking-tight mb-2">Invalid Reset Link</h1>
                    <p className="text-slate-500 font-medium">This password reset link is invalid or has expired</p>
                </div>

                <div className="space-y-6">
                    <Alert variant="destructive" className="border-red-100 bg-red-50 text-red-900 rounded-xl">
                        <AlertDescription className="font-medium">
                            {submitError || "Please request a new password reset link."}
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <Button
                            className="w-full h-12 rounded-xl font-black bg-[#3882a5] hover:bg-[#2c6a88] text-white shadow-xl shadow-[#3882a5]/20"
                            onClick={() => router.push(routes.publicroute.FORGOT_PASSWORD)}
                        >
                            Request New Reset Link
                        </Button>
                        <div className="text-center pt-2">
                            <Link
                                href={routes.publicroute.LOGIN}
                                className="text-slate-500 font-bold hover:text-[#3882a5] transition-colors flex items-center justify-center gap-2 group"
                            >
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
                <div className="mb-6 flex justify-center lg:justify-start">
                    <div className="bg-[#3882a5]/10 flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner border border-[#3882a5]/5 text-[#3882a5]">
                        <Lock className="h-8 w-8" />
                    </div>
                </div>
                <div className="space-y-2 text-center lg:text-left">
                    <h1 className="text-3xl font-black text-[#074463] tracking-tight">Secure Your Account</h1>
                    <p className="text-slate-500 font-medium text-sm sm:text-base">
                        Choose a new strong password for your SafeIn account.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {submitError && (
                    <Alert variant="destructive" className="border-red-100 bg-red-50 text-red-900 rounded-xl animate-in shake duration-500">
                        <AlertDescription className="font-medium">{submitError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <InputField
                            label="New Password"
                            type="password"
                            placeholder="Min. 8 characters"
                            error={errors.newPassword?.message}
                            required
                            {...register("newPassword")}
                            className="h-12 rounded-xl border-slate-200 focus:ring-[#3882a5]/20 focus:border-[#3882a5]"
                        />

                        <InputField
                            label="Confirm Password"
                            type="password"
                            placeholder="Must match password"
                            error={errors.confirmPassword?.message}
                            required
                            {...register("confirmPassword")}
                            className="h-12 rounded-xl border-slate-200 focus:ring-[#3882a5]/20 focus:border-[#3882a5]"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 rounded-xl font-black bg-[#3882a5] hover:bg-[#2c6a88] text-white shadow-xl shadow-[#3882a5]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                        {isLoading ? "Resetting..." : "Update Password"}
                    </Button>
                </form>

                <div className="text-center pt-2">
                    <Link
                        href={routes.publicroute.LOGIN}
                        className="text-slate-500 font-bold hover:text-[#3882a5] transition-colors flex items-center justify-center gap-2 group"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}

