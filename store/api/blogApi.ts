import { baseApi } from "./baseApi";
import { API_URL } from "@/lib/api-config";

export interface Blog {
    _id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    isNoIndex?: boolean;
    isNoFollow?: boolean;
    faqs?: { question: string; answer: string }[];
    createdAt: string;
    updatedAt: string;
}

export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface PaginatedBlogsResponse {
    blogs: Blog[];
    pagination: PaginationInfo;
}

export interface GetBlogsQueryArgs {
    page?: number;
    limit?: number;
    status?: string;
}

export const blogApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPublicBlogs: builder.query<PaginatedBlogsResponse, GetBlogsQueryArgs | void>({
            query: (args) => ({
                url: `${API_URL}/blogs`,
                params: {
                    status: 'PUBLISHED',
                    page: args?.page || 1,
                    limit: args?.limit || 9,
                },
            }),
            transformResponse: (response: any) => ({
                blogs: response.data?.blogs || [],
                pagination: response.data?.pagination || { total: 0, page: 1, limit: 9, pages: 0 },
            }),
            providesTags: (result) =>
                result?.blogs
                    ? [
                          ...result.blogs.map(({ _id }) => ({ type: "Blog" as const, id: _id })),
                          { type: "Blog", id: "LIST" },
                      ]
                    : [{ type: "Blog", id: "LIST" }],
        }),
        getPublicBlogBySlug: builder.query<Blog, string>({
            query: (slug) => `${API_URL}/blogs/slug/${slug}`,
            transformResponse: (response: any) => response.data || null,
            providesTags: (result, error, slug) => [{ type: "Blog", id: slug }],
        }),
    }),
    overrideExisting: true,
});

export const { useGetPublicBlogsQuery, useGetPublicBlogBySlugQuery } = blogApi;
