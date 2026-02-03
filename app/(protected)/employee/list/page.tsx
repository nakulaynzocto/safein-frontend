"use client";

import { Suspense, lazy, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { PageSkeleton } from "@/components/common/pageSkeleton";
import { ProtectedLayout } from "@/components/layout/protectedLayout";
import { routes } from "@/utils/routes";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmployeeList = lazy(() =>
    import("@/components/employee/employeeList").then((module) => ({ default: module.EmployeeList })),
);

export default function EmployeeListPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const [isChecking, setIsChecking] = useState(true);
    const isEmployee = checkIsEmployee(user);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push(routes.publicroute.LOGIN);
            return;
        }

        if (isEmployee) {
            router.push(routes.privateroute.DASHBOARD);
            return;
        }

        setIsChecking(false);
    }, [user, isAuthenticated, router, isEmployee]);

    if (!isAuthenticated || isChecking) {
        return (
            <ProtectedLayout>
                <div className="flex min-h-screen items-center justify-center">
                    <LoadingSpinner />
                </div>
            </ProtectedLayout>
        );
    }

    if (isEmployee) {
        return (
            <ProtectedLayout>
                <div className="flex min-h-screen items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                Access Denied
                            </CardTitle>
                            <CardDescription>You don't have permission to access this page</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Alert variant="destructive">
                                <AlertDescription>
                                    Employee management is only accessible to administrators.
                                </AlertDescription>
                            </Alert>
                            <div className="mt-4">
                                <Button
                                    onClick={() => router.push(routes.privateroute.DASHBOARD)}
                                    className="w-full"
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ProtectedLayout>
        );
    }

    return (
        <Suspense fallback={<PageSkeleton />}>
            <EmployeeList />
        </Suspense>
    );
}
