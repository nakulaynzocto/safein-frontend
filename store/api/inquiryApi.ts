import { baseApi } from "./baseApi";

export const inquiryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        submitInquiry: builder.mutation<any, any>({
            query: (body) => ({
                url: "/inquiries",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const { useSubmitInquiryMutation } = inquiryApi;
