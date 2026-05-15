"use client";

import * as yup from "yup";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputField } from "@/components/common/inputField";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/inputOtp";
import { useLoginMutation, useGoogleLoginMutation, useInitiatePhoneLoginMutation, useVerifyPhoneLoginMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { routes } from "@/utils/routes";
import { showSuccessToast } from "@/utils/toast";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, RefreshCw, Smartphone, Mail as MailIcon, ArrowLeft } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { encryptData } from "@/utils/crypto";
import { Controller } from "react-hook-form";

const loginSchema = yup.object({
    email: yup.string().email("Invalid email address").required("Email is required"),
    password: yup.string().required("Password is required"),
    mobileNumber: yup.string().required("Mobile number is required"),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export function LoginForm() {
    const dispatch = useAppDispatch();
    const { isAuthenticated, token, isInitialized } = useAppSelector((state) => state.auth);
    const searchParams = useSearchParams();
    
    const [login, { isLoading }] = useLoginMutation();
    const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
    const [initiatePhoneLogin, { isLoading: isInitiatingPhone }] = useInitiatePhoneLoginMutation();
    const [verifyPhoneLogin, { isLoading: isVerifyingPhone }] = useVerifyPhoneLoginMutation();

    const [loginMode, setLoginMode] = useState<"email" | "phone">("email");
    const [phoneStep, setPhoneStep] = useState<"input" | "otp">("input");
    const [mobileNumber, setMobileNumber] = useState("");
    const [otpValue, setOtpValue] = useState("");

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, result: 0 });
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset
    } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            email: "",
            mobileNumber: "",
            password: ""
        }
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

    const handleEmailLogin = async (data: LoginFormData) => {
        if (!data.email || !data.password) {
            setErrorMessage("Email and Password are required");
            return;
        }

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

            dispatch(setCredentials(result));
            window.location.href = searchParams.get("next") || routes.privateroute.DASHBOARD;
        } catch (error: any) {
            setErrorMessage(error?.data?.message || "Login failed");
            generateCaptcha();
        }
    };

    const handlePhonePasswordLogin = async (data: LoginFormData) => {
        if (!data.mobileNumber || !data.password) {
            setErrorMessage("Mobile Number and Password are required");
            return;
        }

        if (parseInt(captchaInput) !== captcha.result) {
            setCaptchaError("Incorrect answer. Please solve the math problem.");
            generateCaptcha();
            return;
        }

        try {
            const encryptedMobile = encryptData(data.mobileNumber);
            const encryptedPassword = encryptData(data.password);
            const result = await login({
                mobileNumber: encryptedMobile,
                password: encryptedPassword,
            }).unwrap();

            dispatch(setCredentials(result));
            window.location.href = searchParams.get("next") || routes.privateroute.DASHBOARD;
        } catch (error: any) {
            setErrorMessage(error?.data?.message || "Login failed");
            generateCaptcha();
        }
    };

    const handleSendPhoneOtp = async () => {
        if (!mobileNumber) {
            setErrorMessage("Please enter your mobile number");
            return;
        }
        try {
            setErrorMessage(null);
            await initiatePhoneLogin({ mobileNumber }).unwrap();
            setPhoneStep("otp");
            showSuccessToast("Verification code sent!");
        } catch (error: any) {
            setErrorMessage(error?.data?.message || "Failed to send OTP");
        }
    };

    const handleVerifyPhoneOtp = async (code: string) => {
        try {
            setErrorMessage(null);
            const result = await verifyPhoneLogin({ mobileNumber, otp: code }).unwrap();
            dispatch(setCredentials(result));
            window.location.href = searchParams.get("next") || routes.privateroute.DASHBOARD;
        } catch (error: any) {
            setErrorMessage(error?.data?.message || "Verification failed");
            setOtpValue("");
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setErrorMessage(null);
                const result = await googleLogin({ token: tokenResponse.access_token }).unwrap();
                dispatch(setCredentials(result));
                window.location.href = searchParams.get("next") || routes.privateroute.DASHBOARD;
            } catch (error: any) {
                // Stronger error message extraction
                const msg = 
                    error?.data?.message || 
                    error?.message || 
                    (typeof error?.data === 'string' ? error.data : null) ||
                    error?.data?.error ||
                    "Google login failed. Please register first.";
                
                setErrorMessage(msg);
            }
        },
        onError: () => setErrorMessage("Google login failed. Please try again."),
    });

    const onSubmit = (data: LoginFormData) => {
        if (loginMode === "email") {
            handleEmailLogin(data);
        } else {
            // By default, if password is provided in phone mode, attempt password login
            if (data.password && phoneStep === "input") {
                handlePhonePasswordLogin(data);
            } else if (phoneStep === "input") {
                handleSendPhoneOtp();
            }
        }
    };

    if (!isMounted || !isInitialized) {
        return (
            <div className="w-full space-y-8 animate-pulse">
                <div className="h-10 w-32 bg-slate-200 rounded-md" />
                <div className="h-4 w-64 bg-slate-100 rounded-md" />
                <div className="h-40 w-full bg-slate-50 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8 text-center sm:text-left">
                <h1 className="text-3xl font-semibold text-[#074463] tracking-tight">Login</h1>
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

                {/* Login Mode Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                        onClick={() => { setLoginMode("email"); setErrorMessage(null); }}
                        className={`flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${loginMode === "email" ? "bg-white text-[#3882a5] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        <MailIcon className="h-4 w-4" />
                        Email
                    </button>
                    <button
                        onClick={() => { setLoginMode("phone"); setErrorMessage(null); setPhoneStep("input"); }}
                        className={`flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${loginMode === "phone" ? "bg-white text-[#3882a5] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        <Smartphone className="h-4 w-4" />
                        Phone
                    </button>
                </div>

                {loginMode === "email" ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <InputField
                                label="Email Address"
                                type="email"
                                placeholder="name@company.com"
                                {...register("email")}
                                className="h-12 rounded-xl border-slate-200"
                                required
                                autoComplete="off"
                            />
                            <div className="space-y-1">
                                <InputField
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register("password")}
                                    className="h-12 rounded-xl border-slate-200"
                                    required
                                    autoComplete="new-password"
                                />
                                <div className="flex justify-end">
                                    <Link href={routes.publicroute.FORGOT_PASSWORD} className="text-[#3882a5] text-xs font-bold hover:underline opacity-80">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
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
                                <Button type="button" variant="outline" size="icon" onClick={generateCaptcha} className="h-12 w-12 rounded-xl bg-white">
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 rounded-xl font-semibold bg-[#3882a5] hover:bg-[#2c6a88]" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                            Sign In
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        {phoneStep === "input" ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <Controller
                                    name="mobileNumber"
                                    control={control}
                                    render={({ field }) => (
                                        <PhoneInputField
                                            label="Mobile Number"
                                            value={field.value || ""}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                setMobileNumber(val);
                                            }}
                                            error={errors.mobileNumber?.message}
                                            required
                                            className="w-full"
                                        />
                                    )}
                                />
                                <InputField
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register("password")}
                                    className="h-12 rounded-xl border-slate-200"
                                    autoComplete="current-password"
                                />

                                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
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
                                        <Button type="button" variant="outline" size="icon" onClick={generateCaptcha} className="h-12 w-12 rounded-xl bg-white">
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-xl font-semibold bg-[#3882a5] hover:bg-[#2c6a88]"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                        Sign In
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <button onClick={() => setPhoneStep("input")} className="flex items-center gap-2 text-sm font-bold text-[#3882a5] hover:underline">
                                    <ArrowLeft className="h-4 w-4" />
                                    Change Number
                                </button>
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-slate-500">Enter the 6-digit code sent to</p>
                                    <p className="font-bold text-[#074463]">{mobileNumber}</p>
                                </div>
                                <div className="flex justify-center py-2">
                                    <InputOTP
                                        maxLength={6}
                                        value={otpValue}
                                        onChange={(val) => {
                                            setOtpValue(val);
                                            if (val.length === 6) handleVerifyPhoneOtp(val);
                                        }}
                                    >
                                        <InputOTPGroup className="gap-2">
                                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                                <InputOTPSlot key={i} index={i} className="h-12 w-10 rounded-xl border-2 border-slate-200 font-bold" />
                                            ))}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                <Button
                                    onClick={() => handleVerifyPhoneOtp(otpValue)}
                                    className="w-full h-12 rounded-xl font-semibold bg-[#3882a5] hover:bg-[#2c6a88]"
                                    disabled={isVerifyingPhone || otpValue.length !== 6}
                                >
                                    {isVerifyingPhone ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                    Verify & Login
                                </Button>
                                <div className="text-center">
                                    <button onClick={handleSendPhoneOtp} disabled={isInitiatingPhone} className="text-sm font-bold text-[#3882a5] hover:underline">
                                        Resend Code
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
                    <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                        <span className="bg-white px-4 text-slate-400">Or continue with</span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-3 font-bold transition-all hover:border-[#3882a5] hover:text-[#3882a5]"
                    onClick={() => handleGoogleLogin()}
                    disabled={isLoading || isGoogleLoading}
                >
                    {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />}
                    {isGoogleLoading ? "Connecting..." : "Google Account"}
                </Button>

                <div className="text-center pt-2">
                    <p className="text-slate-500 text-sm font-medium">
                        Don't have an account?{" "}
                        <Link href={routes.publicroute.REGISTER} className="text-[#3882a5] font-semibold hover:underline">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

