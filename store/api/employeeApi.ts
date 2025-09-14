import { baseApi } from './baseApi'

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  department: string
  position: string
  isActive: boolean
  createdAt: string
}

export interface CreateEmployeeRequest {
  name: string
  email: string
  phone: string
  department: string
  position: string
  isActive?: boolean
}

export interface UpdateEmployeeRequest {
  id: string
  name?: string
  email?: string
  phone?: string
  department?: string
  position?: string
  isActive?: boolean
}

export const employeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<Employee[], void>({
      query: () => '/employees',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Employee' as const, id })),
              { type: 'Employee', id: 'LIST' },
            ]
          : [{ type: 'Employee', id: 'LIST' }],
    }),
    getEmployee: builder.query<Employee, string>({
      query: (id) => `/employees/${id}`,
      providesTags: (result, error, id) => [{ type: 'Employee', id }],
    }),
    createEmployee: builder.mutation<Employee, CreateEmployeeRequest>({
      query: (employeeData) => ({
        url: '/employees',
        method: 'POST',
        body: employeeData,
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),
    updateEmployee: builder.mutation<Employee, UpdateEmployeeRequest>({
      query: ({ id, ...employeeData }) => ({
        url: `/employees/${id}`,
        method: 'PUT',
        body: employeeData,
      }),
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
    getTrashedEmployees: builder.query<Employee[], void>({
      query: () => '/employees/trashed',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Employee' as const, id })),
              { type: 'Employee', id: 'TRASHED' },
            ]
          : [{ type: 'Employee', id: 'TRASHED' }],
    }),
    restoreEmployee: builder.mutation<Employee, string>({
      query: (id) => ({
        url: `/employees/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Employee', id },
        { type: 'Employee', id: 'LIST' },
        { type: 'Employee', id: 'TRASHED' },
      ],
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
} = employeeApi
