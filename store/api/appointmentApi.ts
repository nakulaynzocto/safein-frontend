import { baseApi } from "./baseApi";
import { createUrlParams } from "@/utils/helpers";

export interface Appointment {
    _id: string;
    employeeId: string;
    employee?: EmployeeDetails; // Populated employee details
    visitorId: string; // Reference to Visitor
    visitor?: VisitorDetails; // Populated visitor details
    accompaniedBy?: AccompaniedBy;
    accompanyingCount?: number;
    appointmentDetails: AppointmentDetails;
    status: "pending" | "approved" | "rejected" | "completed" | "time_out" | "checked_in";
    checkInTime?: string;
    checkOutTime?: string;
    checkInNotes?: string;
    checkOutNotes?: string;
    actualDuration?: number;
    securityDetails: SecurityDetails;
    notifications: NotificationPreferences;
    createdBy: string;
    isDeleted: boolean;
    deletedAt?: string | null;
    deletedBy?: string | null;
    createdAt: string;
    updatedAt: string;
    approvalLink?: string | null; // One-time approval link
    isTimedOut?: boolean;         // Computed by backend: pending/approved past their scheduled date
    isVerified?: boolean;
}

export interface EmployeeDetails {
    _id: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
    photo?: string;
    status: "Active" | "Inactive";
}

export interface VisitorDetails {
    name: string;
    email: string;
    phone: string;
    company: string;
    purposeOfVisit: string;
    photo?: string;
}

export interface AccompaniedBy {
    name: string;
    phone: string;
    relation: string;
    idProof: {
        type: string;
        number: string;
        image: string;
    };
}

export interface AppointmentDetails {
    purpose: string;
    scheduledDate: string;
    scheduledTime: string;
    notes: string;
    vehicleNumber?: string; // Optional vehicle number
    vehiclePhoto?: string; // Optional vehicle photo URL
}

export interface SecurityDetails {
    badgeIssued: boolean;
    badgeNumber: string;
    securityClearance: boolean;
    securityNotes: string;
}

export interface NotificationPreferences {
    smsSent: boolean;
    emailSent: boolean;
    whatsappSent: boolean;
    reminderSent: boolean;
}

export interface CreateAppointmentRequest {
    employeeId: string;
    visitorId: string; // Reference to Visitor
    accompaniedBy?: AccompaniedBy;
    accompanyingCount?: number;
    appointmentDetails: AppointmentDetails;
    securityDetails?: SecurityDetails;
    notifications?: NotificationPreferences;
    checkInTime?: string;
}

export interface LegacyCreateAppointmentRequest {
    visitorName: string;
    visitorEmail: string;
    visitorPhone: string;
    employeeId: string;
    purpose: string;
    appointmentDate: string;
    appointmentTime: string;
    notes?: string;
}

export interface UpdateAppointmentRequest {
    visitorId?: string; // Reference to Visitor
    employeeId?: string;
    purpose?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    notes?: string;
    status?: Appointment["status"];
}

export interface UpdateAppointmentStatusRequest {
    status: Appointment["status"];
}

export interface GetAppointmentsQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: Appointment["status"];
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    timezoneOffsetMinutes?: number;
}

export interface AppointmentListResponse {
    appointments: Appointment[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalAppointments: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface CheckInRequest {
    appointmentId: string;
    notes?: string;
    visitorPhoto?: string;
}

export interface CheckOutRequest {
    appointmentId: string;
    notes?: string;
}

export interface BulkUpdateAppointmentsRequest {
    appointmentIds: string[];
    status?: Appointment["status"];
    employeeId?: string;
    notes?: string;
}

export interface AppointmentStats {
    totalAppointments: number;
    pendingAppointments: number;
    approvedAppointments: number;
    rejectedAppointments: number;
    completedAppointments: number;
    checkedInAppointments: number;
    checkedOutAppointments: number;
    appointmentsByStatus: Array<{ status: string; count: number }>;
    appointmentsByEmployee: Array<{ employeeId: string; employeeName: string; count: number }>;
    appointmentsByDate: Array<{ date: string; count: number }>;
}

export interface DashboardStats {
    totalAppointments: number;
    pendingAppointments: number;
    approvedAppointments: number;
    rejectedAppointments: number;
    completedAppointments: number;
    checkedInAppointments: number;
    upcomingAppointments: number;
    todayAppointments: number;
}

export const appointmentApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        createAppointment: builder.mutation<Appointment, CreateAppointmentRequest>({
            query: (appointmentData) => ({
                url: "/appointments",
                method: "POST",
                body: appointmentData,
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            invalidatesTags: [{ type: "Appointment", id: "LIST" }, { type: "Subscription" }],
        }),

        getAppointments: builder.query<AppointmentListResponse, GetAppointmentsQuery | void>({
            query: (params) => {
                const timezoneOffsetMinutes =
                    params && typeof params.timezoneOffsetMinutes === "number"
                        ? params.timezoneOffsetMinutes
                        : -new Date().getTimezoneOffset();

                const queryParams = createUrlParams({
                    timezoneOffsetMinutes,
                    ...(params || {}),
                });
                const populateParams = "_populate=visitor,employee";
                return `/appointments?${populateParams}${queryParams ? `&${queryParams}` : ""}`;
            },
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    // Check if it's a paginated response from ResponseUtil.paginate
                    if (response.data.data && response.data.pagination) {
                        return {
                            appointments: response.data.data,
                            pagination: {
                                currentPage: response.data.pagination.page,
                                totalPages: response.data.pagination.pages,
                                totalAppointments: response.data.pagination.total,
                                hasNextPage: response.data.pagination.page < response.data.pagination.pages,
                                hasPrevPage: response.data.pagination.page > 1,
                            },
                        };
                    }
                    return response.data;
                }
                return response;
            },
            providesTags: (result) =>
                result?.appointments
                    ? [
                        ...result.appointments.map(({ _id }) => ({ type: "Appointment" as const, id: _id })),
                        { type: "Appointment", id: "LIST" },
                    ]
                    : [{ type: "Appointment", id: "LIST" }],
            keepUnusedDataFor: 300, // Keep data for 5 minutes
        }),

        // Optimized stats endpoint — accepts same filters as the appointments list
        getAppointmentStats: builder.query<{
            total: number;
            pending: number;
            approved: number;
            rejected: number;
            completed: number;
            checked_in: number;
            cancelled: number;
            time_out: number;
        }, { dateFrom?: string; dateTo?: string; search?: string; employeeId?: string } | void>({
            query: (params) => {
                const queryParams = createUrlParams(params || {});
                return queryParams
                    ? `/appointments/stats?${queryParams}`
                    : '/appointments/stats';
            },
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            providesTags: [{ type: 'Appointment', id: 'STATS' }],
            keepUnusedDataFor: 60, // Keep stats data for 1 minute
        }),

        getAppointment: builder.query<Appointment, string>({
            query: (id) => `/appointments/${id}`,
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            providesTags: (result, error, id) => [{ type: "Appointment", id }],
        }),

        updateAppointment: builder.mutation<Appointment, { id: string } & UpdateAppointmentRequest>({
            query: ({ id, ...appointmentData }) => ({
                url: `/appointments/${id}`,
                method: "PUT",
                body: appointmentData,
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            invalidatesTags: (result, error, { id }) => [
                { type: "Appointment", id },
                { type: "Appointment", id: "LIST" },
            ],
        }),

        deleteAppointment: builder.mutation<void, string>({
            query: (id) => ({
                url: `/appointments/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Appointment", id },
                { type: "Appointment", id: "LIST" },
                { type: "Subscription" },
            ],
        }),

        getAppointmentByAppointmentId: builder.query<Appointment, string>({
            query: (appointmentId) => `/appointments/appointment/${appointmentId}`,
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            providesTags: (result, error, appointmentId) => [{ type: "Appointment", id: appointmentId }],
        }),

        checkInAppointment: builder.mutation<Appointment, CheckInRequest>({
            query: (checkInData) => ({
                url: "/appointments/check-in",
                method: "POST",
                body: checkInData,
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            invalidatesTags: [{ type: "Appointment", id: "LIST" }],
        }),

        checkOutAppointment: builder.mutation<Appointment, CheckOutRequest>({
            query: (checkOutData) => ({
                url: "/appointments/check-out",
                method: "POST",
                body: checkOutData,
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            invalidatesTags: [{ type: "Appointment", id: "LIST" }],
        }),

        cancelAppointment: builder.mutation<Appointment, string>({
            query: (id) => ({
                url: `/appointments/${id}/cancel`,
                method: "PUT",
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            invalidatesTags: (result, error, id) => [
                { type: "Appointment", id },
                { type: "Appointment", id: "LIST" },
                { type: "Subscription" },
            ],
        }),

        approveAppointment: builder.mutation<Appointment, string>({
            query: (id) => ({
                url: `/appointments/${id}/approve`,
                method: "PUT",
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            invalidatesTags: (result, error, id) => [
                { type: "Appointment", id },
                { type: "Appointment", id: "LIST" },
                { type: "Subscription" },
            ],
        }),

        rejectAppointment: builder.mutation<Appointment, string>({
            query: (id) => ({
                url: `/appointments/${id}/reject`,
                method: "PUT",
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            invalidatesTags: (result, error, id) => [
                { type: "Appointment", id },
                { type: "Appointment", id: "LIST" },
                { type: "Subscription" },
            ],
        }),

        // Dashboard stats (unified for admin and employee)
        getDashboardStats: builder.query<DashboardStats, void>({
            query: () => "/appointments/dashboard/stats",
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            providesTags: ["DashboardStats"],
        }),
        resendAppointmentNotification: builder.mutation<any, string>({
            query: (id) => ({
                url: `/appointments/${id}/resend`,
                method: "POST",
            }),
            invalidatesTags: [],
        }),
        sendCheckInOtp: builder.mutation<any, string>({
            query: (id) => ({
                url: `/appointments/${id}/send-checkin-otp`,
                method: "POST",
            }),
        }),
        verifyCheckInOtp: builder.mutation<any, { id: string; otp: string }>({
            query: (data) => ({
                url: `/appointments/${data.id}/verify-checkin-otp`,
                method: "POST",
                body: { otp: data.otp },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Appointment", id },
                { type: "Appointment", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetAppointmentsQuery,
    useGetAppointmentStatsQuery,
    useGetAppointmentQuery,
    useCreateAppointmentMutation,
    useUpdateAppointmentMutation,
    useDeleteAppointmentMutation,
    useGetAppointmentByAppointmentIdQuery,
    useCheckInAppointmentMutation,
    useCheckOutAppointmentMutation,
    useCancelAppointmentMutation,
    useApproveAppointmentMutation,
    useRejectAppointmentMutation,
    useLazyGetAppointmentsQuery,
    useGetDashboardStatsQuery,
    useResendAppointmentNotificationMutation,
    useSendCheckInOtpMutation,
    useVerifyCheckInOtpMutation,
} = appointmentApi;
