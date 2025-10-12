import { baseApi } from './baseApi'
import { createUrlParams } from '@/utils/helpers'

export interface Appointment {
  _id: string
  appointmentId: string
  employeeId: string
  visitorId: string // Reference to Visitor
  visitor?: VisitorDetails // Populated visitor details
  accompaniedBy?: AccompaniedBy
  appointmentDetails: AppointmentDetails
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  checkInTime?: string
  checkOutTime?: string
  actualDuration?: number
  securityDetails: SecurityDetails
  notifications: NotificationPreferences
  createdBy: string
  isDeleted: boolean
  deletedAt?: string | null
  deletedBy?: string | null
  createdAt: string
  updatedAt: string
}

export interface VisitorDetails {
  name: string
  email: string
  phone: string
  company: string
  designation: string
  address: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  idProof: {
    type: string
    number: string
    image: string
  }
  photo: string
}

export interface AccompaniedBy {
  name: string
  phone: string
  relation: string
  idProof: {
    type: string
    number: string
    image: string
  }
}

export interface AppointmentDetails {
  purpose: string
  scheduledDate: string
  scheduledTime: string
  duration: number
  meetingRoom: string
  notes: string
}

export interface SecurityDetails {
  badgeIssued: boolean
  badgeNumber: string
  securityClearance: boolean
  securityNotes: string
}

export interface NotificationPreferences {
  smsSent: boolean
  emailSent: boolean
  whatsappSent: boolean
  reminderSent: boolean
}

export interface CreateAppointmentRequest {
  appointmentId: string
  employeeId: string
  visitorId: string // Reference to Visitor
  accompaniedBy?: AccompaniedBy
  appointmentDetails: AppointmentDetails
  securityDetails: SecurityDetails
  notifications: NotificationPreferences
}

// Legacy interface for backward compatibility
export interface LegacyCreateAppointmentRequest {
  visitorName: string
  visitorEmail: string
  visitorPhone: string
  employeeId: string
  purpose: string
  appointmentDate: string
  appointmentTime: string
  notes?: string
}

export interface UpdateAppointmentRequest {
  visitorId?: string // Reference to Visitor
  employeeId?: string
  purpose?: string
  appointmentDate?: string
  appointmentTime?: string
  notes?: string
  status?: Appointment['status']
}

export interface UpdateAppointmentStatusRequest {
  status: Appointment['status']
}

export interface GetAppointmentsQuery {
  page?: number
  limit?: number
  search?: string
  status?: Appointment['status']
  employeeId?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface AppointmentListResponse {
  appointments: Appointment[]
  pagination: {
    currentPage: number
    totalPages: number
    totalAppointments: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface CheckInRequest {
  appointmentId: string
  notes?: string
}

export interface CheckOutRequest {
  appointmentId: string
  notes?: string
}

export interface BulkUpdateAppointmentsRequest {
  appointmentIds: string[]
  status?: Appointment['status']
  employeeId?: string
  notes?: string
}

export interface AppointmentStats {
  totalAppointments: number
  pendingAppointments: number
  approvedAppointments: number
  rejectedAppointments: number
  completedAppointments: number
  checkedOutAppointments: number
  appointmentsByStatus: Array<{ status: string; count: number }>
  appointmentsByEmployee: Array<{ employeeId: string; employeeName: string; count: number }>
  appointmentsByDate: Array<{ date: string; count: number }>
}

export const appointmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAppointment: builder.mutation<Appointment, CreateAppointmentRequest>({
      query: (appointmentData) => ({
        url: '/appointments',
        method: 'POST',
        body: appointmentData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: [{ type: 'Appointment', id: 'LIST' }],
    }),

    getAppointments: builder.query<AppointmentListResponse, GetAppointmentsQuery | void>({
      query: (params) => {
        const queryParams = createUrlParams(params || {})
        return `/appointments${queryParams ? `?${queryParams}` : ''}`
      },
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: (result) =>
        result?.appointments
          ? [
              ...result.appointments.map(({ _id }) => ({ type: 'Appointment' as const, id: _id })),
              { type: 'Appointment', id: 'LIST' },
            ]
          : [{ type: 'Appointment', id: 'LIST' }],
      keepUnusedDataFor: 300, // Keep data for 5 minutes
    }),

    getAppointment: builder.query<Appointment, string>({
      query: (id) => `/appointments/${id}`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: (result, error, id) => [{ type: 'Appointment', id }],
    }),

    updateAppointment: builder.mutation<Appointment, { id: string } & UpdateAppointmentRequest>({
      query: ({ id, ...appointmentData }) => ({
        url: `/appointments/${id}`,
        method: 'PUT',
        body: appointmentData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Appointment', id },
        { type: 'Appointment', id: 'LIST' },
      ],
    }),

    deleteAppointment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/appointments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Appointment', id },
        { type: 'Appointment', id: 'LIST' },
      ],
    }),

    getAppointmentByAppointmentId: builder.query<Appointment, string>({
      query: (appointmentId) => `/appointments/appointment/${appointmentId}`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: (result, error, appointmentId) => [{ type: 'Appointment', id: appointmentId }],
    }),

    checkInAppointment: builder.mutation<Appointment, CheckInRequest>({
      query: (checkInData) => ({
        url: '/appointments/check-in',
        method: 'POST',
        body: checkInData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: [{ type: 'Appointment', id: 'LIST' }],
    }),

    checkOutAppointment: builder.mutation<Appointment, CheckOutRequest>({
      query: (checkOutData) => ({
        url: '/appointments/check-out',
        method: 'POST',
        body: checkOutData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: [{ type: 'Appointment', id: 'LIST' }],
    }),

    getAppointmentStats: builder.query<AppointmentStats, void>({
      query: () => '/appointments/stats',
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: [{ type: 'Appointment', id: 'STATS' }],
    }),

    bulkUpdateAppointments: builder.mutation<{ updatedCount: number }, BulkUpdateAppointmentsRequest>({
      query: (bulkData) => ({
        url: '/appointments/bulk-update',
        method: 'PUT',
        body: bulkData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: [{ type: 'Appointment', id: 'LIST' }],
    }),

    restoreAppointment: builder.mutation<Appointment, string>({
      query: (id) => ({
        url: `/appointments/${id}/restore`,
        method: 'PUT',
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Appointment', id },
        { type: 'Appointment', id: 'LIST' },
        { type: 'Appointment', id: 'TRASHED' },
      ],
    }),

    cancelAppointment: builder.mutation<Appointment, string>({
      query: (id) => ({
        url: `/appointments/${id}/cancel`,
        method: 'PUT',
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Appointment', id },
        { type: 'Appointment', id: 'LIST' },
      ],
    }),

    approveAppointment: builder.mutation<Appointment, string>({
      query: (id) => ({
        url: `/appointments/${id}/approve`,
        method: 'PUT',
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Appointment', id },
        { type: 'Appointment', id: 'LIST' },
      ],
    }),

    rejectAppointment: builder.mutation<Appointment, string>({
      query: (id) => ({
        url: `/appointments/${id}/reject`,
        method: 'PUT',
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Appointment', id },
        { type: 'Appointment', id: 'LIST' },
      ],
    }),

    getAppointmentsByEmployee: builder.query<AppointmentListResponse, { employeeId: string } & GetAppointmentsQuery>({
      query: ({ employeeId, ...params }) => {
        const queryParams = createUrlParams(params)
        return `/appointments/employee/${employeeId}${queryParams ? `?${queryParams}` : ''}`
      },
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: (result, error, { employeeId }) =>
        result?.appointments
          ? [
              ...result.appointments.map(({ _id }) => ({ type: 'Appointment' as const, id: _id })),
              { type: 'Appointment', id: `EMPLOYEE_${employeeId}` },
            ]
          : [{ type: 'Appointment', id: `EMPLOYEE_${employeeId}` }],
    }),

    getAppointmentsByDateRange: builder.query<AppointmentListResponse, { dateFrom: string; dateTo: string } & GetAppointmentsQuery>({
      query: ({ dateFrom, dateTo, ...params }) => {
        const queryParams = createUrlParams({ dateFrom, dateTo, ...params })
        return `/appointments/date-range?${queryParams}`
      },
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: (result) =>
        result?.appointments
          ? [
              ...result.appointments.map(({ _id }) => ({ type: 'Appointment' as const, id: _id })),
              { type: 'Appointment', id: 'DATE_RANGE' },
            ]
          : [{ type: 'Appointment', id: 'DATE_RANGE' }],
    }),
  }),
})

export const {
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  
  useGetAppointmentByAppointmentIdQuery,
  useGetAppointmentsByEmployeeQuery,
  useGetAppointmentsByDateRangeQuery,
  
  useCheckInAppointmentMutation,
  useCheckOutAppointmentMutation,
  useBulkUpdateAppointmentsMutation,
  useRestoreAppointmentMutation,
  useCancelAppointmentMutation,
  useApproveAppointmentMutation,
  useRejectAppointmentMutation,
  
  useGetAppointmentStatsQuery,
} = appointmentApi
