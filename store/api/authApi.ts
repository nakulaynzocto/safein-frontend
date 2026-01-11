import { baseApi } from "./baseApi";

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    companyName: string;
    profilePicture?: string;
    department?: string;
    designation?: string;
    employeeId?: string;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    isActive?: boolean;
    lastLoginAt?: string;
    createdAt?: string;
    updatedAt?: string;
    mobileNumber?: string;
    bio?: string;
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
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    companyName: string;
    email: string;
    password: string;
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface ResendOtpRequest {
    email: string;
}

export interface RegisterResponse {
    message: string;
    email: string;
    otpSent: boolean;
}

export interface UpdateProfileRequest {
    companyName?: string;
    profilePicture?: string;
    mobileNumber?: string;
    bio?: string;
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
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export const authApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: "/users/login",
                method: "POST",
                body: credentials,
            }),
            transformResponse: (response: any) => {
                let data = response;
                if (response.success && response.data) {
                    data = response.data;
                }

                // Normalize user data in response
                if (data && data.user) {
                    data.user = {
                        ...data.user,
                        id: data.user.id || data.user._id || data.user.id,
                        profilePicture: data.user.profilePicture || "",
                    };
                }

                return data;
            },
            invalidatesTags: ["User"],
        }),

        register: builder.mutation<RegisterResponse, RegisterRequest>({
            query: (userData) => ({
                url: "/users/register",
                method: "POST",
                body: userData,
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
        }),

        verifyOtp: builder.mutation<AuthResponse, VerifyOtpRequest>({
            query: (otpData) => ({
                url: "/users/verify-otp",
                method: "POST",
                body: otpData,
            }),
            transformResponse: (response: any) => {
                let data = response;
                if (response.success && response.data) {
                    data = response.data;
                }

                // Normalize user data in response
                if (data && data.user) {
                    data.user = {
                        ...data.user,
                        id: data.user.id || data.user._id || data.user.id,
                        profilePicture: data.user.profilePicture || "",
                    };
                }

                return data;
            },
            invalidatesTags: ["User"],
        }),

        resendOtp: builder.mutation<{ message: string }, ResendOtpRequest>({
            query: (emailData) => ({
                url: "/users/resend-otp",
                method: "POST",
                body: emailData,
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
        }),

        getCurrentUser: builder.query<User, void>({
            query: () => "/users/me",
            transformResponse: (response: any) => {
                let userData = response;
                if (response.success && response.data) {
                    userData = response.data;
                }

                // Normalize user data: map _id to id and ensure profilePicture
                if (userData && typeof userData === "object") {
                    return {
                        ...userData,
                        id: userData.id || userData._id,
                        profilePicture: userData.profilePicture || "",
                    };
                }
                return userData;
            },
            providesTags: ["User"],
            keepUnusedDataFor: 300, // Keep data for 5 minutes
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: "/users/logout",
                method: "POST",
            }),
            invalidatesTags: ["User"],
        }),

        getProfile: builder.query<User, void>({
            query: () => "/users/profile",
            transformResponse: (response: any) => {
                let userData = response;
                if (response.success && response.data) {
                    userData = response.data;
                }

                // Normalize user data: map _id to id and ensure profilePicture
                if (userData && typeof userData === "object") {
                    const normalized = {
                        ...userData,
                        id: userData.id || userData._id,
                        profilePicture: userData.profilePicture || "",
                    };
                    return normalized;
                }
                return userData;
            },
            providesTags: ["User"],
            keepUnusedDataFor: 300, // Keep data for 5 minutes
        }),

        updateProfile: builder.mutation<User, UpdateProfileRequest>({
            query: (profileData) => {
                // Ensure only allowed fields are sent - explicitly filter the body
                const cleanBody: UpdateProfileRequest = {};

                if (profileData.companyName && typeof profileData.companyName === "string") {
                    cleanBody.companyName = profileData.companyName;
                }

                if (profileData.profilePicture && typeof profileData.profilePicture === "string") {
                    cleanBody.profilePicture = profileData.profilePicture;
                }
                if (profileData.mobileNumber) cleanBody.mobileNumber = profileData.mobileNumber;
                if (profileData.bio) cleanBody.bio = profileData.bio;
                if (profileData.address) cleanBody.address = profileData.address;
                if (profileData.socialLinks) cleanBody.socialLinks = profileData.socialLinks;

                // Verify it's serializable (no circular refs)
                try {
                    JSON.stringify(cleanBody);
                } catch (e) {
                    console.error("Profile data contains circular reference:", e);
                    throw new Error("Invalid profile data");
                }

                return {
                    url: "/users/profile",
                    method: "PUT",
                    body: cleanBody,
                };
            },
            transformResponse: (response: any) => {
                // Handle API response structure
                let userData = response;
                if (response && typeof response === "object") {
                    if (response.success && response.data) {
                        userData = response.data;
                    }
                }

                // Normalize user data: map _id to id and ensure profilePicture
                if (userData && typeof userData === "object") {
                    const normalized = {
                        ...userData,
                        id: userData.id || userData._id,
                        profilePicture: userData.profilePicture || "",
                    };
                    return normalized;
                }
                return userData;
            },
            transformErrorResponse: (response: any) => {
                // Ensure error response is properly formatted
                if (response?.data) {
                    return response.data;
                }
                return response;
            },
            invalidatesTags: ["User"],
        }),

        forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
            query: (emailData) => ({
                url: "/users/forgot-password",
                method: "POST",
                body: emailData,
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
        }),

        resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
            query: (resetData) => ({
                url: "/users/reset-password",
                method: "POST",
                body: resetData,
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
        }),

        exchangeImpersonationToken: builder.mutation<AuthResponse, { code: string }>({
            query: ({ code }) => ({
                url: "/users/exchange-impersonation-token",
                method: "POST",
                body: { code },
            }),
            transformResponse: (response: any) => {
                let data = response;
                if (response.success && response.data) {
                    data = response.data;
                }

                // Normalize user data in response
                if (data && data.user) {
                    data.user = {
                        ...data.user,
                        id: data.user.id || data.user._id || data.user.id,
                        profilePicture: data.user.profilePicture || "",
                    };
                }

                return data;
            },
            invalidatesTags: ["User"],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useVerifyOtpMutation,
    useResendOtpMutation,
    useGetCurrentUserQuery,
    useLogoutMutation,
    useGetProfileQuery,
    useUpdateProfileMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useExchangeImpersonationTokenMutation,
} = authApi;
