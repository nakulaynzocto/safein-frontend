"use client";

import { PageSkeleton } from "@/components/common/pageSkeleton";
import { Suspense, lazy } from "react";

const AppointmentList = lazy(() =>
    import("@/components/appointment/appointmentList").then((module) => ({ default: module.AppointmentList })),
);

export default function AppointmentListPage() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <AppointmentList />
        </Suspense>
    );
}
