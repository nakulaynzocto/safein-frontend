import { configureStore } from "@reduxjs/toolkit"
import { baseApi } from "./api/baseApi"
import { approvalLinkApi } from "./api/approvalLinkApi"
import authReducer from "./slices/authSlice"
import notificationReducer from "./slices/notificationSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [approvalLinkApi.reducerPath]: approvalLinkApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, approvalLinkApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
