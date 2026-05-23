"use client";
 
import { useModuleGating } from "@/hooks/useModuleGating";
import { VoiceCallSettings } from "@/components/settings/VoiceCallSettings";
import { useGetWalletBalanceQuery } from "@/store/api/walletApi";
import { PageSkeleton } from "@/components/common/pageSkeleton";
import { ModuleAccessDenied } from "@/components/common/moduleAccessDenied";

export default function VoiceSettingsPage() {
    const { isChecking, modules, isEmployee, isAuthenticated } = useModuleGating('enableVoice');
    const { data: walletData } = useGetWalletBalanceQuery();

    if (isChecking || !isAuthenticated) {
        return (
            <div className="container mx-auto max-w-full">
                <PageSkeleton type="form" />
            </div>
        );
    }

    if (isEmployee || (modules && !modules.enableVoice)) {
        return (
            <ModuleAccessDenied 
                title="Voice Call Access Restricted"
                description="Your current plan does not include automated Voice Call capabilities. Please upgrade to enable host calling features for your premises."
            />
        );
    }
    
    return <VoiceCallSettings walletData={walletData} />;
}
