"use client";

import { useCallback } from "react";
import { useGetProfileQuery, useUpdateProfileMutation, UpdateProfileRequest } from "@/store/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";

import { ProfileForm } from "@/components/profile/profileForm";
import { EmptyState } from "@/components/common/EmptyState";
import { UserX } from "lucide-react";
import { PageSkeleton } from "@/components/common/pageSkeleton";

export function ProfilePageContent() {
    const dispatch = useAppDispatch();
    const {
        data: profile,
        isLoading,
        error,
        refetch,
    } = useGetProfileQuery(undefined, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
    });
    const [updateProfile] = useUpdateProfileMutation();

    const handleProfileUpdate = useCallback(
        async (data: any) => {
            try {
                // const cleanPayload: UpdateProfileRequest = {};
                const cleanPayload: UpdateProfileRequest = {
                    companyName: data.companyName?.trim(),
                    email: data.email,
                    mobileNumber: data.mobileNumber,
                    bio: data.bio,
                    profilePicture: data.profilePicture,
                    address: data.address,
                    socialLinks: data.socialLinks,
                };


                if (data?.companyName && typeof data.companyName === "string") {
                    cleanPayload.companyName = data.companyName.trim();
                }

                if (
                    data?.profilePicture &&
                    typeof data.profilePicture === "string" &&
                    data.profilePicture.trim() !== ""
                ) {
                    cleanPayload.profilePicture = data.profilePicture.trim();
                }

                let finalPayload: UpdateProfileRequest;
                try {
                    finalPayload = JSON.parse(JSON.stringify(cleanPayload));
                } catch (parseError) {
                    throw new Error("Failed to prepare profile data: contains invalid data");
                }

                if (!finalPayload.companyName) {
                    throw new Error("Company name is required");
                }

                const result = await updateProfile(finalPayload).unwrap();
                await refetch();
                if (result) {
                    dispatch(setUser(result));
                    if (typeof window !== "undefined") {
                        localStorage.setItem("user", JSON.stringify(result));
                        window.dispatchEvent(new CustomEvent("profileUpdated", { detail: result }));
                    }
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
            } catch (err: any) {
                let errorMessage = "Failed to update profile";
                if (err?.data?.message) {
                    errorMessage = err.data.message;
                } else if (err?.data?.error) {
                    errorMessage = err.data.error;
                } else if (typeof err?.data === "string") {
                    errorMessage = err.data;
                } else if (err?.message) {
                    errorMessage = err.message;
                } else if (err?.error) {
                    errorMessage = err.error;
                }

                throw new Error(errorMessage);
            }
        },
        [updateProfile, refetch, dispatch],
    );

    const handleCancelEdit = () => {
        // Reset form to original values by refetching
        if (profile) {
            refetch();
        }
    };

    if (isLoading) {
        return <PageSkeleton />;
    }

    if (error || !profile) {
        return (
            <div className="container mx-auto px-4 py-8">

                <EmptyState
                    title={error ? "Failed to load profile" : "No profile found"}
                    description={
                        error
                            ? "There was an error loading your profile information. Please try again."
                            : "Your profile information could not be found."
                    }
                    icon={UserX}
                />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-full px-1">


            <div className="mt-4 sm:mt-6">
                <ProfileLayout>
                    {(activeTab) => (
                        <>
                            {activeTab === "profile" && (
                                <ProfileForm profile={profile} onSubmit={handleProfileUpdate} onCancel={handleCancelEdit} />
                            )}
                            {activeTab === "notification" && (
                                <div className="space-y-4">
                                    <SettingsPageContent />
                                </div>
                            )}
                            {activeTab === "subscription" && (
                                <ProfileSubscription />
                            )}
                        </>
                    )}
                </ProfileLayout>
            </div>
        </div>
    );
}

// Wrapper to handle dynamic import or just standard import
import { SettingsPageContent } from "@/components/settings/SettingsPageContent";
import { ProfileLayout } from "./profileLayout";
import { ProfileSubscription } from "./profileSubscription";


