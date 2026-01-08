"use client";

import { memo, type ReactNode } from "react";

interface InfoRowProps {
    label: string;
    value?: string | ReactNode;
}

export const InfoRow = memo(function InfoRow({ label, value }: InfoRowProps) {
    return (
        <div>
            <label className="text-muted-foreground text-sm font-medium">{label}</label>
            <div className="text-sm">{value}</div>
        </div>
    );
});
