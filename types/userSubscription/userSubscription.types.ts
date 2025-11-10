// frontend-appointment-system/types/userSubscription/userSubscription.types.ts

export interface IUserSubscriptionResponse {
    _id: string;
    userId: string;
    planType: 'free' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    paymentStatus: 'pending' | 'succeeded' | 'failed' | 'cancelled';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    trialDays: number;
    isTrialing: boolean; // Derived field
    isDeleted: boolean;
    deletedAt?: Date;
    deletedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}



