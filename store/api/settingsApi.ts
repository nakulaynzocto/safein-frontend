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
    sms: boolean;
    voice: boolean;
}

export interface Holiday {
    date: string;
    reason?: string;
    message?: string;
    blockPortal?: boolean;
}

export interface EmailTemplate {
    subject: string;
    body: string;
}

export interface EmailTemplates {
    globalStyles: {
        primaryColor: string;
        textColor: string;
        headerBg: string;
        footerBg: string;
        footerText: string;
        logoUrl?: string;
    };
    templates: {
        appointmentApproval?: EmailTemplate;
        appointmentRejection?: EmailTemplate;
        newAppointmentRequest?: EmailTemplate;
        appointmentConfirmation?: EmailTemplate;
        appointmentLink?: EmailTemplate;
    };
    enabledTemplates?: Record<string, boolean>;
}

export interface Settings {
    _id: string;
    userId: string;
    companyName?: string;
    notifications: {
        emailEnabled: boolean;
        whatsappEnabled: boolean;
        smsEnabled: boolean;
        visitor: INotificationType;
        employee: INotificationType;
        appointment: INotificationType;
    };
    voiceCall: {
        enabled: boolean;
        backupEnabled: boolean;
        backupNumber?: string;
        maxRetries: number;
        language?: "en-US" | "hi-IN";
        callScript?: string;
        callScripts?: Record<string, string>;
        callOnLinkInvite?: boolean;
        callOnAdminEntry?: boolean;
        callOnQrCheckin?: boolean;
    };
    smtp?: SmtpConfig;
    sms?: {
        templates?: {
            newRequest?: string;
            approvedVisitor?: string;
            approvedEmployee?: string;
            rejectedVisitor?: string;
            visitorCheckedIn?: string;
        };
        enabledTemplates?: {
            newRequest?: boolean;
            approvedVisitor?: boolean;
            approvedEmployee?: boolean;
            rejectedVisitor?: boolean;
            visitorCheckedIn?: boolean;
        };
    };
    whatsapp: {
        activeProvider: "meta";
        senderNumber: string;
        testNumber?: string;
        phoneNumberId?: string;
        accessToken?: string;
        verified: boolean;
        metaVerified: boolean;
        verifiedAt?: string;
        enabledTemplates?: Record<string, boolean>;
    };
    features?: {
        enableAutoApproval: boolean;
        enableVisitorImageCapture: boolean;
        enableVerification: boolean;
        enableFeedbackSystem: boolean;
    };
    emailTemplates?: EmailTemplates;
    featureToggles?: Record<string, boolean>;
    holidays?: Holiday[];
    createdAt: string;
    updatedAt: string;
}

export interface UpdateSettingsRequest {
    notifications?: {
        emailEnabled?: boolean;
        whatsappEnabled?: boolean;
        smsEnabled?: boolean;
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
        enabledTemplates?: Record<string, boolean>;
    };
    voiceCall?: {
        enabled?: boolean;
        backupEnabled?: boolean;
        backupNumber?: string;
        maxRetries?: number;
        language?: "en-US" | "hi-IN";
        callScript?: string;
        callScripts?: Record<string, string>;
        callOnLinkInvite?: boolean;
        callOnAdminEntry?: boolean;
        callOnQrCheckin?: boolean;
    };
    emailTemplates?: Partial<EmailTemplates>;
    features?: {
        enableAutoApproval?: boolean;
        enableVisitorImageCapture?: boolean;
        enableVerification?: boolean;
        enableFeedbackSystem?: boolean;
    };
    sms?: {
        enabledTemplates?: Record<string, boolean>;
    };
    holidays?: Holiday[];
}

export interface SaveVoiceConfigRequest {
    enabled: boolean;
    backupEnabled: boolean;
    backupNumber?: string;
    maxRetries: number;
    language: "en-US" | "hi-IN";
    callScript: string;
    callScripts?: Record<string, string>;
    callOnLinkInvite: boolean;
    callOnAdminEntry: boolean;
    callOnQrCheckin: boolean;
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

export interface SaveSmsRequest {
    templates: {
        newRequest: string;
        approvedVisitor: string;
        approvedEmployee: string;
        rejectedVisitor: string;
        visitorCheckedIn: string;
    };
    enabledTemplates: {
        newRequest: boolean;
        approvedVisitor: boolean;
        approvedEmployee: boolean;
        rejectedVisitor: boolean;
        visitorCheckedIn: boolean;
    };
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
            onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
                // Optimistic Update
                const patchResult = dispatch(
                    settingsApi.util.updateQueryData("getSettings", undefined, (draft) => {
                        if (arg.notifications) {
                            if (arg.notifications.emailEnabled !== undefined) draft.notifications.emailEnabled = arg.notifications.emailEnabled;
                            if (arg.notifications.whatsappEnabled !== undefined) draft.notifications.whatsappEnabled = arg.notifications.whatsappEnabled;
                            if (arg.notifications.smsEnabled !== undefined) draft.notifications.smsEnabled = arg.notifications.smsEnabled;
                            
                            // Merge categories
                            const cats = ['visitor', 'employee', 'appointment'] as const;
                            cats.forEach(cat => {
                                if (arg.notifications?.[cat]) {
                                    Object.assign(draft.notifications[cat], arg.notifications[cat]);
                                }
                            });
                        }
                        if (arg.voiceCall) {
                            Object.assign(draft.voiceCall, arg.voiceCall);
                        }
                        if (arg.whatsapp) {
                            Object.assign(draft.whatsapp, arg.whatsapp);
                        }
                        if (arg.features) {
                            if (!draft.features) {
                                draft.features = {
                                    enableAutoApproval: false,
                                    enableVisitorImageCapture: false,
                                    enableVerification: false,
                                    enableFeedbackSystem: false,
                                };
                            }
                            Object.assign(draft.features, arg.features);
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
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

        saveSMSConfig: builder.mutation<Settings, SaveSmsRequest>({
            query: (body) => ({ url: "/settings/sms", method: "POST", body }),
            transformResponse: (res: any) => res?.data ?? res,
            invalidatesTags: ["Settings"],
        }),
        removeSMSConfig: builder.mutation<Settings, void>({
            query: () => ({ url: "/settings/sms", method: "DELETE" }),
            transformResponse: (res: any) => res?.data ?? res,
            invalidatesTags: ["Settings"],
        }),
        saveVoiceConfig: builder.mutation<Settings, SaveVoiceConfigRequest>({
            query: (body) => ({ url: "/settings/voice-call", method: "POST", body }),
            transformResponse: (res: any) => res?.data ?? res,
            invalidatesTags: ["Settings"],
        }),
        getVoiceDefaults: builder.query<{ scripts: Record<string, string> }, void>({
            query: () => "/settings/voice-call/defaults",
            transformResponse: (res: any) => res?.data ?? res,
        }),
        saveEmailTemplates: builder.mutation<Settings, EmailTemplates>({
            query: (body) => ({ url: "/settings/email-templates", method: "POST", body }),
            transformResponse: (res: any) => res?.data ?? res,
            invalidatesTags: ["Settings"],
        }),
        getEmailTemplateDefaults: builder.query<{ templates: Record<string, EmailTemplate>; globalStyles: any }, void>({
            query: () => "/settings/email-templates/defaults",
            transformResponse: (res: any) => res?.data ?? res,
        }),
    }),
});

export const {
    useGetSettingsQuery,
    useUpdateSettingsMutation,
    useInitiateWhatsAppVerificationMutation,
    useConfirmWhatsAppVerificationMutation,
    useSaveSMTPConfigMutation,
    useSaveSMSConfigMutation,
    useRemoveSMSConfigMutation,
    useSaveVoiceConfigMutation,
    useGetVoiceDefaultsQuery,
    useSaveEmailTemplatesMutation,
    useGetEmailTemplateDefaultsQuery,
} = settingsApi;
