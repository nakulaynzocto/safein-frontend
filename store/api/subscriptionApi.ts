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

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSubscriptionPlans: builder.query<GetAllSubscriptionPlansResponse, GetAllSubscriptionPlansQueryArgs>({
      query: ({ isActive }) => ({
        url: `/subscription-plans${isActive ? '?isActive=true' : ''}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        // Handle the standard backend response format
        if (response && response.success && response.data) {
          return { data: response.data };
        }
        // If response.data already has the structure we need
        if (response && response.data && response.data.plans) {
          return { data: response.data };
        }
        // Fallback: if response is already in the correct format
        if (response && response.plans) {
          return { data: { plans: response.plans } };
        }
        // Last resort: return as-is
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
  }),
});

export const { useGetAllSubscriptionPlansQuery, useCreateCheckoutSessionMutation } = subscriptionApi;
