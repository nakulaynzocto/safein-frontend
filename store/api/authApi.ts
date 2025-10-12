import { baseApi } from './baseApi'

export interface User {
  id: string
  email: string
  name: string
  role: string
  companyName: string
  profilePicture?: string
  department?: string
  designation?: string
  employeeId?: string
  isEmailVerified?: boolean
  isPhoneVerified?: boolean
  isActive?: boolean
  lastLoginAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  companyName: string
  email: string
  password: string
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}

export interface ResendOtpRequest {
  email: string
}

export interface RegisterResponse {
  message: string
  email: string
  otpSent: boolean
}

export interface UpdateProfileRequest {
  companyName?: string
  profilePicture?: string
  department?: string
  designation?: string
  employeeId?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: ['User'],
    }),


    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/users/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
    }),

    verifyOtp: builder.mutation<AuthResponse, VerifyOtpRequest>({
      query: (otpData) => ({
        url: '/users/verify-otp',
        method: 'POST',
        body: otpData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: ['User'],
    }),

    resendOtp: builder.mutation<{ message: string }, ResendOtpRequest>({
      query: (emailData) => ({
        url: '/users/resend-otp',
        method: 'POST',
        body: emailData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
    }),


    getCurrentUser: builder.query<User, void>({
      query: () => '/users/me',
      providesTags: ['User'],
      keepUnusedDataFor: 300, // Keep data for 5 minutes
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/users/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),


    getProfile: builder.query<User, void>({
      query: () => '/users/profile',
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: ['User'],
      keepUnusedDataFor: 300, // Keep data for 5 minutes
    }),


    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (profileData) => ({
        url: '/users/profile',
        method: 'PUT',
        body: profileData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi
