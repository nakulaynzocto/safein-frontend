"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { validatePhone, formatPhoneForSubmission } from "@/utils/phoneUtils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { InputField } from "@/components/common/inputField";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { Label } from "@/components/ui/label";
import { useCreateSpecialBookingMutation } from "@/store/api/specialBookingApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useAppSelector } from "@/store/hooks";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { User, Mail, Info, Car, UserPlus, ClipboardList, Camera } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ActionButton } from "@/components/common/actionButton";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { CountryStateCitySelect } from "@/components/common/countryStateCity";
import { useEmployeeSearch } from "@/hooks/useEmployeeSearch";
import { FormProvider } from "react-hook-form";
import { EmployeeSelectionField } from "@/components/common/EmployeeSelectionField";
import { useVisitorAutoFill } from "@/hooks/useVisitorAutoFill";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import { SubscriptionActionButtons } from "@/components/common/SubscriptionActionButtons";
import { useUserCountry } from "@/hooks/useUserCountry";
import { FormContainer } from "@/components/common/formContainer";
import { cn } from "@/lib/utils";

const quickAppointmentSchema = (isEmployee: boolean) =>
    yup.object().shape({
        name: yup.string().required("Name is required"),
        email: yup.string().email("Invalid email").optional(),
        phone: yup
            .string()
            .required("Mobile number is required")
            .test("is-valid-phone", "Please enter a valid global phone number with country code", (value) =>
                validatePhone(value)
            ),
        purpose: yup.string().required("Purpose of visit is required"),
        employeeId: isEmployee
            ? yup.string().optional().nullable()
            : yup.string().required("Please select an employee"),
        accompanyingCount: yup.number().min(0).max(20).default(0),
        notes: yup.string().optional(),
        address: yup.string().optional(),
        country: yup.string().optional(),
        state: yup.string().optional(),
        city: yup.string().optional(),
        vehicleNumber: yup.string().optional().max(20, "Vehicle number cannot exceed 20 characters"),
        visitorPhoto: yup.string().optional(),
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
    country?: string;
    state?: string;
    city?: string;
    vehicleNumber?: string;
    visitorPhoto?: string;
};

interface QuickAppointmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    renderMode?: "modal" | "page";
}

export function QuickAppointmentModal({
    open,
    onOpenChange,
    onSuccess,
    renderMode = "modal",
}: QuickAppointmentModalProps) {
    const { user } = useAppSelector((state) => state.auth);
    const isEmployee = checkIsEmployee(user);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFileUploading, setIsFileUploading] = useState(false);
    const [showOptionalVisitDetails, setShowOptionalVisitDetails] = useState(false);
    const userCountry = useUserCountry();

    const [createSpecialBooking] = useCreateSpecialBookingMutation();
    const { hasReachedAppointmentLimit, isExpired } = useSubscriptionStatus();
    const { showUpgradeModal, openUpgradeModal, closeUpgradeModal } = useSubscriptionActions();

    useEmployeeSearch();

    const methods = useForm<QuickAppointmentFormData>({
        resolver: yupResolver(quickAppointmentSchema(isEmployee)) as any,
        defaultValues: {
            purpose: "Official VIP Meeting",
            employeeId: "",
            accompanyingCount: 0,
            visitorPhoto: "",
        },
    });

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
        reset,
        watch,
    } = methods;

    useVisitorAutoFill({
        nameFieldName: "name",
        phoneFieldName: "phone",
        emailFieldName: "email",
        methods,
        silent: true,
    });

    const isActive = renderMode === "page" || open;

    useEffect(() => {
        if (isActive) {
            setShowOptionalVisitDetails(false);
            reset({
                name: "",
                email: "",
                phone: "",
                purpose: "Official VIP Meeting",
                employeeId: isEmployee ? user?.employeeId || "" : "",
                accompanyingCount: 0,
                notes: "",
                address: "",
                country: "",
                state: "",
                city: "",
                vehicleNumber: "",
                visitorPhoto: "",
            });
        }
    }, [isActive, reset, isEmployee, user]);

    const onSubmit = async (data: QuickAppointmentFormData) => {
        setIsSubmitting(true);
        try {
            const submitEmployeeId = isEmployee ? user?.employeeId : data.employeeId;

            if (!submitEmployeeId) {
                throw new Error(
                    isEmployee
                        ? "Your employee information is not set up correctly. Please contact your administrator."
                        : "Please select an employee"
                );
            }

            const submitPhone = formatPhoneForSubmission(data.phone);

            await createSpecialBooking({
                visitorName: data.name,
                visitorEmail: data.email,
                visitorPhone: submitPhone,
                employeeId: submitEmployeeId,
                purpose: data.purpose,
                accompanyingCount: data.accompanyingCount || 0,
                notes: data.notes || "",
                address: data.address || "",
                country: data.country || "",
                state: data.state || "",
                city: data.city || "",
                vehicleNumber: data.vehicleNumber || "",
                visitorPhoto: data.visitorPhoto?.trim() || undefined,
            }).unwrap();

            showSuccessToast("Special visitor booking created. OTP has been sent to the visitor.");
            reset();
            if (renderMode === "modal") {
                onOpenChange(false);
            }
            onSuccess?.();
        } catch (error: any) {
            showErrorToast(error?.data?.message || error?.message || "Failed to create special visitor booking");
        } finally {
            setIsSubmitting(false);
        }
    };

    const textareaClass = (hasError?: boolean) =>
        cn(
            "min-h-[88px] w-full rounded-xl border border-border/90 bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-shadow placeholder:text-muted-foreground focus-visible:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20",
            hasError && "border-red-500 focus-visible:ring-red-500/25"
        );

    const SectionTitle = ({ children }: { children: ReactNode }) => (
        <div className="mb-1 flex items-center gap-2.5">
            <span className="h-4 w-1 shrink-0 rounded-full bg-accent shadow-sm" aria-hidden />
            <h3 className="text-[13px] font-bold uppercase tracking-[0.18em] text-accent">{children}</h3>
        </div>
    );

    const formBody = (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-1">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-4">
                    {/* Visitor photo — tight column so gap to fields stays small */}
                    <div className="flex w-full max-w-[200px] shrink-0 flex-col space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Camera className="h-4 w-4 shrink-0 text-accent" />
                            Visitor Photo{" "}
                            <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                        </Label>
                        <div className="flex justify-start">
                            <ImageUploadField
                                name="visitorPhoto"
                                register={register}
                                setValue={setValue}
                                errors={errors.visitorPhoto}
                                initialUrl={watch("visitorPhoto")}
                                label=""
                                enableImageCapture={true}
                                onUploadStatusChange={setIsFileUploading}
                                variant="avatar"
                            />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Please capture or upload a clear photo of the visitor.
                        </p>
                        {errors.visitorPhoto && (
                            <p className="text-xs font-medium text-red-500">{errors.visitorPhoto.message as string}</p>
                        )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-8">
                        <div className="space-y-4">
                            <SectionTitle>Visitor Information</SectionTitle>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                        defaultCountry={userCountry}
                                        autoFocus={renderMode === "modal"}
                                    />
                                )}
                            />

                            <InputField
                                label="Email Address"
                                type="email"
                                placeholder="visitor@example.com"
                                icon={<Mail className="h-4 w-4" />}
                                {...register("email")}
                                error={errors.email?.message}
                            />

                            {isEmployee ? (
                                <>
                                    <div className="md:col-span-2">
                                        <InputField
                                            label="Visitor Name"
                                            placeholder="Enter visitor name"
                                            icon={<User className="h-4 w-4" />}
                                            {...register("name")}
                                            error={errors.name?.message}
                                            required
                                        />
                                    </div>
                                    <div className="hidden">
                                        <EmployeeSelectionField />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <InputField
                                        label="Visitor Name"
                                        placeholder="Enter visitor name"
                                        icon={<User className="h-4 w-4" />}
                                        {...register("name")}
                                        error={errors.name?.message}
                                        required
                                    />
                                    <div className="min-w-0">
                                        <EmployeeSelectionField />
                                    </div>
                                </>
                            )}
                        </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InputField
                                label="Purpose of Visit"
                                placeholder="e.g., Official VIP Visit"
                                icon={<Info className="h-4 w-4" />}
                                {...register("purpose")}
                                error={errors.purpose?.message}
                                required
                            />

                            <InputField
                                label="Additional Visitors"
                                type="number"
                                placeholder="Number of people"
                                icon={<User className="h-4 w-4" />}
                                {...register("accompanyingCount")}
                                error={errors.accompanyingCount?.message}
                            />
                            </div>

                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-accent/10 bg-accent/5 p-4 transition-colors hover:bg-accent/10">
                                <div className="min-w-0 space-y-0.5">
                                    <Label
                                        htmlFor="optional-visit-details-toggle"
                                        className="flex cursor-pointer items-center gap-2 text-sm font-bold text-accent"
                                    >
                                        <ClipboardList className="h-4 w-4 shrink-0" />
                                        Add vehicle, address and notes
                                    </Label>
                                    <p className="text-[11px] font-medium text-muted-foreground">
                                        Optional — Vehicle number, address, and extra notes for this visit
                                    </p>
                                </div>
                                <Switch
                                    id="optional-visit-details-toggle"
                                    checked={showOptionalVisitDetails}
                                    onCheckedChange={setShowOptionalVisitDetails}
                                    className="shrink-0 data-[state=checked]:bg-accent"
                                />
                            </div>

                            {showOptionalVisitDetails && (
                                <div className="animate-in fade-in slide-in-from-top-2 space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm duration-300 dark:border-gray-800 dark:bg-gray-950/50">
                                    <CountryStateCitySelect
                                        value={{
                                            country: watch("country") || "",
                                            state: watch("state") || "",
                                            city: watch("city") || "",
                                        }}
                                        onChange={(v) => {
                                            setValue("country", v.country);
                                            setValue("state", v.state);
                                            setValue("city", v.city);
                                        }}
                                        errors={{
                                            country: errors.country?.message as string,
                                            state: errors.state?.message as string,
                                            city: errors.city?.message as string,
                                        }}
                                        required={false}
                                    />

                                    <InputField
                                        label="Vehicle Number (Optional)"
                                        placeholder="e.g., MH12AB1234"
                                        icon={<Car className="h-4 w-4" />}
                                        {...register("vehicleNumber")}
                                        error={errors.vehicleNumber?.message}
                                    />

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Address{" "}
                                            <span className="text-muted-foreground text-[10px] font-normal">(Optional)</span>
                                        </Label>
                                        <Textarea
                                            placeholder="Enter visitor address"
                                            {...register("address")}
                                            className={textareaClass(!!errors.address)}
                                            rows={3}
                                        />
                                        {errors.address && (
                                            <p className="text-xs text-red-500">{errors.address.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Notes{" "}
                                            <span className="text-muted-foreground text-[10px] font-normal">(Optional)</span>
                                        </Label>
                                        <Textarea
                                            placeholder="Add any notes here..."
                                            {...register("notes")}
                                            className={textareaClass(!!errors.notes)}
                                            rows={3}
                                        />
                                        {errors.notes && <p className="text-xs text-red-500">{errors.notes.message}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-2 flex flex-col-reverse gap-3 border-t border-border/60 bg-muted/20 pt-6 sm:flex-row sm:justify-end">
                    <ActionButton
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting || isFileUploading}
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
                        className="w-full min-w-[160px] px-6 text-white sm:w-auto sm:min-w-[200px]"
                    >
                        <ActionButton
                            type="submit"
                            variant="outline-primary"
                            disabled={isSubmitting || isFileUploading}
                            size="xl"
                            className="w-full min-w-[160px] px-6 sm:w-auto sm:min-w-[200px]"
                        >
                            {isSubmitting || isFileUploading ? (
                                <LoadingSpinner size="sm" className="mr-2" />
                            ) : null}
                            {isFileUploading ? "Uploading Photo..." : isSubmitting ? "Booking..." : "Book Appointment"}
                        </ActionButton>
                    </SubscriptionActionButtons>
                </div>
            </form>
        </FormProvider>
    );

    if (renderMode === "page") {
        return <FormContainer isPage={true}>{formBody}</FormContainer>;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-hidden bg-white p-4 sm:max-w-3xl sm:p-6 dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <User className="h-5 w-5 text-accent" />
                        Special Visitor Booking
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Quickly book an appointment for a special visitor by entering their details and schedule.
                    </DialogDescription>
                </DialogHeader>

                <FormContainer isPage={false}>{formBody}</FormContainer>
            </DialogContent>
        </Dialog>
    );
}
