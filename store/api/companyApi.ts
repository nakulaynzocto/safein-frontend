import { baseApi } from './baseApi'

export interface Address {
  street: string
  city: string
  state: string
  country: string
  zipCode: string
}




export interface CompanySettings {
  allowAadhaarVerification: boolean
  requireAadhaarPhoto: boolean
  allowWhatsAppNotifications: boolean
  allowEmailNotifications: boolean
  timezone: string
  logo?: string
}

export interface Company {
  id: string
  companyName: string
  companyCode: string
  address: Address
  settings: CompanySettings
  createdAt: string
  updatedAt: string
}

export interface CreateCompanyRequest {
  companyName: string
  companyCode: string
  address: Address
  settings: CompanySettings
}

export interface UpdateCompanyRequest {
  companyName?: string
  address?: Partial<Address>
  settings?: Partial<CompanySettings>
}

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getCompany: builder.query<Company, void>({
      query: () => '/companies',
      transformResponse: (response: any) => {
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
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: ['Company', { type: 'Company', id: 'EXISTS' }],
    }),


    updateCompany: builder.mutation<Company, UpdateCompanyRequest>({
      query: (companyData) => ({
        url: '/companies',
        method: 'PUT',
        body: companyData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: ['Company', { type: 'Company', id: 'EXISTS' }],
    }),


    checkCompanyExists: builder.query<{ exists: boolean }, void>({
      query: () => '/companies/exists',
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: [{ type: 'Company', id: 'EXISTS' }],
      keepUnusedDataFor: 300, // Keep data for 5 minutes
    }),
  }),
})

export const {
  useGetCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useCheckCompanyExistsQuery,
} = companyApi
