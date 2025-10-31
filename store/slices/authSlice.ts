import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { User } from "../api/authApi"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        // Also remove cookie
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      }
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      // Validate token before storing
      if (!action.payload.token || action.payload.token === 'undefined' || action.payload.token.length < 10) {
        return
      }
      
      // Validate user data
      if (!action.payload.user) {
        return
      }
      
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token)
        // Store user data to restore on page reload
        localStorage.setItem("user", JSON.stringify(action.payload.user))
        // Also set cookie for middleware access
        const expires = new Date()
        expires.setDate(expires.getDate() + 7) // 7 days
        document.cookie = `token=${action.payload.token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token")
        const userStr = localStorage.getItem("user")
        
        // Validate token before using it
        if (token && token !== 'undefined' && token.length > 10) {
          state.token = token
          state.isAuthenticated = true
          
          // Restore user data if available
          if (userStr) {
            try {
              const user = JSON.parse(userStr)
              if (user && user.id && user.email) {
                state.user = user
              }
            } catch (e) {
              // Invalid user data, remove it
              localStorage.removeItem("user")
            }
          }
          
          // Also ensure cookie is set for middleware access
          const expires = new Date()
          expires.setDate(expires.getDate() + 7) // 7 days
          document.cookie = `token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
        } else {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          // Also remove cookie
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        }
      }
    },
  },
})

export const { logout, setCredentials, setUser, initializeAuth } = authSlice.actions
export default authSlice.reducer
