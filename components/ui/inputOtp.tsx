"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function InputOTP({
    className,
    containerClassName,
    ...props
}: React.ComponentProps<typeof OTPInput> & {
    containerClassName?: string;
}) {
    return (
        <OTPInput
            data-slot="input-otp"
            containerClassName={cn("flex items-center gap-2 has-disabled:opacity-50", containerClassName)}
            className={cn("disabled:cursor-not-allowed", className)}
            {...props}
        />
    );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
    return <div data-slot="input-otp-group" className={cn("flex items-center", className)} {...props} />;
}

function InputOTPSlot({
    index,
    className,
    ...props
}: React.ComponentProps<"div"> & {
    index: number;
}) {
    const inputOTPContext = React.useContext(OTPInputContext);
    const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

    return (
        <div
            data-slot="input-otp-slot"
            data-active={isActive}
            className={cn(
                "relative flex items-center justify-center rounded-lg border-2 text-base font-semibold transition-all outline-none",
                "bg-background border-input",
                "data-[active=true]:border-primary data-[active=true]:ring-primary/20 data-[active=true]:ring-2",
                "data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20",
                "aria-invalid:border-destructive",
                "dark:bg-input/30",
                "hover:border-primary/50 shadow-sm",
                "focus-within:border-primary focus-within:ring-primary/20 focus-within:ring-2",
                className,
            )}
            {...props}
        >
            {char}
            {hasFakeCaret && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="animate-caret-blink bg-foreground h-5 w-0.5 duration-1000" />
                </div>
            )}
        </div>
    );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
    return (
        <div data-slot="input-otp-separator" role="separator" {...props}>
            <MinusIcon />
        </div>
    );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
