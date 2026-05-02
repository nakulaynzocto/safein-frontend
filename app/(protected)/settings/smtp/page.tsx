"use client";
 
import { useModuleGating } from "@/hooks/useModuleGating";
import { SMTPSettings } from "@/components/settings/SMTPSettings";
import { PageSkeleton } from "@/components/common/pageSkeleton";
import { ModuleAccessDenied } from "@/components/common/moduleAccessDenied";

export default function SMTPSettingsPage() {
    const { isChecking, modules, isEmployee, isAuthenticated } = useModuleGating('enableEmail');

    if (isChecking || !isAuthenticated) {
        return (
            <div className="container mx-auto max-w-full">
                <PageSkeleton type="form" />
            </div>
        );
    }

    if (isEmployee || (modules && !modules.enableEmail)) {
        return (
            <ModuleAccessDenied 
                title="Email Access Restricted"
                description="Your current plan does not include Custom SMTP/Email notification capabilities. Please upgrade to send automated alerts and invites via Email."
            />
        );
    }

    return <SMTPSettings />;
}
