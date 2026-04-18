"use client";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/loginForm";
import { AuthPageLayout } from "@/components/layout/authPageLayout";

export default function LoginPage() {
    return (
        <AuthPageLayout>
            <Suspense fallback={null}>
                <LoginForm />
            </Suspense>
        </AuthPageLayout>
    );
}
