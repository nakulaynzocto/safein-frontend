import { baseApi } from './baseApi'

export interface Address {
  street: string
  city: string
  state: string
  country: string
  zipCode: string
}

export interface ContactPerson {
  name: string
  email: string
  phone: string
  designation: string
}

export interface Subscription {
  plan: 'basic' | 'premium' | 'enterprise'
  maxEmployees: number
  maxVisitorsPerMonth: number
  endDate: string
}

export interface WorkingHours {
  start: string
  end: string
  workingDays: number[] // 1-7 (Monday-Sunday)
}

export interface CompanySettings {
  allowAadhaarVerification: boolean
  requireAadhaarPhoto: boolean
  allowWhatsAppNotifications: boolean
  allowEmailNotifications: boolean
  workingHours: WorkingHours
  timezone: string
  logo?: string
  primaryColor: string
  secondaryColor: string
}

export interface Company {
  id: string
  companyName: string
  companyCode: string
  email: string
  phone: string
  address: Address
  contactPerson: ContactPerson
  subscription: Subscription
  settings: CompanySettings
  createdAt: string
  updatedAt: string
}

export interface CreateCompanyRequest {
  companyName: string
  companyCode: string
  email: string
  phone: string
  address: Address
  contactPerson: ContactPerson
  subscription: Subscription
  settings: CompanySettings
}

export interface UpdateCompanyRequest {
  companyName?: string
  email?: string
  phone?: string
  address?: Partial<Address>
  contactPerson?: Partial<ContactPerson>
  subscription?: Partial<Subscription>
  settings?: Partial<CompanySettings>
}

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompany: builder.query<Company, void>({
      query: () => '/companies',
      transformResponse: (response: any) => {
        // Handle wrapped response format from backend
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: ['Company'],
    }),
    createCompany: builder.mutation<Company, CreateCompanyRequest>({
      query: (companyData) => ({
        url: '/companies',
        method: 'POST',
        body: companyData,
      }),
      transformResponse: (response: any) => {
        // Handle wrapped response format from backend
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: ['Company'],
    }),
    updateCompany: builder.mutation<Company, UpdateCompanyRequest>({
      query: (companyData) => ({
        url: '/companies',
        method: 'PUT',
        body: companyData,
      }),
      transformResponse: (response: any) => {
        // Handle wrapped response format from backend
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: ['Company'],
    }),
    checkCompanyExists: builder.query<{ exists: boolean }, void>({
      query: () => '/companies/exists',
      transformResponse: (response: any) => {
        // Handle wrapped response format from backend
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
    }),
  }),
})

export const {
  useGetCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useCheckCompanyExistsQuery,
} = companyApi
