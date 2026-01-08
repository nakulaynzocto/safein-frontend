"use client";

import { LoginForm } from "@/components/auth/loginForm";
import { PublicLayout } from "@/components/layout/publicLayout";

export default function LoginPage() {
    return (
        <PublicLayout>
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden py-12">
                <LoginForm />
            </div>
        </PublicLayout>
    );
}
