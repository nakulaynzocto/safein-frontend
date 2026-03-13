"use client";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { validatePhone, formatPhoneForSubmission } from "@/utils/phoneUtils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InputField } from "@/components/common/inputField";
import { TextareaField } from "@/components/common/textareaField";
import { SelectField } from "@/components/common/selectField";
import { CountryStateCitySelect } from "@/components/common/countryStateCity";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { useEffect, useState } from "react";
import { FileText, Camera, Fingerprint } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const bookingVisitorSchema = yup.object({
    name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
    email: yup.string().email("Invalid email address").required("Email is required"),
    phone: yup
        .string()
        .required("Phone number is required")
        .test("is-valid-phone", "Please enter a valid global phone number with country code", (value) => 
            validatePhone(value)
        ),
    address: yup.object({
        street: yup
            .string()
            .required("Company Address is required")
            .min(2, "Company Address must be at least 2 characters"),
        city: yup.string().required("City is required"),
        state: yup.string().required("State is required"),
        country: yup.string().required("Country is required"),
    }),
    idProof: yup.object({
        type: yup.string().optional(),
        number: yup.string().optional(),
        image: yup.string().optional(),
    }),
    photo: yup.string().required("Visitor Photo is required"),
});

type BookingVisitorFormData = {
    name: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
    };
    idProof: {
        type: string;
        number: string;
        image?: string;
    };
    photo: string;
};

const idProofTypes = [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "pan", label: "PAN Card" },
    { value: "driving_license", label: "Driving License" },
    { value: "passport", label: "Passport" },
    { value: "other", label: "Other" },
];

interface BookingVisitorFormProps {
    initialEmail?: string;
    initialPhone?: string;
    initialValues?: Partial<BookingVisitorFormData>;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    appointmentToken?: string; // Token for public upload endpoint
}

export function BookingVisitorForm({
    initialEmail,
    initialPhone,
    initialValues,
    onSubmit,
    isLoading = false,
    appointmentToken,
}: BookingVisitorFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        watch,
    } = useForm<BookingVisitorFormData>({
        resolver: yupResolver(bookingVisitorSchema) as any,
        defaultValues: {
            name: initialValues?.name || "",
            email: initialValues?.email || initialEmail || "",
            phone: initialValues?.phone || initialPhone || "",
            address: {
                street: initialValues?.address?.street || undefined,
                city: initialValues?.address?.city || "",
                state: initialValues?.address?.state || "",
                country: initialValues?.address?.country || "IN",
            },
            idProof: {
                type: initialValues?.idProof?.type || undefined,
                number: initialValues?.idProof?.number || undefined,
                image: initialValues?.idProof?.image || "",
            },
            photo: initialValues?.photo || undefined,
        },
    });

    // Store separate states for each upload field if needed, or a global one
    const [isFileUploading, setIsFileUploading] = useState(false);
    const [showIdProof, setShowIdProof] = useState(false);

    // Set default country to India if not set
    useEffect(() => {
        const currentCountry = watch("address.country");
        if (!currentCountry) {
            setValue("address.country", "IN", { shouldValidate: false, shouldDirty: false });
        }
    }, [setValue, watch]);

    useEffect(() => {
        const opts = { shouldValidate: true, shouldDirty: false };
        if (initialEmail) setValue("email", initialEmail, opts);
        
        if (initialPhone) {
            const formattedPhone = formatPhoneForSubmission(initialPhone);
            setValue("phone", formattedPhone, opts);
        }

        if (initialValues) {
            const { address, idProof, ...rest } = initialValues;
            Object.entries(rest).forEach(([key, value]) => {
                if (value) setValue(key as any, value, opts);
            });
            if (address) {
                setValue(
                    "address",
                    {
                        street: address.street || undefined,
                        city: address.city || "",
                        state: address.state || "",
                        country: address.country || "IN",
                    } as any,
                    opts,
                );
            }
            if (idProof) {
                setValue(
                    "idProof",
                    {
                        type: idProof.type || undefined,
                        number: idProof.number || undefined,
                        image: idProof.image || "",
                    } as any,
                    opts,
                );
            }
            if (initialValues?.photo) {
                setValue("photo", initialValues.photo, opts);
            }
        }
    }, [initialEmail, initialPhone, initialValues, setValue]);

    const handleFormSubmit = (data: BookingVisitorFormData) => {
        const { address, idProof, ...rest } = data;
        const payload = {
            ...rest,
            address: {
                street: address.street?.trim() || undefined,
                city: address.city,
                state: address.state,
                country: address.country,
            },
            idProof: {
                type: idProof.type,
                number: idProof.number,
                image: idProof.image || undefined,
            },
            photo: rest.photo || undefined,
        };
        onSubmit(payload);
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(handleFormSubmit)(e);
            }}
            className="space-y-4 sm:space-y-6"
            noValidate
        >
            {/* Personal Information Section */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InputField
                    id="name"
                    label="Full Name"
                    {...register("name")}
                    placeholder="Enter full name"
                    error={errors.name?.message}
                    required
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
                            disabled={!!initialPhone}
                        />
                    )}
                />

                <div className="space-y-1.5">
                <InputField
                    id="email"
                    label="Email Address"
                    type="email"
                    {...register("email")}
                    placeholder="Enter email address"
                    error={errors.email?.message}
                    required
                    disabled={!!initialEmail}
                    readOnly={!!initialEmail}
                    helperText={initialEmail ? "This email was used to send you the appointment link" : undefined}
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
                    required
                />
            </div>

            {/* Company Address Section */}
            <TextareaField
                id="address.street"
                label="Company Address"
                placeholder="Enter company address"
                rows={3}
                {...register("address.street")}
                error={errors.address?.street?.message}
                required
            />

            {/* ID Verification & Photos */}
            <div className="space-y-6 pt-2">
                {/* Required Visitor Photo */}
                <div className="flex flex-col space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-dashed border-gray-200">
                    <Label className="text-foreground text-sm font-semibold flex items-center gap-2">
                        <Camera className="h-4 w-4 text-[#3882a5]" />
                        Visitor Photo <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex justify-start">
                        <ImageUploadField
                            name="photo"
                            register={register}
                            setValue={setValue}
                            errors={errors.photo}
                            initialUrl={initialValues?.photo}
                            label=""
                            enableImageCapture={true}
                            appointmentToken={appointmentToken}
                            onUploadStatusChange={setIsFileUploading}
                            variant="avatar"
                        />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Please capture or upload a clear photo of the visitor.</p>
                    {errors.photo && (
                        <p className="text-xs text-red-500 mt-1 font-medium">{errors.photo.message}</p>
                    )}
                </div>

                {/* ID Proof Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#3882a5]/5 rounded-2xl border border-[#3882a5]/10 group transition-all hover:bg-[#3882a5]/10">
                    <div className="space-y-0.5">
                        <Label htmlFor="id-proof-toggle" className="text-sm font-bold text-[#3882a5] flex items-center gap-2 cursor-pointer">
                            <Fingerprint className="h-4 w-4" />
                            Add ID Proof Details
                        </Label>
                        <p className="text-[11px] text-muted-foreground font-medium">Capture ID documents for enhanced security (Optional)</p>
                    </div>
                    <Switch 
                        id="id-proof-toggle" 
                        checked={showIdProof} 
                        onCheckedChange={setShowIdProof}
                        className="data-[state=checked]:bg-[#3882a5]"
                    />
                </div>

                {/* Optional ID Proof Section */}
                {showIdProof && (
                    <div className="space-y-5 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* ID Proof Image */}
                        <div className="flex flex-col space-y-3">
                            <Label className="text-foreground text-sm font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-[#3882a5]" />
                                ID Proof Image
                                <span className="text-[10px] font-normal text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">Recommended</span>
                            </Label>
                            <div className="flex justify-start">
                                <ImageUploadField
                                    name="idProof.image"
                                    register={register}
                                    setValue={setValue}
                                    errors={errors.idProof?.image}
                                    initialUrl={initialValues?.idProof?.image}
                                    label=""
                                    enableImageCapture={true}
                                    appointmentToken={appointmentToken}
                                    onUploadStatusChange={setIsFileUploading}
                                    variant="avatar"
                                />
                            </div>
                            {errors.idProof?.image && (
                                <p className="text-xs text-red-500 mt-1 font-medium">{errors.idProof.image.message}</p>
                            )}
                        </div>

                        {/* ID Proof Details Row */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 items-start">
                            {/* ID Proof Type */}
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="idProofType" className="text-foreground text-sm font-semibold">
                                    ID Proof Type
                                </Label>
                                <Controller
                                    name="idProof.type"
                                    control={control}
                                    render={({ field }) => (
                                        <>
                                            <SelectField
                                                {...(field as any)}
                                                options={idProofTypes}
                                                placeholder="Select Document Type"
                                            />
                                            {errors.idProof?.type && (
                                                <p className="text-xs text-red-500 mt-1 font-medium">{errors.idProof.type.message}</p>
                                            )}
                                        </>
                                    )}
                                />
                            </div>

                            {/* ID Proof Number */}
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="idProofNumber" className="text-foreground text-sm font-semibold">
                                    ID Proof Number
                                </Label>
                                <Input
                                    id="idProofNumber"
                                    {...register("idProof.number")}
                                    placeholder="e.g. Aadhar / DL Number"
                                    className={`h-12 w-full rounded-xl border ${errors.idProof?.number ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus-visible:ring-1 focus-visible:ring-[#3882a5]"} bg-background text-foreground placeholder:text-muted-foreground px-4 py-2 text-sm focus:outline-none font-medium transition-all`}
                                />
                                {errors.idProof?.number && (
                                    <p className="text-xs text-red-500 mt-1 font-medium">{errors.idProof.number.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 border-t pt-4 sm:flex-row sm:gap-4 sm:pt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        // Assuming this is used in context where cancel action is needed
                        // Perhaps pass onCancel prop?
                    }}
                    className="h-12 w-full rounded-xl border-border px-8 font-medium sm:w-auto"
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading || isFileUploading}
                    className="h-12 w-full rounded-xl bg-[#3882a5] px-8 text-white hover:bg-[#2d6a87] font-medium sm:w-auto"
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Creating...
                        </>
                    ) : isFileUploading ? (
                        <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Uploading Image...
                        </>
                    ) : (
                        "Continue to Appointment"
                    )}
                </Button>
            </div>
        </form>
    );
}
