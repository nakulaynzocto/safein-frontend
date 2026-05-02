"use client";
 
import { useModuleGating } from "@/hooks/useModuleGating";
import { SMSSettings } from "@/components/settings/SMSSettings";
import { PageSkeleton } from "@/components/common/pageSkeleton";
import { ModuleAccessDenied } from "@/components/common/moduleAccessDenied";

export default function SMSSettingsPage() {
    const { isChecking, modules, isEmployee, isAuthenticated } = useModuleGating('enableSms');

    if (isChecking || !isAuthenticated) {
        return (
            <div className="container mx-auto max-w-full">
                <PageSkeleton type="form" />
            </div>
        );
    }

    if (isEmployee || (modules && !modules.enableSms)) {
        return (
            <ModuleAccessDenied 
                title="SMS Access Restricted"
                description="Your current plan does not include SMS notification capabilities. Please upgrade to send automated alerts and invites via SMS."
            />
        );
    }

    return <SMSSettings />;
}
