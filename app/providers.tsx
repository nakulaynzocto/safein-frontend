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
                    <Toaster position="top-right" richColors />
                    <SupportWidget />
                </AuthInitializer>
            </GoogleOAuthProvider>
        </Provider>
    );
}
