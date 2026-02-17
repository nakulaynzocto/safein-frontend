import { baseApi } from "./baseApi";

export interface IUserSubscription {
    _id: string;
    userId: string;
    planType: "free" | "weekly" | "monthly" | "quarterly" | "yearly";
    startDate: string;
    endDate: string;
    isActive: boolean;
    paymentStatus: "pending" | "succeeded" | "failed" | "cancelled";
    trialDays?: number;
    isTrialing: boolean;
    createdAt: string;
    updatedAt: string;
    // Backend-provided permission flags (preferred over frontend calculation)
    canAccessDashboard?: boolean;
    hasActiveSubscription?: boolean;
    subscriptionStatus?: "active" | "inactive" | "cancelled" | "expired";
}

interface GetUserActiveSubscriptionResponse {
    data: IUserSubscription | null;
}

export interface TrialLimitsStatus {
    isTrial: boolean;
    planType: string;
    subscriptionStatus: string;
    isActive: boolean;
    isExpired: boolean;
    isEmployeeContext?: boolean;
    limits: {
        employees: { limit: number; extra: number; total: number; current: number; reached: boolean; canCreate: boolean };
        visitors: { limit: number; extra: number; total: number; current: number; reached: boolean; canCreate: boolean };
        appointments: { limit: number; extra: number; total: number; current: number; reached: boolean; canCreate: boolean };
        spotPasses: { limit: number; extra: number; total: number; current: number; reached: boolean; canCreate: boolean };
    };
    modules: {
        visitorInvite: boolean;
        message: boolean;
    };
}

interface GetTrialLimitsStatusResponse {
    data: TrialLimitsStatus;
}

export interface ISubscriptionAddon {
    _id: string;
    name: string;
    description: string;
    type: 'employee' | 'appointment' | 'spotPass';
    unitQuantity: number;
    amount: number;
    currency: string;
    isActive: boolean;
}

interface GetAvailableAddonsResponse {
    data: ISubscriptionAddon[];
}

export interface ISubscriptionHistory {
    _id: string;
    subscriptionId: string;
    planType: "free" | "weekly" | "monthly" | "quarterly" | "yearly";
    planName: string;
    purchaseDate: string;
    startDate: string;
    endDate: string;
    amount: number;
    currency: string;
    paymentStatus: "pending" | "succeeded" | "failed" | "cancelled";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    remainingDaysFromPrevious?: number;
    createdAt: string;
}

interface GetSubscriptionHistoryResponse {
    data: ISubscriptionHistory[];
}

export const userSubscriptionApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        /**
         * Get user's active subscription
         * GET /api/v1/user-subscriptions/active/:userId
         */
        getUserActiveSubscription: builder.query<GetUserActiveSubscriptionResponse, string>({
            query: (userId) => ({
                url: `/user-subscriptions/active/${userId}`,
                method: "GET",
            }),
            transformResponse: (response: any) => {
                if (response && response.success && response.data) {
                    return { data: response.data };
                }
                return { data: null };
            },
            providesTags: ["User"],
        }),

        /**
         * Get trial limits status
         * GET /api/v1/user-subscriptions/trial-limits
         */
        getTrialLimitsStatus: builder.query<GetTrialLimitsStatusResponse, void>({
            query: () => ({
                url: "/user-subscriptions/trial-limits",
                method: "GET",
            }),
            transformResponse: (response: any) => {
                if (response && response.success && response.data) {
                    return { data: response.data };
                }
                return {
                    data: {
                        isTrial: false,
                        limits: {
                            employees: { limit: -1, current: 0, reached: false },
                            visitors: { limit: -1, current: 0, reached: false },
                            appointments: { limit: -1, current: 0, reached: false },
                            spotPasses: { limit: -1, current: 0, reached: false },
                        },
                    },
                };
            },
            providesTags: ["User", "Subscription"],
        }),

        /**
         * Get subscription history (all successful purchases)
         * GET /api/v1/user-subscriptions/history
         */
        getSubscriptionHistory: builder.query<GetSubscriptionHistoryResponse, void>({
            query: () => ({
                url: "/user-subscriptions/history",
                method: "GET",
            }),
            transformResponse: (response: any) => {
                if (response && response.success && response.data) {
                    return { data: response.data };
                }
                return { data: [] };
            },
            providesTags: ["User", "Subscription"],
        }),

        /**
         * Get available subscription addons
         */
        getAvailableAddons: builder.query<GetAvailableAddonsResponse, void>({
            query: () => ({
                url: "/user-subscriptions/addons/available",
                method: "GET",
            }),
            transformResponse: (response: any) => {
                return { data: response?.data || [] };
            },
            providesTags: ["Subscription"],
        }),

        /**
         * Create Razorpay order for addon
         */
        createAddonRazorpayCheckout: builder.mutation<any, { addonId: string }>({
            query: (data) => ({
                url: "/user-subscriptions/addons/razorpay/checkout",
                method: "POST",
                body: data,
            }),
        }),

        /**
         * Verify addon payment
         */
        verifyAddonPayment: builder.mutation<
            any,
            { orderId: string; paymentId: string; signature: string; addonId: string }
        >({
            query: (data) => ({
                url: "/user-subscriptions/addons/razorpay/verify",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["User", "Subscription"],
        }),
    }),
});

export const {
    useGetUserActiveSubscriptionQuery,
    useGetTrialLimitsStatusQuery,
    useGetSubscriptionHistoryQuery,
    useGetAvailableAddonsQuery,
    useCreateAddonRazorpayCheckoutMutation,
    useVerifyAddonPaymentMutation,
} = userSubscriptionApi;
