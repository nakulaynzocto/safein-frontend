import { baseApi } from "./baseApi";
import { API_URL } from "@/lib/api-config";

export const inquiryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        submitInquiry: builder.mutation<any, any>({
            query: (body) => ({
                url: `${API_URL}/inquiries/contact`,
                method: "POST",
                body: { ...body, source: "safein" },
            }),
        }),
    }),
});

export const { useSubmitInquiryMutation } = inquiryApi;
