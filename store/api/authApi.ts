import { baseApi } from "./baseApi";

export interface User {
    id: string;
    email: string;
    name: string;
    role?: string; // Legacy field, prefer roles array
    roles?: string[]; // Backend returns roles array
    companyName: string;
    profilePicture?: string;
    photo?: string; // Personal photo for employees
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
    email?: string;
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

export interface SetupEmployeePasswordRequest {
    token: string;
    newPassword: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

const normalizeUser = (userData: any) => {
    if (!userData) return userData;
    const roles = userData.roles || (userData.role ? [userData.role] : ['admin']);
    return {
        ...userData,
        id: userData.id || userData._id || userData.id,
        profilePicture: userData.profilePicture || "",
        photo: userData.photo || "",
        role: userData.role || roles[0] || 'admin',
        roles: roles,
        // Ensure employeeId is set if user is an employee
        employeeId: userData.employeeId || (roles.includes('employee') ? (userData._id || userData.id) : undefined),
    };
};

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

                if (data && data.user) {
                    data.user = normalizeUser(data.user);
                }

                return data;
            },
            invalidatesTags: ["User"],
        }),

        googleLogin: builder.mutation<AuthResponse, { token: string }>({
            query: (data) => ({
                url: "/users/google-login",
                method: "POST",
                body: data,
            }),
            transformResponse: (response: any) => {
                let data = response;
                if (response.success && response.data) {
                    data = response.data;
                }

                if (data && data.user) {
                    data.user = normalizeUser(data.user);
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
                    data.user = normalizeUser(data.user);
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

                // Normalize user data
                if (userData && typeof userData === "object") {
                    return normalizeUser(userData);
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

                // Normalize user data
                if (userData && typeof userData === "object") {
                    return normalizeUser(userData);
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

                // Normalize user data
                if (userData && typeof userData === "object") {
                    return normalizeUser(userData);
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

        setupEmployeePassword: builder.mutation<AuthResponse, SetupEmployeePasswordRequest>({
            query: (setupData) => ({
                url: "/users/setup-employee-password",
                method: "POST",
                body: setupData,
            }),
            transformResponse: (response: any) => {
                let data = response;
                if (response.success && response.data) {
                    data = response.data;
                }

                // Normalize user data in response
                if (data && data.user) {
                    data.user = normalizeUser(data.user);
                }

                return data;
            },
            invalidatesTags: ["User"],
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
                    data.user = normalizeUser(data.user);
                }

                return data;
            },
            invalidatesTags: ["User"],
        }),
    }),
});

export const {
    useLoginMutation,
    useGoogleLoginMutation,
    useRegisterMutation,
    useVerifyOtpMutation,
    useResendOtpMutation,
    useGetCurrentUserQuery,
    useLogoutMutation,
    useGetProfileQuery,
    useUpdateProfileMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useSetupEmployeePasswordMutation,
    useExchangeImpersonationTokenMutation,
} = authApi;
