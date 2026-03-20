"use client";

import { useCallback } from "react";
import { useGetProfileQuery, useUpdateProfileMutation, UpdateProfileRequest } from "@/store/api/authApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";

import { ProfileForm } from "@/components/profile/profileForm";
import { EmptyState } from "@/components/common/EmptyState";
import { UserX } from "lucide-react";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { PageSkeleton } from "@/components/common/pageSkeleton";
import { APIErrorState } from "@/components/common/APIErrorState";

export function ProfilePageContent() {
    const dispatch = useAppDispatch();
    const { user: currentUser } = useAppSelector((state) => state.auth);
    const isEmployee = checkIsEmployee(currentUser);

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
                // For employees, exclude company-related fields from update
                const cleanPayload: UpdateProfileRequest = {};

                // Employees cannot update company fields
                if (!isEmployee) {
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
                }

                // All users can update these fields
                if (data.mobileNumber !== undefined) {
                    cleanPayload.mobileNumber = data.mobileNumber;
                }
                if (data.bio !== undefined) {
                    cleanPayload.bio = data.bio;
                }
                if (data.address !== undefined) {
                    cleanPayload.address = data.address;
                }
                if (data.socialLinks !== undefined) {
                    cleanPayload.socialLinks = data.socialLinks;
                }

                let finalPayload: UpdateProfileRequest;
                try {
                    finalPayload = JSON.parse(JSON.stringify(cleanPayload));
                } catch (parseError) {
                    throw new Error("Failed to prepare profile data: contains invalid data");
                }

                // Company name is only required for admins
                if (!isEmployee && !finalPayload.companyName && data.companyName) {
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
        [updateProfile, refetch, dispatch, isEmployee],
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

    if (error) {
        return (
            <APIErrorState
                title="Failed to load profile"
                error={error}
                onRetry={() => refetch()}
            />
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <EmptyState
                    title="No profile found"
                    description="Your profile information could not be found."
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
import { ProfileLayout } from "./profileLayout";
import { ProfileSubscription } from "./profileSubscription";


