"use client";

import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Loader2, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useUploadFileMutation } from "@/store/api";
import { User as UserType } from "@/store/api/authApi";

const profileSchema = z.object({
    companyName: z
        .string()
        .min(2, "Company name must be at least 2 characters")
        .max(100, "Company name cannot exceed 100 characters"),
    profilePicture: z.string().optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
    profile: UserType;
    onSubmit: (data: ProfileFormData) => Promise<void>;
    onCancel: () => void;
}

export function ProfileForm({ profile, onSubmit, onCancel }: ProfileFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(profile?.profilePicture || null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false);
    const [uploadFile] = useUploadFileMutation();

    const defaultValues = {
        companyName: profile?.companyName || "",
        profilePicture: profile?.profilePicture || "",
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues,
    });

    useEffect(() => {
        if (profile && profile.companyName) {
            const newDefaultValues = {
                companyName: profile.companyName || "",
                profilePicture: profile.profilePicture || "",
            };
            reset(newDefaultValues);
            setProfileImage(profile.profilePicture || null);
        }
    }, [profile, reset]);

    if (!profile || !profile.companyName) {
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

    const handleFormSubmit = useCallback(
        async (data: ProfileFormData) => {
            setIsSubmitting(true);
            try {
                const cleanData: { companyName: string; profilePicture?: string } = {
                    companyName: data.companyName.trim(),
                };

                if (data.profilePicture && data.profilePicture.trim() !== "") {
                    cleanData.profilePicture = data.profilePicture.trim();
                }

                const payload = JSON.parse(JSON.stringify(cleanData));

                await onSubmit(payload as ProfileFormData);
                showSuccessToast("Profile updated successfully!");
            } catch (error: any) {
                const errorMessage = error?.message || "Failed to update profile";
                showErrorToast(errorMessage);
            } finally {
                setIsSubmitting(false);
            }
        },
        [onSubmit],
    );

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
                showErrorToast(err?.data?.message || err?.message || "Failed to upload profile picture");
            } finally {
                setIsUploading(false);
            }
        },
        [uploadFile, setValue],
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
        [handleImageUpload],
    );

    const handleCancel = useCallback(() => {
        if (profile) {
            reset(defaultValues);
            setProfileImage(profile.profilePicture || null);
        }
        onCancel();
    }, [profile, reset, onCancel, defaultValues]);

    // Check if save button should be enabled
    // If user attempted upload, it must be successful
    // Otherwise, allow saving without upload
    const canSave = !hasAttemptedUpload || (hasAttemptedUpload && uploadSuccess);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {/* Profile Picture */}
                    <div className="space-y-3">
                        <Label>Profile Picture</Label>
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                            <div className="relative">
                                <img
                                    src={
                                        profileImage
                                            ? `${profileImage}${profileImage.includes("?") ? "&" : "?"}v=${profileImage.length}`
                                            : "/aynzo-logo.png"
                                    }
                                    alt="Profile"
                                    key={profileImage}
                                    className="h-24 w-24 rounded-full border-2 border-gray-200 object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "/aynzo-logo.png";
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <Label
                                    htmlFor="profile-upload"
                                    className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:bg-gray-50"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="mb-2 h-8 w-8 animate-spin text-gray-400" />
                                                <p className="text-sm text-gray-500">Uploading...</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mb-2 h-8 w-8 text-gray-400" />
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold">Click to upload</span> or drag and
                                                    drop
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Accepted formats: image/* • Max 5MB
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        id="profile-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                    />
                                </Label>
                                {hasAttemptedUpload && !uploadSuccess && (
                                    <p className="mt-2 text-sm text-red-500">
                                        Please upload image successfully to save profile
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Company Name */}
                    <div className="space-y-2">
                        <Label htmlFor="companyName">
                            Company Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="companyName"
                            placeholder="Enter your company name"
                            {...register("companyName")}
                            className={errors.companyName ? "border-red-500" : ""}
                        />
                        {errors.companyName && <p className="text-sm text-red-500">{errors.companyName.message}</p>}
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col justify-end gap-3 border-t pt-4 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting || isUploading}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || isUploading || !canSave}>
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                                </span>
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
    );
}
