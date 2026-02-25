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
import { Link2, Mail, User, Phone } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import { SubscriptionActionButtons } from "@/components/common/SubscriptionActionButtons";
import { UpgradePlanModal } from "../common/upgradePlanModal";
import { AddonPurchaseModal } from "../common/AddonPurchaseModal";
import { ActionButton } from "@/components/common/actionButton";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { FormProvider } from "react-hook-form";
import { EmployeeSelectionField } from "@/components/common/EmployeeSelectionField";
import { VisitorExistenceStatus } from "@/components/visitor/VisitorExistenceStatus";
import { useVisitorExistenceCheck } from "@/hooks/useVisitorExistenceCheck";

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
    visitorEmail: yup.string().email("Please enter a valid email address").optional(),
    visitorPhone: yup
        .string()
        .required("Visitor phone number is required")
        .matches(/^\d{10,15}$/, "Phone number must be between 10 and 15 digits"),
    employeeId: isEmployee
        ? yup.string().optional().nullable()
        : yup.string().required("Employee is required"),
    expiresInDays: yup
        .number()
        .min(0.0208, "Expiry must be at least 30 minutes")
        .max(5, "Expiry cannot exceed 5 days")
        .default(1)
        .required(),
});

interface CreateAppointmentLinkFormData {
    visitorEmail?: string;
    visitorPhone: string;
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
    const {
        showUpgradeModal,
        openUpgradeModal,
        closeUpgradeModal,
        showAddonModal,
        openAddonModal,
        closeAddonModal
    } = useSubscriptionActions();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { hasReachedAppointmentLimit, isExpired } = useSubscriptionStatus();
    const { user } = useAppSelector((state) => state.auth);

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    const [createAppointmentLink, { isLoading: isCreating }] = useCreateAppointmentLinkMutation();

    // Check if current user is an employee
    const isEmployee = checkIsEmployee(user);

    // Get employeeId from user object
    const currentEmployeeId = user?.employeeId || null;

    const methods = useForm<CreateAppointmentLinkFormData>({
        resolver: yupResolver(createLinkSchema(isEmployee)) as any,
        defaultValues: {
            visitorEmail: "",
            visitorPhone: "",
            employeeId: isEmployee ? (currentEmployeeId || "") : "",
            expiresInDays: 1,
        },
        mode: "onChange",
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
        setValue,
        getValues,
    } = methods;

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            reset({
                visitorEmail: "",
                visitorPhone: "",
                employeeId: isEmployee ? (currentEmployeeId || "") : "",
                expiresInDays: 1,
            });
        }
    }, [open, reset, isEmployee, currentEmployeeId]);

    const visitorEmail = watch("visitorEmail");
    const visitorPhone = watch("visitorPhone");
    // Use common visitor check hook
    const { emailExists, phoneExists, foundVisitor } = useVisitorExistenceCheck(visitorEmail, visitorPhone);

    const onSubmit = useCallback(
        async (data: CreateAppointmentLinkFormData) => {
            // Prevent multiple submissions
            if (isSubmitting || isCreating) {
                return;
            }

            if (hasReachedAppointmentLimit || isExpired) {
                if (isExpired) {
                    openUpgradeModal();
                } else {
                    openAddonModal();
                }
                return;
            }

            // Set submitting state to prevent duplicate submissions
            setIsSubmitting(true);

            // Resolve employeeId based on user role
            const submitEmployeeId = isEmployee ? (currentEmployeeId || data.employeeId) : data.employeeId;

            if (!submitEmployeeId) {
                const error = isEmployee
                    ? "Unable to find employee information. Please refresh and try again."
                    : "Employee ID is required. Please try again.";
                setGeneralError(error);
                showErrorToast(error);
                setIsSubmitting(false);
                return;
            }

            try {
                setGeneralError(null);
                const result = await createAppointmentLink({
                    visitorEmail: data.visitorEmail?.trim().toLowerCase(),
                    visitorPhone: data.visitorPhone.trim(),
                    employeeId: submitEmployeeId,
                    expiresInDays: data.expiresInDays || 1,
                }).unwrap();

                showSuccessToast("Appointment link created and sent successfully!");
                // Reset form - for employees, keep employeeId; for admins, clear it
                if (isEmployee && currentEmployeeId) {
                    reset({
                        visitorEmail: "",
                        visitorPhone: "",
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
        [createAppointmentLink, reset, setOpen, onSuccess, isEmployee, currentEmployeeId, hasReachedAppointmentLimit, isSubmitting, isCreating],
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
                        visitorPhone: "",
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
                visitorPhone: "",
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
                        sent via phone (SMS/WhatsApp) and email, and expires based on your selected duration.
                    </DialogDescription>
                </DialogHeader>

                <FormProvider {...methods}>
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
                                    setGeneralError("Unable to find employee information. Please ensure you are properly registered as an employee.");
                                    showErrorToast("Unable to find employee information.");
                                    return;
                                }

                                // Validate visitor phone manually
                                const currentValues = getValues();
                                if (!currentValues.visitorPhone || currentValues.visitorPhone.length < 10) {
                                    setGeneralError("Please enter a valid visitor phone number.");
                                    showErrorToast("Please enter a valid visitor phone number.");
                                    return;
                                }

                                // Call onSubmit directly with the data
                                await onSubmit({
                                    visitorEmail: currentValues.visitorEmail?.trim().toLowerCase(),
                                    visitorPhone: currentValues.visitorPhone.trim(),
                                    employeeId: submitEmployeeId,
                                    expiresInDays: currentValues.expiresInDays || 1,
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
                            <Label htmlFor="visitorPhone" className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Visitor Phone <span className="text-red-500">*</span>
                            </Label>
                            <Controller
                                name="visitorPhone"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-1">
                                        <PhoneInputField
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            id="visitorPhone"
                                            placeholder="Enter phone number"
                                            error={errors.visitorPhone?.message}
                                            defaultCountry="in"
                                            required
                                        />
                                    </div>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="visitorEmail" className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                Visitor Email (Optional)
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
                                            className={`h-12 rounded-xl bg-background font-medium ${errors.visitorEmail ? "border-red-500" : ""}`}
                                        />
                                        {errors.visitorEmail && (
                                            <p className="text-sm text-red-500">{errors.visitorEmail.message}</p>
                                        )}
                                        <VisitorExistenceStatus
                                            isLoading={false}
                                            exists={emailExists || phoneExists}
                                            foundVisitor={foundVisitor}
                                        />
                                    </div>
                                )}
                            />
                        </div>

                        <EmployeeSelectionField />

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

                        <DialogFooter className="gap-2 sm:gap-0">
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

                            <SubscriptionActionButtons
                                isExpired={isExpired}
                                hasReachedLimit={hasReachedAppointmentLimit}
                                limitType="appointment"
                                showUpgradeModal={showUpgradeModal}
                                openUpgradeModal={openUpgradeModal}
                                closeUpgradeModal={closeUpgradeModal}
                                showAddonModal={showAddonModal}
                                openAddonModal={openAddonModal}
                                closeAddonModal={closeAddonModal}
                                upgradeLabel="Upgrade Plan"
                                buyExtraLabel="Buy Extra Invites"
                                className="px-6 text-white min-w-[180px]"
                            >
                                <ActionButton
                                    type="submit"
                                    variant="primary"
                                    disabled={isSubmitting || isCreating || !!(isEmployee && !currentEmployeeId)}
                                    size="xl"
                                    className="px-6 min-w-[180px]"
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
                            </SubscriptionActionButtons>
                        </DialogFooter>
                    </form>
                </FormProvider>

                {!(hasReachedAppointmentLimit || isExpired) && (
                    <>
                        <UpgradePlanModal
                            isOpen={showUpgradeModal}
                            onClose={closeUpgradeModal}
                        />
                        <AddonPurchaseModal
                            isOpen={showAddonModal}
                            onClose={closeAddonModal}
                            type="appointment"
                        />
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
