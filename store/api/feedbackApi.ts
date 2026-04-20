import { baseApi } from "./baseApi";

export interface IFeedbackSubmitRequest {
    appointmentId: string;
    rating: number;
    comments?: string;
}

export const feedbackApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        submitFeedback: builder.mutation<any, IFeedbackSubmitRequest>({
            query: ({ appointmentId, ...data }) => ({
                url: `/feedback/public/${appointmentId}`,
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const { useSubmitFeedbackMutation } = feedbackApi;
