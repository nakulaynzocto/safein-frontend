"use client";

import { type ReactNode } from "react";

import { Provider } from "react-redux";
import { store } from "../store/store";
import { Toaster } from "sonner";

import { GoogleOAuthProvider } from "@react-oauth/google";
import SupportWidget from "@/components/chat/SupportWidget";
import { AuthInitializer } from "@/components/auth/AuthInitializer";

export function Providers({ children }: { children: ReactNode }) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "your-google-client-id";

    return (
        <Provider store={store}>
            <GoogleOAuthProvider clientId={clientId}>
                <AuthInitializer>
                    {children}
                    <Toaster
                        position="top-right"
                        expand={false}
                        visibleToasts={3}
                        gap={8}
                        toastOptions={{
                            duration: 2000,
                            classNames: {
                                toast: [
                                    "group flex items-center gap-3",
                                    "!rounded-2xl !border-0 !shadow-2xl",
                                    "!px-5 !py-4.5 !min-h-0",
                                    "!bg-[#111827]/90 backdrop-blur-xl",
                                    "!text-white !text-sm !font-medium",
                                    "ring-1 ring-white/10",
                                    "animate-in slide-in-from-top-4 duration-300",
                                ].join(" "),
                                title: "!font-semibold !text-[13px] !text-white leading-tight",
                                description: "!text-white/60 !text-xs mt-0.5",
                                icon: "!shrink-0",
                                success: [
                                    "!bg-[#111827]/90 ring-1 ring-emerald-500/20",
                                    "[&_[data-icon]]:text-emerald-400",
                                ].join(" "),
                                error: [
                                    "!bg-[#111827]/90 ring-1 ring-red-500/20",
                                    "[&_[data-icon]]:text-red-400",
                                ].join(" "),
                                warning: [
                                    "!bg-[#111827]/90 ring-1 ring-amber-500/20",
                                    "[&_[data-icon]]:text-amber-400",
                                ].join(" "),
                                info: [
                                    "!bg-[#111827]/90 ring-1 ring-blue-500/20",
                                    "[&_[data-icon]]:text-blue-400",
                                ].join(" "),
                                closeButton: [
                                    "!bg-white/10 !border-0 !text-white/60",
                                    "hover:!bg-white/20 hover:!text-white",
                                    "!rounded-full !w-5 !h-5",
                                ].join(" "),
                            },
                        }}
                    />
                    <SupportWidget />
                </AuthInitializer>
            </GoogleOAuthProvider>
        </Provider>
    );
}
