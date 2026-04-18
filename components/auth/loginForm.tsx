"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputField } from "@/components/common/inputField";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useLoginMutation, useGoogleLoginMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { routes } from "@/utils/routes";
import { showSuccessToast } from "@/utils/toast";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { encryptData } from "@/utils/crypto";

const loginSchema = yup.object({
    email: yup.string().email("Invalid email address").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export function LoginForm() {
    const dispatch = useAppDispatch();
    const { isAuthenticated, token, isInitialized } = useAppSelector((state) => state.auth);
    const searchParams = useSearchParams();
    const [login, { isLoading }] = useLoginMutation();
    const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, result: 0 });
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
    });

    // Handle redirection if already authenticated
    useEffect(() => {
        if (isInitialized && isAuthenticated && token) {
            const next = searchParams.get("next");
            const target = next || routes.privateroute.DASHBOARD;
            window.location.href = target;
        }
    }, [isInitialized, isAuthenticated, token, searchParams]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const generateCaptcha = useCallback(() => {
        const n1 = Math.floor(Math.random() * 10) + 1;
        const n2 = Math.floor(Math.random() * 10) + 1;
        setCaptcha({ num1: n1, num2: n2, result: n1 + n2 });
        setCaptchaInput("");
        setCaptchaError(null);
    }, []);

    useEffect(() => {
        generateCaptcha();
    }, [generateCaptcha]);

    useEffect(() => {
        const message = searchParams.get("message");
        if (message) {
            showSuccessToast(message);
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("message");
            window.history.replaceState({}, "", newUrl.toString());
        }
    }, [searchParams]);

    const onSubmit = async (data: LoginFormData) => {
        if (parseInt(captchaInput) !== captcha.result) {
            setCaptchaError("Incorrect answer. Please solve the math problem.");
            generateCaptcha();
            return;
        }

        try {
            const encryptedEmail = encryptData(data.email);
            const encryptedPassword = encryptData(data.password);
            const result = await login({
                email: encryptedEmail,
                password: encryptedPassword,
            }).unwrap();

            if (!result.token || !result.user) {
                throw new Error("Invalid response from server");
            }

            dispatch(setCredentials(result));
            setErrorMessage(null);

            const next = searchParams.get("next");
            const target = next || routes.privateroute.DASHBOARD;
            window.location.href = target;
        } catch (error: any) {
            const message = error?.data?.message || error?.message || "Login failed";
            setErrorMessage(message);
            generateCaptcha();
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const result = await googleLogin({
                    token: tokenResponse.access_token,
                }).unwrap();

                if (result.token && result.user) {
                    dispatch(setCredentials(result));
                    showSuccessToast("Login successful with Google!");
                    const next = searchParams.get("next");
                    const target = next || routes.privateroute.DASHBOARD;
                    window.location.href = target;
                }
            } catch (error: any) {
                setErrorMessage(error?.data?.message || "Google login failed");
            }
        },
        onError: () => setErrorMessage("Google login failed"),
    });

    if (!isMounted || !isInitialized) {
        return (
            <div className="w-full space-y-8 animate-pulse">
                <div className="space-y-3">
                    <div className="h-10 w-32 bg-slate-200 rounded-md" />
                    <div className="h-4 w-64 bg-slate-100 rounded-md" />
                </div>
                <div className="space-y-6">
                    <div className="h-12 w-full bg-slate-100 rounded-xl" />
                    <div className="h-40 w-full bg-slate-50 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8 text-center sm:text-left">
                <h1 className="text-3xl font-black text-[#074463] tracking-tight">Login</h1>
                <p className="text-slate-500 mt-2 font-medium text-sm sm:text-base">
                    Welcome back! Sign in to manage your visitors.
                </p>
            </div>

            <div className="space-y-6">
                {errorMessage && (
                    <Alert variant="destructive" className="border-red-100 bg-red-50 text-red-900 rounded-xl animate-in shake duration-500">
                        <AlertDescription className="font-medium">{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-3 font-bold transition-all hover:border-[#3882a5] hover:text-[#3882a5]"
                    onClick={() => handleGoogleLogin()}
                    disabled={isLoading || isGoogleLoading}
                >
                    {isGoogleLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                    )}
                    {isGoogleLoading ? "Connecting..." : "Continue with Google"}
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-100" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                        <span className="bg-white px-4 text-slate-400">Or use email</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <InputField
                            label="Email Address"
                            type="email"
                            placeholder="name@company.com"
                            error={errors.email?.message}
                            required
                            {...register("email")}
                            className="h-12 rounded-xl border-slate-200 focus:ring-[#3882a5]/20 focus:border-[#3882a5]"
                        />

                        <div className="space-y-1">
                            <InputField
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                error={errors.password?.message}
                                required
                                {...register("password")}
                                className="h-12 rounded-xl border-slate-200 focus:ring-[#3882a5]/20 focus:border-[#3882a5]"
                            />
                            <div className="flex justify-end">
                                <Link
                                    href={routes.publicroute.FORGOT_PASSWORD}
                                    className="text-[#3882a5] text-xs font-bold hover:underline opacity-80 hover:opacity-100"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3 transition-all hover:border-[#3882a5]/20 hover:bg-[#3882a5]/5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="h-3 w-3 text-[#3882a5]" />
                                Security Check: {captcha.num1} + {captcha.num2}
                            </label>
                            <div className="flex gap-2">
                                <InputField
                                    placeholder="Answer"
                                    type="number"
                                    value={captchaInput}
                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                    error={captchaError || undefined}
                                    className="flex-1 h-12 rounded-xl border-slate-200 bg-white"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={generateCaptcha}
                                    className="h-12 w-12 shrink-0 rounded-xl border-slate-200 hover:bg-white bg-white hover:text-[#3882a5] transition-all"
                                    title="Refresh Captcha"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl font-black bg-[#3882a5] hover:bg-[#2c6a88] text-white shadow-xl shadow-[#3882a5]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            disabled={isLoading || isGoogleLoading}
                        >
                            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </div>
                </form>

                <div className="text-center pt-2">
                    <p className="text-slate-500 text-sm font-medium">
                        Don't have an account?{" "}
                        <Link
                            href={routes.publicroute.REGISTER}
                            className="text-[#3882a5] font-black hover:underline"
                            prefetch={true}
                        >
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

