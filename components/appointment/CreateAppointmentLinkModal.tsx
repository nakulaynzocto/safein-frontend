"use client";

import { useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AsyncSelectField } from "@/components/common/asyncSelectField";
import { SelectField } from "@/components/common/selectField";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { useCreateAppointmentLinkMutation, useCheckVisitorExistsQuery } from "@/store/api/appointmentLinkApi";
import { useAppSelector } from "@/store/hooks";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { isValidEmail, isEmployee as checkIsEmployee } from "@/utils/helpers";
import { Link2, Mail, User } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { UpgradePlanModal } from "../common/upgradePlanModal";
import { ActionButton } from "@/components/common/actionButton";
import { useEmployeeSearch } from "@/hooks/useEmployeeSearch";

const EXPIRATION_CONFIG = {
    "30m": { days: 0.0208, label: "30 minutes" },
    "1h": { days: 0.0417, label: "1 hour" },
    "2h": { days: 0.0833, label: "2 hours" },
    "4h": { days: 0.1667, label: "4 hours" },
    "8h": { days: 0.3333, label: "8 hours" },
    "1day": { days: 1, label: "1 day" },
    "2day": { days: 2, label: "2 days" },
    "3day": { days: 3, label: "3 days" },
    "4day": { days: 4, label: "4 days" },
    "5day": { days: 5, label: "5 days" },
} as const;

const EXPIRATION_OPTIONS = Object.entries(EXPIRATION_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
}));

const DAYS_TO_DISPLAY_MAP: Record<number, string> = Object.fromEntries(
    Object.entries(EXPIRATION_CONFIG).map(([display, config]) => [config.days, display]),
) as Record<number, string>;

const DISPLAY_TO_DAYS_MAP: Record<string, number> = Object.fromEntries(
    Object.entries(EXPIRATION_CONFIG).map(([display, config]) => [display, config.days]),
) as Record<string, number>;

const getDisplayValue = (days: number): string => {
    return DAYS_TO_DISPLAY_MAP[days] || "1day";
};

const convertToDays = (value: string): number => {
    return DISPLAY_TO_DAYS_MAP[value] || 1;
};

// Create schema dynamically based on whether user is employee
const createLinkSchema = (isEmployee: boolean) => yup.object().shape({
    visitorEmail: yup.string().required("Visitor email is required").email("Please enter a valid email address"),
    employeeId: isEmployee
        ? yup.string().optional().nullable() // For employees, employeeId is optional (auto-filled)
        : yup.string().required("Employee is required"), // For admins, employeeId is required
    expiresInDays: yup
        .number()
        .min(0.0208, "Expiry must be at least 30 minutes")
        .max(5, "Expiry cannot exceed 5 days")
        .default(1)
        .required(),
});

interface CreateAppointmentLinkFormData {
    visitorEmail: string;
    employeeId: string | null | undefined;
    expiresInDays: number;
}

interface CreateAppointmentLinkModalProps {
    triggerButton?: ReactNode;
    onSuccess?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CreateAppointmentLinkModal({
    triggerButton,
    onSuccess,
    open: controlledOpen,
    onOpenChange,
}: CreateAppointmentLinkModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [visitorExists, setVisitorExists] = useState<boolean | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { hasReachedAppointmentLimit } = useSubscriptionStatus();
    const { user } = useAppSelector((state) => state.auth);

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    const [createAppointmentLink, { isLoading: isCreating }] = useCreateAppointmentLinkMutation();

    // Check if current user is an employee
    const isEmployee = checkIsEmployee(user);

    // Get employeeId from user object
    const currentEmployeeId = user?.employeeId || null;

    // Use common employee search hook
    const { loadEmployeeOptions } = useEmployeeSearch();

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        watch,
        reset,
        setValue,
        trigger,
    } = useForm<CreateAppointmentLinkFormData>({
        resolver: yupResolver(createLinkSchema(isEmployee)) as any,
        defaultValues: {
            visitorEmail: "",
            employeeId: "",
            expiresInDays: 1,
        },
        mode: "onChange",
    });

    // Reset form when modal opens for employees to ensure employeeId is set
    useEffect(() => {
        if (isEmployee && currentEmployeeId && open) {
            reset({
                visitorEmail: "",
                employeeId: currentEmployeeId,
                expiresInDays: 1,
            }, { keepDefaultValues: false });
            // Also set value explicitly to ensure it's registered (without validation for employees)
            setValue("employeeId", currentEmployeeId, { shouldValidate: false, shouldDirty: true });
        } else if (!isEmployee && open) {
            reset({
                visitorEmail: "",
                employeeId: "",
                expiresInDays: 1,
            });
        }
    }, [isEmployee, currentEmployeeId, open, reset, setValue]);

    // Ensure employeeId is always set for employees when currentEmployeeId changes
    useEffect(() => {
        if (isEmployee && currentEmployeeId && open) {
            setValue("employeeId", currentEmployeeId, { shouldValidate: false, shouldDirty: true });
        }
    }, [isEmployee, currentEmployeeId, open, setValue]);

    const visitorEmail = watch("visitorEmail");
    const expiresInDaysValue = watch("expiresInDays");
    const [debouncedEmail, setDebouncedEmail] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            if (visitorEmail && isValidEmail(visitorEmail)) {
                setDebouncedEmail(visitorEmail.trim().toLowerCase());
            } else {
                setDebouncedEmail("");
                setVisitorExists(null);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [visitorEmail]);

    const { data: visitorCheckData, isLoading: isCheckingVisitor } = useCheckVisitorExistsQuery(debouncedEmail, {
        skip: !debouncedEmail || !isValidEmail(debouncedEmail),
    });

    useEffect(() => {
        if (debouncedEmail && visitorCheckData !== undefined) {
            setVisitorExists(visitorCheckData.exists);
        } else if (!debouncedEmail) {
            setVisitorExists(null);
        }
    }, [debouncedEmail, visitorCheckData]);

    const onSubmit = useCallback(
        async (data: CreateAppointmentLinkFormData) => {
            // Prevent multiple submissions
            if (isSubmitting || isCreating) {
                return;
            }

            if (hasReachedAppointmentLimit) {
                setShowUpgradeModal(true);
                return;
            }

            // Set submitting state to prevent duplicate submissions
            setIsSubmitting(true);

            // Ensure employeeId is set for employees - use currentEmployeeId from component state
            let submitEmployeeId = data.employeeId;
            if (isEmployee) {
                submitEmployeeId = currentEmployeeId || currentEmployeeId || data.employeeId;

                // For employees, if still no employeeId, show error
                if (!submitEmployeeId) {
                    setGeneralError("Unable to find employee information. Please refresh and try again.");
                    showErrorToast("Unable to find employee information. Please refresh and try again.");
                    setIsSubmitting(false);
                    return;
                }
            } else {
                // For admins, employeeId is required
                if (!submitEmployeeId) {
                    setGeneralError("Employee ID is required. Please try again.");
                    showErrorToast("Employee ID is required. Please try again.");
                    setIsSubmitting(false);
                    return;
                }
            }

            try {
                setGeneralError(null);
                const result = await createAppointmentLink({
                    visitorEmail: data.visitorEmail.trim().toLowerCase(),
                    employeeId: submitEmployeeId,
                    expiresInDays: data.expiresInDays || 1,
                }).unwrap();

                showSuccessToast("Appointment link created and email sent successfully!");
                // Reset form - for employees, keep employeeId; for admins, clear it
                if (isEmployee && currentEmployeeId) {
                    reset({
                        visitorEmail: "",
                        employeeId: currentEmployeeId,
                        expiresInDays: 1,
                    });
                } else {
                    reset();
                }
                setOpen(false);
                setVisitorExists(null);
                setIsSubmitting(false);
                onSuccess?.();
            } catch (error: any) {
                const errorMessage = error?.data?.message || error?.message || "Failed to create appointment link";
                setGeneralError(errorMessage);
                showErrorToast(errorMessage);
                setIsSubmitting(false);
            }
        },
        [createAppointmentLink, reset, setOpen, onSuccess, isEmployee, currentEmployeeId, currentEmployeeId, hasReachedAppointmentLimit, isSubmitting, isCreating],
    );

    const handleOpenChange = useCallback(
        (isOpen: boolean) => {
            // Don't allow closing if submission is in progress
            if (!isOpen && (isSubmitting || isCreating)) {
                return;
            }
            setOpen(isOpen);
            if (!isOpen) {
                // Reset form - for employees, keep employeeId; for admins, clear it
                if (isEmployee && currentEmployeeId) {
                    reset({
                        visitorEmail: "",
                        employeeId: currentEmployeeId,
                        expiresInDays: 1,
                    });
                } else {
                    reset();
                }
                setGeneralError(null);
                setVisitorExists(null);
                setIsSubmitting(false);
            }
        },
        [setOpen, reset, isEmployee, currentEmployeeId, isSubmitting, isCreating],
    );

    const handleClose = useCallback(() => {
        // Don't allow closing if submission is in progress
        if (isSubmitting || isCreating) {
            return;
        }
        setOpen(false);
        // Reset form - for employees, keep employeeId; for admins, clear it
        if (isEmployee && currentEmployeeId) {
            reset({
                visitorEmail: "",
                employeeId: currentEmployeeId,
                expiresInDays: 1,
            });
        } else {
            reset();
        }
        setGeneralError(null);
        setVisitorExists(null);
        setIsSubmitting(false);
    }, [setOpen, reset, isEmployee, currentEmployeeId, isSubmitting, isCreating]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-[#3882a5]" />
                        Create Appointment Link
                    </DialogTitle>
                    <DialogDescription>
                        Generate a secure booking link that visitors can use to schedule appointments. The link will be
                        sent via email and expires based on your selected duration.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={async (e) => {
                        e.preventDefault();

                        // Prevent multiple submissions
                        if (isSubmitting || isCreating) {
                            return;
                        }

                        // For employees, bypass validation completely and call onSubmit directly
                        if (isEmployee) {
                            // Wait for employee data to load if still loading
                            if (!currentEmployeeId) {
                                setGeneralError("Loading employee information. Please wait...");
                                showErrorToast("Loading employee information. Please wait...");
                                return;
                            }

                            // Get employeeId from currentEmployeeId
                            let submitEmployeeId = currentEmployeeId;

                            // If still no employeeId, show error
                            if (!submitEmployeeId) {

                                // If we still don't have employeeId, check if employees list has loaded
                                if (false) {
                                    setGeneralError("Loading employee information. Please wait...");
                                    showErrorToast("Loading employee information. Please wait...");
                                    return;
                                }

                                // If employees list has loaded but we still can't find the employee
                                if (false) {
                                    setGeneralError("Failed to load employee information. Please try again.");
                                    showErrorToast("Failed to load employee information. Please try again.");
                                    return;
                                }

                                setGeneralError("Unable to find employee information. Please ensure you are properly registered as an employee and your email matches your employee record.");
                                showErrorToast("Unable to find employee information. Please ensure you are properly registered as an employee and your email matches your employee record.");
                                return;
                            }

                            // Validate visitor email manually
                            if (!visitorEmail || !isValidEmail(visitorEmail)) {
                                setGeneralError("Please enter a valid visitor email address.");
                                showErrorToast("Please enter a valid visitor email address.");
                                return;
                            }

                            // Call onSubmit directly with the data
                            await onSubmit({
                                visitorEmail: visitorEmail.trim().toLowerCase(),
                                employeeId: submitEmployeeId,
                                expiresInDays: expiresInDaysValue || 1,
                            });
                        } else {
                            // For admins, use normal validation
                            await handleSubmit(onSubmit)(e);
                        }
                    }}
                    className="space-y-4"
                >
                    {generalError && (
                        <Alert variant="destructive">
                            <AlertDescription>{generalError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="visitorEmail" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Visitor Email <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                            name="visitorEmail"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-1">
                                    <Input
                                        {...field}
                                        id="visitorEmail"
                                        type="email"
                                        placeholder="visitor@example.com"
                                        className={`h-12 rounded-xl bg-muted/30 font-medium ${errors.visitorEmail ? "border-red-500" : ""}`}
                                    />
                                    {errors.visitorEmail && (
                                        <p className="text-sm text-red-500">{errors.visitorEmail.message}</p>
                                    )}
                                    {isCheckingVisitor && <p className="text-sm text-gray-500">Checking visitor...</p>}
                                    {visitorExists !== null && !isCheckingVisitor && (
                                        <div className="flex items-center gap-2 text-sm">
                                            {visitorExists ? (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <User className="h-4 w-4" />
                                                    This visitor is already registered
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[#3882a5]">
                                                    <User className="h-4 w-4" />
                                                    New visitor - will be registered during booking
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    {/* Employee field - only show for admins, hide completely for employees */}
                    {!isEmployee && (
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">
                                Employee <span className="text-red-500">*</span>
                            </Label>
                            <Controller
                                name="employeeId"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-1">
                                        <AsyncSelectField
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            loadOptions={loadEmployeeOptions}
                                            placeholder="Search employees..."
                                            isClearable={false}
                                            error={errors.employeeId?.message}
                                            cacheOptions={true}
                                            defaultOptions={true}
                                        />
                                    </div>
                                )}
                            />
                        </div>
                    )}

                    {/* Hidden field for employees - employeeId is auto-set */}
                    {isEmployee && (
                        <Controller
                            name="employeeId"
                            control={control}
                            render={({ field }) => {
                                // Always use currentEmployeeId if available, sync immediately
                                const value = currentEmployeeId || field.value || "";
                                if (value && value !== field.value) {
                                    field.onChange(value);
                                }
                                return (
                                    <input
                                        type="hidden"
                                        {...field}
                                        value={value}
                                    />
                                );
                            }}
                        />
                    )}

                    {/* Don't show validation errors for employeeId for employees - it's auto-filled */}

                    <div className="space-y-2">
                        <Label htmlFor="expiresInDays">Link Expires In</Label>
                        <Controller
                            name="expiresInDays"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-1">
                                    <SelectField
                                        value={getDisplayValue(field.value || 1)}
                                        onChange={(value) => field.onChange(convertToDays(value))}
                                        options={EXPIRATION_OPTIONS}
                                        placeholder="Select expiration time"
                                        isClearable={false}
                                        className={errors.expiresInDays ? "border-red-500" : ""}
                                    />
                                    {errors.expiresInDays && (
                                        <p className="text-sm text-red-500">{errors.expiresInDays.message}</p>
                                    )}
                                    <p className="text-xs text-gray-500">Default: 1 day</p>
                                </div>
                            )}
                        />
                    </div>

                    <DialogFooter>
                        <ActionButton
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting || isCreating || !!(isEmployee && !currentEmployeeId)}
                            size="xl"
                            className="px-6"
                        >
                            Cancel
                        </ActionButton>
                        <ActionButton
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting || isCreating || !!(isEmployee && !currentEmployeeId)}
                            size="xl"
                            className="px-6"
                        >
                            {isSubmitting || isCreating ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Creating...
                                </>
                            ) : isEmployee && !currentEmployeeId ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Loading...
                                </>
                            ) : (
                                "Create Link"
                            )}
                        </ActionButton>
                    </DialogFooter>
                </form>
            </DialogContent>

            <UpgradePlanModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
        </Dialog>
    );
}
