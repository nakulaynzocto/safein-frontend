import { baseApi } from "./baseApi";
import { createUrlParams } from "@/utils/helpers";

export interface SpotPass {
    _id: string;
    visitorId: string;
    businessId: string;
    name: string;
    phone: string;
    gender: string;
    address: string;
    photo?: string;
    vehicleNumber?: string;
    notes?: string;
    employeeId?: { _id: string; name: string; photo?: string } | string;
    checkInTime: string;
    checkOutTime?: string;
    status: "checked-in" | "checked-out";
    createdAt: string;
    updatedAt: string;
}

export interface CreateSpotPassRequest {
    name: string;
    phone: string;
    gender: string;
    address: string;
    photo?: string;
    vehicleNumber?: string;
    notes?: string;
    employeeId?: string;
}

export interface GetSpotPassesQuery {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface SpotPassListResponse {
    spotPasses: SpotPass[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalPasses: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export const spotPassApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        createSpotPass: builder.mutation<SpotPass, CreateSpotPassRequest>({
            query: (data) => ({
                url: "/spot-passes",
                method: "POST",
                body: data,
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            invalidatesTags: [{ type: "SpotPass" as const, id: "LIST" }],
        }),

        getSpotPasses: builder.query<SpotPassListResponse, GetSpotPassesQuery | void>({
            query: (params) => {
                const queryParams = createUrlParams(params || {});
                return `/spot-passes${queryParams ? `?${queryParams}` : ""}`;
            },
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            providesTags: (result) =>
                result?.spotPasses
                    ? [
                        ...result.spotPasses.map(({ _id }) => ({ type: "SpotPass" as const, id: _id })),
                        { type: "SpotPass" as const, id: "LIST" },
                    ]
                    : [{ type: "SpotPass" as const, id: "LIST" }],
        }),

        checkOutPass: builder.mutation<SpotPass, string>({
            query: (id) => ({
                url: `/spot-passes/${id}/checkout`,
                method: "PATCH",
            }),
            transformResponse: (response: any) => {
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            invalidatesTags: (result, error, id) => [
                { type: "SpotPass" as const, id },
                { type: "SpotPass" as const, id: "LIST" },
            ],
        }),

        deletePass: builder.mutation<void, string>({
            query: (id) => ({
                url: `/spot-passes/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "SpotPass" as const, id },
                { type: "SpotPass" as const, id: "LIST" },
            ],
        }),
    }),
});

export const {
    useCreateSpotPassMutation,
    useGetSpotPassesQuery,
    useCheckOutPassMutation,
    useDeletePassMutation,
} = spotPassApi;
