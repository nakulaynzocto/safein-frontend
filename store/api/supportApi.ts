import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const SUPPORT_API_BASE_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_API_URL
    ? `${process.env.NEXT_PUBLIC_SUPER_ADMIN_API_URL}/support`
    : "http://localhost:4011/api/support";


export const supportApi = createApi({
    reducerPath: 'supportApi',
    baseQuery: fetchBaseQuery({
        baseUrl: SUPPORT_API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const state = getState() as RootState;
            const token = state.auth.token;

            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }

            const gToken = typeof window !== 'undefined' ? localStorage.getItem('safein_support_g_token') : null;
            if (gToken) {
                headers.set('x-google-token', gToken);
            }

            return headers;
        },
    }),
    tagTypes: ['SupportTicket', 'SupportMessage'],
    endpoints: (builder) => ({
        getTicketHistory: builder.query<any, string>({
            query: (ticketId) => `/tickets/${ticketId}/history`,
            transformResponse: (response: { data: any }) => response.data,
            providesTags: (result, error, ticketId) => [{ type: 'SupportMessage', id: ticketId }],
        }),
        getUserTickets: builder.query<any, string>({
            query: (email) => `/tickets?email=${email}`,
            transformResponse: (response: { data: any }) => response.data || [],
            providesTags: ['SupportTicket'],
        }),
        createTicket: builder.mutation<any, { subject: string; message: string }>({
            query: (data) => ({
                url: '/tickets',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['SupportTicket'],
        }),
        sendMessage: builder.mutation<any, { ticketId: string; content: string; type?: string }>({
            query: ({ ticketId, ...data }) => ({
                url: `/tickets/${ticketId}/messages`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, { ticketId }) => [{ type: 'SupportMessage', id: ticketId }],
        }),
    }),
});

export const {
    useGetTicketHistoryQuery,
    useLazyGetTicketHistoryQuery,
    useGetUserTicketsQuery,
    useLazyGetUserTicketsQuery,
    useCreateTicketMutation,
    useSendMessageMutation
} = supportApi;
