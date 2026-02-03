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
import { SelectField } from "@/components/common/selectField";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { useCreateAppointmentLinkMutation, useCheckVisitorExistsQuery } from "@/store/api/appointmentLinkApi";
import { useGetEmployeesQuery, useGetEmployeeQuery } from "@/store/api/employeeApi";
import { useAppSelector } from "@/store/hooks";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { isValidEmail, isEmployee as checkIsEmployee } from "@/utils/helpers";
import { Link2, Mail, User } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { UpgradePlanModal } from "../common/upgradePlanModal";
import { ActionButton } from "@/components/common/actionButton";

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

    // Get employeeId from user object, or try to fetch it from employee data
    const currentEmployeeId = user?.employeeId || null;

    // Get all employees - backend now includes employee's own record even if created by admin
    const {
        data: employeesData,
        isLoading: isLoadingEmployees,
        error: employeesError,
    } = useGetEmployeesQuery(
        {
            page: 1,
            limit: 100,
            status: "Active" as const,
        },
        {
            skip: false, // Always fetch - backend now includes employee's own record
        }
    );

    // If employee, try to get their own employee data by ID
    // Note: This might fail if the employee was created by admin (controller checks createdBy)
    // So we'll also try to find by email as a fallback
    const { data: currentEmployeeData, isLoading: isLoadingCurrentEmployee } = useGetEmployeeQuery(
        currentEmployeeId || "",
        {
            skip: !isEmployee || !currentEmployeeId,
        }
    );
    
    // Find employee by email - always try this as a fallback
    // Try to find employee by email in the employees list
    const employeeByEmail = useMemo(() => {
        if (!isEmployee || !user?.email || !employeesData?.employees || employeesData.employees.length === 0) {
            return null;
        }
        
        // Always search by email as a fallback, even if we have currentEmployeeId
        // This ensures we can find the employee if employeeId is not set in user object
        const found = employeesData.employees.find(
            (emp) => {
                const empEmail = emp.email?.toLowerCase().trim();
                const userEmail = user.email?.toLowerCase().trim();
                return empEmail === userEmail;
            }
        );
        
        return found || null;
    }, [isEmployee, user?.email, employeesData?.employees]);
    
    // If we have employee data but no employeeId from user, use the employee data's _id
    // Priority: currentEmployeeId > currentEmployeeData?._id > employeeByEmail?._id
    const finalEmployeeId = useMemo(() => {
        if (!isEmployee) return null;
        
        // Try multiple sources - employeeByEmail is now always checked
        const id = currentEmployeeId || 
                   currentEmployeeData?._id || 
                   employeeByEmail?._id || 
                   null;
        
        return id;
    }, [isEmployee, currentEmployeeId, currentEmployeeData?._id, employeeByEmail?._id]);
    
    // Fix: Better coordination of employee data loading to prevent race conditions
    // Check if we're still loading employee data
    // For employees, we need to wait for employees list to load so we can find by email
    const isEmployeeDataLoading = useMemo(() => {
        if (!isEmployee) return false;
        
        // If we have a finalEmployeeId, we're ready
        if (finalEmployeeId) return false;
        
        // If there's an error and we've tried, don't keep loading
        if (employeesError && employeesData === undefined) return false;
        
        // Still loading if:
        // 1. Employees list is loading
        // 2. Current employee query is loading
        // 3. No data yet and no error (still fetching)
        return isLoadingEmployees || 
               (isLoadingCurrentEmployee && currentEmployeeId) ||
               (!employeesError && employeesData === undefined);
    }, [
        isEmployee,
        finalEmployeeId,
        isLoadingEmployees,
        isLoadingCurrentEmployee,
        currentEmployeeId,
        employeesError,
        employeesData,
    ]);

    // For admin: use all employees; for employee: use only their own data
    const employees = isEmployee 
        ? (currentEmployeeData ? [currentEmployeeData] : (employeeByEmail ? [employeeByEmail] : []))
        : (employeesData?.employees || []);

    const employeeOptions = employees
        .filter((emp) => emp.status === "Active" && !emp.isDeleted)
        .map((emp) => ({
            value: emp._id,
            label: `${emp.name} (${emp.email})`,
        }));

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
        if (isEmployee && finalEmployeeId && open) {
            reset({
                visitorEmail: "",
                employeeId: finalEmployeeId,
                expiresInDays: 1,
            }, { keepDefaultValues: false });
            // Also set value explicitly to ensure it's registered (without validation for employees)
            setValue("employeeId", finalEmployeeId, { shouldValidate: false, shouldDirty: true });
        } else if (!isEmployee && open) {
            reset({
                visitorEmail: "",
                employeeId: "",
                expiresInDays: 1,
            });
        }
    }, [isEmployee, finalEmployeeId, open, reset, setValue]);
    
    // Ensure employeeId is always set for employees when finalEmployeeId changes
    useEffect(() => {
        if (isEmployee && finalEmployeeId && open) {
            setValue("employeeId", finalEmployeeId, { shouldValidate: false, shouldDirty: true });
        }
    }, [isEmployee, finalEmployeeId, open, setValue]);

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
            
            // Ensure employeeId is set for employees - use finalEmployeeId from component state or fallback to data
            let submitEmployeeId = data.employeeId;
            if (isEmployee) {
                submitEmployeeId = finalEmployeeId || currentEmployeeData?._id || employeeByEmail?._id || currentEmployeeId || data.employeeId;
                
                // For employees, if still no employeeId, show error but don't block if we have other sources
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
                if (isEmployee && finalEmployeeId) {
                    reset({
                        visitorEmail: "",
                        employeeId: finalEmployeeId,
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
        [createAppointmentLink, reset, setOpen, onSuccess, isEmployee, finalEmployeeId, currentEmployeeData, employeeByEmail, currentEmployeeId, hasReachedAppointmentLimit, isSubmitting, isCreating],
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
                if (isEmployee && finalEmployeeId) {
                    reset({
                        visitorEmail: "",
                        employeeId: finalEmployeeId,
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
        [setOpen, reset, isEmployee, finalEmployeeId, isSubmitting, isCreating],
    );

    const handleClose = useCallback(() => {
        // Don't allow closing if submission is in progress
        if (isSubmitting || isCreating) {
            return;
        }
        setOpen(false);
        // Reset form - for employees, keep employeeId; for admins, clear it
        if (isEmployee && finalEmployeeId) {
            reset({
                visitorEmail: "",
                employeeId: finalEmployeeId,
                expiresInDays: 1,
            });
        } else {
            reset();
        }
        setGeneralError(null);
        setVisitorExists(null);
        setIsSubmitting(false);
    }, [setOpen, reset, isEmployee, finalEmployeeId, isSubmitting, isCreating]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-blue-500" />
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
                            if (isEmployeeDataLoading) {
                                setGeneralError("Loading employee information. Please wait...");
                                showErrorToast("Loading employee information. Please wait...");
                                return;
                            }
                            
                            // Get employeeId from finalEmployeeId or other sources
                            // Try multiple sources in order of priority
                            let submitEmployeeId = finalEmployeeId || 
                                                  currentEmployeeData?._id || 
                                                  employeeByEmail?._id || 
                                                  currentEmployeeId;
                            
                            // If still no employeeId, try to find by email one more time from employees list
                            if (!submitEmployeeId && employeesData?.employees && user?.email) {
                                const foundEmployee = employeesData.employees.find(
                                    (emp) => {
                                        const empEmail = emp.email?.toLowerCase().trim();
                                        const userEmail = user.email?.toLowerCase().trim();
                                        return empEmail === userEmail && 
                                               emp.status === "Active" && 
                                               !emp.isDeleted;
                                    }
                                );
                                if (foundEmployee?._id) {
                                    submitEmployeeId = foundEmployee._id;
                                }
                            }
                            
                            if (!submitEmployeeId) {
                                // If we still don't have employeeId, check if employees list has loaded
                                if (isLoadingEmployees) {
                                    setGeneralError("Loading employee information. Please wait...");
                                    showErrorToast("Loading employee information. Please wait...");
                                    return;
                                }
                                
                                // If employees list has loaded but we still can't find the employee
                                if (employeesError) {
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
                                                <span className="flex items-center gap-1 text-blue-600">
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
                                        <SelectField
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            options={employeeOptions}
                                            placeholder={
                                                isLoadingEmployees
                                                    ? "Loading employees..."
                                                    : employeeOptions.length === 0
                                                        ? "No active employees found"
                                                        : "Select employee"
                                            }
                                            isLoading={isLoadingEmployees}
                                            className={errors.employeeId ? "border-red-500" : ""}
                                        />
                                        {employeesError && (
                                            <p className="text-sm text-red-500">
                                                Failed to load employees. Please try again.
                                            </p>
                                        )}
                                        {errors.employeeId && (
                                            <p className="text-sm text-red-500">{errors.employeeId.message}</p>
                                        )}
                                        {!isLoadingEmployees && employeeOptions.length === 0 && !employeesError && (
                                            <p className="text-sm text-yellow-600">
                                                No active employees available. Please add employees first.
                                            </p>
                                        )}
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
                                // Always use finalEmployeeId if available, sync immediately
                                const value = finalEmployeeId || field.value || "";
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
                            disabled={isSubmitting || isCreating || !!(isEmployee && isEmployeeDataLoading)} 
                            size="xl" 
                            className="px-6"
                        >
                            Cancel
                        </ActionButton>
                        <ActionButton 
                            type="submit" 
                            variant="outline-primary" 
                            disabled={isSubmitting || isCreating || !!(isEmployee && isEmployeeDataLoading)} 
                            size="xl" 
                            className="px-6"
                        >
                            {isSubmitting || isCreating ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Creating...
                                </>
                            ) : isEmployee && isEmployeeDataLoading ? (
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
