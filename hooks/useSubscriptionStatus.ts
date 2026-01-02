import { useGetTrialLimitsStatusQuery } from "@/store/api/userSubscriptionApi";
import { useMemo, useCallback } from "react";

export type ResourceType = 'employees' | 'visitors' | 'appointments';

export function useSubscriptionStatus() {
    const { data: trialStatus, isLoading, error, refetch } = useGetTrialLimitsStatusQuery();

    const isExpired = useMemo(() => trialStatus?.data?.isExpired || false, [trialStatus]);
    const isTrial = useMemo(() => trialStatus?.data?.isTrial || false, [trialStatus]);
    const planType = useMemo(() => trialStatus?.data?.planType || 'none', [trialStatus]);

    const checkLimit = useCallback((type: ResourceType) => {
        const limitInfo = trialStatus?.data?.limits[type];

        return {
            reached: limitInfo?.reached || false,
            canCreate: limitInfo?.canCreate || false,
            current: limitInfo?.current || 0,
            limit: limitInfo?.limit || -1
        };
    }, [trialStatus]);

    const limits = useMemo(() => ({
        appointments: checkLimit('appointments'),
        employees: checkLimit('employees'),
        visitors: checkLimit('visitors')
    }), [checkLimit]);

    return {
        trialStatus: trialStatus?.data,
        isLoading,
        error,
        refetch,
        isExpired,
        isTrial,
        planType,
        checkLimit,
        hasReachedAppointmentLimit: limits.appointments.reached,
        hasReachedEmployeeLimit: limits.employees.reached,
        hasReachedVisitorLimit: limits.visitors.reached,
        limits
    };
}
