import { baseApi } from './baseApi'

export interface User {
  id: string
  email: string
  name: string
  role: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: "male" | "female" | "other"
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
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  gender: "male" | "female" | "other"
  password: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: "male" | "female" | "other"
  profilePicture?: string
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


    register: builder.mutation<User, RegisterRequest>({
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
      invalidatesTags: ['User'],
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
  useGetCurrentUserQuery,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi
