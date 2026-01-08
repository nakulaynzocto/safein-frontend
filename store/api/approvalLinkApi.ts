import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4010/api/v1";

// Public API for approval links (no authentication required)
const publicBaseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    timeout: 10000,
    prepareHeaders: (headers) => {
        headers.set("Content-Type", "application/json");
        return headers;
    },
});

export interface VerifyTokenResponse {
    success: boolean;
    message: string;
    data: {
        isValid: boolean;
        appointment?: {
            _id: string;
            appointmentId: string;
            status: string;
            employee: {
                _id: string;
                name: string;
                email: string;
                department?: string;
            };
            visitor: {
                _id: string;
                name: string;
                email: string;
                phone: string;
                company?: string;
                designation?: string;
                visitorId?: string;
                photo?: string;
                address?: {
                    street: string;
                    city: string;
                    state: string;
                    country: string;
                };
                idProof?: {
                    type: string;
                    number: string;
                    image?: string;
                };
            };
            accompaniedBy?: {
                name: string;
                phone: string;
                relation: string;
                idProof?: {
                    type: string;
                    number: string;
                    image?: string;
                };
            };
            appointmentDetails: {
                purpose: string;
                scheduledDate: string;
                scheduledTime: string;
                duration: number;
                meetingRoom?: string;
                notes?: string;
            };
            createdAt: string;
        };
    };
}

export interface UpdateStatusRequest {
    token: string;
    status: "approved" | "rejected";
}

export interface UpdateStatusResponse {
    success: boolean;
    message: string;
    data: any;
}

export const approvalLinkApi = createApi({
    reducerPath: "approvalLinkApi",
    baseQuery: publicBaseQuery,
    endpoints: (builder) => ({
        verifyToken: builder.query<VerifyTokenResponse, string>({
            query: (token) => `/verify/${token}`,
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response;
                }
                return response;
            },
        }),
        updateStatus: builder.mutation<UpdateStatusResponse, UpdateStatusRequest>({
            query: (body) => ({
                url: "/update-status",
                method: "POST",
                body,
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response;
                }
                return response;
            },
        }),
    }),
});

export const { useVerifyTokenQuery, useUpdateStatusMutation } = approvalLinkApi;
