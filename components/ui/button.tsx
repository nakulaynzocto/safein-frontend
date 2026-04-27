import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl btn-text transition-all duration-200 active:scale-[0.98] hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-sm hover:shadow-md",
    {
        variants: {
            variant: {
                default:
                    "bg-accent text-white shadow-sm hover:bg-accent/90",
                destructive:
                    "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
                outline:
                    "border border-border bg-background shadow-xs hover:bg-accent/5 hover:text-accent text-foreground dark:bg-transparent dark:border-border dark:hover:bg-accent/50",
                "outline-primary":
                    "border border-accent text-accent bg-background shadow-xs hover:bg-accent/5 hover:text-accent/80 dark:border-accent dark:text-accent dark:hover:bg-accent/20",
                primary: "bg-accent text-white shadow-xs hover:bg-accent/90 focus-visible:ring-accent/20",
                secondary: "bg-accent/10 text-accent shadow-xs hover:bg-accent/20",
                ghost: "hover:bg-accent/5 text-accent transition-colors",
                link: "text-accent underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 rounded-xl gap-1.5 px-3 has-[>svg]:px-2.5",
                lg: "h-10 rounded-xl px-6 has-[>svg]:px-4",
                icon: "size-9",
                xl: "h-12 rounded-xl px-8 text-base",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : "button";

    return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

export { Button, buttonVariants };
