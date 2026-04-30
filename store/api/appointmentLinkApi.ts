import { baseApi } from "./baseApi";
import { createUrlParams } from "@/utils/helpers";
import { CreateVisitorRequest, Visitor } from "./visitorApi";

export interface AppointmentLink {
    _id: string;
    visitorId?: string;
    visitor?: Partial<Visitor> & { _id?: string };
    visitorPhone?: string;
    visitorEmail?: string;
    employeeId: string;
    employee?: { _id: string; name: string; email: string; department?: string; designation?: string; };
    createdBy?: { _id: string; companyName: string; profilePicture?: string; };
    features?: any;
    secureToken: string;
    isBooked: boolean;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    bookingUrl: string;
}

export interface CreateAppointmentLinkRequest {
    visitorPhone?: string;
    visitorEmail?: string;
    employeeId: string;
    expiresInDays?: number;
}

export interface AppointmentLinkListResponse {
    links: AppointmentLink[];
    stats?: {
        totalBooked: number;
        totalNotBooked: number;
    };
    pagination: { page: number; limit: number; total: number; totalPages: number; };
}

export interface CreateBookingThroughLinkRequest {
    token: string;
    visitorData?: CreateVisitorRequest;
    appointmentData: any;
}

export const appointmentLinkApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createAppointmentLink: builder.mutation<AppointmentLink, CreateAppointmentLinkRequest>({
            query: (data) => ({ url: "/appointment-links", method: "POST", body: data }),
            invalidatesTags: [{ type: "AppointmentLink", id: "LIST" }, { type: "Subscription" }],
        }),

        getAllAppointmentLinks: builder.query<AppointmentLinkListResponse, { page?: number; limit?: number; isBooked?: boolean; search?: string; sortBy?: string; sortOrder?: "asc" | "desc"; }>({
            query: (params) => `/appointment-links${createUrlParams(params) ? `?${createUrlParams(params)}` : ""}`,
            transformResponse: (res: any) => res?.data || res,
            providesTags: [{ type: "AppointmentLink", id: "LIST" }],
        }),

        getAppointmentLinkByToken: builder.query<AppointmentLink, string>({
            query: (token) => `/appointment-links/public/${encodeURIComponent(token)}`,
            transformResponse: (res: any) => res?.data || res,
            keepUnusedDataFor: 0,
        }),

        deleteAppointmentLink: builder.mutation<void, string>({
            query: (id) => ({ url: `/appointment-links/${id}`, method: "DELETE" }),
            invalidatesTags: [{ type: "AppointmentLink", id: "LIST" }, { type: "Subscription" }],
        }),

        resendAppointmentLink: builder.mutation<any, string>({
            query: (id) => ({ url: `/appointment-links/resend/${id}`, method: "POST" }),
            invalidatesTags: [],
        }),

        createBookingThroughLink: builder.mutation<any, CreateBookingThroughLinkRequest>({
            query: ({ token, visitorData, appointmentData }) => ({
                url: `/appointment-links/public/${encodeURIComponent(token)}/submit`,
                method: "POST",
                body: { visitorData, appointmentData },
            }),
            transformResponse: (res: any) => res?.data || res,
        }),

        sendVisitorOtp: builder.mutation<any, { phone: string; token: string }>({
            query: (body) => ({ url: `/appointment-links/send-otp`, method: "POST", body }),
        }),

        verifyVisitorOtp: builder.mutation<any, { phone: string; otp: string; token: string }>({
            query: (body) => ({ url: `/appointment-links/verify-otp`, method: "POST", body }),
        }),
    }),
});

export const {
    useCreateAppointmentLinkMutation,
    useGetAllAppointmentLinksQuery,
    useGetAppointmentLinkByTokenQuery,
    useDeleteAppointmentLinkMutation,
    useResendAppointmentLinkMutation,
    useCreateBookingThroughLinkMutation,
    useSendVisitorOtpMutation,
    useVerifyVisitorOtpMutation,
} = appointmentLinkApi;
