"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/common/actionButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { SelectField } from "@/components/common/selectField";
import { CountryStateCitySelect } from "@/components/common/countryStateCity";
import { TextareaField } from "@/components/common/textareaField";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { Info, CreditCard, CheckCircle } from "lucide-react";
import { InputField } from "@/components/common/inputField";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { FormContainer } from "@/components/common/formContainer";
import { VisitorFormFields } from "./visitorFormFields";
import { visitorSchema, VisitorFormData, idProofTypes } from "./visitorSchema";
import { useCreateVisitorMutation, useUpdateVisitorMutation, useGetVisitorQuery, type CreateVisitorRequest } from "@/store/api/visitorApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { routes } from "@/utils/routes";

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
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [isFileUploading, setIsFileUploading] = useState(false);

    const isEditMode = !!visitorId;
    const isLoading = isCreating || isUpdating;

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
        ((visitorData as any).emergencyContact?.name ||
            (visitorData as any).emergencyContact?.phone ||
            (visitorData as any).blacklisted ||
            (visitorData as any).tags);
    
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
    } = useForm({
        resolver: yupResolver(visitorSchema),
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
                country: "IN",
            },
            idProof: {
                type: "",
                number: "",
                image: "",
            },
            photo: "",
            blacklisted: false,
            blacklistReason: "",
            tags: "",
            emergencyContact: {
                name: "",
                phone: "",
            },
        },
    });

    useEffect(() => {
        if (!open) {
            reset();
            setGeneralError(null);
            clearErrors();
        } else {
            // Set default country to India when modal opens
            const currentCountry = watch("address.country");
            if (!currentCountry) {
                setValue("address.country", "IN", { shouldValidate: false, shouldDirty: false });
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
                (visitorData as any).emergencyContact?.name ||
                (visitorData as any).emergencyContact?.phone ||
                (visitorData as any).blacklisted ||
                (visitorData as any).tags
            );
            setShowIdVerificationFields(hasIdVerification);
            setShowSecurityFields(hasSecurity);

            reset({
                name: visitorData.name || "",
                email: visitorData.email || "",
                phone: visitorData.phone || "",
                gender: (visitorData as any).gender || "",
                address: {
                    street: visitorData.address?.street || "",
                    city: visitorData.address?.city || "",
                    state: visitorData.address?.state || "",
                    country: visitorData.address?.country || "IN",
                },
                idProof: {
                    type: visitorData.idProof?.type || "",
                    number: visitorData.idProof?.number || "",
                    image: visitorData.idProof?.image || "",
                },
                photo: visitorData.photo || "",
                blacklisted: (visitorData as any).blacklisted || false,
                blacklistReason: (visitorData as any).blacklistReason || "",
                tags: (visitorData as any).tags?.join(", ") || "",
                emergencyContact: {
                    name: (visitorData as any).emergencyContact?.name || "",
                    phone: (visitorData as any).emergencyContact?.phone || "",
                },
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
            setValue("tags", "");
            setValue("emergencyContact.name", "");
            setValue("emergencyContact.phone", "");
        }
    };

    const onSubmit = async (data: VisitorFormData) => {
        try {
            setGeneralError(null);

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

            if (isEditMode && visitorId) {
                await updateVisitor({ id: visitorId, ...visitorPayload }).unwrap();
                showSuccessToast("Visitor updated successfully");
            } else {
                await createVisitor(visitorPayload).unwrap();
                showSuccessToast("Visitor registered successfully");
            }

            setOpen(false);
            reset();

            if (isPage) {
                router.push(routes.privateroute.VISITORLIST);
            } else {
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push(routes.privateroute.VISITORLIST);
                }
            }
        } catch (error: any) {
            if (error?.data?.message) {
                const message = error.data.message.toLowerCase();
                if (message.includes("email") && message.includes("already exists")) {
                    setGeneralError("Email address is already registered");
                } else if (message.includes("phone") && message.includes("already exists")) {
                    setGeneralError("Phone number is already registered");
                } else if (message.includes("id proof")) {
                    const friendlyMessage = error.data.message
                        .replace(/idProof\.type:/gi, "ID Proof Type: ")
                        .replace(/idProof\.number:/gi, "ID Proof Number: ")
                        .replace(
                            /must be at least 2 characters long/gi,
                            "must be at least 2 characters. Please enter a complete value or leave it empty",
                        )
                        .replace(/validation failed:/gi, "")
                        .trim();
                    setGeneralError(
                        friendlyMessage ||
                        "Please check the ID proof fields. They must be at least 2 characters or left empty.",
                    );
                } else if (message.includes("address.street") || message.includes("street address")) {
                    const friendlyMessage = error.data.message
                        .replace(/address\.street:/gi, "Company Address: ")
                        .replace(/street address/gi, "Company Address")
                        .replace(
                            /must be at least 2 characters long/gi,
                            "must be at least 2 characters. Please enter a complete address or leave it empty",
                        )
                        .replace(/validation failed:/gi, "")
                        .trim();
                    setGeneralError(friendlyMessage || "Company Address must be at least 2 characters or left empty.");
                } else {
                    setGeneralError(error.data.message);
                }
            } else {
                const errorMessage =
                    error?.message || (isEditMode ? "Failed to update visitor" : "Failed to register visitor");
                setGeneralError(errorMessage);
            }
        }
    };

    const defaultTrigger = <Button variant="default">{isEditMode ? "Edit Visitor" : "New Visitor"}</Button>;

    const formContent = (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
            {generalError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{generalError}</AlertDescription>
                </Alert>
            )}

            {/* Personal Information Section */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-1">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            {...register("name")}
                            placeholder="Enter full name"
                            className={`pl-4 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium ${errors.name ? "border-destructive" : ""}`}
                        />
                        {errors.name && <span className="text-destructive text-xs">{errors.name.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-1">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            {...register("email", { onChange: clearGeneralError })}
                            placeholder="Enter email address"
                            className={`pl-4 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium ${errors.email ? "border-destructive" : ""}`}
                        />
                        {errors.email && <span className="text-destructive text-xs">{errors.email.message}</span>}
                    </div>

                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <PhoneInputField
                                id="phone"
                                label="Phone Number"
                                value={field.value}
                                onChange={(value) => {
                                    field.onChange(value);
                                    clearGeneralError();
                                }}
                                error={errors.phone?.message}
                                required
                                placeholder="Enter phone number"
                                defaultCountry="in"
                            />
                        )}
                    />

                    <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                            <SelectField
                                label="Gender"
                                placeholder="Select gender"
                                options={[
                                    { value: "male", label: "Male" },
                                    { value: "female", label: "Female" },
                                    { value: "other", label: "Other" },
                                ]}
                                value={field.value || ""}
                                onChange={(val) => field.onChange(val)}
                                error={errors.gender?.message}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
                <CountryStateCitySelect
                    value={{
                        country: watch("address.country") || "",
                        state: watch("address.state") || "",
                        city: watch("address.city") || "",
                    }}
                        onChange={(v: any) => {
                        setValue("address.country", v.country);
                        setValue("address.state", v.state);
                        setValue("address.city", v.city);
                    }}
                    errors={{
                        country: errors.address?.country?.message as string,
                        state: errors.address?.state?.message as string,
                        city: errors.address?.city?.message as string,
                    }}
                />
            </div>

            {/* Company Address Section */}
            <div className="space-y-4 pt-4">
                <TextareaField
                    label="Company Address"
                    id="address.street"
                    placeholder="Enter company address"
                    {...register("address.street")}
                    error={errors.address?.street?.message}
                    className="bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium"
                    rows={3}
                />
            </div>

            {/* ID Verification & Photos Toggle */}
            <div className="border-t pt-4">
                <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        <Info className="text-muted-foreground h-5 w-5" />
                        <div>
                            <Label htmlFor="id-verification-toggle" className="cursor-pointer text-sm font-medium">
                                ID Verification & Photos
                            </Label>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                                Add visitor photo and ID proof details
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="id-verification-toggle"
                        checked={showIdVerificationFields}
                        onCheckedChange={handleToggleIdVerification}
                        className="data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
                    />
                </div>
            </div>

            {/* ID Verification & Photos Section - Only shown when toggle is ON */}
            {showIdVerificationFields && (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-4 pt-4 duration-200">
                    <div className="space-y-4 border-t pt-4">
                        <h4 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
                            ID Verification & Photos
                        </h4>

                        <div className="space-y-4">
                            {/* Photo Uploads Row */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
                                {/* Visitor Photo */}
                                <div className="flex flex-col space-y-2">
                                    <Label className="text-foreground text-sm font-medium">
                                        Visitor Photo
                                    </Label>
                                    <div className="flex justify-start">
                                        <ImageUploadField
                                            key={`photo-${visitorId}-${visitorData?.photo}`}
                                            name="photo"
                                            label=""
                                            register={register}
                                            setValue={setValue}
                                            errors={errors.photo}
                                            initialUrl={visitorData?.photo}
                                            enableImageCapture={true}
                                            onUploadStatusChange={setIsFileUploading}
                                            variant="avatar"
                                        />
                                    </div>
                                    {errors.photo && (
                                        <p className="text-xs text-red-500 mt-1">{errors.photo.message}</p>
                                    )}
                                </div>

                                {/* ID Proof Image */}
                                <div className="flex flex-col space-y-2">
                                    <Label className="text-foreground text-sm font-medium">
                                        ID Proof Image
                                    </Label>
                                    <div className="flex justify-start">
                                        <ImageUploadField
                                            key={`idProof-${visitorId}-${visitorData?.idProof?.image}`}
                                            name="idProof.image"
                                            label=""
                                            register={register}
                                            setValue={setValue}
                                            errors={errors.idProof?.image}
                                            initialUrl={visitorData?.idProof?.image}
                                            enableImageCapture={true}
                                            onUploadStatusChange={setIsFileUploading}
                                            variant="avatar"
                                        />
                                    </div>
                                    {errors.idProof?.image && (
                                        <p className="text-xs text-red-500 mt-1">{errors.idProof.image.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* ID Proof Details Row */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
                                {/* ID Proof Type */}
                                <div className="flex flex-col space-y-2">
                                    <Controller
                                        name="idProof.type"
                                        control={control}
                                        render={({ field }) => (
                                            <>
                                                <SelectField
                                                    label="ID Proof Type"
                                                    placeholder="Select Type"
                                                    options={idProofTypes}
                                                    value={field.value || ""}
                                                    onChange={(val) => field.onChange(val)}
                                                    error={errors.idProof?.type?.message}
                                                />
                                            </>
                                        )}
                                    />
                                </div>

                                {/* ID Proof Number */}
                                <div className="flex flex-col space-y-2">
                                    <InputField
                                        label="ID Proof Number"
                                        placeholder="Enter Number"
                                        error={errors.idProof?.number?.message}
                                        {...register("idProof.number")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Security & Emergency Toggle */}
            <div className="border-t pt-4">
                <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        <CreditCard className="text-muted-foreground h-5 w-5" />
                        <div>
                            <Label htmlFor="security-toggle" className="cursor-pointer text-sm font-medium">
                                Security & Emergency
                            </Label>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                                Add emergency contact and security details
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="security-toggle"
                        checked={showSecurityFields}
                        onCheckedChange={handleToggleSecurity}
                        className="data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
                    />
                </div>
            </div>

            {/* Security & Emergency Section - Only shown when toggle is ON */}
            {showSecurityFields && (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-4 pt-4 duration-200">
                    <div className="space-y-4 border-t pt-4">
                        <h4 className="text-muted-foreground flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
                            <CreditCard className="h-4 w-4" /> Security & Emergency
                        </h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InputField
                                label="Emergency Contact Name"
                                placeholder="Enter contact name"
                                {...register("emergencyContact.name")}
                                error={errors.emergencyContact?.name?.message}
                            />
                            <InputField
                                label="Emergency Contact Phone"
                                placeholder="Enter contact phone"
                                {...register("emergencyContact.phone")}
                                error={errors.emergencyContact?.phone?.message}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <InputField
                            label="Visitor Tags (comma-separated)"
                            placeholder="VIP, Frequent, Contractor..."
                            {...register("tags")}
                            error={errors.tags?.message}
                        />
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <div className="bg-destructive/5 border-destructive/20 flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label className="text-destructive text-sm font-bold">Blacklist Visitor</Label>
                                <p className="text-muted-foreground text-[10px]">
                                    Prevent this visitor from checking in
                                </p>
                            </div>
                            <Controller
                                name="blacklisted"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
                                    />
                                )}
                            />
                        </div>

                        {watch("blacklisted") && (
                            <InputField
                                label="Blacklist Reason"
                                placeholder="Enter reason for blacklisting"
                                {...register("blacklistReason")}
                                error={errors.blacklistReason?.message}
                            />
                        )}
                    </div>
                </div>
            )}

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
