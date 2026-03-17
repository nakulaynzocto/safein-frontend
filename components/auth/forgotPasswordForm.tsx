"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputField } from "@/components/common/inputField";
import { useForgotPasswordMutation } from "@/store/api/authApi";
import { routes } from "@/utils/routes";
import { Mail, ArrowLeft, CheckCircle, Loader2, Sparkles } from "lucide-react";

const forgotPasswordSchema = yup.object({
    email: yup.string().email("Invalid email address").required("Email is required"),
});

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [sentEmail, setSentEmail] = useState("");

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
            setSentEmail(data.email);
            setIsSuccess(true);
        } catch (error: any) {
            setSubmitError(error?.data?.message || error?.message || "Failed to send reset link");
        }
    };

    if (isSuccess) {
        return (
            <div className="w-full animate-in zoom-in duration-500">
                <div className="mb-10 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-green-100 rounded-full blur-xl opacity-50 animate-pulse" />
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl shadow-green-100/50 border-2 border-green-50">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-[#074463] tracking-tight mb-2">Check Your Email</h1>
                    <p className="text-slate-500 font-medium">We've sent a recovery link to your inbox</p>
                </div>

                <div className="space-y-6">
                    <Alert className="border-[#3882a5]/20 bg-[#3882a5]/5 rounded-2xl p-4">
                        <Mail className="h-5 w-5 text-[#3882a5] mt-0.5" />
                        <AlertDescription className="text-[#074463] font-semibold ml-2">
                            A reset link has been sent to <span className="underline">{sentEmail}</span>. Redirecting you soon...
                        </AlertDescription>
                    </Alert>

                    <div className="flex flex-col gap-3">
                        <Button
                            asChild
                            className="w-full h-12 rounded-xl font-black bg-[#3882a5] hover:bg-[#2c6a88] text-white"
                        >
                            <Link href={routes.publicroute.LOGIN}>Back to Sign In</Link>
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full h-12 rounded-xl font-bold text-slate-500"
                            onClick={() => {
                                setIsSuccess(false);
                                setSubmitError(null);
                            }}
                        >
                            Try another email
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8 ">
                <div className="mb-6 flex">
                    <div className="bg-[#3882a5]/10 flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner border border-[#3882a5]/5 text-[#3882a5]">
                        <Sparkles className="h-7 w-7" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-[#074463] tracking-tight">Forgot Password?</h1>
                    <p className="text-slate-500 font-medium text-sm sm:text-base">
                        No worries, we'll send you instructions to reset it.
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
                    <InputField
                        label="Email Address"
                        type="email"
                        placeholder="name@company.com"
                        error={errors.email?.message}
                        required
                        {...register("email")}
                        className="h-12 rounded-xl border-slate-200 focus:ring-[#3882a5]/20 focus:border-[#3882a5]"
                    />

                    <Button
                        type="submit"
                        className="w-full h-12 rounded-xl font-black bg-[#3882a5] hover:bg-[#2c6a88] text-white shadow-xl shadow-[#3882a5]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                        {isLoading ? "Sending link..." : "Send Reset Link"}
                    </Button>
                </form>

                <div className="text-center">
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

