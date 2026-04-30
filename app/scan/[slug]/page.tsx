"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import {
    useGetPublicCompanyInfoQuery,
    useSendQrPhoneOtpMutation,
    useVerifyQrPhoneOtpMutation,
    useSubmitUnifiedQRCheckinMutation,
} from "@/store/api/qrSetupApi";
import { 
    CheckCircle2, 
    ShieldCheck,
    ArrowLeft,
    ArrowRight,
    Camera,
    User,
    Building2,
    Clock,
    User2,
    MessageCircle,
} from "lucide-react";
import { StatusPage } from "@/components/common/statusPage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { extractIdString, isValidId } from "@/utils/idExtractor";
import { cn } from "@/lib/utils";
import { SuccessState } from "@/components/common/SuccessState";
import { VisitReviewCard } from "@/components/appointment/VisitReviewCard";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { Label } from "@/components/ui/label";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { validatePhone, formatPhoneForSubmission } from "@/utils/phoneUtils";
import { useUserCountry } from "@/hooks/useUserCountry";
import { AppointmentBookingForm } from "@/components/appointment/AppointmentBookingForm";
import { BookingVisitorForm } from "@/components/appointment/BookingVisitorForm";
import { OtpDigitBoxes } from "@/components/common/otpDigitBoxes";
import { useFormPersistence } from "@/hooks/useFormPersistence";
import { StepIndicator, Step } from "@/components/common/StepIndicator";
import { FormSkeleton } from "@/components/common/FormSkeleton";

import { useVisitorVerification } from "@/hooks/useVisitorVerification";

type StepKey = "verify_phone" | "details" | "photo" | "appointment" | "review";

export default function QRScanPage() {
    const { slug } = useParams() as { slug: string };
    const PERSIST_KEY = useMemo(() => `qr_scan_draft_${slug}`, [slug]);

    const [step, setStep] = useState<StepKey | "loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");
    const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [visitorDraft, setVisitorDraft] = useState<any>(null);
    const [appointmentDraft, setAppointmentDraft] = useState<any>(null);
    const [isPhotoUploading, setIsPhotoUploading] = useState(false);
    const [phoneStepNotice, setPhoneStepNotice] = useState("");
    const [submissionResult, setSubmissionResult] = useState<any>(null);
    const defaultCountry = useUserCountry();

    const { control: verifyControl, handleSubmit: handleVerifySubmit, watch: watchVerify, setValue: setVerifyValue } = useForm({
        defaultValues: { phone: "", otp: "" },
    });

    const [sendQrOtp, { isLoading: isSendingOtpMutation }] = useSendQrPhoneOtpMutation();
    const [verifyQrOtp, { isLoading: isVerifyingOtpMutation }] = useVerifyQrPhoneOtpMutation();

    // Verification Logic (Unified)
    const { 
        otpSent, 
        isSending, 
        isVerifying, 
        handleSendOtp, 
        handleVerifyOtp 
    } = useVisitorVerification({
        sendOtpMutation: sendQrOtp,
        verifyOtpMutation: verifyQrOtp,
        contextId: slug,
        contextKey: "slug",
        isSending: isSendingOtpMutation,
        isVerifying: isVerifyingOtpMutation,
        onVerified: (res, phone) => {
            setVerifiedPhone(phone);
            if (res.visitor) {
                setVisitorDraft(res.visitor);
                setPhotoValue("photo", res.visitor.photo || "");
                setStep("photo");
                showSuccessToast(`Welcome back, ${res.visitor.name}!`);
            } else {
                setStep("details");
            }
        }
    });

    const { register: photoRegister, setValue: setPhotoValue, handleSubmit: handlePhotoSubmit, watch: watchPhoto, reset: resetPhoto, formState: { errors: photoErrors } } = useForm({
        defaultValues: { photo: "" },
    });

    const { data: companyInfo, isLoading: isLoadingInfo, error: infoError } = useGetPublicCompanyInfoQuery(slug, { skip: !slug });
    const [submitUnifiedQR, { isLoading: isSubmitting }] = useSubmitUnifiedQRCheckinMutation();

    useEffect(() => {
        if (!slug) { setErrorMessage("Invalid QR code"); setStep("error"); return; }
        if (infoError) { setErrorMessage((infoError as any)?.data?.message || "Company not found"); setStep("error"); return; }
        if (companyInfo) {
            if (companyInfo.holiday?.blockPortal) {
                setErrorMessage(companyInfo.holiday.message || "Office closed today");
                setStep("error");
                return;
            }
            if (step === "loading") setStep("verify_phone");
        }
    }, [companyInfo, infoError, slug, step]);

    // Persistence
    useFormPersistence(
        PERSIST_KEY,
        !["loading", "success", "error"].includes(step) ? { step, verifiedPhone, otpSent, visitorId, visitorDraft, appointmentDraft } : null,
        (saved) => {
            if (saved.step && !["loading", "success", "error"].includes(saved.step)) {
                setStep(saved.step as any);
                setVerifiedPhone(saved.verifiedPhone);
                setVisitorId(saved.visitorId);
                setVisitorDraft(saved.visitorDraft);
                setAppointmentDraft(saved.appointmentDraft);
            }
        }
    );

    const handleFinalSubmit = async () => {
        try {
            const res = await submitUnifiedQR({
                slug,
                payload: {
                    visitorData: visitorDraft,
                    appointmentData: appointmentDraft
                }
            }).unwrap();
            setSubmissionResult(res);
            setStep("success");
            localStorage.removeItem(PERSIST_KEY);
        } catch (e: any) { showErrorToast(e?.data?.message || "Submit failed"); }
    };

    const steps = useMemo<Step[]>(() => [
        { key: "verify_phone", label: "Verify Phone", mobileLabel: "Phone" },
        { key: "details", label: "Your Details", mobileLabel: "Details" },
        { key: "photo", label: "Capture Photo", mobileLabel: "Photo" },
        { key: "appointment", label: "Book", mobileLabel: "Book" },
        { key: "review", label: "Review", mobileLabel: "Review" },
    ], []);

    const activeIndex = steps.findIndex(s => s.key === step);
    const company = companyInfo?.company;

    if (step === "loading" || isLoadingInfo) return <div className="min-h-screen flex items-center justify-center"><FormSkeleton /></div>;
    if (step === "error") return <StatusPage type="error" title="Notice" message={errorMessage} showHomeButton />;
    
    if (step === "success") {
        const host = submissionResult?.appointment?.employeeId;
        const hostName = typeof host === 'object' ? host?.name : (companyInfo?.employees || []).find((e: any) => e._id === appointmentDraft?.employeeId)?.name;
        
        return (
            <SuccessState 
                companyName={company?.companyName} 
                visitorName={submissionResult?.visitor?.name || visitorDraft?.name} 
                hostName={hostName}
                referenceId={submissionResult?.appointment?._id}
                onAction={() => window.location.reload()} 
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#f7fafc] px-3 py-6 sm:px-6 sm:py-10">
            <div className="mx-auto max-w-5xl space-y-6">
                <Card className="rounded-3xl border-[#3882a5]/15 shadow-xl">
                    <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
                        <div className="h-16 w-16 bg-[#3882a5] rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                            {company?.profilePicture ? <img src={company.profilePicture} className="h-full w-full object-contain p-1" /> : company?.companyName?.charAt(0)}
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl font-black text-slate-900">Welcome to <span className="text-[#3882a5]">{company?.companyName}</span></h1>
                            <p className="text-sm text-slate-500 font-medium">Please complete the check-in process</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl overflow-hidden border-slate-200 shadow-lg bg-white">
                    <div className="bg-slate-50/50 border-b p-6"><StepIndicator steps={steps} activeIndex={activeIndex} /></div>
                    <CardContent className="p-6 sm:p-10">
                        {step === "verify_phone" && (
                            <form onSubmit={handleVerifySubmit((data: any) => handleVerifyOtp(data.phone, data.otp))} className="max-w-lg mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
                                <div className="p-8 bg-slate-50/50 rounded-[28px] border border-slate-100 space-y-6">
                                    <div className="text-center space-y-1">
                                        <h3 className="text-lg font-bold text-slate-900">Mobile Verification</h3>
                                        <p className="text-xs text-slate-500">Enter your number to receive a secure code</p>
                                    </div>
                                    <Controller name="phone" control={verifyControl} render={({ field }) => (
                                        <PhoneInputField value={field.value} onChange={field.onChange} defaultCountry={defaultCountry} />
                                    )} />
                                    {phoneStepNotice && <p className="p-3 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-200 animate-in slide-in-from-top-2">{phoneStepNotice}</p>}
                                    <Button type="button" variant="primary" size="lg" className="w-full h-14 rounded-2xl shadow-lg shadow-[#3882a5]/10 font-bold" onClick={() => handleSendOtp(watchVerify("phone"), (val) => setVerifyValue("otp", val))} disabled={isSending}>
                                        {otpSent ? "Resend Verification Code" : "Get Verification Code"}
                                    </Button>
                                </div>
                                
                                {otpSent && (
                                    <div className="p-8 bg-[#3882a5]/5 rounded-[28px] border border-[#3882a5]/10 space-y-6 animate-in slide-in-from-top-4 duration-500">
                                        <div className="text-center space-y-1">
                                            <h3 className="text-lg font-bold text-[#3882a5]">Enter Secure Code</h3>
                                            <p className="text-xs text-slate-500">Check your WhatsApp for the 6-digit code</p>
                                        </div>
                                        <Controller name="otp" control={verifyControl} render={({ field }) => (
                                            <OtpDigitBoxes value={field.value} onChange={field.onChange} />
                                        )} />
                                        <Button type="submit" variant="primary" size="lg" className="w-full h-14 rounded-2xl font-bold" disabled={isVerifying}>Verify Identity & Continue</Button>
                                    </div>
                                )}
                            </form>
                        )}

                        {step === "details" && <BookingVisitorForm onSubmit={(d) => { setVisitorDraft(d); setStep("photo"); }} initialPhone={verifiedPhone!} onBack={() => setStep("verify_phone")} collectPhotoInForm={false} />}
                        
                        {step === "photo" && (
                            <div className="space-y-8 max-w-2xl mx-auto">
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold text-slate-900">Capture Visitor Photo</h3>
                                    <p className="text-sm text-slate-500">Face should be clearly visible</p>
                                </div>
                                <ImageUploadField 
                                    name="photo"
                                    register={photoRegister as any} 
                                    setValue={setPhotoValue as any} 
                                    onChange={(p) => setPhotoValue("photo", p as any, { shouldValidate: true })}
                                    initialUrl={watchPhoto("photo")} 
                                    enableImageCapture 
                                    directCameraOnly 
                                    qrSlug={slug} 
                                    onUploadStatusChange={setIsPhotoUploading} 
                                />
                                <div className="flex gap-4">
                                    <Button variant="outline" size="xl" className="flex-1" onClick={() => setStep("details")}>Back</Button>
                                    <Button variant="primary" size="xl" className="flex-1" disabled={!watchPhoto("photo") || isPhotoUploading} onClick={() => { setVisitorDraft({...visitorDraft, photo: watchPhoto("photo")}); setStep("appointment"); }}>Continue</Button>
                                </div>
                            </div>
                        )}

                        {step === "appointment" && <AppointmentBookingForm visitorId={visitorId || "0"} visitorName={visitorDraft?.name} employees={companyInfo?.employees} onSubmit={(d) => { setAppointmentDraft(d); setStep("review"); }} onBack={() => setStep("photo")} isQRBooking />}

                        {step === "review" && (
                            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900">Review Your Check-in</h3>
                                    <p className="text-sm text-slate-500">Double check everything is correct.</p>
                                </div>

                                <VisitReviewCard 
                                    visitor={{
                                        name: visitorDraft?.name,
                                        phone: verifiedPhone || visitorDraft?.phone,
                                        email: visitorDraft?.email,
                                        photo: visitorDraft?.photo
                                    }}
                                    appointment={{
                                        hostName: (companyInfo?.employees || []).find((e: any) => e._id === appointmentDraft.employeeId)?.name || "Host",
                                        date: appointmentDraft?.appointmentDetails?.scheduledDate || new Date().toLocaleDateString(),
                                        time: appointmentDraft?.appointmentDetails?.scheduledTime || new Date().toLocaleTimeString(),
                                        purpose: appointmentDraft?.appointmentDetails?.purpose || "Office Visit"
                                    }}
                                />
                                
                                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                    <Button variant="outline" size="xl" className="flex-1 rounded-2xl h-14" onClick={() => setStep("appointment")}>Edit Details</Button>
                                    <Button variant="primary" size="xl" className="flex-1 rounded-2xl h-14 shadow-2xl shadow-[#3882a5]/30 font-bold" onClick={handleFinalSubmit} disabled={isSubmitting}>
                                        {isSubmitting ? "Checking in..." : "Confirm & Check-in"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
