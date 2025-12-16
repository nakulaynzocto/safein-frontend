import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'
import { logout } from '../slices/authSlice'
import { routes } from '../../utils/routes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4010/api/v1'

// Custom base query with 401 handling and timeout
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  try {
    const result = await fetchBaseQuery({
      baseUrl: API_BASE_URL,
      timeout: 10000, // 10 second timeout
      prepareHeaders: (headers, { getState }) => {
        const state = getState() as RootState
        const token = state.auth.token
        
        if (token) {
          headers.set('Authorization', `Bearer ${token}`)
        }
        
        // Only set JSON content type if body is not FormData
        if (args.body instanceof FormData) {
          // Don't set Content-Type for FormData - let browser set it with boundary
        } else {
          headers.set('Content-Type', 'application/json')
        }
        
        return headers
      },
    })(args, api, extraOptions)

    // Handle 401 errors - silent redirect to login using route helpers
    if (result.error && result.error.status === 401) {
      const isLoginRequest = args?.url?.includes(routes.publicroute.LOGIN)
      const isLogoutRequest = args?.url?.includes('/logout')
      const isRegisterRequest = args?.url?.includes(routes.publicroute.REGISTER)
      
      if (!isLoginRequest && !isLogoutRequest && !isRegisterRequest) {
        api.dispatch(logout())
        
        if (typeof window !== 'undefined') {
          // Clear storage silently
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          sessionStorage.clear()
          
          // Check if not already on login page
          const currentPath = window.location.pathname
          const isOnAuthPage = currentPath === routes.publicroute.LOGIN || 
                               currentPath === routes.publicroute.REGISTER || 
                               currentPath === routes.publicroute.FORGOT_PASSWORD ||
                               currentPath === routes.publicroute.RESET_PASSWORD
          
          if (!isOnAuthPage) {
            // Direct redirect without toast or delay
            window.location.replace(routes.publicroute.LOGIN)
          }
        }
      }
    }

    // Handle 404 and other errors
    if (result.error && (result.error.status === 404 || result.error.status === 500)) {
      // Don't show error toast for expected 404s or specific endpoints
      const shouldSilence = args?.url?.includes('/stats') || 
                           args?.url?.includes('/trashed')
      
      if (!shouldSilence && typeof window !== 'undefined') {
        // Check if it's a JSON parse error (usually means HTML was returned)
        const errorData = result.error.data as any
        if (errorData && typeof errorData === 'string' && errorData.includes('<!DOCTYPE')) {
          console.error('API returned HTML instead of JSON - backend route may be missing')
        }
      }
    }

    return result
  } catch (error: any) {
    // Handle network errors
    if (typeof window !== 'undefined') {
      console.error('Network error:', error)
    }
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
  // NOTE:
  // - 'User' + 'Subscription' are used by userSubscriptionApi
  // - Other tags are used by their respective feature APIs
  // If you introduce new cache tags, add them here.
  tagTypes: ['User', 'Employee', 'Appointment', 'Company', 'Visitor', 'Subscription', 'SubscriptionPlan', 'Settings'],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  keepUnusedDataFor: 300,
})
