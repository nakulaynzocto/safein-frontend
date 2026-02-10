import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { logout } from "../slices/authSlice";
import { routes } from "../../utils/routes";
import { clearAuthData } from "../../utils/helpers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4010/api/v1";

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
    try {
        const result = await fetchBaseQuery({
            baseUrl: API_BASE_URL,
            timeout: 60000, // 60 second timeout for slower networks/large uploads
            prepareHeaders: (headers, { getState }) => {
                const state = getState() as RootState;
                const token = state.auth.token;

                if (token) {
                    headers.set("Authorization", `Bearer ${token}`);
                }

                if (!(args.body instanceof FormData)) {
                    headers.set("Content-Type", "application/json");
                }

                return headers;
            },
        })(args, api, extraOptions);

        if (result.error && result.error.status === 401) {
            const isLoginRequest = args?.url?.includes(routes.publicroute.LOGIN);
            const isLogoutRequest = args?.url?.includes("/logout");
            const isRegisterRequest = args?.url?.includes(routes.publicroute.REGISTER);
            const isUploadRequest = args?.url?.includes("/upload");

            if (typeof window !== "undefined") {
                const currentPath = window.location.pathname;
                const isOnPublicBookingPage = currentPath?.includes("/book-appointment/");

                if (isOnPublicBookingPage) {
                    return result;
                }
            }

            if (!isLoginRequest && !isLogoutRequest && !isRegisterRequest) {
                api.dispatch(logout());

                // We rely on the authSlice/useAuthSubscription to handle the redirect based on isAuthenticated=false
                // But as a failsafe for non-React contexts or race conditions:
                if (typeof window !== "undefined") {
                    clearAuthData();

                    const currentPath = window.location.pathname;
                    const isOnAuthPage =
                        currentPath === routes.publicroute.LOGIN ||
                        currentPath === routes.publicroute.REGISTER ||
                        currentPath === routes.publicroute.FORGOT_PASSWORD ||
                        currentPath === routes.publicroute.RESET_PASSWORD;

                    if (!isOnAuthPage) {
                        // Use setTimeout to allow Redux to propagate if app is mounted
                        // causing cleaner exit
                        setTimeout(() => {
                            window.location.href = routes.publicroute.LOGIN;
                        }, 100);
                    }
                }
            }
        }

        if (result.error && (result.error.status === 404 || result.error.status === 500)) {
            const shouldSilence = args?.url?.includes("/stats");

            if (!shouldSilence && typeof window !== "undefined") {
                const errorData = result.error.data as any;
                if (errorData && typeof errorData === "string" && errorData.includes("<!DOCTYPE")) {
                    // Silent handling for HTML responses
                }
            }
        }

        return result;
    } catch (error: any) {
        return {
            error: {
                status: "FETCH_ERROR" as const,
                error: error.message || "Network error occurred",
            },
        };
    }
};

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: [
        "User",
        "Employee",
        "Appointment",
        "Company",
        "Visitor",
        "Subscription",
        "SubscriptionPlan",
        "Settings",
        "AppointmentLink",
        "Notification",
        "SpotPass",
        "Chat",
    ],
    endpoints: () => ({}),
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    keepUnusedDataFor: 300,
});
