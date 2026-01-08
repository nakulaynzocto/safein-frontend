"use client";

import { RegisterForm } from "@/components/auth/registerForm";
import { PublicLayout } from "@/components/layout/publicLayout";

export default function RegisterPage() {
    return (
        <PublicLayout>
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden py-12">
                <RegisterForm />
            </div>
        </PublicLayout>
    );
}
