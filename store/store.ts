import { configureStore } from "@reduxjs/toolkit"
import { baseApi } from "./api/baseApi"
import { approvalLinkApi } from "./api/approvalLinkApi"
import authReducer from "./slices/authSlice"
import notificationReducer from "./slices/notificationSlice"

// Import injected APIs to ensure endpoints are registered
import "./api/appointmentLinkApi"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [approvalLinkApi.reducerPath]: approvalLinkApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    const defaultMiddleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
        ],
      },
    })
    
    const apiMiddlewares = [baseApi.middleware, approvalLinkApi.middleware]
    
    // Filter out any duplicate middleware references
    const uniqueMiddlewares = apiMiddlewares.filter(
      (middleware, index, self) => self.indexOf(middleware) === index
    )
    
    return defaultMiddleware.concat(...uniqueMiddlewares)
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
