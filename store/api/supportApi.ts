import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const SUPPORT_API_BASE_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_API_URL
    ? `${process.env.NEXT_PUBLIC_SUPER_ADMIN_API_URL}/support`
    : "http://localhost:4011/api/support";

console.log('[Support API] Base URL:', SUPPORT_API_BASE_URL);

export const supportApi = createApi({
    reducerPath: 'supportApi',
    baseQuery: fetchBaseQuery({
        baseUrl: SUPPORT_API_BASE_URL,
        prepareHeaders: (headers) => {
            // Support chat might need special headers or local tokens
            const gToken = typeof window !== 'undefined' ? localStorage.getItem('safein_support_g_token') : null;
            if (gToken) {
                headers.set('x-google-token', gToken);
            }

            // If it's an employee, we might want their main auth token too
            // However, super-admin-backend might have different validation logic
            return headers;
        },
    }),
    tagTypes: ['SupportTicket', 'SupportMessage'],
    endpoints: (builder) => ({
        getTicketHistory: builder.query<any, string>({
            query: (ticketId) => {
                console.log('[Support API] Fetching history for ticket:', ticketId);
                return `/tickets/${ticketId}/history`;
            },
            transformResponse: (response: { data: any }) => response.data,
            providesTags: (result, error, ticketId) => {
                if (error) {
                    console.error('[Frontend Support API] Error fetching history:', {
                        status: (error as any).status,
                        data: (error as any).data,
                        originalError: error
                    });
                }
                return [{ type: 'SupportMessage', id: ticketId }];
            },
        }),
        getUserTickets: builder.query<any, string>({
            query: (email) => `/tickets?email=${email}`,
            transformResponse: (response: { data: any }) => response.data || [],
            providesTags: ['SupportTicket'],
        }),
    }),
});

export const { useGetTicketHistoryQuery, useLazyGetTicketHistoryQuery, useGetUserTicketsQuery, useLazyGetUserTicketsQuery } = supportApi;
