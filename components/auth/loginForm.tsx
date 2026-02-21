"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputField } from "@/components/common/inputField";
import { useAppDispatch } from "@/store/hooks";
import { useLoginMutation, useGoogleLoginMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { routes } from "@/utils/routes";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { encryptData } from "@/utils/crypto";
const loginSchema = yup.object({
    email: yup.string().email("Invalid email address").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export function LoginForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();
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

    const generateCaptcha = () => {
        const n1 = Math.floor(Math.random() * 10) + 1;
        const n2 = Math.floor(Math.random() * 10) + 1;
        setCaptcha({ num1: n1, num2: n2, result: n1 + n2 });
        setCaptchaInput("");
        setCaptchaError(null);
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

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

            if (!result.token || result.token === "undefined") {
                throw new Error("No valid token received from server");
            }

            if (!result.user) {
                throw new Error("No user data received from server");
            }

            dispatch(setCredentials(result));
            setErrorMessage(null);

            const next = searchParams.get("next");
            const target = next || routes.privateroute.DASHBOARD;
            window.location.replace(target);
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
                    window.location.replace(target);
                }
            } catch (error: any) {
                setErrorMessage(error?.data?.message || "Google login failed");
            }
        },
        onError: () => setErrorMessage("Google login failed"),
    });

    return (
        <div className="w-full">
            <div className="mb-10">
                <div className="mb-6 flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(routes.publicroute.HOME)}
                        className="text-muted-foreground hover:bg-[#3882a5] hover:text-white rounded-lg px-3"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Welcome Back</h1>
                    <p className="text-muted-foreground text-lg">Sign in to manage your visitors</p>
                </div>
            </div>

            <div className="space-y-6">
                {errorMessage && (
                    <Alert variant="destructive" className="border-red-100 bg-red-50 text-red-900 rounded-xl">
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <InputField
                            label="Email"
                            type="email"
                            placeholder="Enter your email"
                            error={errors.email?.message}
                            required
                            {...register("email")}
                            className="h-12 rounded-xl border-gray-200 focus:border-[#3882a5]"
                        />

                        <InputField
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            error={errors.password?.message}
                            required
                            {...register("password")}
                            className="h-12 rounded-xl border-gray-200 focus:border-[#3882a5]"
                        />
                    </div>

                    <div className="flex items-center justify-end">
                        <Link
                            href={routes.publicroute.FORGOT_PASSWORD}
                            className="text-[#3882a5] text-sm font-semibold hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700">
                                Security Check: {captcha.num1} + {captcha.num2} = ?
                            </label>
                            <div className="flex gap-2">
                                <InputField
                                    placeholder="Answer"
                                    type="number"
                                    value={captchaInput}
                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                    error={captchaError || undefined}
                                    className="flex-1 h-12 rounded-xl border-gray-200"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={generateCaptcha}
                                    className="h-12 w-12 rounded-xl border-gray-200 hover:bg-gray-50 bg-white"
                                    title="Refresh Captcha"
                                >
                                    🔄
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl font-bold bg-[#3882a5] hover:bg-[#2c6a88] text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                            disabled={isLoading || isGoogleLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </div>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-4 text-muted-foreground font-medium">Or continue with</span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 font-semibold transition-colors"
                    onClick={() => handleGoogleLogin()}
                    disabled={isLoading || isGoogleLoading}
                >
                    <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                    {isGoogleLoading ? "Connecting..." : "Continue with Google"}
                </Button>

                <div className="text-center pt-2">
                    <p className="text-gray-600 text-sm">
                        Don't have an account?{" "}
                        <Link
                            href={routes.publicroute.REGISTER}
                            className="text-[#3882a5] font-bold hover:underline"
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
