"use client";

import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Save, Loader2, Upload, Mail, Phone, MapPin, Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CountryStateCitySelect } from "@/components/common/countryStateCity";
import { Textarea } from "@/components/ui/textarea"; // Using Textarea component
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useUploadFileMutation } from "@/store/api";
import { User as UserType } from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";

// Expanded Schema to match Super Admin
// Note: Schema validation will be conditional based on user role
const createProfileSchema = (isEmployee: boolean) => z.object({
    companyName: isEmployee
        ? z.string().optional() // Optional for employees (will be ignored)
        : z.string()
            .min(2, "Company name must be at least 2 characters")
            .max(100, "Company name cannot exceed 100 characters"),
    email: z.string().email("Invalid email format").min(1, "Email is required"),
    mobileNumber: z.string().max(20, "Mobile number too long").optional(),
    bio: z.string().max(500, "Biography must be less than 500 characters").optional(),
    profilePicture: z.string().optional(),
    address: z.object({
        street: z.string().max(200, "Address too long").optional(),
        city: z.string().max(100, "City too long").optional(),
        state: z.string().max(100, "State too long").optional(),
        country: z.string().max(100, "Country too long").optional(),
        pincode: z.string().max(20, "Pincode too long").optional(),
    }).optional(),
    socialLinks: z.object({
        linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
        twitter: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
        website: z.string().url("Invalid website URL").optional().or(z.literal("")),
    }),
    isActive: z.boolean().optional(),
});

// Type will be inferred from schema created inside component
type ProfileFormData = {
    companyName?: string;
    email: string;
    mobileNumber?: string;
    bio?: string;
    profilePicture?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
    };
    socialLinks?: {
        linkedin?: string;
        twitter?: string;
        website?: string;
    };
    isActive?: boolean;
};

interface ProfileFormProps {
    profile: UserType;
    onSubmit: (data: ProfileFormData) => Promise<void>;
    onCancel: () => void;
}

export function ProfileForm({ profile, onSubmit, onCancel }: ProfileFormProps) {
    const { user: currentUser } = useAppSelector((state) => state.auth);
    const isEmployee = checkIsEmployee(currentUser);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(profile?.profilePicture || null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false);
    const [uploadFile] = useUploadFileMutation();

    const defaultValues: ProfileFormData = {
        companyName: profile?.companyName || "",
        email: profile?.email || "",
        mobileNumber: profile?.mobileNumber || "",
        bio: profile?.bio || "",
        profilePicture: profile?.profilePicture || "",
        address: {
            street: profile?.address?.street || "",
            city: profile?.address?.city || "",
            state: profile?.address?.state || "",
            country: profile?.address?.country || "IN",
            pincode: profile?.address?.pincode || "",
        },
        socialLinks: {
            linkedin: profile?.socialLinks?.linkedin || "",
            twitter: profile?.socialLinks?.twitter || "",
            website: profile?.socialLinks?.website || "",
        },
        isActive: profile?.isActive ?? true,
    };
    // Create schema based on employee status
    const profileSchema = z.object({
        companyName: isEmployee
            ? z.string().optional() // Optional for employees (will be ignored)
            : z.string()
                .min(2, "Company name must be at least 2 characters")
                .max(100, "Company name cannot exceed 100 characters"),
        email: z.string().email("Invalid email format").min(1, "Email is required"),
        mobileNumber: z.string().max(20, "Mobile number too long").optional(),
        bio: z.string().max(500, "Biography must be less than 500 characters").optional(),
        profilePicture: z.string().optional(),
        address: z.object({
            street: z.string().max(200, "Address too long").optional(),
            city: z.string().max(100, "City too long").optional(),
            state: z.string().max(100, "State too long").optional(),
            country: z.string().max(100, "Country too long").optional(),
            pincode: z.string().max(20, "Pincode too long").optional(),
        }),
        socialLinks: z.object({
            linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
            twitter: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
            website: z.string().url("Invalid website URL").optional().or(z.literal("")),
        }),
        isActive: z.boolean().optional(),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        watch,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema) as any,
        defaultValues,
        shouldUnregister: false,
    });

    useEffect(() => {
        if (profile) {
            reset({
                companyName: profile.companyName || "",
                email: profile.email || "",
                mobileNumber: profile.mobileNumber || "",
                bio: profile.bio || "",
                profilePicture: profile.profilePicture || "",
                address: {
                    street: profile.address?.street || "",
                    city: profile.address?.city || "",
                    state: profile.address?.state || "",
                    country: profile.address?.country || "IN",
                    pincode: profile.address?.pincode || "",
                },
                socialLinks: {
                    linkedin: profile.socialLinks?.linkedin || "",
                    twitter: profile.socialLinks?.twitter || "",
                    website: profile.socialLinks?.website || "",
                },
                isActive: profile.isActive ?? true,
            });
            setProfileImage(profile.profilePicture || null);
        }
    }, [profile, reset]);

    if (!profile) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-muted-foreground text-sm">
                        Unable to load profile data. Please refresh the page.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const companyName = watch("companyName");
    const isActive = watch("isActive");

    // Existing Upload Logic - Preserved Exactly
    const handleImageUpload = useCallback(
        async (file: File | null) => {
            if (!file) return;

            setIsUploading(true);
            setHasAttemptedUpload(true);
            setUploadSuccess(false);

            try {
                const result = await uploadFile({ file }).unwrap();

                setProfileImage(result.url);
                setValue("profilePicture", result.url);
                setUploadSuccess(true);
                showSuccessToast("Profile picture uploaded successfully!");
            } catch (err: any) {
                setUploadSuccess(false);
                showErrorToast(
                    err?.data?.message || err?.message || "Failed to upload profile picture"
                );
            } finally {
                setIsUploading(false);
            }
        },
        [uploadFile, setValue]
    );

    const handleFileChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                // Validate file size (5MB max)
                if (file.size > 5 * 1024 * 1024) {
                    showErrorToast("File size must be less than 5MB");
                    return;
                }
                // Validate file type
                if (!file.type.startsWith("image/")) {
                    showErrorToast("Please upload an image file");
                    return;
                }
                handleImageUpload(file);
            }
        },
        [handleImageUpload]
    );
    // End of Existing Upload Logic

    const handleFormSubmit = async (data: ProfileFormData) => {
        setIsSubmitting(true);
        try {
            // For employees, remove company-related fields before submitting
            if (isEmployee) {
                const employeeData = { ...data };
                // Don't send company fields for employees
                delete (employeeData as any).companyName;
                delete (employeeData as any).profilePicture;
                await onSubmit(employeeData);
            } else {
                await onSubmit(data);
            }
            showSuccessToast("Profile updated successfully!");
        } catch (error: any) {
            const errorMessage = error?.message || "Failed to update profile";
            showErrorToast(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check if save button should be enabled based on upload status
    const canSave = !hasAttemptedUpload || (hasAttemptedUpload && uploadSuccess);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold">
                        Profile Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Top Row: Avatar Left + Status Right */}
                    <div className="flex items-start justify-between pb-6 border-b border-border">
                        <div className="flex-shrink-0 relative group">
                            <Avatar className="h-24 w-24 border-4 border-muted">
                                <AvatarImage
                                    src={
                                        profileImage
                                            ? `${profileImage}${profileImage.includes("?") ? "&" : "?"}v=${profileImage?.length}`
                                            : ""
                                    }
                                />
                                <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                                    {companyName?.substring(0, 2).toUpperCase() || "CN"}
                                </AvatarFallback>
                            </Avatar>
                            {!isEmployee && (
                                <label
                                    htmlFor="profile-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                                >
                                    {isUploading ? (
                                        <Loader2 className="animate-spin" size={24} />
                                    ) : (
                                        <Upload size={24} />
                                    )}
                                </label>
                            )}
                            {!isEmployee && (
                                <input
                                    id="profile-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                />
                            )}
                        </div>

                        {/* Active Account Status - Top Right (Read-only for frontend user usually, but duplicating UI) */}
                        <div>
                            <div
                                className={`flex items-center justify-center px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wide border-0 ${isActive
                                    ? "bg-emerald-500/10 text-emerald-700"
                                    : "bg-destructive/10 text-destructive"
                                    }`}
                            >
                                {isActive ? "Active Account" : "Inactive"}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                        {/* Form Fields Grid - Below Avatar */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="companyName"
                                    className="text-xs text-muted-foreground uppercase font-semibold tracking-wider"
                                >
                                    Company Name {!isEmployee && <span className="text-destructive">*</span>}
                                    {isEmployee && (
                                        <span className="ml-2 text-xs text-muted-foreground font-normal">(Managed by administrator)</span>
                                    )}
                                </Label>
                                <Input
                                    id="companyName"
                                    {...register("companyName")}
                                    disabled={isEmployee}
                                    readOnly={isEmployee}
                                    className={`pl-4 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium ${isEmployee ? "opacity-60 cursor-not-allowed bg-gray-100" : ""} ${errors.companyName ? "border-destructive" : ""}`}
                                    style={isEmployee ? { pointerEvents: 'none', backgroundColor: '#f3f4f6' } : {}}
                                />
                                {errors.companyName && (
                                    <p className="text-xs text-destructive mt-1">{errors.companyName.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-xs text-muted-foreground uppercase font-semibold tracking-wider"
                                >
                                    Email Address <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Mail size={16} />
                                    </div>
                                    <Input
                                        id="email"
                                        {...register("email")}
                                        disabled // Usually email is immutable or requires specific flow
                                        className={`pl-10 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground ${errors.email ? "border-destructive" : ""}`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="mobileNumber"
                                    className="text-xs text-muted-foreground uppercase font-semibold tracking-wider"
                                >
                                    Contact Number
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Phone size={16} />
                                    </div>
                                    <Input
                                        id="mobileNumber"
                                        {...register("mobileNumber")}
                                        className={`pl-10 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground ${errors.mobileNumber ? "border-destructive" : ""}`}
                                        placeholder="10-digit mobile number"
                                    />
                                </div>
                                {errors.mobileNumber && (
                                    <p className="text-xs text-destructive mt-1">{errors.mobileNumber.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="bio"
                                    className="text-xs text-muted-foreground uppercase font-semibold tracking-wider"
                                >
                                    Biography / About
                                </Label>
                                <Textarea
                                    id="bio"
                                    {...register("bio")}
                                    rows={3}
                                    className={`w-full rounded-xl border border-border bg-muted/30 px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:bg-background transition-all disabled:cursor-not-allowed disabled:opacity-50 font-medium resize-none ${errors.bio ? "border-destructive" : ""}`}
                                    placeholder="Write a short bio about yourself..."
                                />
                                {errors.bio && (
                                    <p className="text-xs text-destructive mt-1">{errors.bio.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="h-px bg-border w-full" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Address Section */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <MapPin size={18} className="text-primary" />
                                    Office Address
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="street"
                                            className="text-xs text-muted-foreground uppercase font-semibold tracking-wider"
                                        >
                                            Street / Locality
                                        </Label>
                                        <Input
                                            id="street"
                                            {...register("address.street")}
                                            className={`pl-4 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium ${errors.address?.street ? "border-destructive" : ""}`}
                                        />
                                        {errors.address?.street && (
                                            <p className="text-xs text-destructive mt-1">{errors.address.street.message}</p>
                                        )}
                                    </div>
                                    <div className="pt-2">
                                        <CountryStateCitySelect
                                            value={{
                                                country: watch("address.country") || "IN",
                                                state: watch("address.state") || "",
                                                city: watch("address.city") || "",
                                            }}
                                            onChange={(v: any) => {
                                                setValue("address.country", v.country, { shouldDirty: true });
                                                setValue("address.state", v.state, { shouldDirty: true });
                                                setValue("address.city", v.city, { shouldDirty: true });
                                            }}
                                            errors={{
                                                country: errors.address?.country?.message,
                                                state: errors.address?.state?.message,
                                                city: errors.address?.city?.message,
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="pincode"
                                                className="text-xs text-muted-foreground uppercase font-semibold tracking-wider"
                                            >
                                                Pincode
                                            </Label>
                                            <Input
                                                id="pincode"
                                                {...register("address.pincode")}
                                                className={`pl-4 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium ${errors.address?.pincode ? "border-destructive" : ""}`}
                                            />
                                            {errors.address?.pincode && (
                                                <p className="text-xs text-destructive mt-1">{errors.address.pincode.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Section */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <Shield size={18} className="text-primary" />
                                    Social Presence
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="linkedin"
                                            className="text-xs text-muted-foreground uppercase font-semibold tracking-wider"
                                        >
                                            LinkedIn URL
                                        </Label>
                                        <Input
                                            id="linkedin"
                                            {...register("socialLinks.linkedin")}
                                            placeholder="https://linkedin.com/in/..."
                                            className="pl-4 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="twitter"
                                            className="text-xs text-muted-foreground uppercase font-semibold tracking-wider"
                                        >
                                            Twitter URL
                                        </Label>
                                        <Input
                                            id="twitter"
                                            {...register("socialLinks.twitter")}
                                            placeholder="https://twitter.com/..."
                                            className="pl-4 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="website"
                                            className="text-xs text-muted-foreground uppercase font-semibold tracking-wider"
                                        >
                                            Website
                                        </Label>
                                        <Input
                                            id="website"
                                            {...register("socialLinks.website")}
                                            placeholder="https://..."
                                            className="pl-4 h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl text-foreground font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button
                                type="submit"
                                disabled={isSubmitting || isUploading || !canSave}
                                className="min-w-[120px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
