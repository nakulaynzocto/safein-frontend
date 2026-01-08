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
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-brand text-2xl">Check Your Email</CardTitle>
                    <CardDescription>We've sent a password reset link to your email address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <Mail className="h-4 w-4" />
                        <AlertDescription>
                            If an account with that email exists, you will receive a password reset link shortly. Please
                            check your inbox and follow the instructions.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2 text-center">
                        <p className="text-muted-foreground text-sm">
                            Didn't receive the email? Check your spam folder or try again.
                        </p>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                setIsSuccess(false);
                                setSubmitError(null);
                            }}
                        >
                            Try Again
                        </Button>
                    </div>

                    <div className="border-t pt-4">
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
                    <img src="/aynzo-logo.svg" alt="Aynzo Logo" className="h-10 w-auto" />
                </div>
                <CardTitle className="text-brand text-2xl">Forgot Password?</CardTitle>
                <CardDescription>
                    Enter your email address and we'll send you a link to reset your password
                </CardDescription>
            </CardHeader>
            <CardContent>
                {submitError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{submitError}</AlertDescription>
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

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send Reset Link"}
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
