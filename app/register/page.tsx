"use client";

import { RegisterForm } from "@/components/auth/registerForm";
import { AuthPageLayout } from "@/components/layout/authPageLayout";

export default function RegisterPage() {
    return (
        <AuthPageLayout>
            <RegisterForm />
        </AuthPageLayout>
    );
}
