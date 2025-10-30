import { baseApi } from './baseApi'
import { createUrlParams } from '@/utils/helpers'

// Visitor interfaces matching the backend types
export interface Visitor {
  _id: string
  visitorId?: string // Add visitorId field
  name: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    country: string
  }
  idProof: {
    type: string
    number: string
    image?: string
  }
  photo?: string
  createdBy: string
  isDeleted: boolean
  deletedAt?: string | null
  deletedBy?: string | null
  createdAt: string
  updatedAt: string
}

export interface VisitorSearchRequest {
  phone?: string
  email?: string
}

export interface VisitorSearchResponse {
  visitors: Visitor[]
  found: boolean
  message: string
}

export interface CreateVisitorRequest {
  name: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    country: string
  }
  idProof: {
    type: string
    number: string
    image?: string
  }
  photo?: string
}

export interface UpdateVisitorRequest {
  name?: string
  email?: string
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
  }
  idProof?: {
    type?: string
    number?: string
    image?: string
  }
  photo?: string
}

export interface GetVisitorsQuery {
  page?: number
  limit?: number
  search?: string
  startDate?: string
  endDate?: string
  city?: string
  state?: string
  country?: string
  idProofType?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface VisitorListResponse {
  visitors: Visitor[]
  pagination: {
    currentPage: number
    totalPages: number
    totalVisitors: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface VisitorStats {
  totalVisitors: number
  deletedVisitors: number
  visitorsByCity: Array<{
    city: string
    count: number
  }>
  visitorsByState: Array<{
    state: string
    count: number
  }>
  visitorsByCountry: Array<{
    country: string
    count: number
  }>
  visitorsByIdProofType: Array<{
    idProofType: string
    count: number
  }>
}

export interface BulkUpdateVisitorsRequest {
  visitorIds: string[]
}

export const visitorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createVisitor: builder.mutation<Visitor, CreateVisitorRequest>({
      query: (visitorData) => ({
        url: '/visitors',
        method: 'POST',
        body: visitorData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: [{ type: 'Visitor' as const, id: 'LIST' }],
    }),

    getVisitors: builder.query<VisitorListResponse, GetVisitorsQuery | void>({
      query: (params) => {
        const queryParams = createUrlParams(params || {})
        return `/visitors${queryParams ? `?${queryParams}` : ''}`
      },
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: (result) =>
        result?.visitors
          ? [
              ...result.visitors.map(({ _id }) => ({ type: 'Visitor' as const, id: _id })),
              { type: 'Visitor' as const, id: 'LIST' },
            ]
          : [{ type: 'Visitor' as const, id: 'LIST' }],
      keepUnusedDataFor: 300, // Keep data for 5 minutes
    }),

    getVisitor: builder.query<Visitor, string>({
      query: (id) => `/visitors/${id}`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: (result, error, id) => [{ type: 'Visitor' as const, id }],
    }),

    searchVisitors: builder.mutation<VisitorSearchResponse, VisitorSearchRequest>({
      query: (searchData) => ({
        url: '/visitors/search',
        method: 'POST',
        body: searchData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
    }),

    updateVisitor: builder.mutation<Visitor, { id: string } & UpdateVisitorRequest>({
      query: ({ id, ...visitorData }) => ({
        url: `/visitors/${id}`,
        method: 'PUT',
        body: visitorData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Visitor' as const, id },
        { type: 'Visitor' as const, id: 'LIST' },
      ],
    }),

    deleteVisitor: builder.mutation<void, string>({
      query: (id) => ({
        url: `/visitors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Visitor' as const, id },
        { type: 'Visitor' as const, id: 'LIST' },
      ],
    }),

    restoreVisitor: builder.mutation<Visitor, string>({
      query: (id) => ({
        url: `/visitors/${id}/restore`,
        method: 'PUT',
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Visitor' as const, id },
        { type: 'Visitor' as const, id: 'LIST' },
        { type: 'Visitor' as const, id: 'TRASHED' },
      ],
    }),

    getTrashedVisitors: builder.query<VisitorListResponse, GetVisitorsQuery | void>({
      query: (params) => {
        const queryParams = createUrlParams(params || {})
        return `/visitors/trashed${queryParams ? `?${queryParams}` : ''}`
      },
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: (result) =>
        result?.visitors
          ? [
              ...result.visitors.map(({ _id }) => ({ type: 'Visitor' as const, id: _id })),
              { type: 'Visitor' as const, id: 'TRASHED' },
            ]
          : [{ type: 'Visitor' as const, id: 'TRASHED' }],
    }),

    getVisitorStats: builder.query<VisitorStats, void>({
      query: () => '/visitors/stats',
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      providesTags: [{ type: 'Visitor' as const, id: 'STATS' }],
    }),

    bulkUpdateVisitors: builder.mutation<{ updatedCount: number }, BulkUpdateVisitorsRequest>({
      query: (bulkData) => ({
        url: '/visitors/bulk-update',
        method: 'PUT',
        body: bulkData,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data
        }
        return response
      },
      invalidatesTags: [{ type: 'Visitor' as const, id: 'LIST' }],
    }),
  }),
})

export const {
  useCreateVisitorMutation,
  useGetVisitorsQuery,
  useGetVisitorQuery,
  useSearchVisitorsMutation,
  useUpdateVisitorMutation,
  useDeleteVisitorMutation,
  useRestoreVisitorMutation,
  useGetTrashedVisitorsQuery,
  useGetVisitorStatsQuery,
  useBulkUpdateVisitorsMutation,
} = visitorApi
