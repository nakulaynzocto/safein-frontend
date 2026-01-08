"use client";

import { useParams } from "next/navigation";
import { NewVisitorModal } from "@/components/visitor/VisitorForm";

export default function VisitorEditPage() {
    const params = useParams();
    const visitorId = params.id as string;

    if (!visitorId) {
        return (
            <div className="container mx-auto max-w-4xl py-3 sm:py-4">
                <div className="py-8 text-center">
                    <h2 className="text-foreground text-lg font-semibold">Visitor Not Found</h2>
                    <p className="text-muted-foreground mt-0.5 text-xs">Please select a visitor to edit.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-full py-3 sm:py-4">
            <div className="mb-3">
                <h1 className="text-foreground text-lg leading-tight font-semibold">Edit Visitor</h1>
                <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    Update visitor information and details
                </p>
            </div>
            <div className="w-full">
                <NewVisitorModal visitorId={visitorId} layout="page" />
            </div>
        </div>
    );
}
