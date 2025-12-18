import { baseApi } from './baseApi'
import { createUrlParams } from '@/utils/helpers'

export interface Employee {
  _id: string
  name: string
  email: string
  phone: string
  department: string
  designation?: string
  status: 'Active' | 'Inactive'
  isDeleted: boolean
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeRequest {
  name: string
  email: string
  phone: string
  department: string
  designation?: string
  status?: 'Active' | 'Inactive'
}

export interface UpdateEmployeeRequest {
  id: string
  name?: string
  email?: string
  phone?: string
  department?: string
  designation?: string
  status?: 'Active' | 'Inactive'
}

export interface GetEmployeesQuery {
  page?: number
  limit?: number
  search?: string
  startDate?: string
  endDate?: string
  department?: string
  status?: 'Active' | 'Inactive'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface EmployeeListResponse {
  employees: Employee[]
  pagination: {
    currentPage: number
    totalPages: number
    totalEmployees: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export const employeeApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

    getEmployees: builder.query<EmployeeListResponse, GetEmployeesQuery | void>({
      query: (params) => {
        const queryParams = createUrlParams(params || {})
        return `/employees${queryParams ? `?${queryParams}` : ''}`
      },
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: (result) =>
        result?.employees
          ? [
              ...result.employees.map(({ _id }) => ({ type: 'Employee' as const, id: _id })),
              { type: 'Employee', id: 'LIST' },
            ]
          : [{ type: 'Employee', id: 'LIST' }],
      keepUnusedDataFor: 300, // Keep data for 5 minutes
    }),


    getEmployee: builder.query<Employee, string>({
      query: (id) => `/employees/${id}`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: (result, error, id) => [{ type: 'Employee', id }],
    }),


    createEmployee: builder.mutation<Employee, CreateEmployeeRequest>({
      query: (employeeData) => ({
        url: '/employees',
        method: 'POST',
        body: employeeData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),



    updateEmployee: builder.mutation<Employee, UpdateEmployeeRequest>({
      query: ({ id, ...employeeData }) => ({
        url: `/employees/${id}`,
        method: 'PUT',
        body: employeeData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Employee', id },
        { type: 'Employee', id: 'LIST' },
      ],
    }),


    deleteEmployee: builder.mutation<void, string>({
      query: (id) => ({
        url: `/employees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Employee', id },
        { type: 'Employee', id: 'LIST' },
      ],
    }),


    getTrashedEmployees: builder.query<EmployeeListResponse, GetEmployeesQuery | void>({
      query: (params) => {
        const queryParams = createUrlParams(params || {})
        return `/employees/trashed${queryParams ? `?${queryParams}` : ''}`
      },
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: (result) =>
        result?.employees
          ? [
              ...result.employees.map(({ _id }) => ({ type: 'Employee' as const, id: _id })),
              { type: 'Employee', id: 'TRASHED' },
            ]
          : [{ type: 'Employee', id: 'TRASHED' }],
    }),


    restoreEmployee: builder.mutation<Employee, string>({
      query: (id) => ({
        url: `/employees/${id}/restore`,
        method: 'PUT',
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Employee', id },
        { type: 'Employee', id: 'LIST' },
        { type: 'Employee', id: 'TRASHED' },
      ],
    }),


    updateEmployeeStatus: builder.mutation<Employee, { id: string; status: 'Active' | 'Inactive' }>({
      query: ({ id, status }) => ({
        url: `/employees/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Employee', id },
        { type: 'Employee', id: 'LIST' },
      ],
    }),


    bulkUpdateEmployees: builder.mutation<{ updatedCount: number }, { employeeIds: string[]; status?: 'Active' | 'Inactive'; department?: string; designation?: string }>({
      query: (bulkData) => ({
        url: '/employees/bulk-update',
        method: 'PUT',
        body: bulkData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),


    getEmployeeStats: builder.query<{
      totalEmployees: number
      activeEmployees: number
      inactiveEmployees: number
      deletedEmployees: number
      employeesByDepartment: Array<{ department: string; count: number }>
      employeesByStatus: Array<{ status: string; count: number }>
    }, void>({
      query: () => '/employees/stats',
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: [{ type: 'Employee', id: 'STATS' }],
    }),

    /**
     * Download Excel template for bulk import
     * Note: This endpoint doesn't use RTK Query to avoid serialization issues with Blob
     * Use the downloadEmployeeTemplate helper function instead
     */

    /**
     * Bulk create employees from Excel file
     * POST /api/employees/bulk-create
     */
    bulkCreateEmployees: builder.mutation<{
      successCount: number
      failedCount: number
      errors: Array<{
        row: number
        email?: string
        errors: string[]
      }>
    }, File>({
      query: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return {
          url: '/employees/bulk-create',
          method: 'POST',
          body: formData,
        }
      },
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetEmployeesQuery,
  useGetEmployeeQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetTrashedEmployeesQuery,
  useRestoreEmployeeMutation,
  useUpdateEmployeeStatusMutation,
  useBulkUpdateEmployeesMutation,
  useGetEmployeeStatsQuery,
  useBulkCreateEmployeesMutation,
} = employeeApi
