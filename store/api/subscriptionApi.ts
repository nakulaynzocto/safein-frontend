import { baseApi } from './baseApi';

export interface ISubscriptionPlan {
  _id: string;
  name: string;
  amount: number;
  currency: string;
  features: string[];
  isActive: boolean;
  isPopular?: boolean;
  planType: 'free' | 'monthly' | 'quarterly' | 'yearly';
  description?: string;
  discountPercentage?: number;
  monthlyEquivalent?: number;
  trialDays?: number;
  createdAt: string;
  updatedAt: string;
}

interface GetAllSubscriptionPlansResponse {
  data: {
    plans: ISubscriptionPlan[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalPlans: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

interface GetAllSubscriptionPlansQueryArgs {
  isActive?: boolean;
}

interface CreateCheckoutSessionRequest {
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

interface CreateCheckoutSessionResponse {
  url: string;
  sessionId?: string;
}

interface CreateFreeVerificationSessionRequest {
  successUrl: string;
  cancelUrl: string;
}

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSubscriptionPlans: builder.query<GetAllSubscriptionPlansResponse, GetAllSubscriptionPlansQueryArgs>({
      query: ({ isActive }) => ({
        url: `/subscription-plans${isActive ? '?isActive=true' : ''}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (response && response.success && response.data) {
          return { data: response.data };
        }
        if (response && response.data && response.data.plans) {
          return { data: response.data };
        }
        if (response && response.plans) {
          return { data: { plans: response.plans } };
        }
        return response;
      },
    }),
    createCheckoutSession: builder.mutation<CreateCheckoutSessionResponse, CreateCheckoutSessionRequest>({
      query: (body) => ({
        url: '/user-subscriptions/stripe/checkout',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return response;
      },
    }),

    // Removed createFreeVerificationSession - now using single createCheckoutSession route
    // Free plans are handled automatically by the backend based on planType
  }),
});

export const { useGetAllSubscriptionPlansQuery, useCreateCheckoutSessionMutation } = subscriptionApi;
