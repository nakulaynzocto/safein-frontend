"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { initializeAuth } from "@/store/slices/authSlice";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    return <>{children}</>;
}
