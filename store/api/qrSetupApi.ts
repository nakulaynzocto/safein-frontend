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
    features?: {
        enableVisitorImageCapture: boolean;
        enableVerification: boolean;
        enableAutoApproval: boolean;
        enableVisitSlip?: boolean;
    };
    employees: Array<{
        _id: string;
        name: string;
        email: string;
        department: string;
        designation?: string;
        photo?: string;
    }>;
    holiday?: {
        isHoliday: boolean;
        reason?: string;
        message?: string;
        blockPortal?: boolean;
    };
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
            keepUnusedDataFor: 60, // Cache public info for 1 minute instead of 1 hour to reflect setting changes quickly
        }),
        sendQrPhoneOtp: builder.mutation<{ sent: boolean }, { slug: string; phone: string }>({
            query: ({ slug, phone }) => ({
                url: `/qr-setup/public/${encodeURIComponent(slug)}/phone/send-otp`,
                method: "POST",
                body: { phone },
            }),
            transformResponse: (response: any) => response?.data || response,
        }),
        verifyQrPhoneOtp: builder.mutation<{ verified: boolean; visitor?: any }, { slug: string; phone: string; otp: string }>({
            query: ({ slug, phone, otp }) => ({
                url: `/qr-setup/public/${encodeURIComponent(slug)}/phone/verify-otp`,
                method: "POST",
                body: { phone, otp },
            }),
            transformResponse: (response: any) => response?.data || response,
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
    useSendQrPhoneOtpMutation,
    useVerifyQrPhoneOtpMutation,
    useCreateVisitorThroughQRMutation,
    useCreateAppointmentThroughQRMutation,
} = qrSetupApi;
