"use client";

import { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch, Controller } from "react-hook-form";
import { InputField } from "@/components/common/inputField";
import { SelectField } from "@/components/common/selectField";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { CountryStateCitySelect } from "@/components/common/countryStateCity";
import { TextareaField } from "@/components/common/textareaField";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { VisitorFormData, idProofTypes } from "./visitorSchema";
import { EmergencyContactsField } from "./EmergencyContactsField";
import { useUserCountry } from "@/hooks/useUserCountry";

interface VisitorFormFieldsProps {
    register: UseFormRegister<VisitorFormData>;
    control: Control<VisitorFormData>;
    errors: FieldErrors<VisitorFormData>;
    watch: UseFormWatch<VisitorFormData>;
    setValue: UseFormSetValue<VisitorFormData>;
    showIdVerificationFields: boolean;
    onToggleIdVerificationFields: (checked: boolean) => void;
    showSecurityFields: boolean;
    onToggleSecurityFields: (checked: boolean) => void;
    setIsFileUploading: (isUploading: boolean) => void;
    initialData?: any;
    phoneExists?: boolean;
    step?: "details" | "photo" | "id_proof" | "preview";
    enableVisitorImageCapture?: boolean;
}

export function VisitorFormFields({
    register,
    control,
    errors,
    watch,
    setValue,
    showIdVerificationFields,
    onToggleIdVerificationFields,
    showSecurityFields,
    onToggleSecurityFields,
    setIsFileUploading,
    initialData,
    phoneExists = false,
    enableVisitorImageCapture = true,
    step,
}: VisitorFormFieldsProps) {
    const defaultCountry = useUserCountry();

    return (
        <div className="space-y-6">
            {/* Step 1: Details */}
            {(!step || step === "details") && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Personal Information Section */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <PhoneInputField
                                    id="phone"
                                    label="Phone Number"
                                    value={field.value}
                                    onChange={(value) => field.onChange(value)}
                                    error={errors.phone?.message || (phoneExists ? "This phone number is already registered" : undefined)}
                                    required
                                    placeholder="Enter phone number"
                                    defaultCountry={watch("address.country") || defaultCountry}
                                />
                            )}
                        />

                        <InputField
                            id="name"
                            label="Full Name"
                            {...register("name")}
                            placeholder="Enter full name"
                            error={errors.name?.message}
                            required
                        />

                        <InputField
                            id="email"
                            type="email"
                            label="Email (optional)"
                            {...register("email")}
                            placeholder="name@example.com"
                            error={errors.email?.message}
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
                                    required
                                />
                            )}
                        />
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4 border-t pt-6">
                         <h4 className="text-xs font-bold uppercase tracking-widest text-[#3882a5] mb-4">Location Details</h4>
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

                    <div className="space-y-4">
                        <TextareaField
                            label="Full Address / Company Details"
                            id="address.street"
                            placeholder="Enter detailed address"
                            {...register("address.street")}
                            error={errors.address?.street?.message}
                            className="bg-background border-border focus:bg-background transition-all rounded-xl text-foreground font-medium"
                            rows={3}
                        />
                    </div>
                </div>
            )}


            {/* Photo Section */}
            {(!step || step === "photo") && enableVisitorImageCapture && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                        <div className="text-center mb-6">
                            <h4 className="text-lg font-bold text-[#1f4f67]">Visitor Photograph</h4>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">Upload a clear face photo of the visitor for system records.</p>
                        </div>
                        
                        <ImageUploadField
                            key="photo-upload"
                            name="photo"
                            label=""
                            register={register}
                            setValue={setValue}
                            errors={errors.photo}
                            initialUrl={watch("photo")}
                            enableImageCapture={true}
                            variant="avatar"
                            className="scale-110"
                            delayedUpload={true}
                        />
                        {errors.photo && (
                            <p className="text-xs text-red-500 mt-4 font-medium">{String(errors.photo.message)}</p>
                        )}
                    </div>
                </div>
            )}

            {/* ID Proof & Security */}
            {(!step || step === "id_proof") && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#3882a5]">Identification Proof</h4>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="id-verification"
                                    checked={showIdVerificationFields}
                                    onCheckedChange={onToggleIdVerificationFields}
                                />
                                <Label htmlFor="id-verification" className="text-xs text-slate-500 font-medium">Enable ID Upload</Label>
                            </div>
                        </div>
                        
                        {showIdVerificationFields && (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 items-start pt-2">
                                <div className="flex flex-col space-y-2">
                                    <Label className="text-foreground text-sm font-semibold mb-1">ID Proof Image</Label>
                                    <ImageUploadField
                                        key="id-proof-upload"
                                        name="idProof.image"
                                        label=""
                                        register={register}
                                        setValue={setValue}
                                        errors={errors.idProof?.image}
                                        initialUrl={watch("idProof.image")}
                                        enableImageCapture={true}
                                        onUploadStatusChange={setIsFileUploading}
                                        variant="avatar"
                                        delayedUpload={true}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Controller
                                        name="idProof.type"
                                        control={control}
                                        render={({ field }) => (
                                            <SelectField
                                                label="ID Proof Type"
                                                placeholder="Select Type"
                                                options={idProofTypes}
                                                value={field.value || ""}
                                                onChange={(val) => field.onChange(val)}
                                                error={errors.idProof?.type?.message}
                                            />
                                        )}
                                    />

                                    <InputField
                                        label="ID Proof Number"
                                        placeholder="Enter Number"
                                        error={errors.idProof?.number?.message}
                                        {...register("idProof.number")}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Additional Security Section */}
                    <div className="space-y-6 border-t pt-8">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#3882a5]">Additional Security</h4>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="security-fields"
                                    checked={showSecurityFields}
                                    onCheckedChange={onToggleSecurityFields}
                                />
                                <Label htmlFor="security-fields" className="text-xs text-slate-500 font-medium">Enable Security Checks</Label>
                            </div>
                        </div>
                        
                        {showSecurityFields && (
                            <div className="grid grid-cols-1 gap-6 pt-2">
                                <EmergencyContactsField
                                    control={control}
                                    register={register}
                                    errors={errors}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
