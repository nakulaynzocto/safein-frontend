"use client";

import { Suspense } from "react";
import { SpotPassCreateForm } from "@/components/spot-pass/SpotPassCreateForm";
import { PageSkeleton } from "@/components/common/pageSkeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { ModuleAccessDenied } from "@/components/common/moduleAccessDenied";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { useEffect } from "react";
import { routes } from "@/utils/routes";

export default function CreateSpotPassPage() {
    const router = useRouter();
    const { user, subscriptionLimits, isLoading: isAuthLoading, isAuthenticated } = useAuthSubscription();
    const isEmployee = checkIsEmployee(user);

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            router.replace(routes.publicroute.LOGIN);
            return;
        }

        if (!isAuthLoading && isEmployee) {
            router.replace(routes.privateroute.DASHBOARD);
            return;
        }
    }, [isAuthLoading, isAuthenticated, isEmployee, router]);

    const spotPassLimit = subscriptionLimits?.limits?.spotPasses;
    const canCreate = spotPassLimit?.canCreate ?? true;
    const isLimitReached = spotPassLimit?.reached ?? false;

    const isExpired = subscriptionLimits?.isExpired;

    if (isAuthLoading || !isAuthenticated || isEmployee) {
        return (
            <div className="container mx-auto max-w-full py-3 sm:py-4 flex justify-center items-center h-[50vh]">
                <PageSkeleton />
            </div>
        );
    }

    // Non-blocking UI update: Limits handled inside SpotPassCreateForm button state.

    return (
        <div className="container mx-auto max-w-full py-3 sm:py-4">
            <div className="mb-4 flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-xl bg-background hover:bg-accent/50"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Button>
                <div>
                    <h1 className="text-foreground text-lg leading-tight font-semibold">Generate Spot Pass</h1>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                        Create instant walking-in entry for visitor.
                    </p>
                </div>
            </div>
            <Suspense fallback={<PageSkeleton />}>
                <SpotPassCreateForm />
            </Suspense>
        </div>
    );
}
