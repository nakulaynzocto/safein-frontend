"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { routes } from "@/utils/routes";
import { FormContainer } from "@/components/common/formContainer";
import { InputField } from "@/components/common/inputField";
import { SelectField } from "@/components/common/selectField";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { TextareaField } from "@/components/common/textareaField";
import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useCreateSpotPassMutation } from "@/store/api/spotPassApi";

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
        .matches(/^[\+]?[0-9]{10,15}$/, "Phone number must be valid (10-15 digits)"),
    gender: yup.string().required("Gender is required"),
    address: yup
        .string()
        .required("Address is required")
        .trim()
        .min(5, "Address must be at least 5 characters")
        .max(500, "Address cannot exceed 500 characters"),
    vehicleNumber: yup
        .string()
        .optional()
        .default("")
        .trim()
        .max(20, "Vehicle number cannot exceed 20 characters")
        .matches(/^[a-zA-Z0-9\s]*$/, "Vehicle number must be alphanumeric"),
    notes: yup.string().default("").trim(),
    photo: yup.string().default(""),
});

type SpotPassFormData = yup.InferType<typeof spotPassSchema>;

export function SpotPassCreateForm() {
    const router = useRouter();
    const [createSpotPass, { isLoading }] = useCreateSpotPassMutation();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<SpotPassFormData>({
        resolver: yupResolver(spotPassSchema),
        defaultValues: {
            name: "",
            phone: "",
            gender: "male",
            address: "",
            vehicleNumber: "",
            notes: "",
            photo: "",
        },
    });

    const onSubmit = async (data: SpotPassFormData) => {
        try {
            await createSpotPass(data).unwrap();
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
                                    errors={errors.photo}
                                    initialUrl={watch("photo")}
                                    enableImageCapture={true}
                                    variant="avatar"
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
                                    error={errors.name?.message}
                                    required
                                />
                                <InputField
                                    label="Phone Number"
                                    placeholder="Enter mobile number"
                                    {...register("phone")}
                                    error={errors.phone?.message}
                                    required
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
                                    error={errors.gender?.message}
                                    required
                                />
                                <InputField
                                    label="Vehicle Number (Optional)"
                                    placeholder="e.g. MH 12 AB 1234"
                                    {...register("vehicleNumber")}
                                    error={errors.vehicleNumber?.message}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <TextareaField
                                    label="Address"
                                    placeholder="Enter current address"
                                    {...register("address")}
                                    error={errors.address?.message}
                                    required
                                    rows={2}
                                />

                                <TextareaField
                                    label="Notes (Optional)"
                                    placeholder="Any additional information or special requirements"
                                    {...register("notes")}
                                    error={errors.notes?.message}
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse gap-3 pt-6 border-t sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(routes.privateroute.SPOT_PASS)}
                            className="h-12 rounded-xl px-8 font-semibold text-gray-600 sm:w-auto"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-12 rounded-xl bg-[#3882a5] px-8 font-semibold text-white hover:bg-[#3882a5]/90 sm:w-auto"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Generate Pass
                        </Button>
                    </div>
                </form>
            </FormContainer>
        </div>
    );
}
