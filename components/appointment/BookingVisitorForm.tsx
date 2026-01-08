"use client";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/common/selectField";
import { CountryStateCitySelect } from "@/components/common/countryStateCity";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { useEffect, useState } from "react";
import { FileText, Camera } from "lucide-react";

const bookingVisitorSchema = yup.object({
    name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
    email: yup.string().email("Invalid email address").required("Email is required"),
    phone: yup.string().required("Phone number is required"),
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
        type: yup.string().required("ID Proof Type is required"),
        number: yup
            .string()
            .required("ID Proof Number is required")
            .min(2, "ID Proof Number must be at least 2 characters"),
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
    initialValues?: Partial<BookingVisitorFormData>;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    appointmentToken?: string; // Token for public upload endpoint
}

export function BookingVisitorForm({
    initialEmail,
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
            phone: initialValues?.phone || "",
            address: {
                street: initialValues?.address?.street || undefined,
                city: initialValues?.address?.city || "",
                state: initialValues?.address?.state || "",
                country: initialValues?.address?.country || "",
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

    useEffect(() => {
        const opts = { shouldValidate: false, shouldDirty: false };
        if (initialEmail) setValue("email", initialEmail, opts);
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
                        country: address.country || "",
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
    }, [initialEmail, initialValues, setValue]);

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
                <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-foreground text-sm font-medium">
                        Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        {...register("name")}
                        placeholder="Enter full name"
                        className={`h-9 w-full rounded-md border ${errors.name ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-[#3882a5]"} bg-input text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none`}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-foreground text-sm font-medium">
                        Email Address <span className="text-red-500">*</span>
                    </Label>
                    {initialEmail ? (
                        <Controller
                            name="email"
                            control={control}
                            defaultValue={initialEmail}
                            render={({ field }) => (
                                <div className="space-y-1">
                                    <Input
                                        {...field}
                                        id="email"
                                        type="email"
                                        placeholder="Enter email address"
                                        value={initialEmail}
                                        className={`h-9 w-full rounded-md border ${errors.email ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-[#3882a5]"} text-foreground placeholder:text-muted-foreground bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                                        disabled={true}
                                        readOnly={true}
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        This email was used to send you the appointment link
                                    </p>
                                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                                </div>
                            )}
                        />
                    ) : (
                        <>
                            <Input
                                id="email"
                                type="email"
                                {...register("email")}
                                placeholder="Enter email address"
                                className={`h-9 w-full rounded-md border ${errors.email ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-[#3882a5]"} bg-input text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none`}
                            />
                            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                        </>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-foreground text-sm font-medium">
                        Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <PhoneInputField
                                {...(field as any)}
                                id="phone"
                                label=""
                                value={field.value}
                                onChange={(value) => field.onChange(value)}
                                error={errors.phone?.message}
                                required
                                placeholder="Enter phone number"
                                defaultCountry="in"
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
            <div className="space-y-1.5">
                <Label htmlFor="address.street" className="text-foreground text-sm font-medium">
                    Company Address <span className="text-red-500">*</span>
                </Label>
                <Controller
                    name="address.street"
                    control={control}
                    render={({ field }) => (
                        <div className="space-y-1">
                            <textarea
                                {...field}
                                id="address.street"
                                placeholder="Enter company address"
                                rows={3}
                                className={`w-full rounded-md border ${errors.address?.street ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-[#3882a5]"} bg-input text-foreground placeholder:text-muted-foreground resize-none px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none`}
                            />
                            {errors.address?.street && (
                                <p className="text-xs text-red-500">{errors.address.street.message}</p>
                            )}
                        </div>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="idProofType" className="text-foreground text-sm font-medium">
                        ID Proof Type <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                        name="idProof.type"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-1">
                                <SelectField
                                    {...(field as any)}
                                    options={idProofTypes}
                                    placeholder="Select ID proof type"
                                />
                                {errors.idProof?.type && (
                                    <p className="text-xs text-red-500">{errors.idProof.type.message}</p>
                                )}
                            </div>
                        )}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="idProofNumber" className="text-foreground text-sm font-medium">
                        ID Proof Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="idProofNumber"
                        {...register("idProof.number")}
                        placeholder="Enter ID proof number"
                        className={`h-9 w-full rounded-md border ${errors.idProof?.number ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-[#3882a5]"} bg-input text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none`}
                    />
                    {errors.idProof?.number && <p className="text-xs text-red-500">{errors.idProof.number.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-1.5">
                    <Label
                        htmlFor="idProofImage"
                        className="text-foreground flex items-center gap-2 text-sm font-medium"
                    >
                        <FileText className="h-4 w-4" />
                        ID Proof Document
                    </Label>
                    <ImageUploadField
                        name="idProof.image"
                        register={register}
                        setValue={setValue}
                        errors={errors.idProof?.image}
                        initialUrl={initialValues?.idProof?.image}
                        label="Take or Upload Photo"
                        enableImageCapture={true}
                        appointmentToken={appointmentToken}
                        onUploadStatusChange={setIsFileUploading}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="photo" className="text-foreground flex items-center gap-2 text-sm font-medium">
                        <Camera className="h-4 w-4" />
                        Visitor Photo <span className="text-red-500">*</span>
                    </Label>
                    <ImageUploadField
                        name="photo"
                        register={register}
                        setValue={setValue}
                        errors={errors.photo}
                        initialUrl={initialValues?.photo}
                        label="Take or Upload Photo"
                        enableImageCapture={true}
                        appointmentToken={appointmentToken}
                        onUploadStatusChange={setIsFileUploading}
                    />
                </div>
            </div>

            <div className="flex flex-col justify-end gap-3 border-t pt-4 sm:flex-row sm:gap-4 sm:pt-6">
                <Button
                    type="submit"
                    disabled={isLoading || isFileUploading}
                    className="w-full bg-[#3882a5] text-white hover:bg-[#2d6a87] sm:w-auto"
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
