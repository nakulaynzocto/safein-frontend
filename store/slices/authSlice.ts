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
      }
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      // Validate token before storing
      if (!action.payload.token || action.payload.token === 'undefined' || action.payload.token.length < 10) {
        return
      }
      
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token)
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token")
        
        // Validate token before using it
        if (token && token !== 'undefined' && token.length > 10) {
          state.token = token
          state.isAuthenticated = true
        } else {
          localStorage.removeItem("token")
        }
      }
    },
  },
})

export const { logout, setCredentials, setUser, initializeAuth } = authSlice.actions
export default authSlice.reducer
