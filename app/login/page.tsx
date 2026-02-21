"use client";

import { LoginForm } from "@/components/auth/loginForm";
import { AuthPageLayout } from "@/components/layout/authPageLayout";

export default function LoginPage() {
    return (
        <AuthPageLayout>
            <LoginForm />
        </AuthPageLayout>
    );
}
