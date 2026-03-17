"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
    useGetAppointmentLinkByTokenQuery,
    useCreateVisitorThroughLinkMutation,
    useCreateAppointmentThroughLinkMutation,
} from "@/store/api/appointmentLinkApi";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    Clock, 
    CheckCircle2, 
    XCircle, 
    User, 
    Building2, 
    CalendarCheck, 
    ShieldCheck,
    ArrowRight,
    ArrowLeft
} from "lucide-react";
import { StatusPage } from "@/components/common/statusPage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { extractIdString, isValidId } from "@/utils/idExtractor";
import { cn } from "@/lib/utils";

const AppointmentBookingForm = dynamic(() => import("@/components/appointment/AppointmentBookingForm").then(mod => mod.AppointmentBookingForm), {
    loading: () => <FormSkeleton title="Appointment Details" />
});

const BookingVisitorForm = dynamic(() => import("@/components/appointment/BookingVisitorForm").then(mod => mod.BookingVisitorForm), {
    loading: () => <FormSkeleton title="Visitor Information" />
});

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

    const [step, setStep] = useState<"loading" | "visitor" | "appointment" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [appointmentLinkData, setAppointmentLinkData] = useState<any>(null);
    const [visitorData, setVisitorData] = useState<any>(null);

    const {
        data: linkData,
        isLoading: isLoadingLink,
        error: linkError,
    } = useGetAppointmentLinkByTokenQuery(token || "", { 
        skip: !token,
        refetchOnMountOrArgChange: true 
    });

    const [createVisitorThroughLink, { isLoading: isCreatingVisitor }] = useCreateVisitorThroughLinkMutation();
    const [createAppointmentThroughLink, { isLoading: isCreatingAppointment }] =
        useCreateAppointmentThroughLinkMutation();

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
                setStep("appointment");
            } else {
                setStep("visitor");
            }
        }
    }, [linkData, linkError, token]);

    const handleVisitorSubmit = async (data: any) => {
        if (!token) return;
        try {
            const response = await createVisitorThroughLink({ token, visitorData: data }).unwrap();
            const result = (response as any)?.data || response;
            const extractedId = extractIdString(result?._id || result?.id);

            if (isValidId(extractedId)) {
                setVisitorId(extractedId);
                showSuccessToast("Information saved! Let's schedule the time.");
                setStep("appointment");
            } else {
                showErrorToast("Failed to process visitor ID.");
            }
        } catch (error: any) {
            showErrorToast(error?.data?.message || error?.message || "Failed to save information");
        }
    };

    const handleAppointmentSubmit = async (appointmentData: any) => {
        if (!visitorId || !appointmentLinkData || !token) return;
        try {
            const { visitorId: _, employeeId: __, ...restData } = appointmentData;
            const cleanData = {
                ...restData,
                visitorId: extractIdString(visitorId),
                employeeId: extractIdString(appointmentLinkData.employeeId),
            };
            await createAppointmentThroughLink({ token, appointmentData: cleanData }).unwrap();
            setStep("success");
        } catch (error: any) {
            showErrorToast(error?.data?.message || error?.message || "Failed to book appointment");
        }
    };

    const errorConfig = useMemo(() => {
        const messageStr = String(errorMessage || "");
        const isExpired = /expired|used|created|isbooked/i.test(messageStr);
        return {
            title: isExpired ? "Link Expired" : "Invalid Link",
            message: isExpired 
                ? "This appointment link has expired or has already been used. Please contact the person who sent you this link."
                : "This appointment link is invalid. Please contact the person who sent you this link.",
        };
    }, [errorMessage]);

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
            <StatusPage
                type="success"
                title="Appointment Booked!"
                message="Your visit has been confirmed successfully."
                description="A confirmation has been sent to your email. We look forward to seeing you!"
                showHomeButton={true}
            />
        );
    }

    const employee = appointmentLinkData?.employee || (typeof appointmentLinkData?.employeeId === 'object' ? appointmentLinkData.employeeId : null);

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 px-4 py-8 sm:py-16 selection:bg-[#3882a5]/30">
            <div className="mx-auto max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Branding Section */}
                <div className="flex flex-col items-center gap-4 text-center">
                    {appointmentLinkData?.createdBy?.profilePicture ? (
                        <div className="relative group">
                            <div className="absolute -inset-1 rounded-2xl bg-[#3882a5] opacity-20 blur transition group-hover:opacity-40" />
                            <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 p-2">
                                <img
                                    src={appointmentLinkData.createdBy.profilePicture}
                                    alt="Logo"
                                    className="h-full w-full object-contain"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-[#3882a5] shadow-xl text-white font-bold text-2xl">
                            {appointmentLinkData?.createdBy?.companyName?.charAt(0).toUpperCase() || "S"}
                        </div>
                    )}
                    
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                            {appointmentLinkData?.createdBy?.companyName || "Book Appointment"}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            {employee?.name ? `Schedule a meeting with ${employee.name}` : "Please fill in the details below"}
                        </p>
                    </div>
                </div>

                <Card className="overflow-hidden border-0 bg-white/70 shadow-2xl backdrop-blur-xl ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
                    {/* Visual Progress Header */}
                    <div className="bg-[#3882a5]/5 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                        <div className="flex items-center justify-center gap-4 sm:gap-12">
                            <div className={cn(
                                "flex items-center gap-2 text-sm font-bold transition-all duration-300",
                                step === "visitor" ? "text-[#3882a5]" : "text-slate-400"
                            )}>
                                <div className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                                    step === "visitor" ? "bg-[#3882a5] border-[#3882a5] text-white shadow-lg" : "bg-emerald-50 border-emerald-500 text-emerald-600"
                                )}>
                                    {step === "visitor" ? "1" : <CheckCircle2 className="h-4 w-4" />}
                                </div>
                                <span className={cn("hidden sm:inline", step !== "visitor" && "opacity-60")}>Visitor Info</span>
                            </div>
                            
                            <div className="h-0.5 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />

                            <div className={cn(
                                "flex items-center gap-2 text-sm font-bold transition-all duration-300",
                                step === "appointment" ? "text-[#3882a5]" : "text-slate-400"
                            )}>
                                <div className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                                    step === "appointment" ? "bg-[#3882a5] border-[#3882a5] text-white shadow-lg" : "bg-slate-100 border-slate-200 text-slate-400"
                                )}>
                                    2
                                </div>
                                <span className="hidden sm:inline">Scheduling</span>
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-6 sm:p-10">
                        {step === "visitor" && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mb-8 flex items-center gap-3">
                                    <div className="h-10 w-1 rounded-full bg-[#3882a5]" />
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Personal Details</h3>
                                </div>
                                <BookingVisitorForm
                                    initialEmail={appointmentLinkData?.visitorEmail}
                                    initialPhone={appointmentLinkData?.visitorPhone}
                                    initialValues={visitorData}
                                    onSubmit={handleVisitorSubmit}
                                    isLoading={isCreatingVisitor}
                                    appointmentToken={token}
                                />
                            </div>
                        )}

                        {step === "appointment" && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mb-8 flex items-center gap-3">
                                    <div className="h-10 w-1 rounded-full bg-[#3882a5]" />
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Meeting Schedule</h3>
                                        <p className="text-xs text-slate-400 mt-1 font-medium">Schedule your visit with {employee?.name}</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <AppointmentBookingForm
                                        visitorId={visitorId!}
                                        employeeId={extractIdString(appointmentLinkData.employeeId)}
                                        employeeName={employee?.name || ""}
                                        visitorEmail={appointmentLinkData.visitorEmail}
                                        visitorName={visitorData?.name || ""}
                                        onSubmit={handleAppointmentSubmit}
                                        isLoading={isCreatingAppointment}
                                        appointmentToken={token}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-6 text-slate-400 hover:text-[#3882a5]"
                                        onClick={() => setStep("visitor")}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Visitor Info
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer Brand Info */}
                <div className="flex flex-col items-center gap-4 py-8 border-t border-slate-100 dark:border-slate-800">
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
