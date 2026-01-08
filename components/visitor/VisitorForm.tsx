"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SelectField } from "@/components/common/selectField";
import { CountryStateCitySelect } from "@/components/common/countryStateCity";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { FormContainer } from "@/components/common/formContainer";
import {
    CreateVisitorRequest,
    useCreateVisitorMutation,
    useGetVisitorQuery,
    useUpdateVisitorMutation,
} from "@/store/api/visitorApi";
import { showSuccessToast } from "@/utils/toast";
import { routes } from "@/utils/routes";
import { CreditCard, Camera, CheckCircle, Info } from "lucide-react";
import { TextareaField } from "../common/textareaField";
import { Switch } from "@/components/ui/switch";
import { InputField } from "@/components/common/inputField";

const visitorSchema = yup.object({
    name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
    email: yup.string().email("Invalid email address").required("Email is required"),
    phone: yup.string().required("Phone number is required"),
    gender: yup.string().oneOf(["male", "female", "other"], "Please select gender").optional(),
    address: yup.object({
        street: yup.string().optional(),
        city: yup.string().required("City is required"),
        state: yup.string().required("State is required"),
        country: yup.string().required("Country is required"),
    }),
    idProof: yup.object({
        type: yup.string().optional(),
        number: yup.string().optional(),
        image: yup.string().optional(),
    }),
    photo: yup.string().optional().default(""),
    blacklisted: yup.boolean().default(false),
    blacklistReason: yup.string().optional(),
    tags: yup.string().optional(),
    emergencyContact: yup
        .object({
            name: yup.string().optional(),
            phone: yup.string().optional(),
        })
        .optional(),
});

type VisitorFormData = yup.InferType<typeof visitorSchema>;

const idProofTypes = [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "pan", label: "PAN Card" },
    { value: "driving_license", label: "Driving License" },
    { value: "passport", label: "Passport" },
    { value: "other", label: "Other" },
];

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
    const setOpen = isPage ? (_: boolean) => {} : onOpenChange || setInternalOpen;
    const [createVisitor, { isLoading: isCreating }] = useCreateVisitorMutation();
    const [updateVisitor, { isLoading: isUpdating }] = useUpdateVisitorMutation();
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [isFileUploading, setIsFileUploading] = useState(false);

    const isEditMode = !!visitorId;
    const isLoading = isCreating || isUpdating;

    const { data: visitorData, isLoading: isLoadingVisitor } = useGetVisitorQuery(visitorId!, {
        skip: !isEditMode,
    });

    const hasOptionalData =
        visitorData &&
        (visitorData.idProof?.type ||
            visitorData.idProof?.number ||
            visitorData.idProof?.image ||
            visitorData.photo ||
            (visitorData as any).gender ||
            (visitorData as any).blacklisted ||
            (visitorData as any).emergencyContact?.name);
    const [showOptionalFields, setShowOptionalFields] = useState<boolean>(!!hasOptionalData);

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
                country: "",
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
        }
    }, [open, reset, clearErrors]);

    useEffect(() => {
        if (isEditMode && visitorData) {
            const hasOptional = !!(
                visitorData.idProof?.type ||
                visitorData.idProof?.number ||
                visitorData.idProof?.image ||
                visitorData.photo ||
                (visitorData as any).gender ||
                (visitorData as any).blacklisted ||
                (visitorData as any).emergencyContact?.name
            );
            setShowOptionalFields(hasOptional);

            reset({
                name: visitorData.name || "",
                email: visitorData.email || "",
                phone: visitorData.phone || "",
                gender: (visitorData as any).gender || "",
                address: {
                    street: visitorData.address?.street || "",
                    city: visitorData.address?.city || "",
                    state: visitorData.address?.state || "",
                    country: visitorData.address?.country || "",
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
                            className={`h-9 ${errors.name ? "border-destructive" : ""}`}
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
                            className={`h-9 ${errors.email ? "border-destructive" : ""}`}
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
                    onChange={(v) => {
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
                    rows={3}
                />
            </div>

            {/* Optional Fields Toggle */}
            <div className="border-t pt-4">
                <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        <Info className="text-muted-foreground h-5 w-5" />
                        <div>
                            <Label htmlFor="optional-fields-toggle" className="cursor-pointer text-sm font-medium">
                                Add Additional Information
                            </Label>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                                Include optional details like ID proof, photos, and notes
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="optional-fields-toggle"
                        checked={showOptionalFields}
                        onCheckedChange={handleToggleChange}
                    />
                </div>
            </div>

            {/* Optional Fields Section - Only shown when toggle is ON */}
            {showOptionalFields && (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-4 pt-4 duration-200">
                    {/* Emergency Contact & Security Section */}
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
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
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

                    <div className="space-y-4 border-t pt-4">
                        <InputField
                            label="Visitor Tags (comma-separated)"
                            placeholder="VIP, Frequent, Contractor..."
                            {...register("tags")}
                            error={errors.tags?.message}
                        />
                    </div>

                    {/* ID Proof & Additional Information Section */}
                    <div className="space-y-4 border-t pt-4">
                        <h4 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
                            ID Verification
                        </h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Controller
                                name="idProof.type"
                                control={control}
                                render={({ field }) => (
                                    <SelectField
                                        label="ID Proof Type (optional)"
                                        placeholder="Select ID proof type"
                                        options={idProofTypes}
                                        value={field.value || ""}
                                        onChange={(val) => field.onChange(val)}
                                        error={errors.idProof?.type?.message}
                                    />
                                )}
                            />
                            <InputField
                                label="ID Proof Number (optional)"
                                placeholder="Enter ID proof number"
                                error={errors.idProof?.number?.message}
                                {...register("idProof.number")}
                            />
                        </div>
                    </div>

                    {/* Image Uploads Section */}
                    <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <ImageUploadField
                                    key={`idProof-${visitorId}-${visitorData?.idProof?.image}`}
                                    name="idProof.image"
                                    label="ID Proof Image (optional)"
                                    register={register}
                                    setValue={setValue}
                                    errors={errors.idProof?.image}
                                    initialUrl={visitorData?.idProof?.image}
                                    enableImageCapture={true}
                                    onUploadStatusChange={setIsFileUploading}
                                />
                            </div>
                            <div className="space-y-2">
                                <ImageUploadField
                                    key={`photo-${visitorId}-${visitorData?.photo}`}
                                    name="photo"
                                    label="Visitor Photo (optional)"
                                    register={register}
                                    setValue={setValue}
                                    errors={errors.photo}
                                    initialUrl={visitorData?.photo}
                                    enableImageCapture={true}
                                    onUploadStatusChange={setIsFileUploading}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`flex w-full flex-col justify-end gap-2 sm:flex-row ${isPage ? "pt-4" : ""}`}>
                <Button
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
                    className="w-full sm:w-auto"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="default"
                    disabled={isLoading || isFileUploading}
                    className="w-full sm:w-auto"
                >
                    {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isEditMode ? "Update Visitor" : "Register Visitor"}
                </Button>
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
