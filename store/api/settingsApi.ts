import { baseApi } from './baseApi'

export interface Settings {
  _id: string
  userId: string
  notifications: {
    emailEnabled: boolean
    whatsappEnabled: boolean
    smsEnabled: boolean
  }
  whatsapp: {
    senderNumber: string
    verified: boolean
    verifiedAt?: string
  }
  createdAt: string
  updatedAt: string
}

export interface UpdateSettingsRequest {
  notifications?: {
    emailEnabled?: boolean
    whatsappEnabled?: boolean
    smsEnabled?: boolean
  }
  whatsapp?: {
    senderNumber?: string
  }
}

export const settingsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getSettings: builder.query<Settings, void>({
      query: () => '/settings',
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation<Settings, UpdateSettingsRequest>({
      query: (body) => ({
        url: '/settings',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: ['Settings'],
    }),
  }),
})

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi



