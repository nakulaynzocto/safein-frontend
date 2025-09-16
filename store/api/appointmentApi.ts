import { baseApi } from './baseApi'

export interface Appointment {
  id: string
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
  createdAt: string
}

export interface CreateAppointmentRequest {
  visitorName: string
  visitorEmail: string
  visitorPhone: string
  employeeId: string
  purpose: string
  appointmentDate: string
  appointmentTime: string
  notes?: string
}

export interface UpdateAppointmentStatusRequest {
  id: string
  status: Appointment['status']
}

export interface UpdateAppointmentRequest {
  id: string
  visitorName?: string
  visitorEmail?: string
  visitorPhone?: string
  employeeId?: string
  purpose?: string
  appointmentDate?: string
  appointmentTime?: string
  notes?: string
}

export const appointmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppointments: builder.query<Appointment[], void>({
      query: () => '/appointments',
      transformResponse: (response: any) => {
        // Handle wrapped response format from backend
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Appointment' as const, id })),
              { type: 'Appointment', id: 'LIST' },
            ]
          : [{ type: 'Appointment', id: 'LIST' }],
    }),
    getAppointment: builder.query<Appointment, string>({
      query: (id) => `/appointments/${id}`,
      transformResponse: (response: any) => {
        // Handle wrapped response format from backend
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: (result, error, id) => [{ type: 'Appointment', id }],
    }),
    createAppointment: builder.mutation<Appointment, CreateAppointmentRequest>({
      query: (appointmentData) => ({
        url: '/appointments',
        method: 'POST',
        body: { ...appointmentData, status: 'pending' },
      }),
      transformResponse: (response: any) => {
        // Handle wrapped response format from backend
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: [{ type: 'Appointment', id: 'LIST' }],
    }),
    updateAppointment: builder.mutation<Appointment, UpdateAppointmentRequest>({
      query: ({ id, ...appointmentData }) => ({
        url: `/appointments/${id}`,
        method: 'PUT',
        body: appointmentData,
      }),
      transformResponse: (response: any) => {
        // Handle wrapped response format from backend
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
    updateAppointmentStatus: builder.mutation<Appointment, UpdateAppointmentStatusRequest>({
      query: ({ id, status }) => ({
        url: `/appointments/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: any) => {
        // Handle wrapped response format from backend
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
    getTrashedAppointments: builder.query<Appointment[], void>({
      query: () => '/appointments/trashed',
      transformResponse: (response: any) => {
        // Handle wrapped response format from backend
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Appointment' as const, id })),
              { type: 'Appointment', id: 'TRASHED' },
            ]
          : [{ type: 'Appointment', id: 'TRASHED' }],
    }),
    restoreAppointment: builder.mutation<Appointment, string>({
      query: (id) => ({
        url: `/appointments/${id}/restore`,
        method: 'POST',
      }),
      transformResponse: (response: any) => {
        // Handle wrapped response format from backend
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
    getAppointmentsByEmployee: builder.query<Appointment[], string>({
      query: (employeeId) => `/appointments/employee/${employeeId}`,
      transformResponse: (response: any) => {
        // Handle wrapped response format from backend
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: (result, error, employeeId) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Appointment' as const, id })),
              { type: 'Appointment', id: `EMPLOYEE_${employeeId}` },
            ]
          : [{ type: 'Appointment', id: `EMPLOYEE_${employeeId}` }],
    }),
  }),
})

export const {
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useUpdateAppointmentStatusMutation,
  useDeleteAppointmentMutation,
  useGetTrashedAppointmentsQuery,
  useRestoreAppointmentMutation,
  useGetAppointmentsByEmployeeQuery,
} = appointmentApi
