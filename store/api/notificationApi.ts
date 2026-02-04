import { baseApi } from "./baseApi";
import { createUrlParams } from "@/utils/helpers";

export interface Notification {
    _id: string;
    userId: string;
    type: "appointment_approved" | "appointment_rejected" | "appointment_created" | "appointment_deleted" | "appointment_status_changed" | "general";
    title: string;
    message: string;
    read: boolean;
    readAt?: string | null;
    appointmentId?: string;
    metadata?: {
        [key: string]: any;
    };
    createdAt: string;
    updatedAt: string;
}

export interface GetNotificationsQuery {
    page?: number;
    limit?: number;
    read?: boolean;
    type?: Notification["type"];
}

export interface NotificationListResponse {
    notifications: Notification[];
    unreadCount: number;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalNotifications: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface UnreadCountResponse {
    unreadCount: number;
}

export const notificationApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getNotifications: builder.query<NotificationListResponse, GetNotificationsQuery | void>({
            query: (params) => {
                const queryParams = createUrlParams(params || {});
                return `/notifications${queryParams ? `?${queryParams}` : ""}`;
            },
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            providesTags: (result) =>
                result?.notifications
                    ? [
                        ...result.notifications.map(({ _id }) => ({ type: "Notification" as const, id: _id })),
                        { type: "Notification", id: "LIST" },
                    ]
                    : [{ type: "Notification", id: "LIST" }],
            keepUnusedDataFor: 60, // Keep data for 1 minute
        }),

        getUnreadCount: builder.query<UnreadCountResponse, void>({
            query: () => "/notifications/unread-count",
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            providesTags: [{ type: "Notification", id: "UNREAD_COUNT" }],
            keepUnusedDataFor: 30, // Keep data for 30 seconds
        }),

        markAsRead: builder.mutation<Notification, string>({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: "PATCH",
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            invalidatesTags: (result, error, id) => [
                { type: "Notification", id },
                { type: "Notification", id: "LIST" },
                { type: "Notification", id: "UNREAD_COUNT" },
            ],
        }),

        markAllAsRead: builder.mutation<{ count: number }, void>({
            query: () => ({
                url: "/notifications/read-all",
                method: "PATCH",
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            invalidatesTags: [
                { type: "Notification", id: "LIST" },
                { type: "Notification", id: "UNREAD_COUNT" },
            ],
        }),

        deleteNotification: builder.mutation<void, string>({
            query: (id) => ({
                url: `/notifications/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Notification", id },
                { type: "Notification", id: "LIST" },
                { type: "Notification", id: "UNREAD_COUNT" },
            ],
        }),

        deleteAllNotifications: builder.mutation<{ count: number }, void>({
            query: () => ({
                url: "/notifications",
                method: "DELETE",
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            invalidatesTags: [
                { type: "Notification", id: "LIST" },
                { type: "Notification", id: "UNREAD_COUNT" },
            ],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useGetUnreadCountQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation,
    useDeleteAllNotificationsMutation,
} = notificationApi;

