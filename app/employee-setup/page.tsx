"use client";

import { EmployeeSetupForm } from "@/components/auth/employeeSetupForm";
import { PublicLayout } from "@/components/layout/publicLayout";

export default function EmployeeSetupPage() {
    return (
        <PublicLayout>
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden py-12">
                <EmployeeSetupForm />
            </div>
        </PublicLayout>
    );
}

