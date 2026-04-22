"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Button } from "@/components/ui/button";
import { FormContainer } from "@/components/common/formContainer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { CreateVisitorRequest, useCreateVisitorMutation } from "@/store/api/visitorApi";
import { useUploadFileMutation } from "@/store/api";
import { CheckCircle, CalendarClock, User, Image, ShieldCheck } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { VisitorFormFields } from "./visitorFormFields";
import { visitorSchema, VisitorFormData, transformToVisitorPayload } from "./visitorSchema";
import { useUserCountry } from "@/hooks/useUserCountry";
import { useVisitorExistenceCheck } from "@/hooks/useVisitorExistenceCheck";
import { ConfirmationDialog } from "@/components/common/confirmationDialog";
import { useRouter } from "next/navigation";
import { routes } from "@/utils/routes";
import { useGetSettingsQuery } from "@/store/api/settingsApi";

interface VisitorRegisterProps {
    onComplete?: (data: CreateVisitorRequest, visitorId?: string) => void;
    initialData?: CreateVisitorRequest | null;
    standalone?: boolean;
    visitorId?: string;
}

const ImagePreview = ({ src, className, fallbackIcon: Icon }: { src: any, className?: string, fallbackIcon: any }) => {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (src instanceof File) {
            const u = URL.createObjectURL(src);
            setUrl(u);
            return () => URL.revokeObjectURL(u);
        } else if (typeof src === "string") {
            setUrl(src);
        } else {
            setUrl(null);
        }
    }, [src]);

    if (!url) return <div className={cn("bg-slate-100 flex items-center justify-center text-slate-400", className)}><Icon className="h-10 w-10 opacity-50" /></div>;
    return <img src={url} className={cn("object-cover", className)} alt="Visitor" />;
};

export function VisitorRegister({ onComplete, initialData, standalone = false, visitorId: existingVisitorId }: VisitorRegisterProps) {
    const router = useRouter();
    const [createVisitor, { isLoading: isCreating }] = useCreateVisitorMutation();
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
    const [isPending, setIsPending] = useState(false);
    const [step, setStep] = useState<"details" | "photo" | "id_proof" | "preview">("details");
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [isFileUploading, setIsFileUploading] = useState(false);
    const defaultCountry = useUserCountry();

    const { data: settings } = useGetSettingsQuery();

    // Steps definition for type safety
    const allStepOptions = [
        { key: "details", label: "Basic Details", mobileLabel: "Details" },
        { key: "photo", label: "Visitor Photo", mobileLabel: "Photo" },
        { key: "id_proof", label: "ID & Tags", mobileLabel: "ID" },
        { key: "preview", label: "Review & Save", mobileLabel: "Review" },
    ] as const;

    type StepKey = (typeof allStepOptions)[number]["key"];

    // Dynamic Steps Configuration
    const steps = useMemo(() => {
        const baseSteps: { key: StepKey; label: string; mobileLabel: string }[] = [
            { key: "details", label: "Basic Details", mobileLabel: "Details" },
            { key: "photo", label: "Visitor Photo", mobileLabel: "Photo" },
            { key: "id_proof", label: "ID & Tags", mobileLabel: "ID" },
            { key: "preview", label: "Review & Save", mobileLabel: "Review" }
        ];

        return baseSteps;
    }, []);

    const activeStepIndex = steps.findIndex((s) => s.key === step);

    // --- Existence Check ---
    const [showExistenceModal, setShowExistenceModal] = useState(false);
    const [dismissedVisitorId, setDismissedVisitorId] = useState<string | null>(null);

    // Separate states for section visibility
    const [showIdVerificationFields, setShowIdVerificationFields] = useState<boolean>(true);
    const [showSecurityFields, setShowSecurityFields] = useState<boolean>(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset,
        control,
        trigger,
        setError,
    } = useForm<VisitorFormData>({
        resolver: yupResolver(visitorSchema) as any,
        defaultValues: {
            name: initialData?.name || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            gender: (initialData as any)?.gender?.trim().toLowerCase() || ("" as any),
            address: {
                street: initialData?.address?.street || "",
                city: initialData?.address?.city || "",
                state: initialData?.address?.state || "",
                country: initialData?.address?.country || defaultCountry,
            },
            idProof: {
                type: initialData?.idProof?.type || "",
                number: initialData?.idProof?.number || "",
                image: initialData?.idProof?.image || "",
            },
            photo: initialData?.photo || "",
            emergencyContacts: (initialData as any)?.emergencyContacts?.map((c: any) => ({
                name: c.name,
                phone: c.phone?.startsWith("+") ? c.phone : `${c.countryCode || ""}${c.phone || ""}`,
            })) || [],
        },
    });

    const watchedPhone = watch("phone");
    const { phoneExists, foundVisitor } = useVisitorExistenceCheck(watchedPhone, existingVisitorId);

    // Auto-trigger existence modal
    useEffect(() => {
        if (phoneExists && foundVisitor) {
            // Only show if we haven't already shown/dismissed for THIS specific visitor ID
            if (foundVisitor._id !== dismissedVisitorId) {
                setShowExistenceModal(true);
            }
        } else if (!phoneExists) {
            // Reset dismissal if no match is found, so it can re-trigger if a new match appears later
            setDismissedVisitorId(null);
        }
    }, [phoneExists, foundVisitor, dismissedVisitorId]);

    const handleBookAppointment = useCallback(() => {
        if (foundVisitor) {
            router.push(`${routes.privateroute.APPOINTMENTCREATE}?visitorId=${foundVisitor._id}`);
            setShowExistenceModal(false);
        }
    }, [foundVisitor, router]);

    const handleDismissModal = useCallback(() => {
        if (foundVisitor) {
            setDismissedVisitorId(foundVisitor._id);
        }
        setShowExistenceModal(false);
    }, [foundVisitor]);

    const handleAutoFill = useCallback(() => {
        if (foundVisitor) {
            reset({
                name: foundVisitor.name,
                email: foundVisitor.email || "",
                phone: foundVisitor.phone,
                gender: (foundVisitor as any).gender || "",
                address: {
                    street: foundVisitor.address?.street || "",
                    city: foundVisitor.address?.city || "",
                    state: foundVisitor.address?.state || "",
                    country: foundVisitor.address?.country || defaultCountry,
                },
                idProof: {
                    type: foundVisitor.idProof?.type || "",
                    number: foundVisitor.idProof?.number || "",
                    image: foundVisitor.idProof?.image || "",
                },
                photo: foundVisitor.photo || "",
                emergencyContacts: foundVisitor.emergencyContacts?.map((c: any) => ({
                    name: c.name,
                    phone: c.phone,
                })) || [],
            });
            
            // Set fields visibility if data exists
            if (foundVisitor.idProof?.type || foundVisitor.idProof?.number) {
                 setShowIdVerificationFields(true);
            }
            if (foundVisitor.emergencyContacts && foundVisitor.emergencyContacts.length > 0) {
                 setShowSecurityFields(true);
            }

            setStep("preview");
            setShowExistenceModal(false);
            setDismissedVisitorId(foundVisitor._id);
            showSuccessToast("Details auto-filled from your previous visit!");
        }
    }, [foundVisitor, reset, defaultCountry, showSuccessToast]);

    const handleDismissExistenceModal = useCallback(() => {
        handleDismissModal();
    }, [handleDismissModal]);

    const clearGeneralError = () => {
        if (generalError) {
            setGeneralError(null);
        }
    };

    const handleNextStep = async () => {
        let fieldsToValidate: any[] = [];
        if (step === "details") {
            fieldsToValidate = ["name", "phone", "gender", "address.country", "address.state", "address.city"];
        } else if (step === "id_proof") {
             fieldsToValidate = ["idProof.type", "idProof.number"];
        }

        const isValid = fieldsToValidate.length > 0 
            ? await trigger(fieldsToValidate as any)
            : true;

        if (isValid) {
            // Extra check for photo if enabled in settings
            if (step === "photo" && settings?.features?.enableVisitorImageCapture) {
                const photo = watch("photo");
                if (!photo) {
                    setError("photo", { type: "manual", message: "Visitor photo is required" });
                    return;
                }
            }

            const nextStep = steps[activeStepIndex + 1]?.key;
            if (nextStep) {
                setStep(nextStep as any);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
    };

    const handlePrevStep = () => {
        const prevStep = steps[activeStepIndex - 1]?.key;
        if (prevStep) {
            setStep(prevStep as any);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const onSubmit: SubmitHandler<VisitorFormData> = async (data) => {
        // Only allow submission if we are on the final preview step
        if (step !== "preview") return;
        
        setIsPending(true);
        setGeneralError(null);

        try {
            let photoUrl = data.photo as string;
            let idProofImageUrl = data.idProof.image as string;

            // Handle delayed uploads
            if (data.photo instanceof File) {
                const res = await uploadFile({ file: data.photo }).unwrap();
                photoUrl = res.url;
            }

            if (data.idProof.image instanceof File) {
                const res = await uploadFile({ file: data.idProof.image }).unwrap();
                idProofImageUrl = res.url;
            }

            const visitorPayload = transformToVisitorPayload(data, photoUrl, idProofImageUrl);


            const result = await createVisitor(visitorPayload).unwrap();
            showSuccessToast("Visitor registered successfully!");

            if (standalone) {
                reset();
            }

            if (onComplete) {
                // Robustly extract ID from various possible response structures
                const visitorId = (result as any)?.data?._id || (result as any)?.data?.id || (result as any)?._id || (result as any)?.id;
                onComplete(visitorPayload, visitorId);
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || "Failed to register visitor";
            setGeneralError(errorMessage);
            showErrorToast(errorMessage);
        } finally {
            setIsPending(false);
        }
    };

    if (isCreating || (isPending && step !== "preview")) {
        return (
            <div className="mx-auto w-full max-w-7xl space-y-6">
                <div className="flex min-h-[400px] items-center justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    const formContent = (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 pt-2"
            onChange={clearGeneralError}
        >
            {generalError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{generalError}</AlertDescription>
                </Alert>
            )}

            {/* Stepper Header */}
            <div className="mb-8 border-b border-border/50 pb-6">
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
                                        {isDone ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                                    </span>
                                    <span className={cn("text-xs font-semibold", isActive ? "text-[#1f4f67]" : isDone ? "text-emerald-700" : "text-slate-500")}>
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
                    {steps.map((item, idx) => {
                        const isDone = idx < activeStepIndex;
                        const isActive = idx === activeStepIndex;
                        return (
                            <div key={item.key} className="flex flex-1 flex-col items-center gap-1.5 px-0.5">
                                <div 
                                    className={cn(
                                        "flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold transition-all",
                                        isActive && "border-[#3882a5] bg-[#3882a5] text-white shadow-md ring-2 ring-[#3882a5]/20",
                                        isDone && "border-emerald-500 bg-emerald-500 text-white",
                                        !isDone && !isActive && "border-slate-300 bg-white text-slate-400"
                                    )}
                                >
                                    {isDone ? <CheckCircle className="h-3 w-3" /> : idx + 1}
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

            {/* Step 1: Details */}
            {step === "details" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <VisitorFormFields
                        register={register}
                        control={control}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                        showIdVerificationFields={false}
                        onToggleIdVerificationFields={() => {}}
                        showSecurityFields={false}
                        onToggleSecurityFields={() => {}}
                        setIsFileUploading={setIsFileUploading}
                        initialData={initialData}
                        phoneExists={phoneExists}
                        step={step}
                        enableVisitorImageCapture={settings?.features?.enableVisitorImageCapture}
                    />
                </div>
            )}

            {/* Step 2: Photo */}
            {step === "photo" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <VisitorFormFields
                        register={register}
                        control={control}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                        showIdVerificationFields={true}
                        onToggleIdVerificationFields={() => {}}
                        showSecurityFields={false}
                        onToggleSecurityFields={() => {}}
                        setIsFileUploading={setIsFileUploading}
                        initialData={initialData}
                        step={step}
                        enableVisitorImageCapture={settings?.features?.enableVisitorImageCapture}
                    />
                </div>
            )}

            {/* Step 3: ID Proof & Tags */}
            {step === "id_proof" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <VisitorFormFields
                        register={register}
                        control={control}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                        showIdVerificationFields={true}
                        onToggleIdVerificationFields={() => {}}
                        showSecurityFields={true}
                        onToggleSecurityFields={() => {}}
                        setIsFileUploading={setIsFileUploading}
                        initialData={initialData}
                        step={step}
                        enableVisitorImageCapture={settings?.features?.enableVisitorImageCapture}
                    />
                </div>
            )}

            {/* Step 4: Preview */}
            {step === "preview" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                    <div className="bg-[#f8fcff] border border-[#3882a5]/20 rounded-2xl p-6 shadow-sm overflow-hidden">
                        <h3 className="text-lg font-bold text-[#1f4f67] mb-6 border-b pb-4 flex items-center gap-2">
                             Review Visitor Registration
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Top row: Profile & Bio */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    {(settings?.features?.enableVisitorImageCapture === true || watch("photo")) && (
                                        <div className="h-20 w-20 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-white shrink-0">
                                            <ImagePreview 
                                                src={watch("photo")} 
                                                className="h-full w-full" 
                                                fallbackIcon={User} 
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xl font-bold text-[#0f172a]">{watch("name")}</p>
                                        <p className="text-sm font-medium text-slate-500">{watch("phone")}</p>
                                        <p className="text-xs text-slate-400 capitalize">{watch("gender")}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 rounded-xl bg-white/50 p-4 ring-1 ring-slate-100">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium tracking-tight">Location</span>
                                        <span className="font-bold text-[#1f4f67]">{watch("address.city")}, {watch("address.state")}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-t pt-3">
                                        <span className="text-slate-500 font-medium tracking-tight">Email</span>
                                        <span className="font-bold text-[#1f4f67]">{watch("email") || "Not provided"}</span>
                                    </div>
                                    {watch("address.street") && (
                                        <div className="border-t pt-3">
                                            <p className="text-xs text-slate-500 mb-1">Company Address</p>
                                            <p className="text-xs font-medium text-[#1f4f67] line-clamp-2">{watch("address.street")}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Verification Data */}
                            <div className="space-y-6">
                                <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 h-full">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Verification Details</h4>
                                    
                                    <div className="flex items-start gap-4 mb-5">
                                    <div className="h-14 w-20 rounded-lg border border-slate-100 bg-slate-50/50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        <ImagePreview 
                                            src={watch("idProof.image")} 
                                            className="h-full w-full" 
                                            fallbackIcon={ShieldCheck} 
                                        />
                                    </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase leading-none mb-1">ID Proof</p>
                                            <p className="text-sm font-bold text-[#1f4f67]">{watch("idProof.type") || "None selected"}</p>
                                            <p className="text-xs font-mono text-[#3882a5] mt-1">{watch("idProof.number") || "---"}</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit/Navigation Button */}
            <div className="flex flex-col-reverse justify-end gap-4 border-t pt-4 sm:flex-row sm:pt-6">
                <div className="flex">
                    <Button
                        key={`prev-${step}`}
                        type="button"
                        variant="outline"
                        onClick={activeStepIndex === 0 ? () => router.back() : handlePrevStep}
                        className="h-12 flex-1 rounded-xl border-slate-200 px-6 font-semibold sm:flex-none transition-all hover:bg-slate-50"
                        disabled={isPending || isCreating || isUploading}
                    >
                        {activeStepIndex === 0 ? "Cancel" : "Previous Step"}
                    </Button>
                </div>
                
                <div className="flex flex-1 gap-3 sm:flex-none">
                    {step === "preview" ? (
                        <Button
                            key="submit-finalize"
                            type="submit"
                            variant="default"
                            className="h-12 w-full rounded-xl bg-[#3882a5] px-8 text-white hover:bg-[#2d6a87] font-bold shadow-lg shadow-[#3882a5]/20 sm:w-auto"
                            disabled={isPending || isCreating || isUploading}
                        >
                            {isPending || isCreating || isUploading ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Registering...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Finalize Registration
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            key="submit-next"
                            type="button"
                            onClick={handleNextStep}
                            className="h-12 w-full rounded-xl bg-[#3882a5] px-8 text-white hover:bg-[#2d6a87] font-bold shadow-lg shadow-[#3882a5]/20 sm:w-auto"
                            disabled={isFileUploading || isUploading || isPending}
                        >
                            Continue to {steps[activeStepIndex + 1]?.label}
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );

    return (
        <div className="w-full">
            <FormContainer isPage={true} isLoading={false} isEditMode={false}>
                {formContent}
            </FormContainer>

            {/* Visitor Already Exists Modal */}
            <ConfirmationDialog
                open={showExistenceModal}
                onOpenChange={(open) => {
                    if (!open) handleDismissExistenceModal();
                }}
                title="Visitor Already Exists"
                description={
                    <div className="space-y-3">
                        <p>
                            A visitor named <span className="font-bold text-[#3882a5]">{foundVisitor?.name}</span> with phone number {watchedPhone} is already in the system.
                        </p>
                        <div className="rounded-xl bg-[#3882a5]/5 border border-[#3882a5]/10 p-3 mt-4">
                            <p className="text-[11px] font-semibold text-[#3882a5] uppercase tracking-wider mb-1">Recommended Actions</p>
                            <p className="text-[12px] leading-relaxed text-slate-600">
                                Choose <span className="font-bold text-slate-900 underline underline-offset-2">Book Appointment</span> to skip registration, or <span className="font-bold text-slate-900 underline underline-offset-2">Auto-fill & Review</span> to update their details.
                            </p>
                        </div>
                    </div>
                }
                confirmText="Book Appointment"
                secondaryActionText="Auto-fill & Review"
                cancelText="Stay Here"
                onConfirm={handleBookAppointment}
                onSecondaryAction={handleAutoFill}
                onCancel={handleDismissExistenceModal}
            />
        </div>
    );
}

export { VisitorRegister as VisitorDetailsStep };
