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
import { Info, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VisitorFormData, idProofTypes } from "./visitorSchema";

interface VisitorFormFieldsProps {
    register: UseFormRegister<VisitorFormData>;
    control: Control<VisitorFormData>;
    errors: FieldErrors<VisitorFormData>;
    watch: UseFormWatch<VisitorFormData>;
    setValue: UseFormSetValue<VisitorFormData>;
    showOptionalFields: boolean;
    onToggleOptionalFields: (checked: boolean) => void;
    showIdVerificationFields: boolean;
    onToggleIdVerificationFields: (checked: boolean) => void;
    showSecurityFields: boolean;
    onToggleSecurityFields: (checked: boolean) => void;
    setIsFileUploading: (isUploading: boolean) => void;
    visitorId?: string;
    initialData?: any;
}

export function VisitorFormFields({
    register,
    control,
    errors,
    watch,
    setValue,
    showOptionalFields,
    onToggleOptionalFields,
    showIdVerificationFields,
    onToggleIdVerificationFields,
    showSecurityFields,
    onToggleSecurityFields,
    setIsFileUploading,
    visitorId,
    initialData,
}: VisitorFormFieldsProps) {
    return (
        <div className="space-y-6">
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
                            className={`pl-4 h-12 bg-background border-border focus:bg-background transition-all rounded-xl text-foreground font-medium ${errors.name ? "border-destructive" : ""}`}
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
                            {...register("email")}
                            placeholder="Enter email address"
                            className={`pl-4 h-12 bg-background border-border focus:bg-background transition-all rounded-xl text-foreground font-medium ${errors.email ? "border-destructive" : ""}`}
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
                    className="bg-background border-border focus:bg-background transition-all rounded-xl text-foreground font-medium"
                    rows={3}
                />
            </div>

            {/* ID Verification & Photos Toggle */}
            <div className="border-t pt-4">
                <div className="bg-background flex items-center justify-between rounded-lg border p-4">
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
                        onCheckedChange={onToggleIdVerificationFields}
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
                                            key={`photo-${(initialData as any)?._id || visitorId || "new"}`}
                                            name="photo"
                                            label=""
                                            register={register}
                                            setValue={setValue}
                                            errors={errors.photo}
                                            initialUrl={initialData?.photo}
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
                                            key={`idProof-${(initialData as any)?._id || visitorId || "new"}`}
                                            name="idProof.image"
                                            label=""
                                            register={register}
                                            setValue={setValue}
                                            errors={errors.idProof?.image}
                                            initialUrl={initialData?.idProof?.image}
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
                <div className="bg-background flex items-center justify-between rounded-lg border p-4">
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
                        onCheckedChange={onToggleSecurityFields}
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
                                {...register("emergencyContacts.0.name" as any)}
                                error={(errors.emergencyContacts as any)?.[0]?.name?.message}
                            />
                            <Controller
                                name="emergencyContacts.0.phone"
                                control={control}
                                render={({ field }) => (
                                    <PhoneInputField
                                        id="emergency-phone"
                                        label="Emergency Contact Phone"
                                        value={field.value || ""}
                                        onChange={(val) => field.onChange(val)}
                                        placeholder="Enter contact phone"
                                        error={(errors.emergencyContacts as any)?.[0]?.phone?.message}
                                        defaultCountry="in"
                                    />
                                )}
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
        </div>
    );
}
