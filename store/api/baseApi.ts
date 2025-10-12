import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'
import { logout } from '../slices/authSlice'
import { routes } from '../../utils/routes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Custom base query with 401 handling
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState
      const token = state.auth.token
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      
      headers.set('Content-Type', 'application/json')
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

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Employee', 'Appointment', 'Company', 'Visitor'],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  keepUnusedDataFor: 300,
})
