import { baseApi } from './baseApi';

export interface IUserSubscription {
  _id: string;
  userId: string;
  planType: 'free' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  isActive: boolean;
  paymentStatus: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  trialDays?: number;
  isTrialing: boolean;
  createdAt: string;
  updatedAt: string;
  // Backend-provided permission flags (preferred over frontend calculation)
  canAccessDashboard?: boolean;
  hasActiveSubscription?: boolean;
  subscriptionStatus?: 'active' | 'inactive' | 'cancelled' | 'expired';
}

interface GetUserActiveSubscriptionResponse {
  data: IUserSubscription | null;
}

interface CheckPremiumSubscriptionResponse {
  data: {
    hasPremium: boolean;
  };
}

interface AssignFreePlanResponse {
  data: IUserSubscription;
}

export interface TrialLimitsStatus {
  isTrial: boolean;
  limits: {
    employees: { limit: number; current: number; reached: boolean };
    visitors: { limit: number; current: number; reached: boolean };
    appointments: { limit: number; current: number; reached: boolean };
  };
}

interface GetTrialLimitsStatusResponse {
  data: TrialLimitsStatus;
}

export interface ISubscriptionHistory {
  _id: string;
  subscriptionId: string;
  planType: 'free' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  planName: string;
  purchaseDate: string;
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'succeeded' | 'failed' | 'cancelled';
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
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (response && response.success && response.data) {
          return { data: response.data };
        }
        return { data: null };
      },
      providesTags: ['User'],
    }),

    /**
     * Check if user has premium subscription
     * GET /api/v1/user-subscriptions/check-premium/:userId
     */
    checkPremiumSubscription: builder.query<CheckPremiumSubscriptionResponse, string>({
      query: (userId) => ({
        url: `/user-subscriptions/check-premium/${userId}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (response && response.success && response.data) {
          return { data: response.data };
        }
        return { data: { hasPremium: false } };
      },
      providesTags: ['User'],
    }),

    /**
     * Get trial limits status
     * GET /api/v1/user-subscriptions/trial-limits
     */
    getTrialLimitsStatus: builder.query<GetTrialLimitsStatusResponse, void>({
      query: () => ({
        url: '/user-subscriptions/trial-limits',
        method: 'GET',
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
            },
          },
        };
      },
      providesTags: ['User', 'Subscription'],
    }),

    /**
     * Assign free plan to new user
     * POST /api/v1/user-subscriptions/assign-free-plan
     */
    assignFreePlan: builder.mutation<AssignFreePlanResponse, void>({
      query: () => ({
        url: '/user-subscriptions/assign-free-plan',
        method: 'POST',
      }),
      transformResponse: (response: any) => {
        if (response && response.success && response.data) {
          return { data: response.data };
        }
        return response;
      },
      invalidatesTags: ['User', 'Subscription'],
    }),

    /**
     * Get subscription history (all successful purchases)
     * GET /api/v1/user-subscriptions/history
     */
    getSubscriptionHistory: builder.query<GetSubscriptionHistoryResponse, void>({
      query: () => ({
        url: '/user-subscriptions/history',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (response && response.success && response.data) {
          return { data: response.data };
        }
        return { data: [] };
      },
      providesTags: ['User', 'Subscription'],
    }),
  }),
});

export const {
  useGetUserActiveSubscriptionQuery,
  useCheckPremiumSubscriptionQuery,
  useGetTrialLimitsStatusQuery,
  useAssignFreePlanMutation,
  useGetSubscriptionHistoryQuery,
} = userSubscriptionApi;
