"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { NotificationSettings } from "@/components/settings/NotificationSettings";

export default function NotificationSettingsPage() {
    const { user } = useAppSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (user && user.role !== "admin") {
            router.push("/dashboard");
        }
    }, [user, router]);

    if (user?.role !== "admin") return null;

    return <NotificationSettings />;
}
