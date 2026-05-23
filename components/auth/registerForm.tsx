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
import { PhoneInputField } from "@/components/common/phoneInputField";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/inputOtp";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    useSendEmailOtpMutation,
    useSendMobileOtpMutation,
    useVerifyRegistrationOtpMutation,
    useFinalizeRegistrationMutation,
} from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { routes } from "@/utils/routes";
import { showSuccessToast } from "@/utils/toast";
import { CheckCircle, Mail, ArrowLeft, Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { encryptData } from "@/utils/crypto";
import { Controller } from "react-hook-form";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { CountryStateCitySelect } from "@/components/common/countryStateCity";
import { Building2, MapPin, Building, Globe, Send } from "lucide-react";
import { useUserCountry } from "@/hooks/useUserCountry";

const registerSchema = yup.object({
    email: yup.string().email("Invalid email address").required("Email is required"),
    mobileNumber: yup.string().required("Mobile number is required").matches(/^[0-9+]+$/, "Invalid mobile number"),
    password: yup
        .string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
            "Password must contain at least one capital letter, one lower case letter, and one number"
        ),
    companyName: yup.string().required("Company name is required"),
    street: yup.string().required("Address is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    pincode: yup
        .string()
        .required("Pincode is required")
        .matches(/^[0-9]{6}$/, "Pincode must be 6 digits"),
    country: yup.string().required("Country is required"),
    profilePicture: yup.string().required(),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;
type RegistrationStep = "account" | "details" | "success";

export function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const { isAuthenticated, token, isInitialized } = useAppSelector((state) => state.auth);

    const [sendEmailOtp, { isLoading: isSendingEmailOtp }] = useSendEmailOtpMutation();
    const [sendMobileOtp, { isLoading: isSendingMobileOtp }] = useSendMobileOtpMutation();
    const [verifyRegistrationOtp, { isLoading: isVerifyingOtp }] = useVerifyRegistrationOtpMutation();
    const [finalizeRegistration, { isLoading: isFinalizing }] = useFinalizeRegistrationMutation();

    const [submitError, setSubmitError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<RegistrationStep>("account");

    // Email verification state
    const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [emailOtp, setEmailOtp] = useState("");

    // Mobile verification state
    const [isMobileOtpSent, setIsMobileOtpSent] = useState(false);
    const [isMobileVerified, setIsMobileVerified] = useState(false);
    const [mobileOtp, setMobileOtp] = useState("");

    const [otpError, setOtpError] = useState<string | null>(null);
    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, result: 0 });
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    const userCountry = useUserCountry();

    const {
        register: registerField,
        handleSubmit,
        getValues,
        control,
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: yupResolver(registerSchema),
        defaultValues: {
            email: "",
            mobileNumber: "",
            password: "",
            companyName: "",
            street: "",
            city: "",
            state: "",
            pincode: "",
            country: "",
            profilePicture: ""
        }
    });

    useEffect(() => {
        if (userCountry && !getValues("country")) {
            setValue("country", userCountry);
        }
    }, [userCountry, setValue, getValues]);

    const watchedEmail = watch("email");
    const watchedMobile = watch("mobileNumber");
    const watchedPassword = watch("password");

    useEffect(() => {
        setIsMounted(true);
    }, []);

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

    // Live Captcha Validation
    useEffect(() => {
        if (captchaInput && captchaInput !== String(captcha.result)) {
            // Only show error if the user has typed at least the same number of digits as the result
            // or if they've typed more. This prevents showing error while they are still typing the first digit.
            if (captchaInput.length >= String(captcha.result).length) {
                setCaptchaError("Incorrect security answer");
            } else {
                setCaptchaError(null);
            }
        } else {
            setCaptchaError(null);
        }
    }, [captchaInput, captcha.result]);

    // ──── Independent OTP Handlers ────────────────────────────────────────

    const handleSendEmailOtp = async () => {
        const values = getValues();
        if (!values.email) { setSubmitError("Please enter your email address first"); return; }
        try {
            setSubmitError(null);
            setOtpError(null); // Clear previous errors
            setEmailOtp("");   // Clear old OTP digits
            await sendEmailOtp({
                email: encryptData(values.email),
                password: values.password ? encryptData(values.password) : undefined,
                mobileNumber: values.mobileNumber ? encryptData(values.mobileNumber) : undefined,
                companyName: encryptData("SafeIn User"),
            }).unwrap();
            setIsEmailOtpSent(true);
            showSuccessToast("OTP sent to your email address!");
        } catch (error: any) {
            setSubmitError(error?.data?.message || "Failed to send email OTP");
        }
    };

    const handleSendMobileOtp = async () => {
        const values = getValues();
        if (!values.mobileNumber) { setSubmitError("Please enter your mobile number first"); return; }
        if (!values.email) { setSubmitError("Please enter your email address first"); return; }
        try {
            setSubmitError(null);
            setOtpError(null); // Clear previous errors
            setMobileOtp("");  // Clear old OTP digits
            await sendMobileOtp({
                email: encryptData(values.email),
                mobileNumber: encryptData(values.mobileNumber),
                password: values.password ? encryptData(values.password) : undefined,
                companyName: encryptData("SafeIn User"),
            }).unwrap();
            setIsMobileOtpSent(true);
            showSuccessToast("OTP sent to your mobile number via SMS!");
        } catch (error: any) {
            setSubmitError(error?.data?.message || "Failed to send mobile OTP");
        }
    };

    const handleVerifyEmailOtp = async () => {
        const values = getValues();
        try {
            setOtpError(null);
            await verifyRegistrationOtp({ email: values.email, otp: emailOtp, type: "email" }).unwrap();
            setIsEmailVerified(true);
            setIsEmailOtpSent(false);
            showSuccessToast("Email verified successfully! ✓");
        } catch (error: any) {
            setOtpError(error?.data?.message || "Incorrect email OTP");
        }
    };

    const handleVerifyMobileOtp = async () => {
        const values = getValues();
        try {
            setOtpError(null);
            await verifyRegistrationOtp({ email: values.email, otp: mobileOtp, type: "mobile" }).unwrap();
            setIsMobileVerified(true);
            setIsMobileOtpSent(false);
            showSuccessToast("Mobile number verified successfully! ✓");
        } catch (error: any) {
            setOtpError(error?.data?.message || "Incorrect mobile OTP");
        }
    };

    const handleFinalizeRegistration = async () => {
        if (!isEmailVerified || !isMobileVerified) {
            setSubmitError("Please verify both email and mobile number first");
            return;
        }

        const values = getValues();
        try {
            setSubmitError(null);
            
            const registrationData = {
                email: values.email,
                mobileNumber: values.mobileNumber,
                password: encryptData(values.password),
                companyName: values.companyName,
                profilePicture: values.profilePicture,
                address: {
                    street: values.street,
                    city: values.city,
                    state: values.state,
                    pincode: values.pincode,
                    country: values.country,
                }
            };

            const result = await finalizeRegistration(registrationData).unwrap();
            dispatch(setCredentials(result));
            setCurrentStep("success");
            showSuccessToast("Registration complete! Welcome to SafeIn.");
        } catch (error: any) {
            setSubmitError(error?.data?.message || "Finalization failed");
        }
    };

    const handleContinueToDetails = async () => {
        const isAccountValid = await trigger(["email", "mobileNumber", "password"]);
        if (!isAccountValid) return;

        if (!isEmailVerified || !isMobileVerified) {
            setSubmitError("Please verify both email and mobile number first");
            return;
        }

        setCurrentStep("details");
    };

    if (!isMounted || !isInitialized) {
        return (
            <div className="w-full space-y-8 animate-pulse">
                <div className="space-y-3">
                    <div className="h-10 w-32 bg-slate-200 rounded-md" />
                    <div className="h-4 w-64 bg-slate-100 rounded-md" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-6">
                {currentStep === "account" && (
                    <div className="animate-in fade-in duration-500">
                        <div className="mb-8 text-center sm:text-left">
                            <h1 className="text-3xl font-semibold text-[#074463] tracking-tight">Create Account</h1>
                            <p className="text-slate-500 mt-2 font-medium text-sm sm:text-base">
                                Step 1: Verify your identity to get started.
                            </p>
                        </div>

                        {submitError && (
                            <Alert variant="destructive" className="mb-6 border-red-100 bg-red-50 text-red-900 rounded-xl animate-in shake duration-500">
                                <AlertDescription className="font-medium">{submitError}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex gap-2 items-start">
                                        <div className="flex-1">
                                            <InputField
                                                label="Email Address"
                                                type="email"
                                                placeholder="name@company.com"
                                                error={errors.email?.message}
                                                {...registerField("email")}
                                                required
                                                disabled={isEmailVerified}
                                                autoComplete="off"
                                                className="h-12 rounded-xl border-slate-200"
                                            />
                                        </div>
                                        <div className="pt-6 shrink-0">
                                            {isEmailVerified ? (
                                                <span className="inline-flex items-center h-12 px-3 text-emerald-600 bg-emerald-50 rounded-xl text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">✓ Verified</span>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleSendEmailOtp}
                                                    className="h-12 px-4 rounded-xl border-[#3882a5] text-[#3882a5] font-bold text-xs hover:bg-[#3882a5] hover:text-white transition-all disabled:opacity-30 disabled:border-slate-200 disabled:text-slate-400"
                                                    disabled={isSendingEmailOtp || !watchedEmail}
                                                >
                                                    {isSendingEmailOtp ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {isEmailOtpSent && !isEmailVerified && (
                                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                            <div className="flex gap-2">
                                                <InputOTP maxLength={6} value={emailOtp} onChange={setEmailOtp}>
                                                    <InputOTPGroup className="gap-1">
                                                        {[0, 1, 2, 3, 4, 5].map((i) => (
                                                            <InputOTPSlot key={i} index={i} className="h-9 w-8 text-xs rounded-lg border-slate-200" />
                                                        ))}
                                                    </InputOTPGroup>
                                                </InputOTP>
                                                <Button
                                                    type="button"
                                                    onClick={handleVerifyEmailOtp}
                                                    className="h-9 bg-[#3882a5] text-white px-3 rounded-lg text-xs font-bold"
                                                    disabled={emailOtp.length !== 6 || isVerifyingOtp}
                                                >
                                                    {isVerifyingOtp ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify OTP"}
                                                </Button>
                                            </div>
                                            {otpError && (
                                                <p className="text-[11px] font-bold text-red-500 animate-in shake duration-300">
                                                    ✕ {otpError}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex gap-2 items-start">
                                        <div className="flex-1">
                                            <Controller
                                                name="mobileNumber"
                                                control={control}
                                                render={({ field }) => (
                                                    <PhoneInputField
                                                        label="Mobile Number"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        error={errors.mobileNumber?.message}
                                                        required
                                                        disabled={isMobileVerified}
                                                        className="w-full"
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="pt-6 shrink-0">
                                            {isMobileVerified ? (
                                                <span className="inline-flex items-center h-12 px-3 text-emerald-600 bg-emerald-50 rounded-xl text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">✓ Verified</span>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleSendMobileOtp}
                                                    className="h-12 px-4 rounded-xl border-[#3882a5] text-[#3882a5] font-bold text-xs hover:bg-[#3882a5] hover:text-white transition-all disabled:opacity-30 disabled:border-slate-200 disabled:text-slate-400"
                                                    disabled={isSendingMobileOtp || !watchedMobile || !watchedEmail}
                                                >
                                                    {isSendingMobileOtp ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {isMobileOtpSent && !isMobileVerified && (
                                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                            <div className="flex gap-2">
                                                <InputOTP maxLength={6} value={mobileOtp} onChange={setMobileOtp}>
                                                    <InputOTPGroup className="gap-1">
                                                        {[0, 1, 2, 3, 4, 5].map((i) => (
                                                            <InputOTPSlot key={i} index={i} className="h-9 w-8 text-xs rounded-lg border-slate-200" />
                                                        ))}
                                                    </InputOTPGroup>
                                                </InputOTP>
                                                <Button
                                                    type="button"
                                                    onClick={handleVerifyMobileOtp}
                                                    className="h-9 bg-[#3882a5] text-white px-3 rounded-lg text-xs font-bold"
                                                    disabled={mobileOtp.length !== 6 || isVerifyingOtp}
                                                >
                                                    {isVerifyingOtp ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify OTP"}
                                                </Button>
                                            </div>
                                            {otpError && (
                                                <p className="text-[11px] font-bold text-red-500 animate-in shake duration-300">
                                                    ✕ {otpError}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 items-start">
                                    <div className="flex-1">
                                        <InputField
                                            label="Create Password"
                                            type="password"
                                            placeholder="••••••••"
                                            error={errors.password?.message}
                                            {...registerField("password")}
                                            required
                                            autoComplete="new-password"
                                            className="h-12 rounded-xl border-slate-200"
                                        />
                                    </div>
                                    {/* Placeholder to match Verify button width */}
                                    <div className="pt-6 shrink-0">
                                        <div className="h-12 w-[76px]" />
                                    </div>
                                </div>

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
                                        <Button type="button" variant="outline" size="icon" onClick={generateCaptcha} className="h-12 w-12 rounded-xl bg-white shadow-sm border-slate-200">
                                            <RefreshCw className="h-4 w-4 text-slate-400" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="button"
                                onClick={handleContinueToDetails}
                                className="w-full h-12 rounded-xl font-semibold bg-[#3882a5] hover:bg-[#2c6a88] text-white shadow-xl shadow-[#3882a5]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                disabled={!isEmailVerified || !isMobileVerified || !watchedPassword || captchaInput !== String(captcha.result)}
                            >
                                Continue to Company Details
                            </Button>

                            <p className="text-center text-sm text-slate-500 font-medium">
                                Already have an account?{" "}
                                <Link href={routes.publicroute.LOGIN} className="text-[#3882a5] font-bold hover:underline transition-all">
                                    Login here
                                </Link>
                            </p>
                        </div>
                    </div>
                )}

                {currentStep === "details" && (
                    <div className="animate-in slide-in-from-right-4 duration-500">
                        <div className="mb-8 text-center sm:text-left">
                            <button 
                                onClick={() => setCurrentStep("account")}
                                className="flex items-center gap-2 text-sm font-bold text-[#3882a5] mb-4 hover:translate-x-[-4px] transition-transform"
                            >
                                <ArrowLeft className="h-4 w-4" /> Back to Account
                            </button>
                            <h1 className="text-3xl font-semibold text-[#074463] tracking-tight">Company Details</h1>
                            <p className="text-slate-500 mt-2 font-medium text-sm sm:text-base">
                                Step 2: Finalize your profile setup.
                            </p>
                        </div>

                        {submitError && (
                            <Alert variant="destructive" className="mb-6 border-red-100 bg-red-50 text-red-900 rounded-xl">
                                <AlertDescription className="font-medium">{submitError}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit(handleFinalizeRegistration)} className="space-y-6">
                            <div className="flex flex-col items-center mb-6">
                                <ImageUploadField
                                    name="profilePicture"
                                    label="Profile Picture"
                                    setValue={setValue}
                                    variant="avatar"
                                    errors={errors.profilePicture}
                                    className="mb-2"
                                    isRegistration={true}
                                />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommended: Square image</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2">
                                    <InputField
                                        label="Company Name"
                                        placeholder="e.g. Acme Corporation"
                                        icon={<Building2 className="w-4 h-4" />}
                                        error={errors.companyName?.message}
                                        {...registerField("companyName")}
                                        required
                                        className="h-12 rounded-xl border-slate-200"
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <CountryStateCitySelect
                                        value={{
                                            country: watch("country") || "",
                                            state: watch("state") || "",
                                            city: watch("city") || "",
                                        }}
                                        onChange={(val) => {
                                            setValue("country", val.country, { shouldValidate: true });
                                            setValue("state", val.state, { shouldValidate: true });
                                            setValue("city", val.city, { shouldValidate: true });
                                        }}
                                        errors={{
                                            country: errors.country?.message,
                                            state: errors.state?.message,
                                            city: errors.city?.message,
                                        }}
                                        required
                                    />
                                </div>

                                <div className="col-span-1">
                                    <InputField
                                        label="Pincode"
                                        placeholder="e.g. 123456"
                                        error={errors.pincode?.message}
                                        {...registerField("pincode")}
                                        required
                                        className="h-12 rounded-xl border-slate-200"
                                    />
                                </div>

                                <div className="col-span-1">
                                    <InputField
                                        label="Street Address"
                                        placeholder="Building, Street name..."
                                        icon={<MapPin className="w-4 h-4" />}
                                        error={errors.street?.message}
                                        {...registerField("street")}
                                        required
                                        className="h-12 rounded-xl border-slate-200"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 rounded-xl font-bold bg-[#3882a5] hover:bg-[#2c6a88] text-white shadow-xl shadow-[#3882a5]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
                                disabled={isFinalizing}
                            >
                                {isFinalizing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-5 w-5" />}
                                {isFinalizing ? "Creating account..." : "Join SafeIn Now"}
                            </Button>
                        </form>
                    </div>
                )}

                {currentStep === "success" && (
                    <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 text-emerald-500 mb-4 ring-8 ring-emerald-50/50">
                            <CheckCircle className="w-12 h-12" />
                        </div>
                        <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Welcome Aboard!</h2>
                        <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed">
                            Your account and company profile have been successfully set up.
                        </p>
                        <div className="pt-6">
                            <Button
                                onClick={() => router.replace(routes.privateroute.DASHBOARD)}
                                className="h-14 px-12 rounded-2xl bg-[#3882a5] hover:bg-[#2c6a88] text-white font-bold text-lg shadow-2xl shadow-[#3882a5]/30 transition-all hover:scale-105 active:scale-95"
                            >
                                Go to Dashboard
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

