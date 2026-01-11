"use client";

import { NewEmployeeModal } from "@/components/employee/EmployeeForm";
import { UserPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Page: Employeecreat (non-modal page version)
export default function Employeecreat() {
    const router = useRouter();

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
                    <h1 className="text-foreground text-lg leading-tight font-semibold">Add New Employee</h1>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                        Fill in the employee details to add them to the system
                    </p>
                </div>
            </div>
            <div className="w-full">
                <NewEmployeeModal layout="page" />
            </div>
        </div>
    );
}
