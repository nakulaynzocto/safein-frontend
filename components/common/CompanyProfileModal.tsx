"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/common/actionButton";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/common/inputField";
import { CountryStateCitySelect } from "@/components/common/countryStateCity";
import { useUpdateProfileMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { Building2, MapPin, Phone, Loader2 } from "lucide-react";

const companySchema = yup.object({
    companyName: yup.string().required("Company name is required"),
    mobileNumber: yup
        .string()
        .required("Mobile number is required")
        .matches(/^\d{10,15}$/, "Phone number must be between 10 and 15 digits"),
    street: yup.string().required("Company address is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    pincode: yup
        .string()
        .required("Pincode is required")
        .matches(/^[0-9]{6}$/, "Pincode must be 6 digits"),
    country: yup.string().required("Country is required"),
});

type CompanyFormData = yup.InferType<typeof companySchema>;

interface CompanyProfileModalProps {
    isOpen: boolean;
}

export function CompanyProfileModal({ isOpen }: CompanyProfileModalProps) {
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CompanyFormData>({
        resolver: yupResolver(companySchema),
        defaultValues: {
            country: "IN",
            state: "",
            city: "",
        },
    });

    const dispatch = useAppDispatch();
    const onSubmit = async (data: CompanyFormData) => {
        try {
            const updatedUser = await updateProfile({
                companyName: data.companyName,
                mobileNumber: data.mobileNumber,
                address: {
                    street: data.street,
                    city: data.city,
                    state: data.state,
                    pincode: data.pincode,
                    country: data.country,
                },
            }).unwrap();

            // Update auth state so the dashboard re-renders and closes the modal
            dispatch(setUser(updatedUser));

            showSuccessToast("Company profile updated successfully!");
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Failed to update company profile");
        }
    };

    return (
        <Dialog open={isOpen}>
            <DialogContent
                className="sm:max-w-[700px] overflow-y-auto max-h-[90vh]"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                showCloseButton={false}
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center">Complete Company Profile</DialogTitle>
                    <DialogDescription className="text-center">
                        Please provide your company's contact and address details to continue to the dashboard.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <InputField
                                label="Company Name"
                                placeholder="Enter your company name"
                                icon={<Building2 className="w-4 h-4" />}
                                error={errors.companyName?.message}
                                {...register("companyName")}
                                required
                            />
                        </div>
                        <div className="col-span-1">
                            <Controller
                                name="mobileNumber"
                                control={control}
                                render={({ field }) => (
                                    <PhoneInputField
                                        id="mobileNumber"
                                        label="Mobile Number"
                                        value={field.value || ""}
                                        onChange={(val) => field.onChange(val)}
                                        placeholder="Enter mobile number"
                                        error={errors.mobileNumber?.message}
                                        required
                                        defaultCountry="in"
                                    />
                                )}
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <CountryStateCitySelect
                                value={{
                                    country: watch("country") || "",
                                    state: watch("state") || "",
                                    city: watch("city") || "",
                                }}
                                onChange={(val) => {
                                    setValue("country", val.country, { shouldValidate: true });
                                    setValue("state", val.state, { shouldValidate: true });
                                    setValue("city", val.city, { shouldValidate: true });
                                }}
                                errors={{
                                    country: errors.country?.message,
                                    state: errors.state?.message,
                                    city: errors.city?.message,
                                }}
                                required
                            />
                        </div>

                        <div className="col-span-1">
                            <InputField
                                label="Pincode"
                                placeholder="e.g. 123456"
                                error={errors.pincode?.message}
                                {...register("pincode")}
                                required
                            />
                        </div>

                        <div className="col-span-1">
                            <InputField
                                label="Company Address"
                                placeholder="Building No, Street..."
                                icon={<MapPin className="w-4 h-4" />}
                                error={errors.street?.message}
                                {...register("street")}
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Saving Details...
                            </>
                        ) : (
                            "Complete Setup"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
