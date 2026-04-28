"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { validatePhone } from "@/utils/phoneUtils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/common/actionButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, UserPlus, AlertCircle, Mail, Phone, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { SelectField } from "@/components/common/selectField";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { FormContainer } from "@/components/common/formContainer";
import { useCreateEmployeeMutation, useUpdateEmployeeMutation, useGetEmployeeQuery } from "@/store/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { routes } from "@/utils/routes";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { InputField } from "../common/inputField";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import { SubscriptionActionButtons } from "@/components/common/SubscriptionActionButtons";
import { useUserCountry } from "@/hooks/useUserCountry";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationDialog } from "@/components/common/confirmationDialog";

const employeeSchema = yup.object({
    name: yup
        .string()
        .trim()
        .required("Name is required")
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),
    email: yup.string().trim().email("Invalid email address").required("Email is required"),
    phone: yup
        .string()
        .trim()
        .required("Phone number is required")
        .test("is-valid-phone", "Please enter a valid global phone number with country code", (value) => 
            validatePhone(value)
        ),
    department: yup
        .string()
        .trim()
        .required("Department is required")
        .min(2, "Department must be at least 2 characters")
        .max(50, "Department cannot exceed 50 characters"),
    designation: yup
        .string()
        .trim()
        .required("Position is required")
        .min(2, "Position must be at least 2 characters")
        .max(100, "Position cannot exceed 100 characters"),
    status: yup.string().oneOf(["Active", "Inactive"]).default("Active"),
    photo: yup.string().default(""),
    isPublic: yup.boolean().default(true),
});

type EmployeeFormData = {
    name: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
    status: "Active" | "Inactive";
    photo: string;
    isPublic: boolean;
};

const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
];

interface NewEmployeeModalProps {
    employeeId?: string;
    trigger?: ReactNode;
    onSuccess?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    layout?: "modal" | "page";
}

export function NewEmployeeModal({
    employeeId,
    trigger,
    onSuccess,
    open: controlledOpen,
    onOpenChange,
    layout = "modal",
}: NewEmployeeModalProps) {
    const router = useRouter();
    const [internalOpen, setInternalOpen] = useState(false);
    const isPage = layout === "page";

    const open = isPage ? true : controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = isPage ? (_: boolean) => { } : onOpenChange || setInternalOpen;
    const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
    const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [isFileUploading, setIsFileUploading] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isTermsAgreed, setIsTermsAgreed] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<EmployeeFormData | null>(null);
    const userCountry = useUserCountry();

    const { hasReachedEmployeeLimit, isExpired } = useSubscriptionStatus();
    const {
        showUpgradeModal,
        openUpgradeModal,
        closeUpgradeModal
    } = useSubscriptionActions();

    const isEditMode = !!employeeId;
    const isLoading = isCreating || isUpdating;

    const { data: employeeData, isLoading: isLoadingEmployee } = useGetEmployeeQuery(employeeId!, {
        skip: !isEditMode,
    });

    const isEmailLocked = isEditMode && !!employeeData?.isEmailVerified;
    const isPhoneLocked = isEditMode && !!employeeData?.isPhoneVerified;

    useEffect(() => {
        router.prefetch(routes.privateroute.EMPLOYEELIST);
    }, [router]);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        setError,
        clearErrors,
        setValue,
        watch,
    } = useForm<EmployeeFormData>({
        resolver: yupResolver(employeeSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            department: "",
            designation: "",
            status: "Active",
            photo: "",
            isPublic: true,
        },
    });

    useEffect(() => {
        if (isEditMode && employeeData) {
            reset({
                name: employeeData.name,
                email: employeeData.email,
                phone: employeeData.phone,
                department: employeeData.department,
                designation: employeeData.designation || "",
                status: employeeData.status,
                photo: employeeData.photo || "",
                isPublic: employeeData.isPublic !== undefined ? employeeData.isPublic : true,
            });
        }
    }, [isEditMode, employeeData, reset]);

    useEffect(() => {
        if (!open) {
            reset();
            setGeneralError(null);
            clearErrors();
        }
    }, [open, reset, clearErrors]);

    const clearGeneralError = () => {
        if (generalError) {
            setGeneralError(null);
        }
    };

    const handleClose = () => {
        if (isPage) {
            router.push(routes.privateroute.EMPLOYEELIST);
        } else {
            setOpen(false);
        }
    };




    const onSubmit = async (data: EmployeeFormData) => {
        try {
            if (!isEditMode && !showConfirmDialog && !pendingFormData) {
                setPendingFormData(data);
                setShowConfirmDialog(true);
                return;
            }

            setGeneralError(null);

            const payload = { ...data };
            if (isEditMode && employeeData) {
                if (employeeData.isEmailVerified) {
                    payload.email = employeeData.email;
                }
                if (employeeData.isPhoneVerified) {
                    payload.phone = employeeData.phone;
                }
            }

            if (isEditMode) {
                await updateEmployee({ id: employeeId!, ...payload }).unwrap();
                showSuccessToast("Employee updated successfully");

                if (!isPage) {
                    setOpen(false);
                }
                
                setPendingFormData(null);
                setShowConfirmDialog(false);
                setIsTermsAgreed(false);
                reset();

                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push(routes.privateroute.EMPLOYEELIST);
                }
            } else {
                await createEmployee(payload).unwrap();
                showSuccessToast("Employee created successfully");
                
                // Important: Clean up state before redirect
                setPendingFormData(null);
                setShowConfirmDialog(false);
                setIsTermsAgreed(false);
                reset();

                if (onSuccess) {
                    onSuccess();
                } else {
                    console.log("Redirecting to employee list...");
                    router.push(routes.privateroute.EMPLOYEELIST);
                }

                if (!isPage) {
                    setOpen(false);
                }
            }

        } catch (error: any) {
            setPendingFormData(null);
            setShowConfirmDialog(false);
            setIsTermsAgreed(false);
            if (error?.data?.errors && Array.isArray(error.data.errors)) {
                error.data.errors.forEach((fieldError: any) => {
                    if (fieldError.field && fieldError.message) {
                        setError(fieldError.field as keyof EmployeeFormData, {
                            type: "server",
                            message: fieldError.message,
                        });
                    }
                });
            } else if (error?.data?.message) {
                const message = error.data.message.toLowerCase();
                if (message.includes("email") && message.includes("already exists")) {
                    setError("email", {
                        type: "server",
                        message: "Email address is already registered",
                    });
                } else if (message.includes("phone") && message.includes("already exists")) {
                    setError("phone", {
                        type: "server",
                        message: "Phone number is already registered",
                    });
                } else {
                    setGeneralError(error.data.message);
                }
            } else {
                const errorMessage = error?.message || "Failed to create employee";
                setGeneralError(errorMessage);
            }
        }
    };

    const defaultTrigger = <Button variant="default">{isEditMode ? "Edit Employee" : "New Employee"}</Button>;

    const formContent = (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
            {generalError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{generalError}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col gap-8 md:flex-row">
                {/* Employee Photo Section (Left Side) */}
                <div className="flex flex-col items-center shrink-0">
                    <label className="mb-4 block text-sm font-bold uppercase tracking-widest text-[#3882a5]">
                        Employee Photo
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
                            onUploadStatusChange={setIsFileUploading}
                        />
                    </div>
                </div>

                {/* Information Section (Right Side) */}
                <div className="flex-1 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#3882a5] mb-2">
                        Personal Information
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <InputField
                            id="name"
                            label="Full Name"
                            {...register("name")}
                            placeholder="Enter employee's full name"
                            error={errors.name?.message}
                            required
                        />

                        <InputField
                            id="email"
                            label="Email Address"
                            type="email"
                            {...register("email", { onChange: clearGeneralError })}
                            placeholder="Enter email address"
                            error={errors.email?.message}
                            required
                            disabled={isEmailLocked}
                            className={isEmailLocked ? "opacity-60 cursor-not-allowed" : undefined}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-2">
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <PhoneInputField
                                    id="phone"
                                    label="Phone Number"
                                    value={field.value}
                                    onChange={(value) => {
                                        field.onChange(value);
                                        clearGeneralError();
                                    }}
                                    error={errors.phone?.message}
                                    required
                                    placeholder="Enter phone number"
                                    defaultCountry={userCountry}
                                    disabled={isPhoneLocked}
                                />
                            )}
                        />

                        <div className="flex flex-col gap-1.5">
                            <InputField
                                id="department"
                                label="Department"
                                placeholder="Enter department"
                                {...register("department")}
                                error={errors.department?.message}
                                required
                            />
                        </div>
                    </div>

                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#3882a5] mt-6 mb-2">
                        Professional Information
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <InputField
                            id="designation"
                            label="Position"
                            placeholder="e.g., CEO, VP, HR, Manager"
                            {...register("designation")}
                            error={errors.designation?.message}
                            required
                        />

                        {(isEditMode && employeeData?.isVerified) && (
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-sm font-medium">Status</Label>
                                        <SelectField
                                            placeholder="Select status"
                                            options={statusOptions}
                                            value={field.value}
                                            onChange={(val) => field.onChange(val)}
                                            error={errors.status?.message}
                                            isClearable={false}
                                            className="pl-4 h-12 bg-background border-border focus:bg-background transition-all rounded-xl text-foreground font-medium"
                                        />
                                    </div>
                                )}
                            />
                        )}
                    </div>
                    
                    <Controller
                        name="isPublic"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20 mt-4 h-20 shadow-sm border-dashed">
                                <div className="space-y-1">
                                    <Label className="text-sm font-bold text-foreground">Public Directory Visibility</Label>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Show employee in the QR code visitor check-in list
                                    </p>
                                </div>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isLoading}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>
                        )}
                    />
                </div>
            </div>

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
                <SubscriptionActionButtons
                    isExpired={isExpired}
                    hasReachedLimit={hasReachedEmployeeLimit && !isEditMode}
                    limitType="employee"
                    showUpgradeModal={showUpgradeModal}
                    openUpgradeModal={openUpgradeModal}
                    closeUpgradeModal={closeUpgradeModal}
                    upgradeLabel="Upgrade Plan"
                    icon={UserPlus}
                    className="w-full min-w-[160px] px-6 sm:w-auto text-white"
                >
                    <ActionButton
                        type="submit"
                        variant="primary"
                        disabled={isLoading || isLoadingEmployee || isFileUploading}
                        size="xl"
                        className="w-full min-w-[170px] px-8 sm:w-auto font-bold transition-all shadow-md active:scale-95 hover:scale-105"
                    >
                        {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : isFileUploading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                        {isFileUploading ? "Uploading Photo..." : isEditMode ? "Update Employee" : "Create Employee"}
                    </ActionButton>
                </SubscriptionActionButtons>
            </div>

            {/* Upgrade Modal is handled by SubscriptionActionButtons if limit reached, 
                but we might still need it if we're not using the component directly in some logic. 
                However, for this form, the component above is sufficient. */}



        </form>
    );

    const confirmationDialog = (
        <ConfirmationDialog
            open={showConfirmDialog}
            onOpenChange={(open) => {
                setShowConfirmDialog(open);
                if (!open) {
                    setPendingFormData(null);
                    setIsTermsAgreed(false);
                }
            }}
            title="Confirm Contact Details"
            variant="warning"
            description={
                <div className="space-y-4 pr-2">
                    <div className="text-sm leading-relaxed text-slate-600">
                        Please verify that <strong>{pendingFormData?.email}</strong> and <strong>{pendingFormData?.phone}</strong> are correct. 
                        Incoming alerts and calls depend on this information.
                        <p className="mt-2 text-[11px] italic text-amber-700 font-medium">
                            (Email aur number sahi hona chahiye taki messages receive ho sakein.)
                        </p>
                    </div>

                    <div 
                        className={cn(
                            "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer shadow-sm",
                            isTermsAgreed 
                                ? "bg-amber-50 border-amber-500 scale-[1.01]" 
                                : "bg-white border-slate-300 hover:border-amber-400"
                        )}
                        onClick={() => setIsTermsAgreed(!isTermsAgreed)}
                    >
                        <div className="relative flex items-center justify-center">
                            <Checkbox 
                                id="confirmation_checkbox" 
                                checked={isTermsAgreed} 
                                onCheckedChange={(checked) => setIsTermsAgreed(!!checked)}
                                className="h-6 w-6 border-slate-400 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 transition-all stroke-[3]"
                            />
                        </div>
                        <label
                            htmlFor="confirmation_checkbox"
                            className="text-[14px] font-extrabold leading-none cursor-pointer select-none text-slate-900"
                        >
                            I confirm details are 100% correct
                        </label>
                    </div>
                </div>
            }
            confirmText={isCreating ? "Creating..." : "Confirm & Create"}
            onConfirm={() => {
                if (isTermsAgreed && pendingFormData) {
                    onSubmit(pendingFormData);
                }
            }}
            disabled={!isTermsAgreed || isCreating}
        />
    );

    if (isPage) {
        return (
            <>
                <FormContainer isPage={true} isLoading={isLoadingEmployee} isEditMode={isEditMode}>
                    {formContent}
                </FormContainer>
                {confirmationDialog}
            </>
        );
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-hidden bg-white p-4 sm:max-w-2xl sm:p-6 dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {isEditMode ? "Edit Employee" : "Personal Information"}
                    </DialogTitle>
                </DialogHeader>

                <FormContainer isPage={false} isLoading={isLoadingEmployee} isEditMode={isEditMode}>
                    {formContent}
                </FormContainer>
            </DialogContent>
            </Dialog>

            {confirmationDialog}
        </>
    );
}

export default NewEmployeeModal;
