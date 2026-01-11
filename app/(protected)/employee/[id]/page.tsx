"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { NewEmployeeModal } from "@/components/employee/EmployeeForm";

export default function EmployeeEditPage() {
    const params = useParams();
    const router = useRouter();
    const employeeId = params.id as string;

    if (!employeeId) {
        return (
            <div className="container mx-auto max-w-4xl py-3 sm:py-4">
                <div className="mb-4 flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0 rounded-xl bg-background hover:bg-accent/50"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <div className="py-2">
                        <h2 className="text-foreground text-lg font-semibold">Employee Not Found</h2>
                        <p className="text-muted-foreground mt-0.5 text-xs">Please select an employee to edit.</p>
                    </div>
                </div>
            </div>
        );
    }

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
                    <h1 className="text-foreground text-lg leading-tight font-semibold">Edit Employee</h1>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                        Update employee details and information
                    </p>
                </div>
            </div>
            <div className="w-full">
                <NewEmployeeModal employeeId={employeeId} layout="page" />
            </div>
        </div>
    );
}
