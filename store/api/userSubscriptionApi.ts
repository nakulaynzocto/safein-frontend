import { baseApi } from './baseApi';

export interface IUserSubscription {
  _id: string;
  userId: string;
  planType: 'free' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  isActive: boolean;
  paymentStatus: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialDays?: number;
  isTrialing: boolean;
  createdAt: string;
  updatedAt: string;
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
    assignFreePlan: builder.mutation<AssignFreePlanResponse, { stripeCustomerId?: string }>({
      query: (body) => ({
        url: '/user-subscriptions/assign-free-plan',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => {
        if (response && response.success && response.data) {
          return { data: response.data };
        }
        return response;
      },
      invalidatesTags: ['User', 'Subscription'],
    }),
  }),
});

export const {
  useGetUserActiveSubscriptionQuery,
  useCheckPremiumSubscriptionQuery,
  useGetTrialLimitsStatusQuery,
  useAssignFreePlanMutation,
} = userSubscriptionApi;
