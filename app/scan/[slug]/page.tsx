"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import {
    useGetPublicCompanyInfoQuery,
    useSendQrPhoneOtpMutation,
    useVerifyQrPhoneOtpMutation,
    useCreateVisitorThroughQRMutation,
    useCreateAppointmentThroughQRMutation,
} from "@/store/api/qrSetupApi";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    CheckCircle2, 
    ShieldCheck,
    ArrowLeft,
    ArrowRight,
    Camera,
    User,
    Briefcase,
    Building2,
    CalendarClock,
    FileText,
    Home,
    MessageCircle,
    Clock,
    Mail,
    MapPin,
    Phone,
    User2,
} from "lucide-react";
import { StatusPage } from "@/components/common/statusPage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { extractIdString, isValidId } from "@/utils/idExtractor";
import { cn } from "@/lib/utils";
import { SuccessState } from "@/components/common/SuccessState";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { Label } from "@/components/ui/label";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { validatePhone, formatPhoneForSubmission } from "@/utils/phoneUtils";
import { useUserCountry } from "@/hooks/useUserCountry";
import { AppointmentBookingForm } from "@/components/appointment/AppointmentBookingForm";
import { BookingVisitorForm } from "@/components/appointment/BookingVisitorForm";
import { OtpDigitBoxes } from "@/components/common/otpDigitBoxes";

function FormSkeleton({ title }: { title: string }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-48" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                ))}
            </div>
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="flex justify-end pt-4">
                <Skeleton className="h-11 w-40 rounded-xl" />
            </div>
        </div>
    );
}

export default function QRScanPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [step, setStep] = useState<
        "loading" | "verify_phone" | "details" | "photo" | "appointment" | "review" | "success" | "error"
    >("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
    const [otpSent, setOtpSent] = useState(false);
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [visitorData, setVisitorData] = useState<any>(null);
    const [visitorDraft, setVisitorDraft] = useState<any>(null);
    const [appointmentDraft, setAppointmentDraft] = useState<any>(null);
    const [appointmentFormDraft, setAppointmentFormDraft] = useState<any>(null);
    const [submittedAppointmentId, setSubmittedAppointmentId] = useState<string | null>(null);
    const [isPhotoUploading, setIsPhotoUploading] = useState(false);
    /** Inline under mobile (409 from API) — not shown as toast */
    const [phoneStepNotice, setPhoneStepNotice] = useState("");
    const defaultCountry = useUserCountry();

    const {
        control: verifyControl,
        register: verifyRegister,
        handleSubmit: handleVerifySubmit,
        watch: watchVerifyPhone,
        reset: resetVerifyForm,
    } = useForm<{ phone: string; otp: string }>({
        defaultValues: { phone: "", otp: "" },
    });

    const {
        register: photoRegister,
        setValue: setPhotoValue,
        handleSubmit: handlePhotoSubmit,
        watch: watchPhoto,
        reset: resetPhotoForm,
        formState: { errors: photoErrors },
    } = useForm<{ photo: string }>({
        defaultValues: { photo: "" },
    });

    /** Return to step 1 on the same QR URL (fresh check-in). */
    const restartQrBookingFlow = useCallback(() => {
        setVerifiedPhone(null);
        setOtpSent(false);
        setVisitorId(null);
        setVisitorData(null);
        setVisitorDraft(null);
        setAppointmentDraft(null);
        setAppointmentFormDraft(null);
        setSubmittedAppointmentId(null);
        setIsPhotoUploading(false);
        resetVerifyForm({ phone: "", otp: "" });
        resetPhotoForm({ photo: "" });
        setPhoneStepNotice("");
        setStep("verify_phone");
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [resetVerifyForm, resetPhotoForm]);

    const watchedVerifyPhone = watchVerifyPhone("phone");
    useEffect(() => {
        setPhoneStepNotice("");
    }, [watchedVerifyPhone]);

    const {
        data: companyInfo,
        isLoading: isLoadingInfo,
        error: infoError,
    } = useGetPublicCompanyInfoQuery(slug, { 
        skip: !slug,
    });

    const [createVisitor, { isLoading: isCreatingVisitor }] = useCreateVisitorThroughQRMutation();
    const [createAppointment, { isLoading: isCreatingAppointment }] = useCreateAppointmentThroughQRMutation();
    const [sendQrOtp, { isLoading: isSendingOtp }] = useSendQrPhoneOtpMutation();
    const [verifyQrOtp, { isLoading: isVerifyingOtp }] = useVerifyQrPhoneOtpMutation();

    useEffect(() => {
        if (!slug) {
            setErrorMessage("Invalid QR code - company ID is missing");
            setStep("error");
            return;
        }

        if (infoError) {
            const error = infoError as any;
            setErrorMessage(error?.data?.message || "Company not found or inactive.");
            setStep("error");
            return;
        }

        if (companyInfo) {
            setStep((s) => (s === "loading" ? "verify_phone" : s));
        }
    }, [companyInfo, infoError, slug]);

    const onSendOtp = async () => {
        if (!slug) return;
        const raw = watchVerifyPhone("phone");
        if (!validatePhone(raw)) {
            showErrorToast("Please enter a valid phone number with country code.");
            return;
        }
        try {
            const phone = formatPhoneForSubmission(raw);
            await sendQrOtp({ slug, phone }).unwrap();
            setOtpSent(true);
            showSuccessToast("Verification code sent to your WhatsApp.");
        } catch (e: any) {
            const status = e?.status ?? e?.data?.statusCode;
            const msg =
                e?.data?.message ||
                e?.message ||
                "Could not send code.";
            if (status === 409) {
                setPhoneStepNotice(msg);
                return;
            }
            showErrorToast(msg);
        }
    };

    const onVerifyOtpSubmit = async (data: { phone: string; otp: string }) => {
        if (!slug) return;
        if (!validatePhone(data.phone)) {
            showErrorToast("Please enter a valid phone number.");
            return;
        }
        const phone = formatPhoneForSubmission(data.phone);
        const otp = data.otp?.replace(/\D/g, "").trim() || "";
        if (!/^\d{6}$/.test(otp)) {
            showErrorToast("Enter the 6-digit code sent to your WhatsApp.");
            return;
        }
        try {
            const response = await verifyQrOtp({ slug, phone, otp }).unwrap();
            setVerifiedPhone(phone);
            
            if (response.visitor) {
                // Pre-fill existing visitor data
                const visitorInfo = {
                    ...response.visitor,
                    phone: phone, // ensure it uses the verified phone
                };
                setVisitorDraft(visitorInfo);
                setVisitorData(visitorInfo);
                setPhotoValue("photo", visitorInfo.photo || "");

                const photoEnabled = companyInfo?.features?.enableVisitorImageCapture ?? false;
                
                if (photoEnabled) {
                    setStep("photo");
                    showSuccessToast(`Welcome back, ${visitorInfo.name}! Please take a fresh photo.`);
                } else {
                    setStep("appointment");
                    showSuccessToast(`Welcome back, ${visitorInfo.name}!`);
                }
            } else {
                setStep("details");
                showSuccessToast("Phone verified. Please complete your details.");
            }
        } catch (e: any) {
            const status = e?.status ?? e?.data?.statusCode;
            const msg = e?.data?.message || e?.message || "Verification failed.";
            if (status === 409) {
                setPhoneStepNotice(msg);
                return;
            }
            showErrorToast(msg);
        }
    };

    const handleVisitorDetailsSubmit = async (data: any) => {
        setVisitorDraft(data);
        setPhotoValue("photo", data?.photo || "");
        // Skip photo step if the feature is disabled
        if (!companyInfo?.features?.enableVisitorImageCapture) {
            setVisitorData(data);
            setStep("appointment");
        } else {
            setStep("photo");
        }
    };

    const handlePhotoStepSubmit = async (data: { photo: string }) => {
        if (!visitorDraft) return;
        const payload = { ...visitorDraft, photo: data.photo };
        setVisitorDraft(payload);
        setVisitorData(payload);
        setStep("appointment");
    };

    const handleAppointmentSubmit = async (appointmentData: any) => {
        setAppointmentDraft(appointmentData);
        setStep("review");
    };

    const handleFinalSubmit = async () => {
        if (!slug || !appointmentDraft || !visitorDraft) return;
        try {
            // Persist only on final submit: first visitor, then appointment.
            const visitorResponse = await createVisitor({ slug, visitorData: visitorDraft }).unwrap();
            const visitorResult = visitorResponse?.data || visitorResponse;
            const extractedId = extractIdString(visitorResult?._id || visitorResult?.id);

            if (!isValidId(extractedId)) {
                showErrorToast("Failed to create visitor profile. Please try again.");
                return;
            }

            setVisitorId(extractedId);
            setVisitorData(visitorResult);

            const finalAppointmentPayload = {
                ...appointmentDraft,
                visitorId: extractedId,
            };

            const appointmentResponse = await createAppointment({ slug, appointmentData: finalAppointmentPayload }).unwrap();
            const appointmentResult = appointmentResponse?.data || appointmentResponse;
            const createdAppointmentId = extractIdString(appointmentResult?._id || appointmentResult?.id);
            if (createdAppointmentId) {
                setSubmittedAppointmentId(createdAppointmentId);
            }
            setStep("success");
        } catch (error: any) {
            showErrorToast(error?.data?.message || error?.message || "Failed to submit appointment");
        }
    };

    const company = companyInfo?.company;
    const photoEnabled = companyInfo?.features?.enableVisitorImageCapture ?? false;

    type StepKey = "verify_phone" | "details" | "photo" | "appointment" | "review";
    const steps: Array<{ key: StepKey; label: string; mobileLabel: string }> = [
        { key: "verify_phone", label: "Verify phone", mobileLabel: "Phone" },
        { key: "details", label: "Your Details", mobileLabel: "Details" },
        ...(photoEnabled ? [{ key: "photo" as StepKey, label: "Capture Photo", mobileLabel: "Photo" }] : []),
        { key: "appointment", label: "Book", mobileLabel: "Book" },
        { key: "review", label: "Review", mobileLabel: "Review" },
    ];
    const activeStepIndex = steps.findIndex((s) => s.key === step);
    const selectedEmployee = (companyInfo?.employees || []).find((emp: any) => emp._id === appointmentDraft?.employeeId);

    if (step === "loading" || isLoadingInfo) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-[#f8fafc] dark:bg-slate-950">
                <div className="w-full max-w-2xl space-y-8 animate-pulse text-center">
                    <Skeleton className="mx-auto h-20 w-20 rounded-2xl" />
                    <Skeleton className="mx-auto h-8 w-64 rounded-lg" />
                    <Card className="border-0 bg-white/60 shadow-2xl backdrop-blur-xl ring-1 ring-slate-200">
                        <CardContent className="p-10">
                            <FormSkeleton title="Loading" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (step === "error") {
        const isOutOfService = errorMessage.toLowerCase().includes("out of service");
        return (
            <StatusPage
                type="error"
                title={isOutOfService ? "Out of Service" : "Invalid Scan"}
                message={errorMessage}
                description={
                    isOutOfService
                        ? "The QR check-in feature for this company is currently disabled. Please contact the management or visit the reception desk."
                        : "This QR code might be expired or the company is no longer active. Please contact the front desk."
                }
                showHomeButton={true}
            />
        );
    }

    if (step === "success") {
        return (
            <SuccessState
                companyName={company?.companyName}
                visitorName={visitorDraft?.name}
                hostName={selectedEmployee?.name}
                referenceId={submittedAppointmentId || undefined}
                onAction={restartQrBookingFlow}
                actionLabel="New Registration"
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#f7fafc] px-3 py-4 sm:px-5 sm:py-10">
            <div className="mx-auto w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="rounded-3xl border border-[#3882a5]/15 bg-white p-4 shadow-[0_10px_30px_rgba(7,68,99,0.08)] sm:p-6">
                    <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:gap-4 sm:text-left">
                        {company?.profilePicture ? (
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white p-1 ring-1 ring-slate-200 sm:h-16 sm:w-16">
                                <img src={company.profilePicture} alt="Logo" className="h-full w-full rounded-xl object-contain" />
                            </div>
                        ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#3882a5] text-xl font-bold text-white sm:h-16 sm:w-16">
                                {company?.companyName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl font-extrabold tracking-tight text-[#0f172a] sm:text-4xl leading-tight">
                                Welcome to <span className="block sm:inline text-[#3882a5] truncate" title={company?.companyName}>{company?.companyName}</span>
                            </h1>
                            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">Complete all {steps.length} steps for fast visitor approval</p>
                        </div>
                    </div>
                </div>

                <Card className="mt-4 overflow-hidden border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:mt-6">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-[#3882a5]/10 via-[#3882a5]/5 to-transparent px-3 py-4 sm:px-6">
                        <div className="hidden items-center sm:flex">
                            {steps.map((item, idx) => {
                                const isDone = idx < activeStepIndex;
                                const isActive = idx === activeStepIndex;
                                return (
                                    <div key={item.key} className="flex flex-1 items-center">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={cn(
                                                    "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition-all",
                                                    isActive && "border-[#3882a5] bg-[#3882a5] text-white shadow-lg",
                                                    isDone && "border-emerald-500 bg-emerald-500 text-white",
                                                    !isDone && !isActive && "border-slate-300 bg-white text-slate-500"
                                                )}
                                            >
                                                {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                                            </span>
                                            <span className={cn("text-sm font-semibold", isActive ? "text-[#1f4f67]" : isDone ? "text-emerald-700" : "text-slate-500")}>
                                                {item.label}
                                            </span>
                                        </div>
                                        {idx < steps.length - 1 && (
                                            <div className={cn("mx-3 h-[2px] flex-1 rounded-full", idx < activeStepIndex ? "bg-emerald-400" : "bg-slate-200")} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between px-1 sm:hidden">
                            {steps.map((item: any, idx) => {
                                const isDone = idx < activeStepIndex;
                                const isActive = idx === activeStepIndex;
                                return (
                                    <div key={item.key} className="flex flex-1 flex-col items-center gap-1.5 px-0.5">
                                        <div 
                                            className={cn(
                                                "flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-bold transition-all",
                                                isActive && "border-[#3882a5] bg-[#3882a5] text-white shadow-md ring-2 ring-[#3882a5]/20 scale-110",
                                                isDone && "border-emerald-500 bg-emerald-500 text-white",
                                                !isDone && !isActive && "border-slate-300 bg-white text-slate-400"
                                            )}
                                        >
                                            {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                                        </div>
                                        <span 
                                            className={cn(
                                                "text-[9px] font-bold uppercase tracking-tighter text-center line-clamp-1",
                                                isActive ? "text-[#1f4f67]" : isDone ? "text-emerald-700" : "text-slate-400"
                                            )}
                                        >
                                            {item.mobileLabel}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <CardContent className="p-4 sm:p-6 lg:p-8">
                        {step === "verify_phone" && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mx-auto w-full max-w-lg sm:max-w-xl">
                                    <form
                                        onSubmit={(e) => {
                                            if (!otpSent) {
                                                e.preventDefault();
                                                return;
                                            }
                                            handleVerifySubmit(onVerifyOtpSubmit)(e);
                                        }}
                                        className="w-full"
                                    >
                                        {/* Step A */}
                                        <div className="flex gap-4">
                                            <div
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3882a5] text-sm font-bold text-white shadow-sm"
                                                aria-hidden
                                            >
                                                1
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-[#0f172a]">Enter your number</p>
                                                    <p className="text-xs text-slate-500">Include your country code.</p>
                                                </div>
                                                <Controller
                                                    name="phone"
                                                    control={verifyControl}
                                                    render={({ field }) => (
                                                        <PhoneInputField
                                                            id="qr-verify-phone"
                                                            label="Mobile number"
                                                            value={field.value}
                                                            onChange={(v) => field.onChange(v)}
                                                            required
                                                            placeholder="Enter mobile with country code"
                                                            defaultCountry={defaultCountry}
                                                        />
                                                    )}
                                                />
                                                {phoneStepNotice ? (
                                                    <p
                                                        role="alert"
                                                        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
                                                    >
                                                        {phoneStepNotice}
                                                    </p>
                                                ) : null}
                                                <Button
                                                    type="button"
                                                    variant="outline-primary"
                                                    size="xl"
                                                    className="w-full font-semibold shadow-sm"
                                                    disabled={isSendingOtp || !watchVerifyPhone("phone")?.trim()}
                                                    onClick={onSendOtp}
                                                >
                                                    {isSendingOtp ? (
                                                        "Sending…"
                                                    ) : otpSent ? (
                                                        <>
                                                            <MessageCircle className="h-4 w-4" />
                                                            Resend code
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MessageCircle className="h-4 w-4" />
                                                            Send verification code
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        {otpSent && (
                                            <>
                                                <div className="relative my-8 sm:my-10">
                                                    <div className="absolute inset-0 flex items-center" aria-hidden>
                                                        <div className="w-full border-t border-slate-200" />
                                                    </div>
                                                    <div className="relative flex justify-center">
                                                        <span className="bg-card px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                            Then enter code
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Step B — only after code is sent */}
                                                <div className="flex gap-4">
                                                    <div
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3882a5] text-sm font-bold text-white shadow-sm"
                                                        aria-hidden
                                                    >
                                                        2
                                                    </div>
                                                    <div className="min-w-0 flex-1 space-y-4">
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#0f172a]">Enter the WhatsApp code</p>
                                                            <p className="text-xs text-slate-500">
                                                                Type the code you received below.
                                                            </p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor="qr-verify-otp"
                                                                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                                                            >
                                                                Verification code
                                                            </Label>
                                                            <Controller
                                                                name="otp"
                                                                control={verifyControl}
                                                                render={({ field }) => (
                                                                    <OtpDigitBoxes
                                                                        id="qr-verify-otp"
                                                                        value={field.value || ""}
                                                                        onChange={field.onChange}
                                                                    />
                                                                )}
                                                            />
                                                            <p className="flex items-center gap-1.5 text-xs text-slate-500">
                                                                <Clock className="h-3.5 w-3.5 shrink-0 text-[#3882a5]" />
                                                                Enter 6 digits only. Code is valid for 10 minutes.
                                                            </p>
                                                        </div>
                                                        <Button
                                                            type="submit"
                                                            variant="primary"
                                                            size="xl"
                                                            className="w-full font-semibold shadow-md shadow-[#3882a5]/20"
                                                            disabled={
                                                                isVerifyingOtp ||
                                                                (watchVerifyPhone("otp")?.replace(/\D/g, "")?.length ?? 0) !== 6
                                                            }
                                                        >
                                                            {isVerifyingOtp ? "Verifying…" : "Verify & continue"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </form>
                                </div>
                            </div>
                        )}

                        {step === "details" && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#3882a5]/20 bg-[#3882a5]/5 p-3 sm:p-4">
                                    <div className="rounded-lg bg-[#3882a5]/15 p-2 text-[#3882a5]"><User className="h-4 w-4" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-[#1f4f67]">Step 2: Fill visitor details</p>
                                        <p className="text-xs text-slate-600">
                                            Name, address, and ID — your mobile number is already verified.
                                        </p>
                                    </div>
                                </div>
                                <BookingVisitorForm
                                    onSubmit={handleVisitorDetailsSubmit}
                                    isLoading={isCreatingVisitor}
                                    collectPhotoInForm={false}
                                    initialValues={visitorDraft || undefined}
                                    initialPhone={verifiedPhone || undefined}
                                    lockedPhoneHelperText="This number is verified and cannot be changed."
                                    onBack={() => {
                                        setVerifiedPhone(null);
                                        setOtpSent(false);
                                        setVisitorDraft(null);
                                        setStep("verify_phone");
                                    }}
                                />
                            </div>
                        )}

                        {step === "photo" && photoEnabled && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                                <div className="flex items-start gap-3 rounded-2xl border border-[#3882a5]/20 bg-[#3882a5]/5 p-3 sm:p-4">
                                    <div className="rounded-lg bg-[#3882a5]/15 p-2 text-[#3882a5]"><Camera className="h-4 w-4" /></div>
                                    <div>
                                        <h3 className="text-base font-bold text-[#1f4f67] sm:text-lg">Step 3: Capture Visitor Photo</h3>
                                        <p className="mt-1 text-sm text-slate-600">Clear face photo required for secure entry verification.</p>
                                    </div>
                                </div>
                                <form onSubmit={handlePhotoSubmit(handlePhotoStepSubmit)} className="space-y-5">
                                    <div className="rounded-2xl border border-[#3882a5]/20 bg-gradient-to-b from-[#f8fcff] to-white p-4 shadow-sm sm:p-6">
                                        <div className="grid gap-4 md:grid-cols-[1fr_1.4fr] md:items-stretch md:gap-6">
                                            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-[#3882a5]/15 bg-[#f8fcff] px-4 py-8 text-center sm:min-h-[260px] sm:px-6 md:min-h-0 md:h-full md:py-6">
                                                <ul className="mx-auto mt-4 w-max max-w-[min(100%,17rem)] space-y-2 text-left text-[11px] leading-relaxed text-slate-700 sm:text-xs">
                                                    <li className="flex gap-2">
                                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3882a5]" />
                                                        <span>Face centered and clearly visible</span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3882a5]" />
                                                        <span>Good lighting, no blur</span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3882a5]" />
                                                        <span>No mask/sunglasses</span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3882a5]" />
                                                        <span>Single person only</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="rounded-xl border border-dashed border-[#3882a5]/25 bg-white p-4 sm:p-5">
                                                <div className="mb-3 text-center">
                                                    <p className="text-base font-bold text-[#1f4f67]">Visitor Photo</p>
                                                    <p className="text-xs text-slate-500">Capture visitor face for verification</p>
                                                </div>
                                            <ImageUploadField
                                                name="photo"
                                                register={photoRegister as any}
                                                setValue={setPhotoValue as any}
                                                errors={photoErrors.photo as any}
                                                initialUrl={watchPhoto("photo")}
                                                label="Capture visitor face photo"
                                                enableImageCapture={true}
                                                qrSlug={slug}
                                                onUploadStatusChange={setIsPhotoUploading}
                                                variant="default"
                                                autoOpenCamera={true}
                                                directCameraOnly={true}
                                            />
                                            </div>
                                        </div>
                                        {photoErrors.photo && <p className="text-xs font-medium text-red-500">{photoErrors.photo.message}</p>}
                                    </div>
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => setStep("details")}
                                            className="h-12 flex-1 rounded-xl border-border font-medium"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={!watchPhoto("photo") || isPhotoUploading || isCreatingVisitor}
                                            className="h-12 flex-1 rounded-xl bg-[#3882a5] text-white hover:bg-[#2d6a87] font-medium shadow-md"
                                        >
                                            Continue <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {step === "appointment" && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#3882a5]/20 bg-[#3882a5]/5 p-3 sm:p-4">
                                    <div className="rounded-lg bg-[#3882a5]/15 p-2 text-[#3882a5]"><Building2 className="h-4 w-4" /></div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 sm:text-lg">Step 4: Book Appointment</h3>
                                        <p className="text-sm text-slate-500">
                                            Choose your host, date, and time, then continue.
                                        </p>
                                    </div>
                                </div>
                                <AppointmentBookingForm
                                    visitorId={visitorId || "000000000000000000000000"}
                                    visitorName={visitorData?.name || ""}
                                    visitorPhone={visitorData?.phone || ""}
                                    employees={companyInfo?.employees || []}
                                    onSubmit={handleAppointmentSubmit}
                                    onDraftChange={setAppointmentFormDraft}
                                    initialValues={appointmentFormDraft || undefined}
                                    isLoading={isCreatingAppointment}
                                    isQRBooking={true}
                                    submitLabel="Review Details"
                                    onBack={() => setStep(photoEnabled ? "photo" : "details")}
                                />
                            </div>
                        )}

                        {step === "review" && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-5">
                                <div className="flex items-center gap-4 rounded-2xl border border-[#3882a5]/20 bg-gradient-to-r from-[#3882a5]/10 to-transparent p-4 shadow-sm">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3882a5] text-white shadow-lg shadow-[#3882a5]/20">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Step 5: Review & Submit</h3>
                                        <p className="text-xs font-medium text-slate-500">Double-check your details before final submission.</p>
                                    </div>
                                </div>

                                <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-[#1f4f67]">Final Summary</span>
                                        </div>
                                        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight text-emerald-700 ring-1 ring-emerald-200/50">SafeIn Verified</span>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        {/* Visitor Information Card */}
                                        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/40 p-5 transition-all hover:border-[#3882a5]/30 hover:bg-white hover:shadow-md">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Visitor Profile</span>
                                                <User2 className="h-3.5 w-3.5 text-slate-300" />
                                            </div>
                                            
                                            <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                                                {visitorDraft?.photo ? (
                                                    <div className="relative group/photo h-28 w-28 shrink-0">
                                                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#3882a5] to-[#2d6a87] blur shadow-lg opacity-40 group-hover/photo:opacity-60 transition-opacity" />
                                                        <div className="relative h-full w-full overflow-hidden rounded-3xl border-4 border-white bg-white shadow-inner">
                                                            <img src={visitorDraft.photo} alt="Visitor" className="h-full w-full object-cover transition-transform duration-500 group-hover/photo:scale-110" />
                                                        </div>
                                                    </div>
                                                ) : null}
                                                
                                                <div className="flex w-full flex-col gap-3.5 text-center sm:text-left">
                                                    <div>
                                                        <p className="text-base font-bold text-slate-900">{visitorDraft?.name || "-"}</p>
                                                        <div className="mt-1 flex flex-col gap-1.5">
                                                            <div className="flex items-center justify-center gap-2 text-slate-500 sm:justify-start">
                                                                <Mail className="h-3 w-3 text-[#3882a5]" />
                                                                <span className="text-[12px] font-medium truncate max-w-full">{visitorDraft?.email || "-"}</span>
                                                            </div>
                                                            <div className="flex items-center justify-center gap-2 text-slate-500 sm:justify-start">
                                                                <Phone className="h-3 w-3 text-[#3882a5]" />
                                                                <span className="text-[12px] font-medium">{visitorDraft?.phone || "-"}</span>
                                                            </div>
                                                            <div className="flex items-start justify-center gap-2 text-slate-500 sm:justify-start">
                                                                <MapPin className="mt-0.5 h-3 w-3 text-[#3882a5] shrink-0" />
                                                                <span className="text-[12px] font-medium leading-relaxed">{visitorDraft?.address?.street || "-"}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Host & Schedule Card */}
                                        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/40 p-5 transition-all hover:border-[#3882a5]/30 hover:bg-white hover:shadow-md">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Meeting Details</span>
                                                <CalendarClock className="h-3.5 w-3.5 text-slate-300" />
                                            </div>

                                            <div className="mt-5 space-y-4">
                                                <div className="flex items-center gap-3 rounded-xl bg-white/50 p-3 ring-1 ring-slate-100 group-hover:bg-white group-hover:ring-[#3882a5]/10">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3882a5]/10 text-[#3882a5]">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400">Host / Employee</p>
                                                        <p className="truncate text-sm font-bold text-slate-800">{selectedEmployee?.name || "Selected Employee"}</p>
                                                        <p className="truncate text-[11px] text-slate-500 font-medium">{selectedEmployee?.department || "-"}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="rounded-xl border border-slate-200/60 bg-white/40 p-3">
                                                        <div className="flex items-center gap-1.5 text-[#3882a5] mb-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span className="text-[9px] font-bold uppercase tracking-wider">Date</span>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-700">{appointmentDraft?.appointmentDetails?.scheduledDate || "-"}</p>
                                                    </div>
                                                    <div className="rounded-xl border border-slate-200/60 bg-white/40 p-3">
                                                        <div className="flex items-center gap-1.5 text-[#3882a5] mb-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span className="text-[9px] font-bold uppercase tracking-wider">Time</span>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-700">{appointmentDraft?.appointmentDetails?.scheduledTime || "-"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Purpose Banner */}
                                    <div className="relative mt-2 overflow-hidden rounded-2xl border border-[#3882a5]/10 bg-[#3882a5]/5 p-4 transition-all hover:bg-[#3882a5]/10">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-[#3882a5]/20 text-[#3882a5]">
                                                <MessageCircle className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#3882a5]">Purpose of Visit</p>
                                                <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700 italic">
                                                    "{appointmentDraft?.appointmentDetails?.purpose || "-"}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 pt-4 sm:gap-4 sm:pt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep("appointment")}
                                            className="h-14 flex-1 rounded-2xl border-slate-200 font-bold tracking-tight text-slate-600 transition-all hover:bg-slate-50 hover:text-[#3882a5] active:scale-95"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                                        </Button>
                                        <Button
                                            onClick={handleFinalSubmit}
                                            disabled={isCreatingVisitor || isCreatingAppointment}
                                            className="h-14 flex-[1.5] rounded-2xl bg-[#3882a5] font-extrabold text-white shadow-lg shadow-[#3882a5]/20 transition-all hover:bg-[#2d6a87] hover:shadow-[#3882a5]/30 active:scale-95"
                                        >
                                            {isCreatingVisitor || isCreatingAppointment ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                    <span>Submitting...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span>Confirm & Submit</span>
                                                    <ArrowRight className="h-4 w-4 animate-bounce-x" />
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="flex flex-col items-center gap-4 py-4 sm:py-6">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold tracking-wide uppercase">
                        <ShieldCheck className="h-3 w-3" />
                        Secure Check-in by SafeIn
                    </div>
                </div>
            </div>
        </div>
    );
}
