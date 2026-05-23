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
    createdBy?: string;
}

export interface LoginRequest {
    email?: string;
    mobileNumber?: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    mobileNumber: string;
    password: string;
    companyName: string;
    profilePicture?: string;
    address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
    };
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

        initiatePhoneLogin: builder.mutation<{ mobileNumber: string; otpSent: boolean }, { mobileNumber: string }>({
            query: (data) => ({
                url: "/users/initiate-phone-login",
                method: "POST",
                body: data,
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
        }),

        verifyPhoneLogin: builder.mutation<AuthResponse, { mobileNumber: string; otp: string }>({
            query: (data) => ({
                url: "/users/verify-phone-login",
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

        verifyMobileOtp: builder.mutation<{ email: string; otpSent: boolean; mode: 'email' }, VerifyOtpRequest>({
            query: (otpData) => ({
                url: "/users/verify-mobile-otp",
                method: "POST",
                body: otpData,
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

        // [NEW] Independent OTP flow
        sendEmailOtp: builder.mutation<{ otpSent: boolean; mode: string }, { email: string; password?: string; mobileNumber?: string; companyName?: string }>({
            query: (userData) => ({
                url: "/users/send-email-otp",
                method: "POST",
                body: userData,
            }),
            transformResponse: (response: any) => response.success && response.data ? response.data : response,
        }),

        sendMobileOtp: builder.mutation<{ otpSent: boolean; mode: string }, { email: string; mobileNumber: string; password?: string; companyName?: string }>({
            query: (userData) => ({
                url: "/users/send-mobile-otp",
                method: "POST",
                body: userData,
            }),
            transformResponse: (response: any) => response.success && response.data ? response.data : response,
        }),

        verifyRegistrationOtp: builder.mutation<{ verified: boolean; type: string }, { email: string; otp: string; type: 'email' | 'mobile' }>({
            query: (data) => ({
                url: "/users/verify-registration-otp",
                method: "POST",
                body: data,
            }),
            transformResponse: (response: any) => response.success && response.data ? response.data : response,
        }),

        finalizeRegistration: builder.mutation<AuthResponse, any>({
            query: (registrationData) => ({
                url: "/users/finalize-registration",
                method: "POST",
                body: registrationData,
            }),
            transformResponse: (response: any) => {
                let data = response.success && response.data ? response.data : response;
                if (data && data.user) data.user = normalizeUser(data.user);
                return data;
            },
            invalidatesTags: ["User"],
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
        updateFCMToken: builder.mutation<void, { fcmToken: string }>({
            query: (data) => ({
                url: "/users/fcm-token",
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useGoogleLoginMutation,
    useInitiatePhoneLoginMutation,
    useVerifyPhoneLoginMutation,
    useRegisterMutation,
    useVerifyMobileOtpMutation,
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
    useUpdateFCMTokenMutation,
    useSendEmailOtpMutation,
    useSendMobileOtpMutation,
    useVerifyRegistrationOtpMutation,
    useFinalizeRegistrationMutation,
} = authApi;
