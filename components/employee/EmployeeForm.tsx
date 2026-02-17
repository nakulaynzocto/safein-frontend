"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/common/actionButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { SelectField } from "@/components/common/selectField";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { FormContainer } from "@/components/common/formContainer";
import { useCreateEmployeeMutation, useUpdateEmployeeMutation, useGetEmployeeQuery } from "@/store/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { routes } from "@/utils/routes";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { AddonPurchaseModal } from "@/components/common/AddonPurchaseModal";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";

const employeeSchema = yup.object({
    name: yup
        .string()
        .required("Name is required")
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),
    email: yup.string().email("Invalid email address").required("Email is required"),
    phone: yup
        .string()
        .required("Phone number is required")
        .matches(/^[\+]?[0-9]{10,15}$/, "Please enter a valid phone number"),
    department: yup
        .string()
        .required("Department is required")
        .min(2, "Department must be at least 2 characters")
        .max(50, "Department cannot exceed 50 characters"),
    designation: yup
        .string()
        .required("Position is required")
        .min(2, "Position must be at least 2 characters")
        .max(100, "Position cannot exceed 100 characters"),
    status: yup.string().oneOf(["Active", "Inactive"]).default("Active"),
    photo: yup.string().default(""),
});

type EmployeeFormData = {
    name: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
    status: "Active" | "Inactive";
    photo: string;
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

    const { hasReachedEmployeeLimit, isExpired } = useSubscriptionStatus();
    const [showAddonModal, setShowAddonModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const isEditMode = !!employeeId;
    const isLoading = isCreating || isUpdating;

    const { data: employeeData, isLoading: isLoadingEmployee } = useGetEmployeeQuery(employeeId!, {
        skip: !isEditMode,
    });

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
            setGeneralError(null);

            const employeeData = {
                ...data,
            };

            if (isEditMode) {
                await updateEmployee({ id: employeeId!, ...employeeData }).unwrap();
                showSuccessToast("Employee updated successfully");

                if (!isPage) {
                    setOpen(false);
                }
                reset();

                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push(routes.privateroute.EMPLOYEELIST);
                }
            } else {
                await createEmployee(employeeData).unwrap();
                showSuccessToast("Employee created successfully");
                reset();

                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push(routes.privateroute.EMPLOYEELIST);
                }

                if (!isPage) {
                    setOpen(false);
                }
            }

        } catch (error: any) {
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
                        />
                    </div>
                </div>

                {/* Information Section (Right Side) */}
                <div className="flex-1 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#3882a5] mb-2">
                        Personal Information
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Full Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                {...register("name")}
                                placeholder="Enter employee's full name"
                                aria-required="true"
                                className={`pl-4 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium ${errors.name ? "border-destructive" : ""}`}
                            />
                            {errors.name && <span className="text-destructive text-xs">{errors.name.message}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email Address <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                {...register("email", { onChange: clearGeneralError })}
                                placeholder="Enter email address"
                                aria-required="true"
                                className={`pl-4 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium ${errors.email ? "border-destructive" : ""}`}
                            />
                            {errors.email && <span className="text-destructive text-xs">{errors.email.message}</span>}
                        </div>
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
                                    defaultCountry="in"
                                    className="pl-4 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium"
                                />
                            )}
                        />

                        <Controller
                            name="department"
                            control={control}
                            rules={{ required: "Department is required" }}
                            render={({ field }) => (
                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-sm font-medium">
                                        Department <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="department"
                                        placeholder="Enter department"
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        aria-required="true"
                                        className={`pl-4 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium ${errors.department ? "border-destructive" : ""}`}
                                    />
                                    {errors.department && (
                                        <span className="text-destructive text-xs">{errors.department.message}</span>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#3882a5] mt-6 mb-2">
                        Professional Information
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">


                        <Controller
                            name="designation"
                            control={control}
                            rules={{ required: "Position is required" }}
                            render={({ field }) => (
                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-sm font-medium">
                                        Position <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="designation"
                                        placeholder="e.g., CEO, VP, HR, Manager"
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        aria-required="true"
                                        className={`pl-4 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium ${errors.designation ? "border-destructive" : ""}`}
                                    />
                                    {errors.designation && (
                                        <span className="text-destructive text-xs">{errors.designation.message}</span>
                                    )}
                                </div>
                            )}
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
                                            className="pl-4 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium"
                                        />
                                    </div>
                                )}
                            />
                        )}
                    </div>
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
                {isExpired ? (
                    <ActionButton
                        type="button"
                        variant="destructive"
                        onClick={() => setShowUpgradeModal(true)}
                        size="xl"
                        className="w-full min-w-[160px] px-6 sm:w-auto"
                    >
                        Upgrade Plan
                    </ActionButton>
                ) : hasReachedEmployeeLimit && !isEditMode ? (
                    <ActionButton
                        type="button"
                        variant="primary"
                        onClick={() => setShowAddonModal(true)}
                        size="xl"
                        className="w-full min-w-[160px] px-6 sm:w-auto text-white"
                    >
                        Buy Extra Slots
                    </ActionButton>
                ) : (
                    <ActionButton
                        type="submit"
                        variant="outline-primary"
                        disabled={isLoading || isLoadingEmployee}
                        size="xl"
                        className="w-full min-w-[160px] px-6 sm:w-auto"
                    >
                        {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                        {isEditMode ? "Update Employee" : "Create Employee"}
                    </ActionButton>
                )}
            </div>

            <AddonPurchaseModal
                isOpen={showAddonModal}
                onClose={() => setShowAddonModal(false)}
                type="employee"
            />

            <UpgradePlanModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
            />
        </form>
    );

    if (isPage) {
        return (
            <FormContainer isPage={true} isLoading={isLoadingEmployee} isEditMode={isEditMode}>
                {formContent}
            </FormContainer>
        );
    }

    return (
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
    );
}

export default NewEmployeeModal;
