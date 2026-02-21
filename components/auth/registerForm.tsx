"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputField } from "@/components/common/inputField";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/inputOtp";
import { useAppDispatch } from "@/store/hooks";
import { useRegisterMutation, useVerifyOtpMutation, useResendOtpMutation, useGoogleLoginMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { routes } from "@/utils/routes";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { CheckCircle, Mail, ArrowLeft } from "lucide-react";
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
    const [register, { isLoading }] = useRegisterMutation();
    const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
    const [resendOtp, { isLoading: isResendingOtp }] = useResendOtpMutation();
    const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<RegistrationStep>("form");
    const [userEmail, setUserEmail] = useState<string>("");
    const [otpError, setOtpError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);

    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, result: 0 });
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState<string | null>(null);

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

    useEffect(() => { }, [currentStep]);

    const {
        register: registerField,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<RegisterFormData>({
        resolver: yupResolver(registerSchema),
    });

    const [otpValue, setOtpValue] = useState<string>("");

    const {
        register: registerOtpField,
        handleSubmit: handleOtpSubmit,
        formState: { errors: otpErrors },
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
            const result = await register({
                email: encryptedEmail,
                password: encryptedPassword,
                companyName: "SafeIn User"
            }).unwrap();

            setUserEmail(data.email);
            setCurrentStep("otp");
        } catch (error: any) {
            let errorMessage = "Registration failed";

            if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            setSubmitError(errorMessage);
            generateCaptcha();
        }
    };

    const onOtpSubmit = async (data: OtpFormData) => {
        try {
            setOtpError(null);

            // Use otpValue state if form data is empty (for OTP component)
            const otpToVerify = data.otp || otpValue;

            if (!otpToVerify || otpToVerify.length !== 6) {
                setOtpError("Please enter a valid 6-digit OTP");
                return;
            }

            const result = await verifyOtp({
                email: userEmail,
                otp: otpToVerify,
            }).unwrap();

            setUser(result.user);
            setToken(result.token);
            dispatch(setCredentials({ user: result.user, token: result.token }));

            setCurrentStep("success");
            // After successful verification, redirect to dashboard
            // Free trial is now auto-assigned during registration
            const next = searchParams.get("next");
            const target = next || routes.privateroute.DASHBOARD;
            router.push(target);
        } catch (error: any) {
            let errorMessage = "OTP verification failed. Please try again.";

            if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            if (errorMessage.includes("expired")) {
                errorMessage = "OTP expired. Click Resend OTP.";
            } else if (errorMessage.includes("incorrect") || errorMessage.includes("invalid")) {
                errorMessage = "OTP incorrect. Please try again.";
            }

            setOtpError(errorMessage);
        }
    };

    const handleResendOtp = async () => {
        try {
            setOtpError(null);

            const result = await resendOtp({
                email: userEmail,
            }).unwrap();

            setOtpError(null);
            showSuccessToast("OTP resent to your email");
        } catch (error: any) {
            let errorMessage = "Failed to resend OTP. Please try again.";

            if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            setOtpError(errorMessage);
        }
    };

    const handleBackToForm = () => {
        setCurrentStep("form");
        setOtpError(null);
        setOtpValue("");
    };

    const handleOtpChange = async (value: string) => {
        setOtpValue(value);
        setOtpValueForm("otp", value, { shouldValidate: true });

        // Auto-verify when 6 digits are entered
        if (value.length === 6) {
            try {
                setOtpError(null);
                const result = await verifyOtp({
                    email: userEmail,
                    otp: value,
                }).unwrap();

                setUser(result.user);
                setToken(result.token);
                dispatch(setCredentials({ user: result.user, token: result.token }));

                setCurrentStep("success");
                const next = searchParams.get("next");
                const target = next || routes.privateroute.DASHBOARD;
                router.push(target);
            } catch (error: any) {
                let errorMessage = "OTP verification failed. Please try again.";

                if (error?.data?.message) {
                    errorMessage = error.data.message;
                } else if (error?.message) {
                    errorMessage = error.message;
                }

                if (errorMessage.includes("expired")) {
                    errorMessage = "OTP expired. Click Resend OTP.";
                } else if (errorMessage.includes("incorrect") || errorMessage.includes("invalid")) {
                    errorMessage = "OTP incorrect. Please try again.";
                }

                setOtpError(errorMessage);
                setOtpValue(""); // Clear OTP on error
            }
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
                    window.location.replace(target);
                }
            } catch (error: any) {
                setSubmitError(error?.data?.message || "Google registration failed");
            }
        },
        onError: () => setSubmitError("Google registration failed"),
    });

    const handleGoToLogin = () => {
        router.push(`${routes.publicroute.LOGIN}?message=Registration successful. Please login to continue.`);
    };

    const handleGoToDashboard = () => {
        // On success, send users to dashboard (free trial is auto-assigned during registration)
        const next = searchParams.get("next");
        const target = next || routes.privateroute.DASHBOARD;
        router.push(target);
    };

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
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                        {currentStep === "success"
                            ? "Registration Complete!"
                            : currentStep === "otp"
                                ? "Verify Your Email"
                                : "Create Account"}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {currentStep === "success"
                            ? "Your account has been successfully created"
                            : currentStep === "otp"
                                ? "Enter the OTP sent to your email"
                                : "Join thousands of users today"}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Error Messages */}
                {submitError && (
                    <Alert variant="destructive" className="border-red-100 bg-red-50 text-red-900 rounded-xl">
                        <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                )}

                {otpError && (
                    <Alert variant="destructive" className="border-red-100 bg-red-50 text-red-900 rounded-xl">
                        <AlertDescription>{otpError}</AlertDescription>
                    </Alert>
                )}

                {/* Success Message */}
                {currentStep === "success" && (
                    <Alert className="mb-4 border-green-200 bg-green-50 rounded-xl">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 font-medium">
                            OTP verified — your account is ready!
                        </AlertDescription>
                    </Alert>
                )}

                {/* OTP Sent Message */}
                {currentStep === "otp" && (
                    <Alert className="mb-4 border-[#3882a5]/20 bg-[#3882a5]/5 rounded-xl">
                        <Mail className="h-4 w-4 text-[#3882a5]" />
                        <AlertDescription className="text-[#074463] font-medium">
                            OTP sent to <span className="font-bold">{userEmail}</span>.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Registration Form */}
                {currentStep === "form" && (
                    <>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <InputField
                                    label="Email"
                                    type="email"
                                    placeholder="Enter your email"
                                    error={errors.email?.message}
                                    {...registerField("email")}
                                    required
                                    className="h-12 rounded-xl border-gray-200 focus:border-[#3882a5]"
                                />

                                <InputField
                                    label="Password"
                                    type="password"
                                    placeholder="Create a strong password"
                                    error={errors.password?.message}
                                    {...registerField("password")}
                                    required
                                    className="h-12 rounded-xl border-gray-200 focus:border-[#3882a5]"
                                />

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
                                            onClick={generateCaptcha}
                                            className="h-12 w-12 rounded-xl border-gray-200 hover:bg-gray-50 bg-white"
                                            title="Refresh Captcha"
                                        >
                                            🔄
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl font-bold bg-[#3882a5] hover:bg-[#2c6a88] text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                                disabled={isLoading || isGoogleLoading}
                            >
                                {isLoading ? "Creating account..." : "Register Now"}
                            </Button>
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
                    </>
                )}

                {/* OTP Verification Form */}
                {currentStep === "otp" && (
                    <div className="space-y-6">
                        <Button
                            variant="ghost"
                            onClick={handleBackToForm}
                            className="text-[#3882a5] hover:bg-[#3882a5]/10 font-semibold"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to registration
                        </Button>

                        <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-gray-700 block text-center">
                                    Enter 6-digit code
                                </label>
                                <div className="flex justify-center">
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
                                                    className="focus-within:border-[#3882a5] focus-within:ring-[#3882a5]/20 h-12 w-12 rounded-xl border-2 text-lg font-bold transition-all focus-within:ring-4 md:h-14 md:w-14"
                                                />
                                            ))}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                {otpError && <p className="text-destructive mt-1 text-sm text-center font-medium">{otpError}</p>}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl font-bold bg-[#3882a5] hover:bg-[#2c6a88]"
                                disabled={isVerifyingOtp || otpValue.length !== 6}
                            >
                                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                            </Button>
                        </form>

                        <div className="text-center">
                            <Button
                                variant="link"
                                onClick={handleResendOtp}
                                className="text-[#3882a5] font-semibold"
                                disabled={isResendingOtp}
                            >
                                {isResendingOtp ? "Resending..." : "Didn't receive code? Resend"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Success Step */}
                {currentStep === "success" && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-gray-600 text-lg">
                                Welcome aboard! Your account has been created successfully.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={handleGoToDashboard}
                                className="w-full h-12 rounded-xl font-bold bg-[#3882a5] hover:bg-[#2c6a88]"
                            >
                                Go to Dashboard
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleGoToLogin}
                                className="w-full h-12 rounded-xl border-gray-200"
                            >
                                Login Later
                            </Button>
                        </div>
                    </div>
                )}

                {/* Login Link */}
                {currentStep === "form" && (
                    <div className="text-center pt-2">
                        <p className="text-gray-600 text-sm">
                            Already have an account?{" "}
                            <Link
                                href={routes.publicroute.LOGIN}
                                className="text-[#3882a5] font-bold hover:underline"
                                prefetch={true}
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
