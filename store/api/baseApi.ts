import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['User', 'Employee', 'Appointment'],
  endpoints: () => ({}),
})
