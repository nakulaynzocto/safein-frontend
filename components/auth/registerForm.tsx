"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputField } from "@/components/common/inputField";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/inputOtp";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRegisterMutation, useVerifyOtpMutation, useResendOtpMutation, useGoogleLoginMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { routes } from "@/utils/routes";
import { showSuccessToast } from "@/utils/toast";
import { CheckCircle, Mail, ArrowLeft, Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { encryptData } from "@/utils/crypto";

const registerSchema = yup.object({
    email: yup.string().email("Invalid email address").required("Email is required"),
    password: yup
        .string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
            "Password must contain at least one capital letter, one lower case letter, and one number"
        ),
});

const otpSchema = yup.object({
    otp: yup.string().required("OTP is required").length(6, "OTP must be 6 digits"),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;
type OtpFormData = yup.InferType<typeof otpSchema>;

type RegistrationStep = "form" | "otp" | "success";

export function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const { isAuthenticated, token, isInitialized } = useAppSelector((state) => state.auth);

    const [register, { isLoading }] = useRegisterMutation();
    const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
    const [resendOtp, { isLoading: isResendingOtp }] = useResendOtpMutation();
    const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<RegistrationStep>("form");
    const [userEmail, setUserEmail] = useState<string>("");
    const [otpError, setOtpError] = useState<string | null>(null);

    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, result: 0 });
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState<string | null>(null);

    // Handle redirection if already authenticated
    useEffect(() => {
        if (isInitialized && isAuthenticated && token && currentStep !== "success") {
            const next = searchParams.get("next");
            const target = next || routes.privateroute.DASHBOARD;
            router.replace(target);
        }
    }, [isInitialized, isAuthenticated, token, router, searchParams, currentStep]);

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

    const {
        register: registerField,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: yupResolver(registerSchema),
    });

    const [otpValue, setOtpValue] = useState<string>("");

    const {
        handleSubmit: handleOtpSubmit,
        setValue: setOtpValueForm,
    } = useForm<OtpFormData>({
        resolver: yupResolver(otpSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        if (parseInt(captchaInput) !== captcha.result) {
            setCaptchaError("Incorrect answer. Please solve the math problem.");
            generateCaptcha();
            return;
        }

        try {
            setSubmitError(null);
            const encryptedEmail = encryptData(data.email);
            const encryptedPassword = encryptData(data.password);
            await register({
                email: encryptedEmail,
                password: encryptedPassword,
                companyName: "SafeIn User"
            }).unwrap();

            setUserEmail(data.email);
            setCurrentStep("otp");
        } catch (error: any) {
            setSubmitError(error?.data?.message || error?.message || "Registration failed");
            generateCaptcha();
        }
    };

    const verifyOtpCode = async (code: string) => {
        try {
            setOtpError(null);
            const result = await verifyOtp({
                email: userEmail,
                otp: code,
            }).unwrap();

            dispatch(setCredentials({ user: result.user, token: result.token }));
            setCurrentStep("success");
            
            const next = searchParams.get("next");
            const target = next || routes.privateroute.DASHBOARD;
            router.replace(target);
        } catch (error: any) {
            let errorMessage = error?.data?.message || error?.message || "Verification failed";
            if (errorMessage.includes("expired")) errorMessage = "OTP expired. Please resend.";
            else if (errorMessage.includes("incorrect")) errorMessage = "Invalid OTP. Please try again.";
            
            setOtpError(errorMessage);
            setOtpValue("");
        }
    };

    const onOtpSubmit = async (data: OtpFormData) => {
        const otpToVerify = data.otp || otpValue;
        if (!otpToVerify || otpToVerify.length !== 6) {
            setOtpError("Please enter a valid 6-digit OTP");
            return;
        }
        await verifyOtpCode(otpToVerify);
    };

    const handleResendOtp = async () => {
        try {
            setOtpError(null);
            await resendOtp({ email: userEmail }).unwrap();
            showSuccessToast("OTP resent to your email");
        } catch (error: any) {
            setOtpError(error?.data?.message || "Failed to resend OTP");
        }
    };

    const handleBackToForm = () => {
        setCurrentStep("form");
        setOtpError(null);
        setOtpValue("");
    };

    const handleOtpChange = (value: string) => {
        setOtpValue(value);
        setOtpValueForm("otp", value, { shouldValidate: true });
        if (value.length === 6) {
            verifyOtpCode(value);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setSubmitError(null);
                const result = await googleLogin({
                    token: tokenResponse.access_token,
                }).unwrap();

                if (result.token && result.user) {
                    dispatch(setCredentials(result));
                    showSuccessToast("Registration successful with Google!");
                    const next = searchParams.get("next");
                    const target = next || routes.privateroute.DASHBOARD;
                    router.replace(target);
                }
            } catch (error: any) {
                setSubmitError(error?.data?.message || "Google registration failed");
            }
        },
        onError: () => setSubmitError("Google registration failed"),
    });

    if (!isInitialized) return null;

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Step Indicators could go here if needed */}
            
            <div className="space-y-6">
                {/* Registration Form */}
                {currentStep === "form" && (
                    <div className="animate-in fade-in duration-500">
                        <div className="mb-8 text-center sm:text-left">
                            <h1 className="text-3xl font-black text-[#074463] tracking-tight">Register</h1>
                            <p className="text-slate-500 mt-2 font-medium text-sm sm:text-base">
                                Join SafeIn and streamline your visitor management.
                            </p>
                        </div>

                        {submitError && (
                            <Alert variant="destructive" className="mb-6 border-red-100 bg-red-50 text-red-900 rounded-xl animate-in shake duration-500">
                                <AlertDescription className="font-medium">{submitError}</AlertDescription>
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

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-100" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                                <span className="bg-white px-4 text-slate-400">Or regiser with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <InputField
                                    label="Email Address"
                                    type="email"
                                    placeholder="name@company.com"
                                    error={errors.email?.message}
                                    {...registerField("email")}
                                    required
                                    className="h-12 rounded-xl border-slate-200 focus:ring-[#3882a5]/20 focus:border-[#3882a5]"
                                />

                                <InputField
                                    label="Create Password"
                                    type="password"
                                    placeholder="••••••••"
                                    error={errors.password?.message}
                                    {...registerField("password")}
                                    required
                                    className="h-12 rounded-xl border-slate-200 focus:ring-[#3882a5]/20 focus:border-[#3882a5]"
                                />

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
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl font-black bg-[#3882a5] hover:bg-[#2c6a88] text-white shadow-xl shadow-[#3882a5]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                disabled={isLoading || isGoogleLoading}
                            >
                                {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                                {isLoading ? "Creating account..." : "Register Now"}
                            </Button>
                        </form>

                        <div className="text-center pt-6">
                            <p className="text-slate-500 text-sm font-medium">
                                Already have an account?{" "}
                                <Link
                                    href={routes.publicroute.LOGIN}
                                    className="text-[#3882a5] font-black hover:underline"
                                    prefetch={true}
                                >
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>
                )}

                {/* OTP Verification Form */}
                {currentStep === "otp" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                        <Button
                            variant="ghost"
                            onClick={handleBackToForm}
                            className="text-[#3882a5] hover:bg-[#3882a5]/10 font-bold -ml-2 rounded-lg"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Edit Email
                        </Button>

                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl font-black text-[#074463] tracking-tight">Verify Email</h1>
                            <p className="text-slate-500 mt-2 font-medium">
                                Enter the 6-digit code sent to <span className="font-bold text-[#074463]">{userEmail}</span>
                            </p>
                        </div>

                        {otpError && (
                            <Alert variant="destructive" className="border-red-100 bg-red-50 text-red-900 rounded-xl">
                                <AlertDescription className="font-medium">{otpError}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-8">
                            <div className="flex justify-center py-4">
                                <InputOTP
                                    maxLength={6}
                                    value={otpValue}
                                    onChange={handleOtpChange}
                                    containerClassName="gap-2 md:gap-3"
                                >
                                    <InputOTPGroup className="gap-2 md:gap-3">
                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                            <InputOTPSlot
                                                key={index}
                                                index={index}
                                                className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2 border-slate-200 text-xl font-black text-[#074463] transition-all focus-within:border-[#3882a5] focus-within:ring-4 focus-within:ring-[#3882a5]/10"
                                            />
                                        ))}
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl font-black bg-[#3882a5] hover:bg-[#2c6a88] text-white shadow-xl shadow-[#3882a5]/20 flex items-center justify-center gap-2"
                                disabled={isVerifyingOtp || otpValue.length !== 6}
                            >
                                {isVerifyingOtp && <Loader2 className="h-5 w-5 animate-spin" />}
                                {isVerifyingOtp ? "Verifying..." : "Verify & Continue"}
                            </Button>
                        </form>

                        <div className="text-center pt-4">
                            <p className="text-slate-500 text-sm font-medium">
                                Didn't receive code?{" "}
                                <button
                                    onClick={handleResendOtp}
                                    disabled={isResendingOtp}
                                    className="text-[#3882a5] font-black hover:underline disabled:opacity-50"
                                >
                                    {isResendingOtp ? "Sending..." : "Resend OTP"}
                                </button>
                            </p>
                        </div>
                    </div>
                )}

                {/* Success Step (Temporary while redirecting) */}
                {currentStep === "success" && (
                    <div className="animate-in zoom-in duration-500 flex flex-col items-center justify-center py-12 text-center space-y-6">
                        <div className="h-24 w-24 rounded-full bg-[#3882a5]/5 flex items-center justify-center border-4 border-[#3882a5]/10">
                            <CheckCircle className="h-12 w-12 text-[#3882a5]" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-[#074463]">Welcome Aboard!</h1>
                            <p className="text-slate-500 font-medium max-w-xs">
                                Your account is verified. Redirecting you to the dashboard...
                            </p>
                        </div>
                        <Loader2 className="h-8 w-8 animate-spin text-[#3882a5] opacity-20" />
                    </div>
                )}
            </div>
        </div>
    );
}

