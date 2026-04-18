"use client";
import { Suspense } from "react";

import { RegisterForm } from "@/components/auth/registerForm";
import { AuthPageLayout } from "@/components/layout/authPageLayout";

export default function RegisterPage() {
    return (
        <AuthPageLayout>
            <Suspense fallback={null}>
                <RegisterForm />
            </Suspense>
        </AuthPageLayout>
    );
}
