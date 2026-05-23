"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { validatePhone, formatPhoneForSubmission } from "@/utils/phoneUtils";
import { useRouter } from "next/navigation";
import { routes } from "@/utils/routes";
import { FormContainer } from "@/components/common/formContainer";
import { InputField } from "@/components/common/inputField";
import { SelectField } from "@/components/common/selectField";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { TextareaField } from "@/components/common/textareaField";
import { AsyncSelectField } from "@/components/common/asyncSelectField";
import { ActionButton } from "@/components/common/actionButton";
import { CheckCircle, X } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useCreateSpotPassMutation } from "@/store/api/spotPassApi";
import { useEmployeeSearch } from "@/hooks/useEmployeeSearch";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import { SubscriptionActionButtons } from "@/components/common/SubscriptionActionButtons";
import { useUserCountry } from "@/hooks/useUserCountry";

// Form Schema
const spotPassSchema = yup.object({
    name: yup
        .string()
        .required("Visitor name is required")
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be at most 100 characters"),
    phone: yup
        .string()
        .required("Phone number is required")
        .trim()
        .test("is-valid-phone", "Please enter a valid global phone number with country code", (value) => 
            validatePhone(value)
        ),
    gender: yup.string().trim().required("Gender is required"),
    address: yup
        .string()
        .required("Address is required")
        .trim()
        .min(5, "Address must be at least 5 characters")
        .max(500, "Address cannot exceed 500 characters"),
    notes: yup.string().trim().optional(),
    employeeId: yup.string().trim().optional(),
    photo: yup.string().trim().optional(),
});

type SpotPassFormData = {
    name: string;
    phone: string;
    gender: string;
    address: string;
    notes?: string;
    employeeId?: string;
    photo?: string;
};

export function SpotPassCreateForm() {
    const router = useRouter();
    const [createSpotPass, { isLoading }] = useCreateSpotPassMutation();
    const { loadEmployeeOptions } = useEmployeeSearch();
    const userCountry = useUserCountry();

    const { hasReachedSpotPassLimit, isExpired } = useSubscriptionStatus();
    const {
        showUpgradeModal,
        openUpgradeModal,
        closeUpgradeModal,
    } = useSubscriptionActions();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors },
    } = useForm<SpotPassFormData>({
        resolver: yupResolver(spotPassSchema) as any,
        defaultValues: {
            name: "",
            phone: "",
            gender: "male",
            address: "",
            notes: "",
            employeeId: undefined,
            photo: "",
        },
    });

    const [isFileUploading, setIsFileUploading] = useState(false);

    const onSubmit = async (data: SpotPassFormData) => {
        // Format phone number before submission
        const submitPhone = formatPhoneForSubmission(data.phone);

        try {
            await createSpotPass({
                ...data,
                phone: submitPhone,
                employeeId: data.employeeId || undefined
            }).unwrap();
            showSuccessToast("Spot Pass generated successfully!");
            router.push(routes.privateroute.SPOT_PASS);
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Failed to generate spot pass");
        }
    };

    return (
        <div className="space-y-6">
            <FormContainer isPage={true} isLoading={isLoading}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex flex-col gap-8 md:flex-row">
                        {/* Visitor Photo Section (Left Side) */}
                        <div className="flex flex-col items-center shrink-0">
                            <label className="mb-4 block text-sm font-bold uppercase tracking-widest text-[#3882a5]">
                                Visitor Photo
                            </label>
                            <div className="relative">
                                <ImageUploadField
                                    name="photo"
                                    register={register}
                                    setValue={setValue}
                                    errors={errors.photo as any}
                                    initialUrl={watch("photo")}
                                    enableImageCapture={true}
                                    variant="avatar"
                                    onUploadStatusChange={setIsFileUploading}
                                />
                            </div>
                        </div>

                        {/* Basic Information Section (Right Side) */}
                        <div className="flex-1 space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-[#3882a5]">
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <InputField
                                    label="Full Name"
                                    placeholder="Enter visitor's full name"
                                    {...register("name")}
                                    error={errors.name?.message as string}
                                    required
                                />
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <PhoneInputField
                                            id="phone"
                                            label="Phone Number"
                                            value={field.value || ""}
                                            onChange={(value) => field.onChange(value)}
                                            error={errors.phone?.message as string}
                                            required
                                            placeholder="Enter phone number"
                                            defaultCountry={userCountry}
                                        />
                                    )}
                                />
                                <SelectField
                                    label="Gender"
                                    options={[
                                        { label: "Male", value: "male" },
                                        { label: "Female", value: "female" },
                                        { label: "Other", value: "other" },
                                    ]}
                                    value={watch("gender")}
                                    onChange={(val) => setValue("gender", val)}
                                    error={errors.gender?.message as string}
                                    required
                                />

                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">
                                        Meet to Employee (Optional)
                                    </label>
                                    <Controller
                                        name="employeeId"
                                        control={control}
                                        render={({ field }) => (
                                            <AsyncSelectField
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                loadOptions={loadEmployeeOptions}
                                                placeholder="Search employees..."
                                                isClearable={true}
                                                error={errors.employeeId?.message as string}
                                                cacheOptions={true}
                                                defaultOptions={true}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <TextareaField
                                    label="Address"
                                    placeholder="Enter current address"
                                    {...register("address")}
                                    error={errors.address?.message as string}
                                    required
                                    rows={2}
                                />

                                <TextareaField
                                    label="Notes (Optional)"
                                    placeholder="Any additional information or special requirements"
                                    {...register("notes")}
                                    error={errors.notes?.message as string}
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse gap-3 pt-6 border-t sm:flex-row sm:justify-end">
                        <ActionButton
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isLoading}
                            size="xl"
                            className="w-full px-8 sm:w-auto"
                        >
                            Cancel
                        </ActionButton>
                        <SubscriptionActionButtons
                            isExpired={isExpired}
                            hasReachedLimit={hasReachedSpotPassLimit}
                            limitType="spotPass"
                            showUpgradeModal={showUpgradeModal}
                            openUpgradeModal={openUpgradeModal}
                            closeUpgradeModal={closeUpgradeModal}
                            upgradeLabel="Upgrade Plan"
                            className="w-full sm:w-auto min-w-[180px]"
                        >
                            <ActionButton
                                type="submit"
                                variant="primary"
                                disabled={isLoading || isFileUploading}
                                size="xl"
                                className="w-full min-w-[200px] px-8 sm:w-auto font-bold transition-all shadow-md active:scale-95 hover:scale-105"
                            >
                                {isLoading ? (
                                    <>Generating...</>
                                ) : isFileUploading ? (
                                    <>Uploading Photo...</>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Generate Spot Pass
                                    </>
                                )}
                            </ActionButton>
                        </SubscriptionActionButtons>
                    </div>
                </form>

            </FormContainer>
        </div>
    );
}
