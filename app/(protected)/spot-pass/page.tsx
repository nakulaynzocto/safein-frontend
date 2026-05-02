"use client";
 
import { Suspense } from "react";
import { SpotPassList } from "@/components/spot-pass/SpotPassList";
import { PageSkeleton } from "@/components/common/pageSkeleton";
import { useModuleGating } from "@/hooks/useModuleGating";
import { ModuleAccessDenied } from "@/components/common/moduleAccessDenied";

export default function SpotPassPage() {
    const { isChecking, modules } = useModuleGating('enableSpotPass');

    if (isChecking) {
        return (
            <div className="container mx-auto p-4 lg:p-8">
                <PageSkeleton type="table" />
            </div>
        );
    }

    if (modules && !modules.enableSpotPass) {
        return (
            <ModuleAccessDenied 
                title="Spot Pass Access Restricted"
                description="Your current plan does not include Spot Pass capabilities. Please upgrade to manage walk-in visitors efficiently."
            />
        );
    }

    return (
        <Suspense fallback={<PageSkeleton type="table" />}>
            <SpotPassList />
        </Suspense>
    );
}
