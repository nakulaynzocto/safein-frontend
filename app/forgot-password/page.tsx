"use client";

import { ForgotPasswordForm } from "@/components/auth/forgotPasswordForm";
import { AuthPageLayout } from "@/components/layout/authPageLayout";

export default function ForgotPasswordPage() {
    return (
        <AuthPageLayout>
            <ForgotPasswordForm />
        </AuthPageLayout>
    );
}
