import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import { approvalLinkApi } from "./api/approvalLinkApi";
import { notificationApi } from "./api/notificationApi";
import authReducer from "./slices/authSlice";
import notificationReducer from "./slices/notificationSlice";
import { supportApi } from "./api/supportApi";

// Import injected APIs to ensure endpoints are registered
import "./api/appointmentLinkApi";
import "./api/employeeApi";
import "./api/uploadApi";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        notification: notificationReducer,
        [baseApi.reducerPath]: baseApi.reducer,
        [approvalLinkApi.reducerPath]: approvalLinkApi.reducer,
        [supportApi.reducerPath]: supportApi.reducer,
    },
    middleware: (getDefaultMiddleware) => {
        const defaultMiddleware = getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
            },
        });

        const apiMiddlewares = [
            baseApi.middleware,
            approvalLinkApi.middleware,
            notificationApi.middleware,
            supportApi.middleware
        ];

        // Filter out any duplicate middleware references
        const uniqueMiddlewares = apiMiddlewares.filter(
            (middleware, index, self) => self.indexOf(middleware) === index,
        );

        return defaultMiddleware.concat(...uniqueMiddlewares);
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
