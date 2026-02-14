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
import { useRegisterMutation, useVerifyOtpMutation, useResendOtpMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { routes } from "@/utils/routes";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { CheckCircle, Mail, ArrowLeft } from "lucide-react";
import { encryptData } from "@/utils/crypto";

const registerSchema = yup.object({
    companyName: yup.string().required("Company name is required"),
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
            const enctyptedCompanyNmae = encryptData(data.companyName);
            const result = await register({
                email: encryptedEmail,
                password: encryptedPassword,
                companyName: enctyptedCompanyNmae
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
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mb-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(routes.publicroute.HOME)}
                        className="text-muted-foreground hover:bg-[#3882a5] hover:text-white"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div className="flex flex-1 justify-center">
                        <img src="/aynzo-logo.svg" alt="Aynzo Logo" className="h-10 w-auto" />
                    </div>
                    <div className="w-20"></div>
                </div>
                <CardTitle className="text-brand text-2xl">
                    {currentStep === "success"
                        ? "Registration Complete!"
                        : currentStep === "otp"
                            ? "Verify Your Email"
                            : "Sign Up"}
                </CardTitle>
                <CardDescription>
                    {currentStep === "success"
                        ? "Your account has been successfully created"
                        : currentStep === "otp"
                            ? "Enter the OTP sent to your email"
                            : "Sign up for your account"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Error Messages */}
                {submitError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                )}

                {otpError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{otpError}</AlertDescription>
                    </Alert>
                )}

                {/* Success Message */}
                {currentStep === "success" && (
                    <Alert className="mb-4 border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            OTP verified — your account has been created.
                        </AlertDescription>
                    </Alert>
                )}

                {/* OTP Sent Message */}
                {currentStep === "otp" && (
                    <Alert className="mb-4 border-[#3882a5]/20 bg-[#3882a5]/5">
                        <Mail className="h-4 w-4 text-[#3882a5]" />
                        <AlertDescription className="text-[#074463]">
                            OTP sent to {userEmail}. Please enter it below to complete registration.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Registration Form */}
                {currentStep === "form" && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <InputField
                                label="Company Name"
                                placeholder="Enter your company name"
                                error={errors.companyName?.message}
                                {...registerField("companyName")}
                                required
                            />

                            <InputField
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                                error={errors.email?.message}
                                {...registerField("email")}
                                required
                            />

                            <InputField
                                label="Password"
                                type="password"
                                placeholder="Create a password"
                                error={errors.password?.message}
                                {...registerField("password")}
                                required
                            />

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Security Check: {captcha.num1} + {captcha.num2} = ?
                                </label>
                                <div className="flex gap-2">
                                    <InputField
                                        placeholder="Answer"
                                        type="number"
                                        value={captchaInput}
                                        onChange={(e) => setCaptchaInput(e.target.value)}
                                        error={captchaError || undefined}
                                        className="flex-1 h-12 rounded-xl"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={generateCaptcha}
                                        className="h-12 w-12 rounded-xl"
                                        title="Refresh Captcha"
                                    >
                                        🔄
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" variant="primary" className="w-full h-12 rounded-xl font-bold" disabled={isLoading}>
                            {isLoading ? "Registering..." : "Register"}
                        </Button>
                    </form>
                )}

                {/* OTP Verification Form */}
                {currentStep === "otp" && (
                    <div className="space-y-6">
                        <Button variant="ghost" onClick={handleBackToForm} className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Registration
                        </Button>

                        <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Enter Verification Code
                                </label>
                                <div className="flex justify-center">
                                    <InputOTP
                                        maxLength={6}
                                        value={otpValue}
                                        onChange={handleOtpChange}
                                        containerClassName="gap-2 md:gap-3"
                                    >
                                        <InputOTPGroup className="gap-2 md:gap-3">
                                            <InputOTPSlot
                                                index={0}
                                                className="focus-within:border-primary focus-within:ring-primary/20 h-12 w-12 rounded-lg border-2 text-lg font-semibold transition-all focus-within:ring-2 md:h-14 md:w-14 md:text-xl"
                                            />
                                            <InputOTPSlot
                                                index={1}
                                                className="focus-within:border-primary focus-within:ring-primary/20 h-12 w-12 rounded-lg border-2 text-lg font-semibold transition-all focus-within:ring-2 md:h-14 md:w-14 md:text-xl"
                                            />
                                            <InputOTPSlot
                                                index={2}
                                                className="focus-within:border-primary focus-within:ring-primary/20 h-12 w-12 rounded-lg border-2 text-lg font-semibold transition-all focus-within:ring-2 md:h-14 md:w-14 md:text-xl"
                                            />
                                            <InputOTPSlot
                                                index={3}
                                                className="focus-within:border-primary focus-within:ring-primary/20 h-12 w-12 rounded-lg border-2 text-lg font-semibold transition-all focus-within:ring-2 md:h-14 md:w-14 md:text-xl"
                                            />
                                            <InputOTPSlot
                                                index={4}
                                                className="focus-within:border-primary focus-within:ring-primary/20 h-12 w-12 rounded-lg border-2 text-lg font-semibold transition-all focus-within:ring-2 md:h-14 md:w-14 md:text-xl"
                                            />
                                            <InputOTPSlot
                                                index={5}
                                                className="focus-within:border-primary focus-within:ring-primary/20 h-12 w-12 rounded-lg border-2 text-lg font-semibold transition-all focus-within:ring-2 md:h-14 md:w-14 md:text-xl"
                                            />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                {otpErrors.otp?.message && (
                                    <p className="text-destructive mt-1 text-sm">{otpErrors.otp.message}</p>
                                )}
                                {otpError && <p className="text-destructive mt-1 text-sm">{otpError}</p>}
                                <p className="text-muted-foreground mt-2 text-center text-xs">
                                    Enter the 6-digit code sent to your email
                                </p>
                            </div>

                            <Button type="submit" variant="primary" className="w-full" disabled={isVerifyingOtp || otpValue.length !== 6}>
                                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                            </Button>
                        </form>

                        <div className="text-center">
                            <Button
                                variant="link"
                                onClick={handleResendOtp}
                                className="text-sm"
                                disabled={isResendingOtp}
                            >
                                {isResendingOtp ? "Resending..." : "Didn't receive OTP? Resend"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Success Step */}
                {currentStep === "success" && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="mb-4 text-sm text-gray-600">
                                Your account has been created successfully! You can now access your dashboard or login
                                later.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button onClick={handleGoToDashboard} variant="primary" className="flex-1">
                                Go to Dashboard
                            </Button>
                            <Button variant="outline" onClick={handleGoToLogin} className="flex-1">
                                Login Later
                            </Button>
                        </div>
                    </div>
                )}

                {/* Login Link */}
                {currentStep === "form" && (
                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground text-sm">
                            Already have an account?{" "}
                            <Link
                                href={routes.publicroute.LOGIN}
                                className="text-primary hover:underline"
                                prefetch={true}
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
