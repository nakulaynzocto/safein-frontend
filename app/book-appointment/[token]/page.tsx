"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { useGetAppointmentLinkByTokenQuery, useCreateBookingThroughLinkMutation, useSendVisitorOtpMutation, useVerifyVisitorOtpMutation } from "@/store/api/appointmentLinkApi";
import { BookingVisitorForm } from "@/components/appointment/BookingVisitorForm";
import { AppointmentBookingForm } from "@/components/appointment/AppointmentBookingForm";
import { StatusPage } from "@/components/common/statusPage";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { extractIdString, isValidId } from "@/utils/idExtractor";
import { cn } from "@/lib/utils";
import { Camera, User, Phone, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { OtpDigitBoxes } from "@/components/common/otpDigitBoxes";
import { validatePhone, formatPhoneForSubmission } from "@/utils/phoneUtils";
import { Label } from "@/components/ui/label";
import { StepIndicator, Step } from "@/components/common/StepIndicator";
import { FormSkeleton } from "@/components/common/FormSkeleton";
import { useFormPersistence } from "@/hooks/useFormPersistence";
import { useVisitorVerification } from "@/hooks/useVisitorVerification";
import { SuccessState } from "@/components/common/SuccessState";
import { VisitReviewCard } from "@/components/appointment/VisitReviewCard";

type StepKey = "verification" | "details" | "photo" | "appointment" | "review";

export default function BookAppointmentPage() {
    const { token } = useParams<{ token: string }>();
    const PERSIST_KEY = useMemo(() => `booking_state_${token}`, [token]);

    const { data: appointmentLinkData, isLoading: isLoadingLink, error: linkError } = useGetAppointmentLinkByTokenQuery(token as string);
    const [createBookingThroughLink, { isLoading: isCreatingBooking }] = useCreateBookingThroughLinkMutation();
    const [sendOtp, { isLoading: isSendingOtpMutation }] = useSendVisitorOtpMutation();
    const [verifyOtp, { isLoading: isVerifyingOtpMutation }] = useVerifyVisitorOtpMutation();

    const [step, setStep] = useState<StepKey | "loading" | "error" | "success" | "already_booked">("loading");
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
    const [visitorDraft, setVisitorDraft] = useState<any>(null);
    const [appointmentData, setAppointmentData] = useState<any>(null);
    const [submittedAppointmentId, setSubmittedAppointmentId] = useState<string | null>(null);

    const { control: verifyControl, handleSubmit: handleVerifySubmit, watch: watchVerifyForm, setValue: setVerifyValue } = useForm({
        defaultValues: { phone: "", otp: "" },
    });

    // Verification Logic (Unified)
    const { 
        otpSent, 
        setOtpSent, 
        isSending, 
        isVerifying, 
        handleSendOtp, 
        handleVerifyOtp 
    } = useVisitorVerification({
        sendOtpMutation: sendOtp,
        verifyOtpMutation: verifyOtp,
        contextId: token as string,
        contextKey: "token",
        isSending: isSendingOtpMutation,
        isVerifying: isVerifyingOtpMutation,
        onVerified: (res, phone) => {
            const existingVisitor = (res as any)?.data?.visitor || (res as any)?.visitor;
            setVerifiedPhone(phone);
            if (existingVisitor) {
                setVisitorId(extractIdString(existingVisitor?._id || existingVisitor?._id));
                setVisitorDraft({
                    ...existingVisitor,
                    phone: existingVisitor.phone || phone,
                    email: existingVisitor.email || (appointmentLinkData as any)?.visitorEmail || ""
                });
            } else {
                setVisitorDraft({ phone, email: (appointmentLinkData as any)?.visitorEmail || "" });
            }
            setStep("details");
        }
    });

    useFormPersistence(
        PERSIST_KEY,
        step !== "loading" ? { step, visitorId, verifiedPhone, otpSent, visitorDraft, appointmentData } : null,
        (saved) => {
            if (saved.step && !["success", "loading"].includes(saved.step)) {
                setStep(saved.step as any);
                setVisitorId(saved.visitorId);
                setVerifiedPhone(saved.verifiedPhone);
                setOtpSent(saved.otpSent);
                setVisitorDraft(saved.visitorDraft);
                setAppointmentData(saved.appointmentData);
            }
        }
    );

    // --- Initialization Logic ---
    useEffect(() => {
        if (linkError) return setStep("error");
        if (!appointmentLinkData) return;

        const linkData = appointmentLinkData as any;
        if (linkData.isBooked) {
            localStorage.removeItem(PERSIST_KEY);
            return setStep("already_booked");
        }

        // Initialize only if no persistence found
        if (!localStorage.getItem(PERSIST_KEY)) {
            setStep("verification");
            if (linkData.visitorPhone) setVerifyValue("phone", linkData.visitorPhone);
        }
    }, [appointmentLinkData, linkError, PERSIST_KEY, setVerifyValue]);

    const handleFinalSubmit = async () => {
        try {
            const { visitorId: _v, ...rest } = appointmentData;
            const res = await createBookingThroughLink({
                token: token as string,
                visitorData: visitorDraft || undefined,
                appointmentData: { ...rest, employeeId: extractIdString(appointmentLinkData?.employeeId) },
            }).unwrap();
            const result = (res as any)?.data || res;
            const aId = extractIdString(result?._id || result?.id);
            if (aId) setSubmittedAppointmentId(aId);
            setStep("success");
            localStorage.removeItem(PERSIST_KEY);
        } catch (e: any) {
            const msg = e?.data?.message || e?.message || "Booking failed";
            showErrorToast(msg);
            if (e?.status === 409 || msg.toLowerCase().includes("slot")) setStep("appointment");
        }
    };

    const steps: Step[] = useMemo(() => [
        { key: "verification", label: "Verify", mobileLabel: "Phone" },
        { key: "details", label: "Details", mobileLabel: "Details" },
        { key: "photo", label: "Photo", mobileLabel: "Photo" },
        { key: "appointment", label: "Book", mobileLabel: "Book" },
        { key: "review", label: "Review", mobileLabel: "Review" },
    ], []);

    const activeIndex = steps.findIndex(s => s.key === step);
    const company = appointmentLinkData?.createdBy;

    if (step === "loading" || isLoadingLink) return <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50"><Card className="max-w-2xl w-full p-8 rounded-3xl shadow-none border-none bg-transparent"><FormSkeleton /></Card></div>;
    if (step === "error") return <StatusPage type="error" title="Invalid Link" message={(linkError as any)?.data?.message || "Expired or invalid link."} />;
    
    if (step === "success") {
        return (
            <SuccessState 
                companyName={company?.companyName} 
                visitorName={visitorDraft?.name} 
                hostName={(appointmentLinkData?.employeeId as any)?.name || (appointmentLinkData as any)?.employee?.name}
                referenceId={submittedAppointmentId || "CONFIRMED"}
                enableVisitSlip
                visitorPhone={verifiedPhone || visitorDraft?.phone}
                visitorPhoto={visitorDraft?.photo}
                customFooterMessage="Your appointment has been scheduled successfully. Please show this slip at the reception upon arrival."
            />
        );
    }

    if (step === "already_booked") return <StatusPage type="info" title="Already Booked" message="This invitation link has already been used to schedule an appointment." />;

    return (
        <div className="min-h-screen bg-[#f7fafc] px-3 py-4 sm:px-5 sm:py-10">
            <div className="mx-auto w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Card className="rounded-3xl border-[#3882a5]/15 shadow-sm p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                        <div className="h-16 w-16 bg-[#3882a5] rounded-2xl flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                            {company?.profilePicture ? <img src={company.profilePicture} className="h-full w-full object-contain p-1" /> : company?.companyName?.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-black text-slate-900 leading-tight">Welcome to <span className="text-[#3882a5]">{company?.companyName}</span></h1>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-1">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Secure Entry Handshake</p>
                                {appointmentLinkData?.expiresAt && (
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                                        <Calendar className="h-3 w-3" />
                                        Valid until: {new Date(appointmentLinkData.expiresAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Meeting Info Badge */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#3882a5] shadow-sm">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">You are meeting with</p>
                                <p className="text-sm font-black text-slate-800 mt-0.5">{(appointmentLinkData?.employeeId as any)?.name || (appointmentLinkData as any)?.employee?.name || "Host"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-[11px] font-bold text-slate-500 shadow-sm">Purpose: Office Visit</span>
                        </div>
                    </div>
                </Card>

                <Card className="overflow-hidden border-slate-200 shadow-xl rounded-3xl bg-white">
                    <div className="bg-slate-50/50 border-b p-6"><StepIndicator steps={steps} activeIndex={activeIndex} /></div>
                    <CardContent className="p-6 sm:p-10">
                        {step === "verification" && (
                            <form onSubmit={handleVerifySubmit((data: any) => handleVerifyOtp(data.phone, data.otp))} className="max-w-lg mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
                                <div className="p-6 bg-slate-50 rounded-2xl border space-y-4">
                                    <Label className="text-sm font-bold text-slate-700">Mobile Verification</Label>
                                    <Controller name="phone" control={verifyControl} render={({ field }) => (
                                        <PhoneInputField 
                                            value={field.value} 
                                            onChange={field.onChange} 
                                            disabled={!!appointmentLinkData?.visitorPhone}
                                            helperText={appointmentLinkData?.visitorPhone ? "This number is tied to your secure invitation." : undefined}
                                        />
                                    )} />
                                    <Button type="button" variant="primary" size="lg" className="w-full h-14 rounded-2xl shadow-lg shadow-[#3882a5]/10 font-bold" onClick={() => handleSendOtp(watchVerifyForm("phone"), (val) => setVerifyValue("otp", val))} disabled={isSending}>
                                        {otpSent ? "Resend Verification Code" : "Get Verification Code"}
                                    </Button>
                                </div>
                                
                                {otpSent && (
                                    <div className="p-8 bg-[#3882a5]/5 rounded-[28px] border border-[#3882a5]/10 space-y-6 animate-in slide-in-from-top-4 duration-500">
                                        <div className="text-center space-y-1">
                                            <h3 className="text-lg font-bold text-[#3882a5]">Enter Secure Code</h3>
                                            <p className="text-xs text-slate-500">Check your phone for the 6-digit code</p>
                                        </div>
                                        <Controller name="otp" control={verifyControl} render={({ field }) => <OtpDigitBoxes value={field.value} onChange={field.onChange} />} />
                                        <Button type="submit" variant="primary" size="lg" className="w-full h-14 rounded-2xl font-bold" disabled={isVerifying}>Verify Identity & Continue</Button>
                                    </div>
                                )}
                            </form>
                        )}

                        {step === "details" && (
                            <BookingVisitorForm 
                                initialValues={visitorDraft} 
                                initialEmail={appointmentLinkData?.visitorEmail}
                                lockedEmailHelperText="This email is tied to your secure invitation."
                                initialPhone={verifiedPhone || appointmentLinkData?.visitorPhone}
                                lockedPhoneHelperText={appointmentLinkData?.visitorPhone ? "This phone number is tied to your secure invitation." : undefined}
                                onSubmit={(d) => { setVisitorDraft(d); setStep("photo"); }} 
                                appointmentToken={token as string} 
                                collectPhotoInForm={false} 
                                onBack={() => setStep("verification")} 
                            />
                        )}

                        {step === "photo" && (
                            <div className="space-y-8 max-w-2xl mx-auto">
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-black text-slate-900">Capture Visitor Photo</h3>
                                    <p className="text-sm text-slate-500">A clear face photo is required for secure entry verification.</p>
                                </div>
                                
                                <div className="max-w-md mx-auto w-full">
                                    <ImageUploadField 
                                        initialUrl={visitorDraft?.photo} 
                                        onChange={(p) => setVisitorDraft({...visitorDraft, photo: p})} 
                                        enableImageCapture 
                                        autoOpenCamera={false} 
                                        directCameraOnly 
                                        appointmentToken={token as string} 
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button variant="outline" size="xl" className="flex-1" onClick={() => setStep("details")}>Back</Button>
                                    <Button variant="primary" size="xl" className="flex-1" onClick={() => { if (!visitorDraft?.photo) return showErrorToast("Photo required"); setStep("appointment"); }}>Continue</Button>
                                </div>
                            </div>
                        )}

                        {step === "appointment" && (
                            <AppointmentBookingForm 
                                visitorId={visitorId!} 
                                visitorName={visitorDraft?.name} 
                                employeeId={extractIdString(appointmentLinkData?.employeeId)} 
                                employeeName={(appointmentLinkData?.employeeId as any)?.name || (appointmentLinkData as any)?.employee?.name}
                                onSubmit={(d) => { setAppointmentData(d); setStep("review"); }} 
                                onBack={() => setStep("photo")} 
                                showVehicleDetails={false} 
                            />
                        )}

                        {step === "review" && (
                            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900">Review & Confirm</h3>
                                    <p className="text-sm text-slate-500">Please double check your visit details before submitting.</p>
                                </div>

                                <VisitReviewCard 
                                    visitor={{
                                        name: visitorDraft?.name,
                                        phone: visitorDraft?.phone || verifiedPhone,
                                        email: visitorDraft?.email,
                                        photo: visitorDraft?.photo
                                    }}
                                    appointment={{
                                        hostName: (appointmentLinkData?.employeeId as any)?.name || (appointmentLinkData as any)?.employee?.name || "Host",
                                        date: appointmentData?.appointmentDetails?.scheduledDate || appointmentData?.appointmentDate,
                                        time: appointmentData?.appointmentDetails?.scheduledTime || appointmentData?.appointmentTime,
                                        purpose: appointmentData?.appointmentDetails?.purpose || appointmentData?.purpose
                                    }}
                                />
                                
                                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                    <Button variant="outline" size="xl" className="flex-1 rounded-2xl h-14" onClick={() => setStep("appointment")}>Edit Schedule</Button>
                                    <Button variant="primary" size="xl" className="flex-1 rounded-2xl h-14 shadow-2xl shadow-[#3882a5]/30 font-bold" onClick={handleFinalSubmit} disabled={isCreatingBooking}>Confirm & Complete Booking</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
