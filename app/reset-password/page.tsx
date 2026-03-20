"use client";

import { ResetPasswordForm } from "@/components/auth/resetPasswordForm";
import { AuthPageLayout } from "@/components/layout/authPageLayout";

export default function ResetPasswordPage() {
    return (
        <AuthPageLayout>
            <ResetPasswordForm />
        </AuthPageLayout>
    );
}
