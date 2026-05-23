"use client";
 
import { useModuleGating } from "@/hooks/useModuleGating";
import { WhatsAppSettings } from "@/components/settings/WhatsAppSettings";
import { PageSkeleton } from "@/components/common/pageSkeleton";
import { useGetWalletBalanceQuery } from "@/store/api/walletApi";
import { ModuleAccessDenied } from "@/components/common/moduleAccessDenied";

export default function WhatsAppConfigPage() {
    const { isChecking, modules, isEmployee, isAuthenticated } = useModuleGating('enableWhatsApp');
    const { data: walletData } = useGetWalletBalanceQuery();

    if (isChecking || !isAuthenticated) {
        return (
            <div className="container mx-auto max-w-full">
                <PageSkeleton type="form" />
            </div>
        );
    }

    if (isEmployee || (modules && !modules.enableWhatsApp)) {
        return (
            <ModuleAccessDenied 
                title="WhatsApp Access Restricted"
                description="Your current plan does not include WhatsApp notification capabilities. Please upgrade to send automated alerts and invites via WhatsApp."
            />
        );
    }

    return <WhatsAppSettings walletData={walletData} />;
}
