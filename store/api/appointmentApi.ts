import { baseApi } from './baseApi'
import { createUrlParams } from '@/utils/helpers'

export interface Appointment {
  _id: string
  appointmentId: string
  visitorName: string
  visitorEmail: string
  visitorPhone: string
  employeeId: string
  employeeName: string
  purpose: string
  appointmentDate: string
  appointmentTime: string
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'checked-out'
  notes?: string
  checkInTime?: string
  checkOutTime?: string
  isDeleted: boolean
  deletedAt?: string
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
  employeeId: string
  visitorDetails: VisitorDetails
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
  visitorName?: string
  visitorEmail?: string
  visitorPhone?: string
  employeeId?: string
  purpose?: string
  appointmentDate?: string
  appointmentTime?: string
  notes?: string
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
    // 1. POST /appointments - Create a new appointment
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

    // 2. GET /appointments - Get all appointments
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
    }),

    // 3. GET /appointments/{id} - Get appointment by ID
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

    // 4. PUT /appointments/{id} - Update appointment
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

    // 5. DELETE /appointments/{id} - Delete appointment
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

    // 6. GET /appointments/appointment/{appointmentId} - Get appointment by appointment ID
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

    // 7. POST /appointments/check-in - Check in appointment
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

    // 8. POST /appointments/check-out - Check out appointment
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

    // 9. GET /appointments/stats - Get appointment statistics
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

    // 10. PUT /appointments/bulk-update - Bulk update appointments
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

    // 11. PUT /appointments/{id}/restore - Restore appointment
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

    // 12. GET /appointments/employee/{employeeId} - Get appointments by employee
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

    // 13. GET /appointments/date-range - Get appointments by date range
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
  // Basic CRUD operations
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  
  // Specialized queries
  useGetAppointmentByAppointmentIdQuery,
  useGetAppointmentsByEmployeeQuery,
  useGetAppointmentsByDateRangeQuery,
  
  // Actions
  useCheckInAppointmentMutation,
  useCheckOutAppointmentMutation,
  useBulkUpdateAppointmentsMutation,
  useRestoreAppointmentMutation,
  
  // Statistics
  useGetAppointmentStatsQuery,
} = appointmentApi
