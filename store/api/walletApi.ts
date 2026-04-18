import { baseApi } from "./baseApi";

export interface WalletBalance {
    balance: number;
    currency: string;
    equivalentAmount?: number;
    creditRate: number; // Ensuring this is always present from backend
    callCostPerAttempt: number; // Added to make it dynamic
    smsCostPerMessage: number; // Dynamic SMS/WhatsApp cost
}

export interface WalletTransaction {
    _id: string;
    userId: string;
    amount: number;
    credits: number;
    type: 'recharge' | 'usage' | 'refund';
    description: string;
    referenceId?: string;
    status: 'pending' | 'completed' | 'failed';
    appliedRate: number;
    createdAt: string;
}

export interface TransactionsResponse {
    transactions: WalletTransaction[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
}

export const walletApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getWalletBalance: builder.query<WalletBalance, void>({
            query: () => "/communication-wallet/balance",
            transformResponse: (res: any) => res?.data ?? res,
            providesTags: ["Wallet"],
        }),
        getWalletTransactions: builder.query<TransactionsResponse, { page?: number; limit?: number; type?: string } | void>({
            query: (params) => ({
                url: "/communication-wallet/transactions",
                params: params || { page: 1, limit: 10 },
            }),
            transformResponse: (res: any) => {
                const data = res?.data ?? res;
                // Backend uses ResponseUtil.paginate which returns { data, pagination }
                // We need to map 'data' to 'transactions' matches the interface
                return {
                    transactions: data.data || [],
                    pagination: data.pagination
                };
            },
            providesTags: ["Wallet"],
        }),
        createCheckoutOrder: builder.mutation<{ orderId: string; amount: number; currency: string; keyId: string; userEmail: string }, { amount: number }>({
            query: (data) => ({
                url: "/communication-wallet/recharge/checkout",
                method: "POST",
                body: data,
            }),
            transformResponse: (res: any) => res.data,
        }),
        verifyPayment: builder.mutation<any, { orderId: string; paymentId: string; signature: string; amount: number }>({
            query: (data) => ({
                url: "/communication-wallet/recharge/verify",
                method: "POST",
                body: data,
            }),
            transformResponse: (res: any) => res.data,
            invalidatesTags: ["Wallet"],
        }),
    }),
});

export const {
    useGetWalletBalanceQuery,
    useGetWalletTransactionsQuery,
    useCreateCheckoutOrderMutation,
    useVerifyPaymentMutation,
} = walletApi;
