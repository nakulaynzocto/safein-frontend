"use client";

import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/common/actionButton";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SelectField } from "@/components/common/selectField";
import { InputField } from "@/components/common/inputField";
import { EnhancedDatePicker } from "@/components/common/enhancedDatePicker";
import { EnhancedTimePicker } from "@/components/common/enhancedTimePicker";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { ImageUploadField } from "@/components/common/imageUploadField";
import {
    useCreateAppointmentMutation,
    useGetAppointmentQuery,
    useUpdateAppointmentMutation,
} from "@/store/api/appointmentApi";
import { useGetEmployeesQuery, useGetEmployeeQuery } from "@/store/api/employeeApi";
import { useGetVisitorsQuery, useGetVisitorQuery, Visitor } from "@/store/api/visitorApi";
import { showSuccessToast } from "@/utils/toast";
import { routes } from "@/utils/routes";
import { Calendar, Car, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FormContainer } from "@/components/common/formContainer";
import { ApprovalLinkModal } from "./ApprovalLinkModal";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useDebounce } from "@/hooks/useDebounce";
import { appointmentSchema, type AppointmentFormData } from "./helpers/appointmentValidation";
import { createSelectOptions } from "./helpers/selectOptionsHelper";
import {
    createAppointmentPayload,
    createUpdateAppointmentPayload,
    formatEmployeeLabel,
    formatEmployeeSearchKeywords,
    formatVisitorLabel,
    formatVisitorSearchKeywords,
} from "./helpers/appointmentFormHelpers";
import { getDefaultFormValues, appointmentToFormValues } from "./helpers/formResetHelpers";

interface NewAppointmentModalProps {
    appointmentId?: string;
    triggerButton?: ReactNode;
    onSuccess?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    layout?: "modal" | "page";
}

export function NewAppointmentModal({
    appointmentId,
    triggerButton,
    onSuccess,
    open: controlledOpen,
    onOpenChange,
    layout = "modal",
}: NewAppointmentModalProps) {
    const router = useRouter();

    const [internalOpen, setInternalOpen] = useState(false);
    const isPage = layout === "page";
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [approvalLink, setApprovalLink] = useState<string | null>(null);
    const [showApprovalLinkModal, setShowApprovalLinkModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [employeeSearchInput, setEmployeeSearchInput] = useState("");
    const [visitorSearchInput, setVisitorSearchInput] = useState("");
    const [showVehicleFields, setShowVehicleFields] = useState<boolean>(false);
    const [isFileUploading, setIsFileUploading] = useState(false);

    const debouncedEmployeeSearch = useDebounce(employeeSearchInput, 500);
    const debouncedVisitorSearch = useDebounce(visitorSearchInput, 500);

    const open = isPage ? true : controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = isPage ? (_: boolean) => { } : onOpenChange || setInternalOpen;
    const isEditMode = !!appointmentId;

    const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation();
    const [updateAppointment, { isLoading: isUpdating }] = useUpdateAppointmentMutation();
    const { hasReachedAppointmentLimit } = useSubscriptionStatus();
    const isLoading = isCreating || isUpdating;
    const {
        data: employeesData,
        isLoading: isLoadingEmployees,
        error: employeesError,
    } = useGetEmployeesQuery({
        page: 1,
        limit: 10,
        search: debouncedEmployeeSearch || undefined,
        status: "Active" as const,
    });
    const employees = employeesData?.employees || [];

    const {
        data: visitorsData,
        isLoading: isLoadingVisitors,
        error: visitorsError,
    } = useGetVisitorsQuery({
        page: 1,
        limit: 10,
        search: debouncedVisitorSearch || undefined,
    });
    const visitors: Visitor[] = visitorsData?.visitors || [];

    const { data: existingAppointment, isLoading: isLoadingAppointment } = useGetAppointmentQuery(appointmentId || "", {
        skip: !appointmentId,
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        setValue,
        watch,
        clearErrors,
        trigger,
    } = useForm<AppointmentFormData>({
        resolver: yupResolver(appointmentSchema),
        defaultValues: getDefaultFormValues(),
    });

    const selectedEmployeeId = watch("employeeId");
    const selectedVisitorId = watch("visitorId");
    const { data: selectedEmployeeData } = useGetEmployeeQuery(selectedEmployeeId || "", {
        skip: !selectedEmployeeId || employees.some((emp) => emp._id === selectedEmployeeId),
    });
    const selectedEmployee = selectedEmployeeData;

    const isSelectedVisitorInList = visitors.some((v) => v._id === selectedVisitorId);
    const { data: selectedVisitorData } = useGetVisitorQuery(selectedVisitorId || "", {
        skip: !selectedVisitorId || isSelectedVisitorInList,
    });
    const selectedVisitor = selectedVisitorData;

    const employeeOptions = useMemo(
        () =>
            createSelectOptions({
                items: employees,
                selectedId: selectedEmployeeId,
                selectedItem: selectedEmployee,
                formatLabel: formatEmployeeLabel,
                formatSearchKeywords: formatEmployeeSearchKeywords,
                filterFn: (emp) => emp.status === "Active",
            }),
        [employees, selectedEmployeeId, selectedEmployee],
    );

    const visitorOptions = useMemo(
        () =>
            createSelectOptions({
                items: visitors,
                selectedId: selectedVisitorId,
                selectedItem: selectedVisitor,
                formatLabel: formatVisitorLabel,
                formatSearchKeywords: formatVisitorSearchKeywords,
            }),
        [visitors, selectedVisitorId, selectedVisitor],
    );

    const handleEmployeeSearchChange = useCallback((inputValue: string) => {
        setEmployeeSearchInput(inputValue);
    }, []);

    const handleVisitorSearchChange = useCallback((inputValue: string) => {
        setVisitorSearchInput(inputValue);
    }, []);

    const handleVisitorSelect = useCallback(
        (visitorId: string | null) => {
            if (visitorId) {
                clearErrors("visitorId");
            }
        },
        [clearErrors],
    );

    // Effects
    useEffect(() => {
        if (!open) {
            reset();
            setGeneralError(null);
            setApprovalLink(null);
            clearErrors();
            setEmployeeSearchInput("");
            setVisitorSearchInput("");
        }
    }, [open, reset, clearErrors]);

    useEffect(() => {
        if (isEditMode && existingAppointment && open) {
            reset(appointmentToFormValues(existingAppointment));
            // Set vehicle fields toggle if vehicle data exists
            const hasVehicleData =
                existingAppointment?.appointmentDetails?.vehicleNumber ||
                existingAppointment?.appointmentDetails?.vehiclePhoto;
            setShowVehicleFields(!!hasVehicleData);
        }
    }, [isEditMode, existingAppointment, open, reset]);

    const handleClose = () => {
        if (isPage) {
            router.push(routes.privateroute.APPOINTMENTLIST);
        } else {
            setOpen(false);
        }
    };

    const onSubmit = async (data: AppointmentFormData) => {
        if (isLoading) return;

        if (!isEditMode && hasReachedAppointmentLimit) {
            setShowUpgradeModal(true);
            return;
        }

        setGeneralError(null);

        try {
            const selectedEmp = employees.find((e) => e._id === data.employeeId);
            if (selectedEmp && selectedEmp.status === "Inactive") {
                setGeneralError("Selected employee is inactive. Please choose an active employee.");
                return;
            }
            if (isEditMode && appointmentId) {
                const updateData = createUpdateAppointmentPayload(data, existingAppointment);
                await updateAppointment({ id: appointmentId, ...updateData }).unwrap();
                showSuccessToast("Appointment updated successfully!");
                if (!isPage) setOpen(false);
                if (onSuccess) onSuccess();
                if (isPage && !onSuccess) {
                    router.push(routes.privateroute.APPOINTMENTLIST);
                }
            } else {
                const newAppointmentData = createAppointmentPayload(data);
                const result = await createAppointment(newAppointmentData).unwrap();
                showSuccessToast("Appointment created successfully");
                if (!isPage) setOpen(false);

                if (result.approvalLink) {
                    setApprovalLink(result.approvalLink);
                    setShowApprovalLinkModal(true);
                } else {
                    if (onSuccess) onSuccess();
                    if (isPage && !onSuccess) {
                        router.push(routes.privateroute.APPOINTMENTLIST);
                    }
                }
            }
        } catch (error: any) {
            if (error?.data?.errors && Array.isArray(error.data.errors)) {
                setGeneralError(error.data.message || "Validation failed");
            } else if (error?.data?.message) {
                setGeneralError(error.data.message);
            } else {
                setGeneralError(error?.message || "Failed to create appointment");
            }
        }
    };

    const defaultTrigger = <Button variant="default">{isEditMode ? "Edit Appointment" : "New Appointment"}</Button>;

    const formContent = (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
            {generalError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{generalError}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Controller
                        name="visitorId"
                        control={control}
                        render={({ field }) => (
                            <SelectField
                                label="Visitor"
                                placeholder="Select visitor"
                                options={visitorOptions}
                                value={field.value}
                                onChange={(val) => {
                                    field.onChange(val ?? "");
                                    handleVisitorSelect(val);
                                }}
                                onInputChange={handleVisitorSearchChange}
                                error={
                                    errors.visitorId?.message || (visitorsError ? "Failed to load visitors" : undefined)
                                }
                                isLoading={isLoadingVisitors}
                                required
                            />
                        )}
                    />

                    <Controller
                        name="employeeId"
                        control={control}
                        render={({ field }) => (
                            <SelectField
                                label="Employee to Meet"
                                placeholder="Select employee"
                                options={employeeOptions}
                                value={field.value}
                                onChange={(val) => {
                                    field.onChange(val ?? "");
                                }}
                                onInputChange={handleEmployeeSearchChange}
                                error={
                                    errors.employeeId?.message ||
                                    (employeesError ? "Failed to load employees" : undefined)
                                }
                                isLoading={isLoadingEmployees}
                                required
                            />
                        )}
                    />

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium">
                            Accompanying People <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Input
                            type="number"
                            min={0}
                            max={20}
                            step={1}
                            placeholder="Number of people (e.g., 0, 1, 2)"
                            {...register("accompanyingCount")}
                            className={`pl-4 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium ${errors.accompanyingCount ? "border-destructive" : ""}`}
                        />
                        {errors.accompanyingCount && (
                            <span className="text-destructive text-xs">{errors.accompanyingCount.message}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Second Row: Appointment Date, Appointment Time, Purpose of Visit */}
            <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

                    <InputField
                        label="Purpose of Visit"
                        placeholder="Brief description of the visit purpose"
                        error={errors.purpose?.message}
                        {...register("purpose")}
                        required
                    />
                </div>
            </div>

            {/* Visit Information Section */}
            <div className="space-y-4 pt-4">
                <div className="space-y-1.5">
                    <Label htmlFor="notes" className="text-sm font-medium">
                        Notes <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Textarea
                        id="notes"
                        {...register("notes")}
                        placeholder="Any additional information or special requirements"
                        className={`bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium ${errors.notes ? "border-destructive" : ""}`}
                        rows={4}
                    />
                    {errors.notes && <span className="text-destructive text-xs">{errors.notes.message}</span>}
                </div>
            </div>

            {/* Vehicle Fields Toggle */}
            <div className="border-t pt-4">
                <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        <Car className="text-muted-foreground h-5 w-5" />
                        <div>
                            <Label htmlFor="vehicle-fields-toggle" className="cursor-pointer text-sm font-medium">
                                Add Vehicle Information
                            </Label>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                                Include vehicle number and photo if applicable
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="vehicle-fields-toggle"
                        checked={showVehicleFields}
                        onCheckedChange={(checked) => {
                            setShowVehicleFields(checked);
                            if (!checked) {
                                setValue("vehicleNumber", "");
                                setValue("vehiclePhoto", "");
                            }
                        }}
                        className="data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
                    />
                </div>
            </div>

            {/* Vehicle Information Section (Optional) - Only shown when toggle is ON */}
            {showVehicleFields && (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-4 pt-4 duration-200">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Vehicle Photo */}
                        <div className="flex items-start justify-center md:justify-start">
                            <ImageUploadField
                                name="vehiclePhoto"
                                label="Vehicle Photo (optional)"
                                register={register}
                                setValue={setValue}
                                errors={errors}
                                initialUrl={watch("vehiclePhoto")}
                                enableImageCapture={true}
                                onUploadStatusChange={setIsFileUploading}
                                variant="avatar"
                            />
                        </div>

                        {/* Vehicle Number */}
                        <div className="space-y-1.5">
                            <Label htmlFor="vehicleNumber" className="text-sm font-medium">
                                Vehicle Number <span className="text-muted-foreground font-normal">(optional)</span>
                            </Label>
                            <Input
                                id="vehicleNumber"
                                {...register("vehicleNumber")}
                                placeholder="e.g., DL01AB1234"
                                className={`pl-4 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium ${errors.vehicleNumber ? "border-destructive" : ""}`}
                            />
                            {errors.vehicleNumber && (
                                <span className="text-destructive text-xs">{errors.vehicleNumber.message}</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                <ActionButton
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    size="xl"
                    className="w-full px-6 sm:w-auto"
                >
                    Cancel
                </ActionButton>
                <ActionButton
                    type="submit"
                    variant="outline-primary"
                    disabled={isLoading || isFileUploading}
                    size="xl"
                    className="w-full min-w-[180px] px-6 sm:w-auto"
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            <span>{isEditMode ? "Updating..." : "Scheduling..."}</span>
                        </>
                    ) : (
                        <>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>{isEditMode ? "Update" : "Schedule"} Appointment</span>
                        </>
                    )}
                </ActionButton>
            </div>
        </form>
    );

    const renderedForm = isPage ? (
        <FormContainer isPage={true} isLoading={isLoadingAppointment} isEditMode={isEditMode}>
            {formContent}
        </FormContainer>
    ) : (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{triggerButton || defaultTrigger}</DialogTrigger>

            <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-hidden bg-white p-4 sm:max-w-2xl sm:p-6 dark:bg-gray-900">
                <FormContainer isPage={false} isLoading={isLoadingAppointment} isEditMode={isEditMode}>
                    {formContent}
                </FormContainer>
            </DialogContent>
        </Dialog>
    );

    return (
        <>
            {renderedForm}

            {/* Approval Link Modal - Separate Modal */}
            {approvalLink && (
                <ApprovalLinkModal
                    open={showApprovalLinkModal}
                    onOpenChange={(open) => {
                        setShowApprovalLinkModal(open);
                        if (!open) {
                            setApprovalLink(null);
                            if (onSuccess) {
                                onSuccess();
                            } else if (isPage) {
                                router.push(routes.privateroute.APPOINTMENTLIST);
                            }
                        }
                    }}
                    approvalLink={approvalLink || ""}
                    onCancel={() => {
                        if (onSuccess) {
                            onSuccess();
                        } else if (isPage) {
                            router.push(routes.privateroute.APPOINTMENTLIST);
                        }
                    }}
                />
            )}

            <UpgradePlanModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
        </>
    );
}

export default NewAppointmentModal;
