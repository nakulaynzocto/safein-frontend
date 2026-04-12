"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SelectField } from "@/components/common/selectField";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { useCreateAppointmentLinkMutation } from "@/store/api/appointmentLinkApi";
import { useAppSelector } from "@/store/hooks";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { formatPhoneForSubmission, validatePhone } from "@/utils/phoneUtils";
import { Link2, Mail, Phone, User, UserPlus } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import { SubscriptionActionButtons } from "@/components/common/SubscriptionActionButtons";
import { UpgradePlanModal } from "../common/upgradePlanModal";
import { ActionButton } from "@/components/common/actionButton";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormProvider } from "react-hook-form";
import { EmployeeSelectionField } from "@/components/common/EmployeeSelectionField";
import { VisitorExistenceStatus } from "@/components/visitor/VisitorExistenceStatus";
import { useVisitorExistenceCheck } from "@/hooks/useVisitorExistenceCheck";
import { useUserCountry } from "@/hooks/useUserCountry";
import { useGetSettingsQuery } from "@/store/api/settingsApi";
import Link from "next/link";
import { routes } from "@/utils/routes";
import { ConfigurationRequiredModal } from "../common/ConfigurationRequiredModal";
import { useConfigurationModal } from "@/hooks/useConfigurationModal";

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

const createLinkSchema = (isEmployee: boolean) =>
    yup.object().shape({
        visitorPhone: yup.string().optional(),
        visitorEmail: yup
            .string()
            .optional()
            .test("email-format", "Please enter a valid email address", (value) => {
                if (!value || !value.trim()) return true;
                return yup.string().email().isValidSync(value.trim());
            }),
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
    visitorPhone: string;
    visitorEmail: string;
    employeeId: string | null | undefined;
    expiresInDays: number;
}

interface CreateAppointmentLinkModalProps {
    triggerButton?: ReactNode;
    onSuccess?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    renderMode?: "modal" | "page";
}

export function CreateAppointmentLinkModal({
    triggerButton,
    onSuccess,
    open: controlledOpen,
    onOpenChange,
    renderMode = "modal",
}: CreateAppointmentLinkModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);
    const {
        showUpgradeModal,
        openUpgradeModal,
        closeUpgradeModal,
    } = useSubscriptionActions();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inviteChannel, setInviteChannel] = useState<"email" | "phone">("email");
    const { user } = useAppSelector((state) => state.auth);
    const isEmployee = checkIsEmployee(user);
    const { hasReachedAppointmentLimit, isExpired } = useSubscriptionStatus();
    const userCountry = useUserCountry();

    const {
        configWarning,
        openConfigModal,
        closeConfigModal,
        whatsappOk,
        settingsReady,
        checkConfiguration,
    } = useConfigurationModal();

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    const [createAppointmentLink, { isLoading: isCreating }] = useCreateAppointmentLinkMutation();

    const currentEmployeeId = user?.employeeId || null;

    const methods = useForm<CreateAppointmentLinkFormData>({
        resolver: yupResolver(createLinkSchema(isEmployee)) as any,
        defaultValues: {
            visitorPhone: "",
            visitorEmail: "",
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
    } = methods;

    useEffect(() => {
        if (open) {
            reset({
                visitorPhone: "",
                visitorEmail: "",
                employeeId: isEmployee ? (currentEmployeeId || "") : "",
                expiresInDays: 1,
            });
            setInviteChannel("email");
            closeConfigModal();
        }
    }, [open, reset, isEmployee, currentEmployeeId]);

    const visitorPhoneInput = watch("visitorPhone");
    const phoneDigits = (visitorPhoneInput || "").replace(/\D/g, "");
    const { phoneExists, foundVisitor } = useVisitorExistenceCheck(
        inviteChannel === "phone" ? visitorPhoneInput : "",
    );

    const onSubmit = useCallback(
        async (data: CreateAppointmentLinkFormData) => {
            if (isSubmitting || isCreating) {
                return;
            }

            const emailTrim = data.visitorEmail?.trim() || "";
            const phone =
                data.visitorPhone?.trim() ? formatPhoneForSubmission(data.visitorPhone.trim()) : "";

            if (inviteChannel === "email") {
                if (!emailTrim) {
                    const error = "Please enter the visitor's email address.";
                    setGeneralError(error);
                    showErrorToast(error);
                    return;
                }
                if (!yup.string().email().isValidSync(emailTrim)) {
                    const error = "Please enter a valid email address.";
                    setGeneralError(error);
                    showErrorToast(error);
                    return;
                }
            } else {
                if (!phone || !validatePhone(data.visitorPhone || "")) {
                    const error = "Please enter a valid mobile number with country code.";
                    setGeneralError(error);
                    showErrorToast(error);
                    return;
                }
            }

            if (hasReachedAppointmentLimit || isExpired) {
                openUpgradeModal();
                return;
            }

            if (inviteChannel === "email") {
                if (!checkConfiguration("email")) return;
            } else {
                if (!checkConfiguration("phone")) return;
            }

            setIsSubmitting(true);

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
                await createAppointmentLink({
                    ...(inviteChannel === "email"
                        ? { visitorEmail: emailTrim.toLowerCase() }
                        : { visitorPhone: phone }),
                    employeeId: submitEmployeeId,
                    expiresInDays: data.expiresInDays || 1,
                }).unwrap();

                showSuccessToast("Appointment link created and sent successfully!");
                if (isEmployee && currentEmployeeId) {
                    reset({
                        visitorPhone: "",
                        visitorEmail: "",
                        employeeId: currentEmployeeId,
                        expiresInDays: 1,
                    });
                } else {
                    reset({
                        visitorPhone: "",
                        visitorEmail: "",
                        employeeId: "",
                        expiresInDays: 1,
                    });
                }
                setInviteChannel("email");
                setOpen(false);
                setIsSubmitting(false);
                onSuccess?.();
            } catch (error: any) {
                const errorMessage = error?.data?.message || error?.message || "Failed to create appointment link";
                setGeneralError(errorMessage);
                showErrorToast(errorMessage);
                setIsSubmitting(false);
            }
        },
        [
            createAppointmentLink,
            reset,
            setOpen,
            onSuccess,
            isEmployee,
            currentEmployeeId,
            hasReachedAppointmentLimit,
            isSubmitting,
            isCreating,
            isExpired,
            openUpgradeModal,
            inviteChannel,
            settingsReady,
            whatsappOk,
            checkConfiguration,
        ],
    );

    const handleOpenChange = useCallback(
        (isOpen: boolean) => {
            if (!isOpen && (isSubmitting || isCreating)) {
                return;
            }
            setOpen(isOpen);
            if (!isOpen) {
                if (isEmployee && currentEmployeeId) {
                    reset({
                        visitorPhone: "",
                        visitorEmail: "",
                        employeeId: currentEmployeeId,
                        expiresInDays: 1,
                    });
                } else {
                    reset({
                        visitorPhone: "",
                        visitorEmail: "",
                        employeeId: "",
                        expiresInDays: 1,
                    });
                }
                setInviteChannel("email");
                setGeneralError(null);
                setIsSubmitting(false);
                closeConfigModal();
            }
        },
        [setOpen, reset, isEmployee, currentEmployeeId, isSubmitting, isCreating],
    );

    const handleClose = useCallback(() => {
        if (isSubmitting || isCreating) {
            return;
        }
        setOpen(false);
        if (isEmployee && currentEmployeeId) {
            reset({
                visitorPhone: "",
                visitorEmail: "",
                employeeId: currentEmployeeId,
                expiresInDays: 1,
            });
        } else {
            reset({
                visitorPhone: "",
                visitorEmail: "",
                employeeId: "",
                expiresInDays: 1,
            });
        }
        setInviteChannel("email");
        setGeneralError(null);
        setIsSubmitting(false);
        closeConfigModal();
    }, [setOpen, reset, isEmployee, currentEmployeeId, isSubmitting, isCreating]);

    const formHeader =
        renderMode === "page" ? (
            <div className="space-y-2">
                <h2 className="flex items-center gap-2 text-lg font-semibold leading-none">
                    <Link2 className="h-5 w-5 text-[#3882a5]" />
                    Create Appointment Link
                </h2>
                <p className="text-muted-foreground text-sm">
                    Send a secure booking link by email (default) or WhatsApp to the visitor&apos;s mobile. Expiry is
                    based on your selected duration.
                </p>
            </div>
        ) : (
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-[#3882a5]" />
                    Create Appointment Link
                </DialogTitle>
                <DialogDescription>
                    Send a secure booking link by email (default) or WhatsApp to the visitor&apos;s mobile. Expiry is
                    based on your selected duration.
                </DialogDescription>
            </DialogHeader>
        );

    const formContent = (
        <>
            {formHeader}

            <FormProvider {...methods}>
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();

                        if (isSubmitting || isCreating) {
                            return;
                        }

                        if (isEmployee && !currentEmployeeId) {
                            setGeneralError("Loading employee information. Please wait...");
                            showErrorToast("Loading employee information. Please wait...");
                            return;
                        }

                        await handleSubmit(onSubmit)(e);
                    }}
                    className="space-y-4"
                >
                    {generalError && (
                        <Alert variant="destructive">
                            <AlertDescription>{generalError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="mt-2 grid grid-cols-1 gap-4 xl:grid-cols-3">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm font-medium">
                                <User className="h-4 w-4" />
                                Send invite via
                            </Label>
                            <div className="flex rounded-xl border border-border bg-muted/30 p-1">
                                <button
                                    type="button"
                                    onClick={() => setInviteChannel("email")}
                                    className={cn(
                                        "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors",
                                        inviteChannel === "email"
                                            ? "bg-background text-[#3882a5] shadow-sm"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    <Mail className="h-4 w-4 shrink-0" />
                                    Email
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setInviteChannel("phone")}
                                    className={cn(
                                        "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors",
                                        inviteChannel === "phone"
                                            ? "bg-background text-[#3882a5] shadow-sm"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    <Phone className="h-4 w-4 shrink-0" />
                                    Mobile
                                </button>
                            </div>

                            {inviteChannel === "email" ? (
                                <div className="space-y-1.5 pt-1">
                                    <Label htmlFor="visitorEmail" className="text-xs font-medium text-muted-foreground">
                                        Visitor email <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="visitorEmail"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id="visitorEmail"
                                                type="email"
                                                autoComplete="email"
                                                inputMode="email"
                                                placeholder="name@company.com"
                                                className={cn(
                                                    "h-11 rounded-xl border bg-background px-3",
                                                    errors.visitorEmail && "border-red-500",
                                                )}
                                            />
                                        )}
                                    />
                                    {errors.visitorEmail && (
                                        <p className="text-xs text-red-500">{errors.visitorEmail.message}</p>
                                    )}
                                    <p className="text-[11px] text-muted-foreground">
                                        The booking link is sent to this address when email notifications are enabled.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1.5 pt-1">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Visitor mobile <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="visitorPhone"
                                        control={control}
                                        render={({ field }) => (
                                            <PhoneInputField
                                                id="visitorPhone"
                                                label=""
                                                value={field.value || ""}
                                                onChange={(val) => field.onChange(val)}
                                                placeholder="Enter visitor mobile number"
                                                error={errors.visitorPhone?.message}
                                                required
                                                defaultCountry={userCountry}
                                            />
                                        )}
                                    />

                                    {phoneDigits.length >= 10 && (
                                        <VisitorExistenceStatus
                                            isLoading={false}
                                            exists={phoneExists}
                                            foundVisitor={foundVisitor}
                                        />
                                    )}
                                    <p className="text-[11px] text-muted-foreground">
                                        The link is shared on WhatsApp when it is enabled for your workspace.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <EmployeeSelectionField />
                        </div>

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
                    </div>

                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <ActionButton
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting || isCreating || !!(isEmployee && !currentEmployeeId)}
                            size="xl"
                            className="w-full px-6 sm:w-auto"
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
                            upgradeLabel="Upgrade Plan"
                            icon={UserPlus}
                            className="w-full px-6 text-white sm:w-auto sm:min-w-[180px]"
                        >
                            <ActionButton
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting || isCreating || !!(isEmployee && !currentEmployeeId)}
                                size="xl"
                                className="w-full px-6 sm:w-auto sm:min-w-[180px]"
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
                <UpgradePlanModal isOpen={showUpgradeModal} onClose={closeUpgradeModal} />
            )}

            <ConfigurationRequiredModal
                isOpen={configWarning !== null}
                onClose={closeConfigModal}
                type={configWarning}
            />
        </>
    );

    if (renderMode === "page") {
        return (
            <div className="w-full rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
                {formContent}
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
            <DialogContent className="sm:max-w-[500px]">{formContent}</DialogContent>
        </Dialog>
    );
}
