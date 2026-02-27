import { baseApi } from "./baseApi";
import { createUrlParams } from "@/utils/helpers";

export interface SpecialBooking {
    _id: string;
    visitorName: string;
    visitorEmail?: string;
    visitorPhone: string;
    employeeId: {
        _id: string;
        name: string;
        email: string;
        department?: string;
    };
    purpose: string;
    scheduledDate: string;
    scheduledTime: string;
    accompanyingCount: number;
    notes?: string;
    address?: string;
    status: 'pending' | 'verified' | 'cancelled';
    createdBy: string;
    visitorId?: string;
    appointmentId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SpecialBookingListResponse {
    bookings: SpecialBooking[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const specialBookingApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        createSpecialBooking: builder.mutation<SpecialBooking, any>({
            query: (data) => ({
                url: "/special-bookings",
                method: "POST",
                body: data,
            }),
            transformResponse: (response: any) => response.data || response,
            invalidatesTags: [{ type: "AppointmentLink", id: "LIST" }], // Invalidate appointment links to refresh the combined list
        }),
        getAllSpecialBookings: builder.query<SpecialBookingListResponse, any>({
            query: (params) => {
                const queryParams = createUrlParams(params);
                return `/special-bookings${queryParams ? `?${queryParams}` : ""}`;
            },
            transformResponse: (response: any) => {
                // Backend returns { success, message, data: { bookings, pagination } }
                // We need to extract the data object
                return response.data || response;
            },
            providesTags: [{ type: "AppointmentLink", id: "LIST" }],
        }),
        verifySpecialBookingOtp: builder.mutation<any, { bookingId: string; otp: string }>({
            query: (data) => ({
                url: "/special-bookings/verify-otp",
                method: "POST",
                body: data,
            }),
            transformResponse: (response: any) => response.data || response,
            invalidatesTags: [{ type: "AppointmentLink", id: "LIST" }, { type: "Appointment", id: "LIST" }],
        }),
        updateSpecialBookingNote: builder.mutation<any, { bookingId: string; notes: string }>({
            query: (data) => ({
                url: "/special-bookings/update-note",
                method: "PATCH",
                body: data,
            }),
            transformResponse: (response: any) => response.data || response,
            invalidatesTags: [{ type: "AppointmentLink", id: "LIST" }],
        }),
        resendOtp: builder.mutation<any, { bookingId: string }>({
            query: (data) => ({
                url: "/special-bookings/resend",
                method: "POST",
                body: data,
            }),
            transformResponse: (response: any) => response.data || response,
            // Don't invalidate any tags to prevent table re-fetch/blink
            invalidatesTags: [],
        }),
    }),
});

export const {
    useCreateSpecialBookingMutation,
    useGetAllSpecialBookingsQuery,
    useVerifySpecialBookingOtpMutation,
    useUpdateSpecialBookingNoteMutation,
    useResendOtpMutation,
} = specialBookingApi;
