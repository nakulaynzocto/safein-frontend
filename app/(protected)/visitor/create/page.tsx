"use client";

import { useEffect } from "react";
import { VisitorRegister } from "@/components/visitor/visitorRegister";
import { CreateVisitorRequest } from "@/store/api/visitorApi";
import { useRouter } from "next/navigation";
import { routes } from "@/utils/routes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { LoadingSpinner } from "@/components/common/loadingSpinner";

// Page: VisitorCreate (non-modal page version)
// Employees are not allowed to access this page
export default function VisitorCreatePage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const isEmployee = checkIsEmployee(user);

    useEffect(() => {
        // Redirect if not authenticated
        if (!isAuthenticated) {
            router.replace(routes.publicroute.LOGIN);
            return;
        }

        // Redirect employees to dashboard - they cannot access visitor registration
        if (isEmployee) {
            router.replace(routes.privateroute.DASHBOARD);
            return;
        }
    }, [isEmployee, isAuthenticated, router]);

    // Show loading while checking authentication or if employee tries to access
    if (!isAuthenticated || isEmployee) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const handleVisitorComplete = (visitorData: CreateVisitorRequest) => {
        router.push(routes.privateroute.VISITORLIST);
    };

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
                    <h1 className="text-foreground text-lg leading-tight font-semibold">Register New Visitor</h1>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                        Enter visitor details, address, ID proof, and optional notes to register them in the system
                    </p>
                </div>
            </div>
            <div className="w-full">
                <VisitorRegister onComplete={handleVisitorComplete} standalone={true} />
            </div>
        </div>
    );
}
