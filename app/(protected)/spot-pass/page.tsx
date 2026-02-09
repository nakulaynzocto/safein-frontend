"use client";

import { Suspense } from "react";
import { SpotPassList } from "@/components/spot-pass/SpotPassList";
import { PageSkeleton } from "@/components/common/pageSkeleton";

export default function SpotPassPage() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <SpotPassList />
        </Suspense>
    );
}
