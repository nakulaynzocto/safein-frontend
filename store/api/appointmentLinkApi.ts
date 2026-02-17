import { baseApi } from "./baseApi";
import { createUrlParams } from "@/utils/helpers";
import { CreateVisitorRequest, Visitor } from "./visitorApi";

export interface AppointmentLink {
    _id: string;
    visitorId?: string;
    visitor?: Partial<Visitor> & { _id?: string };
    visitorEmail: string;
    employeeId: string;
    employee?: {
        _id: string;
        name: string;
        email: string;
    };
    createdBy?: {
        _id: string;
        companyName: string;
        profilePicture?: string;
    };
    secureToken: string;
    isBooked: boolean;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    bookingUrl: string;
}

export interface CreateAppointmentLinkRequest {
    visitorEmail: string;
    employeeId: string;
    expiresInDays?: number;
}

export interface AppointmentLinkListResponse {
    links: AppointmentLink[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    stats: {
        totalBooked: number;
        totalNotBooked: number;
    };
}

export interface CheckVisitorResponse {
    exists: boolean;
    visitorId?: string;
}

export const appointmentLinkApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createAppointmentLink: builder.mutation<AppointmentLink, CreateAppointmentLinkRequest>({
            query: (data) => ({
                url: "/appointment-links",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "AppointmentLink", id: "LIST" }, { type: "Subscription" }],
        }),

        getAllAppointmentLinks: builder.query<
            AppointmentLinkListResponse,
            {
                page?: number;
                limit?: number;
                isBooked?: boolean;
                search?: string;
                sortBy?: string;
                sortOrder?: "asc" | "desc";
            }
        >({
            query: (params) => {
                const queryParams = createUrlParams(params);
                return `/appointment-links${queryParams ? `?${queryParams}` : ""}`;
            },
            transformResponse: (response: any) => {
                // Handle backend response structure: { success, message, data }
                return response?.data || response;
            },
            providesTags: [{ type: "AppointmentLink", id: "LIST" }],
        }),

        getAppointmentLinkByToken: builder.query<AppointmentLink, string>({
            query: (token) => `/appointment-links/public/${encodeURIComponent(token)}`,
            transformResponse: (response: any) => response?.data || response,
            keepUnusedDataFor: 0,
        }),

        checkVisitorExists: builder.query<CheckVisitorResponse, string>({
            query: (email) => {
                const normalizedEmail = email.trim().toLowerCase();
                const queryParams = createUrlParams({ email: normalizedEmail });
                return `/appointment-links/check-visitor${queryParams ? `?${queryParams}` : ""}`;
            },
            transformResponse: (response: any) => {
                return response?.data || response;
            },
            keepUnusedDataFor: 0,
        }),

        deleteAppointmentLink: builder.mutation<void, string>({
            query: (id) => ({
                url: `/appointment-links/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "AppointmentLink", id: "LIST" }, { type: "Subscription" }],
        }),
        resendAppointmentLink: builder.mutation<any, string>({
            query: (id) => ({
                url: `/appointment-links/resend/${id}`,
                method: "POST",
            }),
            // Don't invalidate any tags to prevent table re-fetch/blink
            invalidatesTags: [],
        }),

        createVisitorThroughLink: builder.mutation<Visitor, { token: string; visitorData: CreateVisitorRequest }>({
            query: ({ token, visitorData }) => ({
                url: `/appointment-links/public/${encodeURIComponent(token)}/create-visitor`,
                method: "POST",
                body: visitorData,
            }),
            transformResponse: (response: any) => {
                // Handle both direct response and nested data structure
                const data = response?.data || response;
                return data;
            },
        }),

        createAppointmentThroughLink: builder.mutation<any, { token: string; appointmentData: any }>({
            query: ({ token, appointmentData }) => ({
                url: `/appointment-links/public/${encodeURIComponent(token)}/create-appointment`,
                method: "POST",
                body: appointmentData,
            }),
            transformResponse: (response: any) => response?.data || response,
        }),
    }),
});

export const {
    useCreateAppointmentLinkMutation,
    useGetAllAppointmentLinksQuery,
    useGetAppointmentLinkByTokenQuery,
    useCheckVisitorExistsQuery,
    useDeleteAppointmentLinkMutation,
    useResendAppointmentLinkMutation,
    useCreateVisitorThroughLinkMutation,
    useCreateAppointmentThroughLinkMutation,
} = appointmentLinkApi;
