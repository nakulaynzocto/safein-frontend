import { baseApi } from "./baseApi";

export interface QRConfig {
    slug: string;
}

export interface CompanyPublicInfo {
    company: {
        _id: string;
        companyName: string;
        profilePicture?: string;
        address?: {
            city?: string;
            state?: string;
            country?: string;
        };
    };
    employees: Array<{
        _id: string;
        name: string;
        email: string;
        department: string;
        designation?: string;
        photo?: string;
    }>;
}

export const qrSetupApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getQRConfig: builder.query<QRConfig, void>({
            query: () => "/qr-setup/config",
            transformResponse: (response: any) => response?.data || response,
            providesTags: ["QRSetup"],
        }),
        regenerateQRSlug: builder.mutation<QRConfig, { customSlug?: string }>({
            query: (data) => ({
                url: "/qr-setup/regenerate",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["QRSetup"],
        }),
        getPublicCompanyInfo: builder.query<CompanyPublicInfo, string>({
            query: (slug) => `/qr-setup/public/${slug}`,
            transformResponse: (response: any) => response?.data || response,
            keepUnusedDataFor: 3600, // Cache public info for 1 hour
        }),
        createVisitorThroughQR: builder.mutation<any, { slug: string; visitorData: any }>({
            query: ({ slug, visitorData }) => ({
                url: `/qr-setup/public/${slug}/visitor`,
                method: "POST",
                body: visitorData,
            }),
            transformResponse: (response: any) => response?.data || response,
        }),
        createAppointmentThroughQR: builder.mutation<any, { slug: string; appointmentData: any }>({
            query: ({ slug, appointmentData }) => ({
                url: `/qr-setup/public/${slug}/appointment`,
                method: "POST",
                body: appointmentData,
            }),
            transformResponse: (response: any) => response?.data || response,
        }),
    }),
});

export const {
    useGetQRConfigQuery,
    useRegenerateQRSlugMutation,
    useGetPublicCompanyInfoQuery,
    useCreateVisitorThroughQRMutation,
    useCreateAppointmentThroughQRMutation,
} = qrSetupApi;
