import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4010/api/v1'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from Redux store
      const state = getState() as RootState
      const token = state.auth.token
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['User', 'Employee', 'Appointment', 'Company'],
  endpoints: () => ({}),
})
