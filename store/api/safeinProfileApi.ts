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
}

export interface ISafeinProfileResponse {
    success: boolean;
    data: ISafeinProfile;
}

export const safeinProfileApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSafeinProfile: builder.query<ISafeinProfileResponse, void>({
            query: () => "/safein-profile",
            providesTags: ["Settings"],
        }),
    }),
});

export const { useGetSafeinProfileQuery } = safeinProfileApi;
