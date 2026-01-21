import { baseApi } from "./baseApi";

const SUPER_ADMIN_API_URL =
    process.env.NEXT_PUBLIC_SUPER_ADMIN_API_URL &&
        process.env.NEXT_PUBLIC_SUPER_ADMIN_API_URL !== "undefined"
        ? process.env.NEXT_PUBLIC_SUPER_ADMIN_API_URL
        : "https://dev.backend.admin.aynzo.com/api";

export const inquiryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        submitInquiry: builder.mutation<any, any>({
            query: (body) => ({
                url: `${SUPER_ADMIN_API_URL}/inquiries/contact`,
                method: "POST",
                body: { ...body, source: "safein" },
            }),
        }),
    }),
});

export const { useSubmitInquiryMutation } = inquiryApi;
