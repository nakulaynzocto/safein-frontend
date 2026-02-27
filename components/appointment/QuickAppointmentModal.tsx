"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useVisitorExistenceCheck } from "@/hooks/useVisitorExistenceCheck";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InputField } from "@/components/common/inputField";
import { AsyncSelectField } from "@/components/common/asyncSelectField";
import { appointmentLinkApi } from "@/store/api/appointmentLinkApi";
import { useCreateSpecialBookingMutation } from "@/store/api/specialBookingApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useAppSelector } from "@/store/hooks";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { User, Mail, FileText, Info, Briefcase, Building, Calendar, Clock } from "lucide-react";
import { ActionButton } from "@/components/common/actionButton";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { EnhancedDatePicker } from "@/components/common/enhancedDatePicker";
import { EnhancedTimePicker } from "@/components/common/enhancedTimePicker";
import { useEmployeeSearch } from "@/hooks/useEmployeeSearch";
import { FormProvider } from "react-hook-form";
import { EmployeeSelectionField } from "@/components/common/EmployeeSelectionField";
import { useVisitorAutoFill } from "@/hooks/useVisitorAutoFill";

const quickAppointmentSchema = (isEmployee: boolean) => yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").optional(),
    phone: yup
        .string()
        .required("Mobile number is required")
        .matches(/^\d{10,15}$/, "Phone number must be between 10 and 15 digits"),
    purpose: yup.string().required("Purpose of visit is required"),
    employeeId: isEmployee
        ? yup.string().optional().nullable()
        : yup.string().required("Please select an employee"),
    accompanyingCount: yup.number().min(0).max(20).default(0),
    notes: yup.string().optional(),
    address: yup.string().optional(),
});

type QuickAppointmentFormData = {
    name: string;
    email?: string;
    phone: string;
    purpose: string;
    employeeId?: string | null;
    accompanyingCount: number;
    notes?: string;
    address?: string;
};

interface QuickAppointmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function QuickAppointmentModal({ open, onOpenChange, onSuccess }: QuickAppointmentModalProps) {
    const { user } = useAppSelector((state) => state.auth);
    const isEmployee = checkIsEmployee(user);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [createSpecialBooking] = useCreateSpecialBookingMutation();

    // Use common employee search hook
    const { } = useEmployeeSearch();

    const methods = useForm<QuickAppointmentFormData>({
        resolver: yupResolver(quickAppointmentSchema(isEmployee)) as any,
        defaultValues: {
            purpose: "Official VIP Meeting",
            employeeId: "",
            accompanyingCount: 0,
        }
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        watch,
        trigger,
        clearErrors,
        getValues,
    } = methods;


    const { emailExists, phoneExists } = useVisitorAutoFill({
        nameFieldName: "name",
        phoneFieldName: "phone",
        emailFieldName: "email",
        methods,
        silent: true
    });

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            reset({
                name: "",
                email: "",
                phone: "",
                purpose: "Official VIP Meeting",
                employeeId: isEmployee ? (user?.employeeId || "") : "",
                accompanyingCount: 0,
                notes: "",
                address: "",
            });
        }
    }, [open, reset, isEmployee, user]);


    const onSubmit = async (data: QuickAppointmentFormData) => {
        setIsSubmitting(true);
        try {
            // Determine Employee ID


            const submitEmployeeId = isEmployee ? user?.employeeId : data.employeeId;

            if (!submitEmployeeId) {
                throw new Error(
                    isEmployee
                        ? "Your employee information is not set up correctly. Please contact your administrator."
                        : "Please select an employee"
                );
            }

            // Create Special Booking (Pending OTP)
            await createSpecialBooking({
                visitorName: data.name,
                visitorEmail: data.email,
                visitorPhone: data.phone,
                employeeId: submitEmployeeId,
                purpose: data.purpose,
                accompanyingCount: data.accompanyingCount || 0,
                notes: data.notes || "",
                address: data.address || "",
            }).unwrap();

            showSuccessToast("Special visitor booking created. OTP has been sent to the visitor.");
            reset();
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            showErrorToast(error?.data?.message || error?.message || "Failed to create special visitor booking");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[95vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-[#3882a5]" />
                        Special Visitor Booking
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Quickly book an appointment for a special visitor by entering their details and schedule.
                    </DialogDescription>
                </DialogHeader>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 touch-pan-y pointer-events-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Visitor Name"
                                    placeholder="Enter visitor name"
                                    icon={<User className="h-4 w-4" />}
                                    {...register("name")}
                                    error={errors.name?.message}
                                    required
                                />
                                <div className="space-y-1">
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field }) => (
                                            <PhoneInputField
                                                id="phone"
                                                label="Mobile Number"
                                                value={field.value || ""}
                                                onChange={(val) => field.onChange(val)}
                                                placeholder="Enter mobile number"
                                                error={errors.phone?.message}
                                                required
                                                defaultCountry="in"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <InputField
                                        label="Email Address"
                                        type="email"
                                        placeholder="visitor@example.com"
                                        icon={<Mail className="h-4 w-4" />}
                                        {...register("email")}
                                        error={errors.email?.message}
                                    />
                                </div>

                                <EmployeeSelectionField />

                                <InputField
                                    label="Purpose of Visit"
                                    placeholder="e.g., Official VIP Visit"
                                    icon={<Info className="h-4 w-4" />}
                                    {...register("purpose")}
                                    error={errors.purpose?.message}
                                    required
                                />

                                <InputField
                                    label="Accompanying People"
                                    type="number"
                                    placeholder="Number of people"
                                    icon={<User className="h-4 w-4" />}
                                    {...register("accompanyingCount")}
                                    error={errors.accompanyingCount?.message}
                                />

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium leading-none flex items-center gap-2">
                                        <Building className="h-4 w-4" />
                                        Address
                                        <span className="ml-1 text-muted-foreground text-[10px] font-normal leading-none">(Optional)</span>
                                    </label>
                                    <Textarea
                                        placeholder="Enter visitor address"
                                        {...register("address")}
                                        className={errors.address ? "border-red-500" : ""}
                                        rows={2}
                                    />
                                    {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Notes
                                        <span className="ml-1 text-muted-foreground text-[10px] font-normal leading-none">(Optional)</span>
                                    </label>
                                    <Textarea
                                        placeholder="Add any notes here..."
                                        {...register("notes")}
                                        className={errors.notes ? "border-red-500" : ""}
                                        rows={3}
                                    />
                                    {errors.notes && <p className="text-xs text-red-500">{errors.notes.message}</p>}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-4 border-t bg-gray-50/50">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-6">
                                Cancel
                            </Button>
                            <ActionButton
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting}
                                className="px-8"
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Booking...
                                    </>
                                ) : (
                                    "Book Appointment"
                                )}
                            </ActionButton>
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
