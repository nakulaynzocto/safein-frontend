import { baseApi } from "./baseApi";

export interface ISafeinProfile {
    _id: string;
    name: string;
    cin?: string;
    email: string;
    phone?: string;
    logo?: string;
    companyDetails?: {
        name: string;
        cin?: string;
        email: string;
        phone?: string;
        logo?: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
        gstin?: string;
        pan?: string;
    };
    gstin?: string;
    pan?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
    };
    bankDetails?: {
        bankName?: string;
        accountNumber?: string;
        ifscCode?: string;
        branchName?: string;
        upiId?: string;
    };
    features?: {
        enableEmail: boolean;
        enableSms: boolean;
        enableWhatsApp: boolean;
        enableVoice: boolean;
        enableAutoApproval: boolean;
        enableVisitorImageCapture: boolean;

        enableMaintenanceMode: boolean;
        enableRegistration: boolean;
        enableFeedbackSystem: boolean;

        // Dynamic System Warning and Notes Controls
        enableExpiryWarning?: boolean;
        expiryWarningMessage?: string;
        enableSubscriptionEndingSoonWarning?: boolean;
        subscriptionEndingSoonWarningMessage?: string;
        subscriptionEndingSoonDays?: number;
        enableGlobalAlert?: boolean;
        globalAlertMessage?: string;
        enableLowWalletWarning?: boolean;
        lowWalletWarningMessage?: string;
        lowWalletWarningThreshold?: number;
    };
}

export interface ISafeinProfileResponse {
    success: boolean;
    data: ISafeinProfile;
}

export const safeinProfileApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSafeinProfile: builder.query<ISafeinProfileResponse, void>({
            query: () => "/safein-profile",
            providesTags: ["SafeinProfile"],
        }),
    }),
});

export const { useGetSafeinProfileQuery } = safeinProfileApi;
