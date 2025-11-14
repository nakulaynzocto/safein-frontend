import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'
import { logout } from '../slices/authSlice'
import { routes } from '../../utils/routes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4010/api/v1'

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  try {
    const result = await fetchBaseQuery({
      baseUrl: API_BASE_URL,
      timeout: 10000,
      prepareHeaders: (headers, { getState }) => {
        const state = getState() as RootState
        const token = state.auth.token
        
        if (token) {
          headers.set('Authorization', `Bearer ${token}`)
        }
        
        if (args.body instanceof FormData) {
        } else {
          headers.set('Content-Type', 'application/json')
        }
        
        return headers
      },
    })(args, api, extraOptions)

    if (result.error && result.error.status === 401) {
      const isLoginRequest = args && args.url && args.url.includes(routes.publicroute.LOGIN)
      
      if (!isLoginRequest) {
        api.dispatch(logout())
        
        if (typeof window !== 'undefined') {
          import('sonner').then(({ toast }) => {
            toast.error('Session expired. Please login again.')
          })

          setTimeout(() => {
            window.location.href = routes.publicroute.LOGIN
          }, 1000)
        }
      }
    }

    if (result.error && (result.error.status === 404 || result.error.status === 500)) {
      const shouldSilence = args?.url?.includes('/stats') || 
                           args?.url?.includes('/trashed')
      
      if (!shouldSilence && typeof window !== 'undefined') {
        const errorData = result.error.data as any
        if (errorData && typeof errorData === 'string' && errorData.includes('<!DOCTYPE')) {
        }
      }
    }

    return result
  } catch (error: any) {
    return {
      error: {
        status: 'FETCH_ERROR' as const,
        error: error.message || 'Network error occurred',
      },
    }
  }
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Employee', 'Appointment', 'Company', 'Visitor', 'Subscription'],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  keepUnusedDataFor: 300,
})
