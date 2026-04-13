"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
    useGetAppointmentLinkByTokenQuery,
    useCreateBookingThroughLinkMutation,
} from "@/store/api/appointmentLinkApi";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    CheckCircle2, 
    ShieldCheck,
    ArrowLeft,
    Home,
    ArrowRight,
    Camera,
} from "lucide-react";
import { StatusPage } from "@/components/common/statusPage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { extractIdString, isValidId } from "@/utils/idExtractor";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { AppointmentBookingForm } from "@/components/appointment/AppointmentBookingForm";
import { BookingVisitorForm } from "@/components/appointment/BookingVisitorForm";
import { OtpVerificationStep } from "@/components/appointment/OtpVerificationStep";

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

export default function BookAppointmentPage() {
    const params = useParams();
    const rawToken = params?.token as string;
    const token = rawToken ? decodeURIComponent(rawToken) : "";

    const [step, setStep] = useState<"loading" | "verification" | "details" | "photo" | "appointment" | "review" | "success" | "already_booked" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [appointmentLinkData, setAppointmentLinkData] = useState<any>(null);
    const [visitorData, setVisitorData] = useState<any>(null);
    const [visitorDraft, setVisitorDraft] = useState<any>(null);
    const [appointmentDraft, setAppointmentDraft] = useState<any>(null);
    const [submittedAppointmentId, setSubmittedAppointmentId] = useState<string | null>(null);
    const [isPhotoUploading, setIsPhotoUploading] = useState(false);

    const {
        register: photoRegister,
        setValue: setPhotoValue,
        handleSubmit: handlePhotoSubmit,
        watch: watchPhoto,
        formState: { errors: photoErrors },
    } = useForm<{ photo: string }>({
        defaultValues: { photo: "" },
    });

    const {
        data: linkData,
        isLoading: isLoadingLink,
        error: linkError,
    } = useGetAppointmentLinkByTokenQuery(token || "", { 
        skip: !token,
        refetchOnMountOrArgChange: true 
    });

    const [createBookingThroughLink, { isLoading: isSubmittingBooking }] = useCreateBookingThroughLinkMutation();

    const employee = appointmentLinkData?.employee || (typeof appointmentLinkData?.employeeId === 'object' ? appointmentLinkData.employeeId : null);

    useEffect(() => {
        if (!token) {
            setErrorMessage("Invalid appointment link - token is missing");
            setStep("error");
            return;
        }

        if (linkError) {
            const error = linkError as any;
            const errorMessage = error?.data?.message || error?.message || "Invalid or expired appointment link";
            setErrorMessage(error?.status === 404 ? "Appointment link not found. Please check the link and try again." : errorMessage);
            setStep("error");
            return;
        }

        if (linkData) {
            setAppointmentLinkData(linkData);
            if (linkData.visitor) setVisitorData(linkData.visitor);

            if (linkData.isBooked) {
                setStep("already_booked");
                return;
            }

            let finalVisitorId: string | null = null;
            if (linkData.visitorId) {
                const extractedVisitorId = extractIdString(linkData.visitorId);
                if (isValidId(extractedVisitorId)) finalVisitorId = extractedVisitorId;
            }

            if (!finalVisitorId && linkData.visitor) {
                const visitorIdFromObject = extractIdString(linkData.visitor._id || (linkData.visitor as any).id || linkData.visitor);
                if (isValidId(visitorIdFromObject)) finalVisitorId = visitorIdFromObject;
            }

            if (finalVisitorId && isValidId(finalVisitorId)) {
                setVisitorId(finalVisitorId);
                if (linkData.visitor) {
                    setVisitorDraft(linkData.visitor);
                    setVisitorData(linkData.visitor);
                }
                setStep("appointment");
            } else {
                setStep("verification");
            }
        }
    }, [linkData, linkError, token]);

    const handlePhoneVerified = (phone: string) => {
        setVisitorDraft((prev: any) => ({ ...prev, phone }));
        setStep("details");
    };

    const handleVisitorSubmit = async (data: any) => {
        setVisitorDraft(data);
        setVisitorData(data);
        setPhotoValue("photo", data?.photo || "");
        setStep("photo");
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
        if (!appointmentLinkData || !token || !appointmentDraft) return;
        try {
            const { visitorId: _, employeeId: __, ...restData } = appointmentDraft;
            const cleanData = {
                ...restData,
                employeeId: extractIdString(appointmentLinkData.employeeId),
            };
            const response = await createBookingThroughLink({
                token,
                visitorData: visitorDraft || visitorData || undefined,
                appointmentData: cleanData,
            }).unwrap();
            const result = (response as any)?.data || response;
            const appointmentId = extractIdString(result?._id || result?.id);
            if (appointmentId) {
                setSubmittedAppointmentId(appointmentId);
            }
            setStep("success");
        } catch (error: any) {
            showErrorToast(error?.data?.message || error?.message || "Failed to book appointment");
        }
    };

    const errorConfig = useMemo(() => {
        const messageStr = String(errorMessage || "");
        const err = linkError as any;
        const isOutOfService = messageStr.toLowerCase().includes("out of service") || err?.status === 402 || errorMessage.toLowerCase().includes("subscription");
        const isExpired = /expired|used|created|isbooked/i.test(messageStr);
        
        if (isOutOfService) {
            return {
                title: "Service Unavailable",
                message: "This company's visitor portal is currently out of service. Please contact their reception desk directly or try again later.",
            };
        }
        
        return {
            title: isExpired ? "Link Expired" : "Invalid Link",
            message: isExpired 
                ? "This appointment link has expired or has already been used. Please contact the person who sent you this link."
                : "This appointment link is invalid. Please contact the person who sent you this link.",
        };
    }, [errorMessage, linkError]);

    if (step === "loading" || isLoadingLink) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-[#f8fafc] dark:bg-slate-950">
                <div className="w-full max-w-2xl space-y-8 animate-pulse">
                    <div className="text-center space-y-4">
                        <Skeleton className="mx-auto h-16 w-16 rounded-2xl" />
                        <Skeleton className="mx-auto h-8 w-64 rounded-lg" />
                        <Skeleton className="mx-auto h-4 w-48 rounded-md" />
                    </div>
                    <Card className="overflow-hidden border-0 bg-white/60 shadow-2xl backdrop-blur-xl ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-800">
                        <CardContent className="p-8">
                            <div className="flex justify-center gap-8 mb-10">
                                <Skeleton className="h-10 w-32 rounded-full" />
                                <Skeleton className="h-10 w-32 rounded-full" />
                            </div>
                            <FormSkeleton title="Loading" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (step === "error") {
        return (
            <StatusPage
                type="error"
                title={errorConfig.title}
                message={errorMessage}
                description={errorConfig.message}
                showHomeButton={true}
            />
        );
    }

    if (step === "success") {
        return (
            <div className="min-h-screen bg-[#f7fafc] px-4 py-10">
                <div className="mx-auto w-full max-w-2xl">
                    <Card className="overflow-hidden border border-emerald-200 bg-white shadow-[0_10px_30px_rgba(16,185,129,0.08)]">
                        <div className="bg-gradient-to-r from-emerald-50 to-white px-6 py-6 text-center">
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-emerald-700">Appointment Booked!</h2>
                            <p className="mt-2 text-sm text-slate-600">Your visit request has been submitted successfully for approval.</p>
                        </div>

                        <CardContent className="space-y-5 p-6">
                            <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Visitor</p>
                                    <p className="text-sm font-semibold text-slate-900">{visitorData?.name || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Host</p>
                                    <p className="text-sm font-semibold text-slate-900">{employee?.name || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Date & Time</p>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {submittedAppointmentId ? "Scheduled" : "Submitted"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Reference</p>
                                    <p className="text-sm font-semibold text-slate-900">{submittedAppointmentId || "Generated"}</p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                                <p className="text-sm font-semibold text-emerald-700">Please wait at reception. You will be notified once approved.</p>
                            </div>

                            <div className="flex justify-center">
                                <Button variant="outline" onClick={() => window.location.assign("/")}>
                                    <Home className="mr-2 h-4 w-4" /> Go Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (step === "already_booked") {
        return (
            <div className="min-h-screen bg-[#f7fafc] px-4 py-10">
                <div className="mx-auto w-full max-w-2xl">
                    <Card className="overflow-hidden border border-[#3882a5]/25 bg-white shadow-[0_10px_30px_rgba(56,130,165,0.12)]">
                        <div className="bg-gradient-to-r from-[#3882a5]/10 to-white px-6 py-6 text-center">
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#3882a5]/15">
                                <CheckCircle2 className="h-8 w-8 text-[#3882a5]" />
                            </div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-[#074463]">Already Booked</h2>
                            <p className="mt-2 text-sm text-slate-600">You have already booked this appointment link.</p>
                        </div>
                        <CardContent className="space-y-5 p-6">
                            <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Visitor</p>
                                    <p className="text-sm font-semibold text-slate-900">{visitorData?.name || "Existing Visitor"}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Meeting With</p>
                                    <p className="text-sm font-semibold text-slate-900">{employee?.name || "-"}</p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-[#3882a5]/25 bg-[#3882a5]/8 p-4 text-center">
                                <p className="text-sm font-semibold text-[#1f4f67]">No action needed. Your previous booking is already submitted.</p>
                            </div>
                            <div className="flex justify-center">
                                <Button variant="outline" onClick={() => window.location.assign("/")}>
                                    <Home className="mr-2 h-4 w-4" /> Go Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7fafc] px-3 py-4 sm:px-5 sm:py-10">
            <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="rounded-3xl border border-[#3882a5]/15 bg-white p-4 shadow-[0_10px_30px_rgba(7,68,99,0.08)] sm:p-6">
                    <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:gap-4 sm:text-left">
                        {appointmentLinkData?.createdBy?.profilePicture ? (
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white p-1 ring-1 ring-slate-200 sm:h-16 sm:w-16">
                                <img src={appointmentLinkData.createdBy.profilePicture} alt="Logo" className="h-full w-full rounded-xl object-contain" />
                            </div>
                        ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#3882a5] text-xl font-bold text-white sm:h-16 sm:w-16">
                                {appointmentLinkData?.createdBy?.companyName?.charAt(0).toUpperCase() || "S"}
                            </div>
                        )}
                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-extrabold tracking-tight text-[#0f172a] sm:text-4xl">
                                {appointmentLinkData?.createdBy?.companyName || "Book Appointment"}
                            </h1>
                            <p className="mt-1 text-sm font-medium text-slate-500">
                                {employee?.name ? `Schedule a meeting with ${employee.name}` : "Complete both steps to confirm appointment"}
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="overflow-hidden border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-[#3882a5]/10 via-[#3882a5]/5 to-transparent px-3 py-4 sm:px-6">
                        <div className="flex items-center sm:justify-center gap-3 sm:gap-7 overflow-x-auto">
                            {[
                                { key: "verification", label: "Verify", index: 1 },
                                { key: "details", label: "Details", index: 2 },
                                { key: "photo", label: "Photo", index: 3 },
                                { key: "appointment", label: "Book", index: 4 },
                                { key: "review", label: "Review", index: 5 },
                            ].map((item, idx, arr) => {
                                const order = ["verification", "details", "photo", "appointment", "review"];
                                const currentIndex = order.indexOf(step as any);
                                const itemIndex = order.indexOf(item.key);
                                const isDone = itemIndex < currentIndex;
                                const isActive = item.key === step;
                                return (
                                    <div key={item.key} className="flex items-center gap-3 shrink-0">
                                        <div className={cn("flex items-center gap-2 text-xs sm:text-sm font-bold transition-all", isActive ? "text-[#3882a5]" : isDone ? "text-emerald-700" : "text-slate-400")}>
                                            <span className={cn("flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2", isActive ? "bg-[#3882a5] border-[#3882a5] text-white" : isDone ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-100 border-slate-200 text-slate-500")}>
                                                {isDone ? <CheckCircle2 className="h-4 w-4" /> : item.index}
                                            </span>
                                            <span className="whitespace-nowrap">{item.label}</span>
                                        </div>
                                        {idx < arr.length - 1 && <div className="hidden sm:block h-[2px] w-4 sm:w-8 rounded-full bg-slate-200" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <CardContent className="p-4 sm:p-6 lg:p-8">
                        {step === "verification" && (
                            <OtpVerificationStep
                                token={token}
                                initialPhone={appointmentLinkData?.visitorPhone}
                                companyName={appointmentLinkData?.createdBy?.companyName}
                                onVerified={handlePhoneVerified}
                            />
                        )}

                        {step === "details" && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mb-4 rounded-xl border border-[#3882a5]/20 bg-[#3882a5]/5 p-3">
                                    <h3 className="text-base font-bold text-[#1f4f67]">Step 1: Fill visitor details</h3>
                                    <p className="text-xs text-slate-600">Contact information verify karke next karein.</p>
                                </div>
                                <BookingVisitorForm
                                    initialPhone={visitorDraft?.phone || appointmentLinkData?.visitorPhone}
                                    initialEmail={appointmentLinkData?.visitorEmail}
                                    lockedEmailHelperText="This email is tied to your invite link and cannot be changed."
                                    initialValues={visitorDraft || visitorData}
                                    onSubmit={handleVisitorSubmit}
                                    isLoading={isSubmittingBooking}
                                    appointmentToken={token}
                                    collectPhotoInForm={false}
                                />
                            </div>
                        )}

                        {step === "photo" && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                                <div className="rounded-xl border border-[#3882a5]/20 bg-[#3882a5]/5 p-3">
                                    <h3 className="text-base font-bold text-[#1f4f67]">Step 2: Capture visitor photo</h3>
                                    <p className="text-xs text-slate-600">Clear face photo required for secure verification.</p>
                                </div>
                                <form onSubmit={handlePhotoSubmit(handlePhotoStepSubmit)} className="space-y-4">
                                    <div className="mx-auto w-full max-w-md rounded-xl border border-dashed border-[#3882a5]/25 bg-white p-4">
                                        <ImageUploadField
                                            name="photo"
                                            register={photoRegister as any}
                                            setValue={setPhotoValue as any}
                                            errors={photoErrors.photo as any}
                                            initialUrl={watchPhoto("photo")}
                                            label="Capture visitor face photo"
                                            enableImageCapture={true}
                                            onUploadStatusChange={setIsPhotoUploading}
                                            variant="default"
                                            autoOpenCamera={true}
                                            directCameraOnly={true}
                                        />
                                    </div>
                                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                                        <Button type="button" variant="outline" onClick={() => setStep("details")}>
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                        </Button>
                                        <Button type="submit" disabled={!watchPhoto("photo") || isPhotoUploading}>
                                            Continue to Appointment <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {step === "appointment" && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mb-4 rounded-xl border border-[#3882a5]/20 bg-[#3882a5]/5 p-3">
                                    <h3 className="text-base font-bold text-[#1f4f67]">Step 3: Book appointment</h3>
                                    <p className="text-xs text-slate-600">Choose date/time and review before submit.</p>
                                </div>
                                <div className="relative">
                                    <AppointmentBookingForm
                                        visitorId={visitorId || "000000000000000000000000"}
                                        employeeId={extractIdString(appointmentLinkData.employeeId)}
                                        employeeName={employee?.name || ""}
                                        visitorPhone={visitorDraft?.phone || visitorData?.phone || appointmentLinkData?.visitorPhone}
                                        visitorName={visitorDraft?.name || visitorData?.name || ""}
                                        onSubmit={handleAppointmentSubmit}
                                        isLoading={isSubmittingBooking}
                                        appointmentToken={token}
                                        submitLabel="Review Details"
                                    />
                                    {!visitorId && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-6 text-slate-400 hover:text-[#3882a5]"
                                            onClick={() => setStep("photo")}
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === "review" && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-4">
                                <div className="rounded-xl border border-[#3882a5]/20 bg-[#3882a5]/5 p-3">
                                    <h3 className="text-base font-bold text-[#1f4f67]">Step 4: Review & Submit</h3>
                                    <p className="text-xs text-slate-600">Final details verify karke appointment submit karein.</p>
                                </div>
                                <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Visitor</p>
                                        <p className="text-sm font-semibold text-slate-900">{visitorDraft?.name || visitorData?.name || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Email</p>
                                        <p className="text-sm font-semibold text-slate-900">{visitorDraft?.email || visitorData?.email || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {visitorDraft?.phone || visitorData?.phone || appointmentLinkData?.visitorPhone || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Meeting With</p>
                                        <p className="text-sm font-semibold text-slate-900">{employee?.name || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Date</p>
                                        <p className="text-sm font-semibold text-slate-900">{appointmentDraft?.appointmentDetails?.scheduledDate || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Time</p>
                                        <p className="text-sm font-semibold text-slate-900">{appointmentDraft?.appointmentDetails?.scheduledTime || "-"}</p>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Purpose</p>
                                    <p className="text-sm font-semibold text-slate-900">{appointmentDraft?.appointmentDetails?.purpose || "-"}</p>
                                </div>
                                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                                    <Button variant="outline" onClick={() => setStep("appointment")}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Edit appointment
                                    </Button>
                                    <Button onClick={handleFinalSubmit} disabled={isSubmittingBooking}>
                                        {isSubmittingBooking ? "Submitting..." : "Submit Request"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex flex-col items-center gap-4 py-4 sm:py-6">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold tracking-wide uppercase">
                        <ShieldCheck className="h-3 w-3" />
                        Secure Booking Powered by SafeIn
                    </div>
                    <div className="flex gap-6">
                        <a href="/privacy-policy" className="text-xs text-slate-400 hover:text-[#3882a5] transition-colors">Privacy Policy</a>
                        <a href="/contact" className="text-xs text-slate-400 hover:text-[#3882a5] transition-colors">Support</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
