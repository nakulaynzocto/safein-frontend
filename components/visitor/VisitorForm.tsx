"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/common/actionButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { FormContainer } from "@/components/common/formContainer";
import { VisitorFormFields } from "./visitorFormFields";
import { visitorSchema, VisitorFormData, transformToVisitorPayload } from "./visitorSchema";
import { useCreateVisitorMutation, useUpdateVisitorMutation, useGetVisitorQuery, type CreateVisitorRequest } from "@/store/api/visitorApi";
import { useUploadFileMutation } from "@/store/api/uploadApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { routes } from "@/utils/routes";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import { SubscriptionActionButtons } from "@/components/common/SubscriptionActionButtons";
import { UserPlus } from "lucide-react";
import { useUserCountry } from "@/hooks/useUserCountry";

interface NewVisitorModalProps {
    visitorId?: string;
    trigger?: ReactNode;
    onSuccess?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    layout?: "modal" | "page";
}

export function NewVisitorModal({
    visitorId,
    trigger,
    onSuccess,
    open: controlledOpen,
    onOpenChange,
    layout = "modal",
}: NewVisitorModalProps) {
    const router = useRouter();
    const [internalOpen, setInternalOpen] = useState(false);
    const isPage = layout === "page";

    const open = isPage ? true : controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = isPage ? (_: boolean) => { } : onOpenChange || setInternalOpen;
    const [createVisitor, { isLoading: isCreating }] = useCreateVisitorMutation();
    const [updateVisitor, { isLoading: isUpdating }] = useUpdateVisitorMutation();
    const [uploadFile, { isLoading: isUploadingFile }] = useUploadFileMutation();
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [isFileUploading, setIsFileUploading] = useState(false);
    const { hasReachedVisitorLimit, isExpired } = useSubscriptionStatus();
    const {
        showUpgradeModal,
        openUpgradeModal,
        closeUpgradeModal
    } = useSubscriptionActions();

    const isEditMode = !!visitorId;
    const isLoading = isCreating || isUpdating || isUploadingFile;
    const defaultCountry = useUserCountry();

    const { data: visitorData, isLoading: isLoadingVisitor } = useGetVisitorQuery(visitorId!, {
        skip: !isEditMode,
    });

    // Separate states for ID Verification and Security sections
    const hasIdVerificationData =
        visitorData &&
        (visitorData.idProof?.type ||
            visitorData.idProof?.number ||
            visitorData.idProof?.image ||
            visitorData.photo);
    const hasSecurityData =
        visitorData &&
        ((visitorData as any).emergencyContacts?.length > 0);

    const [showIdVerificationFields, setShowIdVerificationFields] = useState<boolean>(!!hasIdVerificationData);
    const [showSecurityFields, setShowSecurityFields] = useState<boolean>(!!hasSecurityData);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitted },
        reset,
        setValue,
        clearErrors,
        watch,
    } = useForm<VisitorFormData>({
        resolver: yupResolver(visitorSchema) as any,
        mode: "onSubmit",
        reValidateMode: "onChange",
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            gender: "" as any,
            address: {
                street: "",
                city: "",
                state: "",
                country: defaultCountry,
            },
            idProof: {
                type: "",
                number: "",
                image: "",
            },
            photo: "",
            emergencyContacts: [],
        },
    });

    useEffect(() => {
        if (!open) {
            reset();
            setGeneralError(null);
            clearErrors();
        } else {
            // Set default country from hook when modal opens
            const currentCountry = watch("address.country");
            if (!currentCountry) {
                setValue("address.country", defaultCountry, { shouldValidate: false, shouldDirty: false });
            }
        }
    }, [open, reset, clearErrors, setValue, watch]);

    useEffect(() => {
        if (isEditMode && visitorData) {
            const hasIdVerification = !!(
                visitorData.idProof?.type ||
                visitorData.idProof?.number ||
                visitorData.idProof?.image ||
                visitorData.photo
            );
            const hasSecurity = !!(
                (visitorData as any).emergencyContacts?.length > 0
            );
            setShowIdVerificationFields(hasIdVerification);
            setShowSecurityFields(hasSecurity);

            reset({
                name: visitorData.name || "",
                email: visitorData.email || "",
                phone: visitorData.phone || "",
                gender: (visitorData as any).gender?.trim().toLowerCase() || "",
                address: {
                    street: visitorData.address?.street || "",
                    city: visitorData.address?.city || "",
                    state: visitorData.address?.state || "",
                    country: visitorData.address?.country || defaultCountry,
                },
                idProof: {
                    type: visitorData.idProof?.type || "",
                    number: visitorData.idProof?.number || "",
                    image: visitorData.idProof?.image || "",
                },
                photo: visitorData.photo || "",
                blacklisted: (visitorData as any).blacklisted || false,
                blacklistReason: (visitorData as any).blacklistReason || "",
                emergencyContacts: (visitorData as any).emergencyContacts?.map((c: any) => ({
                    name: c.name,
                    phone: c.phone?.startsWith("+") ? c.phone : `${c.countryCode || ""}${c.phone || ""}`,
                })) || [],
            });
        }
    }, [isEditMode, visitorData, reset]);

    const clearGeneralError = () => {
        if (generalError) {
            setGeneralError(null);
        }
    };

    const handleToggleIdVerification = (checked: boolean) => {
        setShowIdVerificationFields(checked);
        if (!checked) {
            setValue("idProof.type", "");
            setValue("idProof.number", "");
            setValue("idProof.image", "");
            setValue("photo", "");
        }
    };

    const handleToggleSecurity = (checked: boolean) => {
        setShowSecurityFields(checked);
        if (!checked) {
            setValue("blacklisted", false);
            setValue("blacklistReason", "");
            setValue("emergencyContacts", []);
        }
    };

    const onSubmit = async (data: VisitorFormData) => {
        try {
            setGeneralError(null);

            let finalPhotoUrl = typeof data.photo === "string" ? data.photo : undefined;
            if (data.photo instanceof File) {
                const uploadRes = await uploadFile({ file: data.photo }).unwrap();
                finalPhotoUrl = uploadRes.url;
            }

            let finalIdProofUrl = typeof data.idProof?.image === "string" ? data.idProof.image : undefined;
            if (data.idProof && data.idProof.image instanceof File) {
                const uploadRes = await uploadFile({ file: data.idProof.image }).unwrap();
                finalIdProofUrl = uploadRes.url;
            }

            const visitorPayload = transformToVisitorPayload(data, finalPhotoUrl, finalIdProofUrl);
            
            // Adjust for edit mode differences if any
            if (isEditMode) {
                (visitorPayload as any).email = (data.email?.trim() ? data.email.trim() : null);
            }


            if (isEditMode && visitorId) {
                await updateVisitor({ id: visitorId, ...visitorPayload }).unwrap();
                showSuccessToast("Visitor updated successfully");
                setOpen(false);
                reset();
                if (isPage) {
                    router.push(routes.privateroute.VISITORLIST);
                } else if (onSuccess) {
                    onSuccess();
                } else {
                    router.push(routes.privateroute.VISITORLIST);
                }
            } else {
                const result = await createVisitor(visitorPayload).unwrap();
                showSuccessToast("Visitor registered successfully");

                const newVisitorId = (result as any)?._id ||
                    (result as any)?.id ||
                    (result as any)?.data?._id ||
                    (result as any)?.data?.id ||
                    (result as any)?.visitor?._id ||
                    (result as any)?.visitor?.id;
                setOpen(false);
                reset();

                // Redirect to appointment create page with visitorId
                router.push(`${routes.privateroute.APPOINTMENTCREATE}?visitorId=${newVisitorId}`);
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || (error as any)?.message || "An error occurred during registration";
            setGeneralError(errorMessage);
        }
    };

    const defaultTrigger = <Button variant="default">{isEditMode ? "Edit Visitor" : "New Visitor"}</Button>;

    const formContent = (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 pt-2"
        >
            {generalError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{generalError}</AlertDescription>
                </Alert>
            )}

            {/* Visitor Form Fields - Common Component */}
            <VisitorFormFields
                register={register}
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
                showIdVerificationFields={showIdVerificationFields}
                onToggleIdVerificationFields={handleToggleIdVerification}
                showSecurityFields={showSecurityFields}
                onToggleSecurityFields={handleToggleSecurity}
                setIsFileUploading={setIsFileUploading}
                initialData={visitorData}
            />



            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                <ActionButton
                    type="button"
                    variant="outline"
                    onClick={() => {
                        if (isPage) {
                            router.push(routes.privateroute.VISITORLIST);
                        } else {
                            setOpen(false);
                        }
                    }}
                    disabled={isLoading || isFileUploading}
                    size="xl"
                    className="w-full px-8 sm:w-auto"
                >
                    Cancel
                </ActionButton>
                <SubscriptionActionButtons
                    isExpired={isExpired}
                    hasReachedLimit={hasReachedVisitorLimit && !isEditMode}
                    limitType="visitor"
                    showUpgradeModal={showUpgradeModal}
                    openUpgradeModal={openUpgradeModal}
                    closeUpgradeModal={closeUpgradeModal}
                    upgradeLabel="Upgrade Plan"
                    icon={UserPlus}
                    className="w-full min-w-[200px] px-8 sm:w-auto text-white"
                >
                    <ActionButton
                        type="submit"
                        variant="outline-primary"
                        disabled={isLoading || isFileUploading}
                        size="xl"
                        className="w-full min-w-[200px] px-8 sm:w-auto"
                    >
                        {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {isEditMode ? "Update Visitor" : "Register Visitor"}
                    </ActionButton>
                </SubscriptionActionButtons>
            </div>
        </form>
    );

    if (isPage) {
        return (
            <FormContainer isPage={true} isLoading={isLoadingVisitor} isEditMode={isEditMode}>
                {formContent}
            </FormContainer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-hidden bg-white p-4 sm:max-w-3xl sm:p-6 dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {isEditMode ? "Edit Visitor" : "Register New Visitor"}
                    </DialogTitle>
                </DialogHeader>
                <div className="max-h-[calc(90vh-100px)] overflow-y-auto pr-2">
                    <FormContainer isPage={false} isLoading={isLoadingVisitor} isEditMode={isEditMode}>
                        {formContent}
                    </FormContainer>
                </div>
            </DialogContent>
        </Dialog>
    );
}
