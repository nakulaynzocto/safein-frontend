"use client";

import { ResetPasswordForm } from "@/components/auth/resetPasswordForm";
import { PublicLayout } from "@/components/layout/publicLayout";

export default function ResetPasswordPage() {
    return (
        <PublicLayout>
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden py-12">
                <ResetPasswordForm />
            </div>
        </PublicLayout>
    );
}
