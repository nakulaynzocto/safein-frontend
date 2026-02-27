"use client";

import React, { useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User } from "lucide-react";
import { InputField } from "@/components/common/inputField";
import { EnhancedDatePicker } from "@/components/common/enhancedDatePicker";
import { EnhancedTimePicker } from "@/components/common/enhancedTimePicker";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { ActionButton } from "@/components/common/actionButton";
import { VehicleInfoSection } from "./VehicleInfoSection";
import { showErrorToast } from "@/utils/toast";
import { extractIdString, isValidId } from "@/utils/idExtractor";
import { appointmentSchema, type AppointmentFormData } from "./helpers/appointmentValidation";

interface AppointmentBookingFormProps {
    visitorId: string;
    employeeId: string;
    employeeName: string;
    visitorEmail: string;
    visitorName: string;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
}

export function AppointmentBookingForm({
    visitorId,
    employeeId,
    employeeName,
    visitorEmail,
    visitorName,
    onSubmit,
    isLoading = false,
    appointmentToken,
}: AppointmentBookingFormProps & { appointmentToken?: string }) {
    const normalizedVisitorId = extractIdString(visitorId);
    const normalizedEmployeeId = extractIdString(employeeId);
    const [isFileUploading, setIsFileUploading] = useState(false);

    const methods = useForm<AppointmentFormData>({
        resolver: yupResolver(appointmentSchema),
        defaultValues: {
            visitorId: normalizedVisitorId,
            employeeId: normalizedEmployeeId,
            purpose: "",
            appointmentDate: "",
            appointmentTime: "",
            accompanyingCount: 0,
            notes: "",
            vehicleNumber: "",
            vehiclePhoto: "",
        },
    });

    const {
        control,
        handleSubmit,
        register,
        setValue,
        watch,
        clearErrors,
        trigger,
        formState: { errors },
    } = methods;

    const handleFormSubmit = (data: AppointmentFormData) => {
        if (!isValidId(normalizedVisitorId)) {
            showErrorToast("Invalid visitor ID. Please refresh the page and try again.");
            return;
        }

        if (!isValidId(normalizedEmployeeId)) {
            showErrorToast("Invalid employee ID. Please refresh the page and try again.");
            return;
        }

        const payload = {
            employeeId: normalizedEmployeeId,
            visitorId: normalizedVisitorId,
            accompanyingCount: data.accompanyingCount ?? 0,
            appointmentDetails: {
                purpose: data.purpose,
                scheduledDate: data.appointmentDate,
                scheduledTime: data.appointmentTime,
                notes: data.notes || "",
                vehicleNumber: data.vehicleNumber || "",
                vehiclePhoto: data.vehiclePhoto || "",
            },
            securityDetails: {
                badgeIssued: false,
                badgeNumber: "",
                securityClearance: false,
                securityNotes: "",
            },
            notifications: {
                emailSent: false,
                whatsappSent: false,
                reminderSent: false,
            },
        };
        onSubmit(payload);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 pt-2">
                {/* Visitor and Employee Info Display */}
                <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-600">Visitor</Label>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">{visitorName || visitorEmail || "Visitor"}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-600">Meeting With</Label>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">{employeeName || "Employee"}</span>
                        </div>
                    </div>
                </div>

                {/* First Row: Appointment Date and Appointment Time */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Controller
                            control={control}
                            name="appointmentDate"
                            render={({ field }) => (
                                <EnhancedDatePicker
                                    label="Appointment Date"
                                    value={field.value}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value) {
                                            const selectedDate = new Date(value + "T00:00:00");
                                            selectedDate.setHours(0, 0, 0, 0);
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);

                                            if (selectedDate < today) {
                                                trigger("appointmentDate");
                                                return;
                                            }
                                        }
                                        field.onChange(value);
                                        if (errors.appointmentTime) {
                                            clearErrors("appointmentTime");
                                        }
                                        trigger("appointmentDate");
                                    }}
                                    error={errors.appointmentDate?.message}
                                    required
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="appointmentTime"
                            render={({ field }) => {
                                let normalizedDate = watch("appointmentDate");
                                if (normalizedDate && normalizedDate.includes("/")) {
                                    const parts = normalizedDate.split("/");
                                    if (parts.length === 3) {
                                        normalizedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                                    }
                                }
                                return (
                                    <EnhancedTimePicker
                                        label="Appointment Time"
                                        value={field.value}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            if (errors.appointmentDate) {
                                                clearErrors("appointmentDate");
                                            }
                                        }}
                                        error={errors.appointmentTime?.message}
                                        selectedDate={normalizedDate}
                                        required
                                    />
                                );
                            }}
                        />
                    </div>
                </div>

                {/* Second Row: Purpose of Visit and Accompanying People */}
                <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <InputField
                            label="Purpose of Visit"
                            placeholder="Brief description of the visit purpose"
                            error={errors.purpose?.message}
                            {...register("purpose")}
                            required
                        />

                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                                Accompanying People
                                <span className="ml-1 text-muted-foreground text-[10px] font-normal leading-none">(Optional)</span>
                            </Label>
                            <Input
                                type="number"
                                min={0}
                                max={20}
                                step={1}
                                placeholder="Number of people (e.g., 0, 1, 2)"
                                {...register("accompanyingCount")}
                                className={`h-12 rounded-xl bg-background font-medium ${errors.accompanyingCount ? "border-destructive" : ""}`}
                            />
                            {errors.accompanyingCount && (
                                <span className="text-destructive text-xs">{errors.accompanyingCount.message}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Visit Information Section */}
                <div className="space-y-4 pt-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="notes" className="text-sm font-medium">
                            Notes
                            <span className="ml-1 text-muted-foreground text-[10px] font-normal leading-none">(Optional)</span>
                        </Label>
                        <Textarea
                            id="notes"
                            {...register("notes")}
                            placeholder="Any additional information or special requirements"
                            className={errors.notes ? "border-destructive" : ""}
                            rows={4}
                        />
                        {errors.notes && <span className="text-destructive text-xs">{errors.notes.message}</span>}
                    </div>
                </div>

                {/* Vehicle Fields Section */}
                <VehicleInfoSection
                    appointmentToken={appointmentToken}
                    variant="button"
                    onUploadStatusChange={setIsFileUploading}
                />

                <div className="flex justify-end gap-4 border-t pt-4">
                    <ActionButton
                        type="submit"
                        disabled={isLoading || isFileUploading}
                        className="bg-[#3882a5] text-white hover:bg-[#2d6a87] font-medium text-base px-8"
                        size="xl"
                        variant="default"
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Booking Appointment...
                            </>
                        ) : (
                            "Book Appointment"
                        )}
                    </ActionButton>
                </div>
            </form>
        </FormProvider>
    );
}
