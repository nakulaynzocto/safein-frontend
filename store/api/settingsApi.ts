import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SmtpConfig {
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    pass?: string;         // always masked in API responses
    fromName?: string;
    fromEmail?: string;
    verified?: boolean;
    verifiedAt?: string;
}

export interface INotificationType {
    email: boolean;
    whatsapp: boolean;
}

export interface Settings {
    _id: string;
    userId: string;
    notifications: {
        emailEnabled: boolean;
        whatsappEnabled: boolean;
        visitor: INotificationType;
        employee: INotificationType;
        appointment: INotificationType;
    };
    smtp?: SmtpConfig;
    whatsapp: {
        activeProvider: "meta";
        senderNumber: string;
        testNumber?: string;
        phoneNumberId?: string;
        accessToken?: string;
        verified: boolean;
        metaVerified: boolean;
        verifiedAt?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface UpdateSettingsRequest {
    notifications?: {
        emailEnabled?: boolean;
        whatsappEnabled?: boolean;
        visitor?: Partial<INotificationType>;
        employee?: Partial<INotificationType>;
        appointment?: Partial<INotificationType>;
    };
    whatsapp?: {
        activeProvider?: "meta";
        senderNumber?: string;
        testNumber?: string;
        phoneNumberId?: string;
        accessToken?: string;
    };
}

export interface SaveSmtpRequest {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromName: string;
    fromEmail: string;
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const settingsApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        // General settings
        getSettings: builder.query<Settings, void>({
            query: () => "/settings",
            transformResponse: (res: any) => res?.data ?? res,
            providesTags: ["Settings"],
        }),
        updateSettings: builder.mutation<Settings, UpdateSettingsRequest>({
            query: (body) => ({ url: "/settings", method: "PUT", body }),
            transformResponse: (res: any) => res?.data ?? res,
            invalidatesTags: ["Settings"],
        }),

        // WhatsApp verification
        initiateWhatsAppVerification: builder.mutation<void, any>({
            query: (body) => ({ url: "/settings/whatsapp/verify/initiate", method: "POST", body }),
            invalidatesTags: ["Settings"],
        }),
        confirmWhatsAppVerification: builder.mutation<Settings, { otp: string }>({
            query: (body) => ({ url: "/settings/whatsapp/verify/confirm", method: "POST", body }),
            transformResponse: (res: any) => res?.data ?? res,
            invalidatesTags: ["Settings"],
        }),

        // SMTP configuration
        saveSMTPConfig: builder.mutation<Settings, SaveSmtpRequest>({
            query: (body) => ({ url: "/settings/smtp", method: "POST", body }),
            transformResponse: (res: any) => res?.data ?? res,
            invalidatesTags: ["Settings"],
        }),
    }),
});

export const {
    useGetSettingsQuery,
    useUpdateSettingsMutation,
    useInitiateWhatsAppVerificationMutation,
    useConfirmWhatsAppVerificationMutation,
    useSaveSMTPConfigMutation,
} = settingsApi;
