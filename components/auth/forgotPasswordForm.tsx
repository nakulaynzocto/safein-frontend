"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputField } from "@/components/common/inputField";
import { useForgotPasswordMutation } from "@/store/api/authApi";
import { routes } from "@/utils/routes";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

const forgotPasswordSchema = yup.object({
    email: yup.string().email("Invalid email address").required("Email is required"),
});

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: yupResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            setSubmitError(null);
            await forgotPassword({ email: data.email }).unwrap();
            setIsSuccess(true);
        } catch (error: any) {
            let errorMessage = "Failed to send password reset email";

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
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Check Your Email</h1>
                    <p className="text-muted-foreground text-lg">We've sent a recovery link to your inbox</p>
                </div>

                <div className="space-y-6">
                    <Alert className="border-blue-100 bg-blue-50 rounded-xl">
                        <Mail className="h-4 w-4 text-[#3882a5]" />
                        <AlertDescription className="text-blue-900 font-medium">
                            If an account with that email exists, you will receive a reset link shortly.
                        </AlertDescription>
                    </Alert>

                    <Button
                        variant="outline"
                        className="w-full h-12 rounded-xl border-gray-200"
                        onClick={() => {
                            setIsSuccess(false);
                            setSubmitError(null);
                        }}
                    >
                        Try with another email
                    </Button>

                    <div className="pt-2 text-center">
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

    return (
        <div className="w-full">
            <div className="mb-10">
                <div className="mb-6 flex justify-center">
                </div>
                <div className="space-y-2 text-center lg:text-left">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Forgot Password?</h1>
                    <p className="text-muted-foreground text-lg">Don't worry, we'll help you recover it</p>
                </div>
            </div>

            <div className="space-y-6">
                {submitError && (
                    <Alert variant="destructive" className="border-red-100 bg-red-50 text-red-900 rounded-xl">
                        <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <InputField
                        label="Email Address"
                        type="email"
                        placeholder="e.g. name@company.com"
                        error={errors.email?.message}
                        required
                        {...register("email")}
                        className="h-12 rounded-xl border-gray-200 focus:border-[#3882a5]"
                    />

                    <Button
                        type="submit"
                        className="w-full h-12 rounded-xl font-bold bg-[#3882a5] hover:bg-[#2c6a88] text-white shadow-lg shadow-blue-500/20"
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending link..." : "Send Reset Link"}
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
