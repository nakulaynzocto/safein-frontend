"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { FormContainer } from "@/components/common/formContainer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InputField } from "@/components/common/inputField";
import { SelectField } from "@/components/common/selectField";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { CountryStateCitySelect } from "@/components/common/countryStateCity";
import { TextareaField } from "@/components/common/textareaField";
import { CreateVisitorRequest, useCreateVisitorMutation } from "@/store/api/visitorApi";
import { CreditCard, Camera, CheckCircle, Info } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

const visitorDetailsSchema = yup.object({
    name: yup.string().required("Name is required"),
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

type VisitorDetailsFormData = yup.InferType<typeof visitorDetailsSchema>;

interface VisitorRegisterProps {
    onComplete?: (data: CreateVisitorRequest, visitorId?: string) => void;
    initialData?: CreateVisitorRequest | null;
    standalone?: boolean;
}

export function VisitorRegister({ onComplete, initialData, standalone = false }: VisitorRegisterProps) {
    const [createVisitor, { isLoading, isSuccess }] = useCreateVisitorMutation();
    const [generalError, setGeneralError] = useState<string | null>(null);

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
    } = useForm<VisitorDetailsFormData>({
        resolver: yupResolver(visitorDetailsSchema),
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

    const idProofTypes = [
        { value: "aadhaar", label: "Aadhaar Card" },
        { value: "pan", label: "PAN Card" },
        { value: "driving_license", label: "Driving License" },
        { value: "passport", label: "Passport" },
        { value: "other", label: "Other" },
    ];

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

    const onSubmit = async (data: VisitorDetailsFormData): Promise<void> => {
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

            {/* Personal Information Section */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <InputField
                        label="Name"
                        placeholder="Enter name"
                        error={errors.name?.message}
                        {...register("name")}
                        required
                        className="md:col-span-1"
                    />
                    <InputField
                        label="Email"
                        type="email"
                        placeholder="Enter email address"
                        error={errors.email?.message}
                        {...register("email")}
                        required
                        className="md:col-span-1"
                    />
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <PhoneInputField
                                id="phone"
                                label="Phone Number"
                                value={field.value}
                                onChange={(value) => field.onChange(value)}
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

            {/* Address Information Section */}
            <div className="space-y-4 pt-4">
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
                    label="Company Address (optional)"
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
                                    key={`idProof-${initialData?._id || "new"}`}
                                    name="idProof.image"
                                    label="ID Proof Image (optional)"
                                    register={register}
                                    setValue={setValue}
                                    errors={errors.idProof?.image}
                                    initialUrl={initialData?.idProof?.image}
                                    enableImageCapture={true}
                                />
                            </div>
                            <div className="space-y-2">
                                <ImageUploadField
                                    key={`photo-${initialData?._id || "new"}`}
                                    name="photo"
                                    label="Visitor Photo (optional)"
                                    register={register}
                                    setValue={setValue}
                                    errors={errors.photo}
                                    initialUrl={initialData?.photo}
                                    enableImageCapture={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
                <Button type="submit" variant="default" className="min-w-[140px] px-8" disabled={isLoading}>
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
