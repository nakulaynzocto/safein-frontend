import { baseApi } from "./baseApi";

export const inquiryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        submitInquiry: builder.mutation<any, any>({
            query: (body) => ({
                url: `${process.env.NEXT_PUBLIC_SUPER_ADMIN_API_URL || "https://dev.backend.admin.aynzo.com/api"}/inquiries/contact`,
                method: "POST",
                body: { ...body, source: "safein" },
            }),
        }),
    }),
});

export const { useSubmitInquiryMutation } = inquiryApi;
