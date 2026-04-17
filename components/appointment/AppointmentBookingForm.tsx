"use client";

import React, { useState } from "react";
import { useForm, Controller, FormProvider, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, ArrowLeft } from "lucide-react";
import { InputField } from "@/components/common/inputField";
import { EnhancedDatePicker } from "@/components/common/enhancedDatePicker";
import { EnhancedTimePicker } from "@/components/common/enhancedTimePicker";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { ActionButton } from "@/components/common/actionButton";
import { VehicleInfoSection } from "./VehicleInfoSection";
import { showErrorToast } from "@/utils/toast";
import { extractIdString, isValidId } from "@/utils/idExtractor";
import { cn } from "@/lib/utils";
import { appointmentSchema, type AppointmentFormData } from "./helpers/appointmentValidation";

import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Briefcase } from "lucide-react";

interface AppointmentBookingFormProps {
    visitorId: string;
    employeeId?: string;
    employeeName?: string;
    visitorPhone?: string;
    visitorName: string;
    employees?: Array<{
        _id: string;
        name: string;
        department: string;
        designation?: string;
    }>;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    isQRBooking?: boolean;
    submitLabel?: string;
    initialValues?: Partial<AppointmentFormData>;
    onDraftChange?: (data: Partial<AppointmentFormData>) => void;
    onBack?: () => void;
}

export function AppointmentBookingForm({
    visitorId,
    employeeId,
    employeeName,
    visitorPhone,
    visitorName,
    employees = [],
    onSubmit,
    isLoading = false,
    appointmentToken,
    isQRBooking = false,
    submitLabel = "Book Appointment",
    initialValues,
    onDraftChange,
    onBack,
}: AppointmentBookingFormProps & { appointmentToken?: string }) {
    const normalizedVisitorId = extractIdString(visitorId);
    const normalizedEmployeeId = employeeId ? extractIdString(employeeId) : "";
    const [isFileUploading, setIsFileUploading] = useState(false);

    const methods = useForm<AppointmentFormData>({
        resolver: yupResolver(appointmentSchema),
        defaultValues: {
            visitorId: normalizedVisitorId,
            employeeId: initialValues?.employeeId || normalizedEmployeeId,
            purpose: initialValues?.purpose || "",
            appointmentDate: initialValues?.appointmentDate || "",
            appointmentTime: initialValues?.appointmentTime || "",
            accompanyingCount: initialValues?.accompanyingCount ?? 0,
            notes: initialValues?.notes || "",
            vehicleNumber: initialValues?.vehicleNumber || "",
            vehiclePhoto: initialValues?.vehiclePhoto || "",
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

    const watchedEmployeeId = watch("employeeId");
    const lastDraftHashRef = React.useRef<string>("");

    React.useEffect(() => {
        const subscription = watch((values) => {
            if (!onDraftChange) return;
            const nextHash = JSON.stringify(values || {});
            if (nextHash === lastDraftHashRef.current) return;
            lastDraftHashRef.current = nextHash;
            onDraftChange(values as Partial<AppointmentFormData>);
        });
        return () => subscription.unsubscribe();
    }, [watch, onDraftChange]);

    React.useEffect(() => {
        setValue("visitorId", normalizedVisitorId, { shouldValidate: false });
    }, [normalizedVisitorId, setValue]);

    React.useEffect(() => {
        if (isQRBooking) return;
        if (!normalizedEmployeeId) return;
        setValue("employeeId", normalizedEmployeeId, { shouldValidate: false });
    }, [isQRBooking, normalizedEmployeeId, setValue]);

    React.useEffect(() => {
        if (!isQRBooking) return;
        if (watchedEmployeeId) return;
        if (employees.length !== 1) return;
        setValue("employeeId", employees[0]._id, { shouldValidate: true, shouldDirty: true });
    }, [isQRBooking, employees, watchedEmployeeId, setValue]);

    const handleInvalidSubmit = (formErrors: typeof errors) => {
        const firstError = Object.values(formErrors).find((error) => !!error?.message);
        showErrorToast(
            (firstError?.message as string) || "Please complete required fields before continuing."
        );
    };

    const handleFormSubmit = (data: AppointmentFormData) => {
        if (!isValidId(normalizedVisitorId)) {
            showErrorToast("Invalid visitor ID. Please refresh the page and try again.");
            return;
        }

        const currentEmployeeId = data.employeeId || normalizedEmployeeId;

        if (!isValidId(currentEmployeeId)) {
            showErrorToast("Please select an employee you want to meet.");
            return;
        }

        const payload = {
            employeeId: currentEmployeeId,
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
                smsSent: false,
                emailSent: false,
                whatsappSent: false,
                reminderSent: false,
            },
        };
        onSubmit(payload);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit, handleInvalidSubmit)} className="space-y-6 pt-2">
                <input type="hidden" {...register("visitorId")} />
                {!isQRBooking && <input type="hidden" {...register("employeeId")} />}

                {/* Visitor and Employee Info Display */}
                <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Visitor</Label>
                        <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 shadow-sm">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                <User className="h-4 w-4" />
                            </div>
                            <span className="min-w-0 truncate text-sm font-semibold text-slate-900">
                                {visitorName || visitorPhone || "Visitor"}
                            </span>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Meeting With <span className="text-red-500 ml-1">*</span>
                        </Label>
                        {isQRBooking && employees.length > 0 ? (
                            <Controller
                                control={control}
                                name="employeeId"
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                                            <SelectTrigger
                                                className={cn(
                                                    "h-12 w-full rounded-lg border-slate-100 bg-white px-3 py-0 text-left shadow-sm focus:ring-[#3882a5]",
                                                    "data-[size=default]:!h-12 data-[size=default]:!min-h-0",
                                                    "[&_[data-slot=select-value]]:line-clamp-1 [&_[data-slot=select-value]]:min-w-0",
                                                )}
                                            >
                                                <div className="flex h-full min-w-0 flex-1 items-center gap-3 text-slate-700">
                                                    <Briefcase className="h-4 w-4 shrink-0 text-[#3882a5]" />
                                                    <SelectValue placeholder="Select an employee" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px]">
                                            {employees.map((emp) => (
                                                <SelectItem
                                                    key={emp._id}
                                                    value={emp._id}
                                                    textValue={`${emp.name} ${emp.department} ${emp.designation ?? ""}`}
                                                    className="rounded-md px-2 py-2 data-[highlighted]:bg-[#3882a5] data-[highlighted]:text-white"
                                                >
                                                    <span className="block min-w-0 max-w-full truncate text-left font-semibold">
                                                        {emp.name}
                                                        <span className="ml-1 text-[10px] font-normal opacity-90">
                                                            · {emp.department}
                                                            {emp.designation ? ` · ${emp.designation}` : ""}
                                                        </span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="px-1 text-[11px] text-slate-500">Choose the employee who will approve this visit.</p>
                                    </div>
                                )}
                            />
                        ) : (
                            <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 shadow-sm">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3882a5]/10 text-[#3882a5]">
                                    <User className="h-4 w-4" />
                                </div>
                                <span className="min-w-0 truncate text-sm font-semibold text-slate-900">{employeeName || "Employee"}</span>
                            </div>
                        )}
                        {errors.employeeId && (
                            <span className="text-[10px] font-bold text-destructive uppercase tracking-wide px-1">
                                {errors.employeeId.message}
                            </span>
                        )}
                    </div>
                </div>

                {/* First Row:  Appointment Date and Appointment Time */}
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
                                Additional Visitors
                                <span className="ml-1 text-muted-foreground text-[10px] font-normal leading-none">(Optional)</span>
                            </Label>
                            <Input
                                type="number"
                                min={0}
                                max={20}
                                step={1}
                                autoComplete="off"
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

                <div className="flex items-center gap-3 border-t pt-4 sm:gap-4 sm:pt-6">
                    {onBack && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                            disabled={isLoading}
                            className="h-12 flex-1 rounded-xl border-border px-4 font-medium"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    )}
                    <ActionButton
                        type="submit"
                        disabled={isLoading || isFileUploading}
                        className={cn(
                            "h-12 rounded-xl bg-[#3882a5] px-4 text-white hover:bg-[#2d6a87] font-medium transition-all shadow-md",
                            onBack ? "flex-1" : "hover:shadow-lg"
                        )}
                        size="lg"
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Processing...
                            </>
                        ) : (
                            submitLabel
                        )}
                    </ActionButton>
                </div>
            </form>
        </FormProvider>
    );
}
