"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { FormContainer } from "@/components/common/formContainer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { CreateVisitorRequest, useCreateVisitorMutation } from "@/store/api/visitorApi";
import { CheckCircle } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { VisitorFormFields } from "./visitorFormFields";
import { visitorSchema, VisitorFormData } from "./visitorSchema";

interface VisitorRegisterProps {
    onComplete?: (data: CreateVisitorRequest, visitorId?: string) => void;
    initialData?: CreateVisitorRequest | null;
    standalone?: boolean;
}

export function VisitorRegister({ onComplete, initialData, standalone = false }: VisitorRegisterProps) {
    const [createVisitor, { isLoading, isSuccess }] = useCreateVisitorMutation();
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [isFileUploading, setIsFileUploading] = useState(false);

    const hasOptionalData =
        initialData &&
        (initialData.idProof?.type ||
            initialData.idProof?.number ||
            initialData.idProof?.image ||
            initialData.photo ||
            (initialData as any).gender ||
            (initialData as any).blacklisted ||
            (initialData as any).emergencyContact?.name);
    const [showOptionalFields, setShowOptionalFields] = useState<boolean>(!!hasOptionalData);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset,
        control,
    } = useForm<VisitorFormData>({
        resolver: yupResolver(visitorSchema),
        defaultValues: {
            name: initialData?.name || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            gender: (initialData as any)?.gender || ("" as any),
            address: {
                street: initialData?.address?.street || "",
                city: initialData?.address?.city || "",
                state: initialData?.address?.state || "",
                country: initialData?.address?.country || "",
            },
            idProof: {
                type: initialData?.idProof?.type || "",
                number: initialData?.idProof?.number || "",
                image: initialData?.idProof?.image || "",
            },
            photo: initialData?.photo || "",
            blacklisted: (initialData as any)?.blacklisted || false,
            blacklistReason: (initialData as any)?.blacklistReason || "",
            tags: (initialData as any)?.tags?.join(", ") || "",
            emergencyContact: {
                name: (initialData as any)?.emergencyContact?.name || "",
                phone: (initialData as any)?.emergencyContact?.phone || "",
            },
        },
    });



    const clearGeneralError = () => {
        if (generalError) {
            setGeneralError(null);
        }
    };

    const handleToggleChange = (checked: boolean) => {
        setShowOptionalFields(checked);
        if (!checked) {
            setValue("idProof.type", "");
            setValue("idProof.number", "");
            setValue("idProof.image", "");
            setValue("photo", "");
            setValue("gender", "" as any);
            setValue("blacklisted", false);
            setValue("blacklistReason", "");
            setValue("tags", "");
            setValue("emergencyContact.name", "");
            setValue("emergencyContact.phone", "");
        }
    };

    const onSubmit: SubmitHandler<VisitorFormData> = async (data) => {
        setGeneralError(null);

        try {
            const visitorPayload: CreateVisitorRequest = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                gender: (data.gender as any) || undefined,
                address: {
                    street: data.address.street || undefined,
                    city: data.address.city,
                    state: data.address.state,
                    country: data.address.country,
                },
                idProof:
                    data.idProof.type || data.idProof.number || data.idProof.image
                        ? {
                            type: data.idProof.type || undefined,
                            number: data.idProof.number || undefined,
                            image: data.idProof.image || undefined,
                        }
                        : undefined,
                photo: data.photo || undefined,
                blacklisted: data.blacklisted,
                blacklistReason: data.blacklistReason || undefined,
                tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : undefined,
                emergencyContact:
                    data.emergencyContact?.name || data.emergencyContact?.phone
                        ? {
                            name: data.emergencyContact.name || "",
                            phone: data.emergencyContact.phone || "",
                        }
                        : undefined,
            };

            const result = await createVisitor(visitorPayload).unwrap();
            showSuccessToast("Visitor registered successfully!");

            if (standalone) {
                reset();
            }

            if (onComplete) {
                onComplete(visitorPayload, result._id);
            }
        } catch (error: any) {
            let errorMessage = error?.data?.message || error?.message || "Failed to register visitor";

            if (errorMessage.toLowerCase().includes("id proof")) {
                errorMessage = errorMessage
                    .replace(/idProof\.type:/gi, "ID Proof Type: ")
                    .replace(/idProof\.number:/gi, "ID Proof Number: ")
                    .replace(
                        /must be at least 2 characters long/gi,
                        "must be at least 2 characters. Please enter a complete value or leave it empty",
                    )
                    .replace(/validation failed:/gi, "")
                    .trim();
            } else if (
                errorMessage.toLowerCase().includes("address.street") ||
                errorMessage.toLowerCase().includes("street address")
            ) {
                errorMessage = errorMessage
                    .replace(/address\.street:/gi, "Company Address: ")
                    .replace(/street address/gi, "Company Address")
                    .replace(
                        /must be at least 2 characters long/gi,
                        "must be at least 2 characters. Please enter a complete address or leave it empty",
                    )
                    .replace(/validation failed:/gi, "")
                    .trim();
            }

            setGeneralError(errorMessage);
            showErrorToast(errorMessage);
        }
    };

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-7xl space-y-6">
                <div className="flex min-h-[400px] items-center justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    const formContent = (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2" onChange={clearGeneralError}>
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
                showOptionalFields={showOptionalFields}
                onToggleOptionalFields={handleToggleChange}
                setIsFileUploading={setIsFileUploading}
                initialData={initialData}
            />

            {/* Submit Button */}
            <div className="flex flex-col-reverse justify-end gap-3 border-t pt-4 sm:flex-row sm:gap-4 sm:pt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onComplete?.({} as CreateVisitorRequest)} // Or handle cancel properly
                    className="h-12 w-full rounded-xl border-border px-8 font-medium sm:w-auto"
                    disabled={isLoading || isFileUploading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="default"
                    className="h-12 w-full rounded-xl bg-[#3882a5] px-8 text-white hover:bg-[#2d6a87] font-medium sm:w-auto"
                    disabled={isLoading || isFileUploading}
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Registering...
                        </>
                    ) : standalone ? (
                        <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Register Visitor
                        </>
                    ) : (
                        "Register"
                    )}
                </Button>
            </div>
        </form>
    );

    return (
        <div className="w-full">
            <FormContainer isPage={true} isLoading={false} isEditMode={false}>
                {formContent}
            </FormContainer>
        </div>
    );
}

export { VisitorRegister as VisitorDetailsStep };
