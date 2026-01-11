"use client";

import { SimpleVisitorRegistration } from "@/components/visitor/simpleVisitorRegistration";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VisitorRegistrationPage() {
    const router = useRouter();

    return (
        <div className="container mx-auto max-w-full py-3 sm:py-4">
            <div className="mb-4 flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-xl bg-background hover:bg-accent/50"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Button>
                <div>
                    <h1 className="text-foreground text-lg leading-tight font-semibold">Visitor Registration</h1>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                        Quick visitor registration for appointments
                    </p>
                </div>
            </div>
            <div className="w-full">
                <SimpleVisitorRegistration />
            </div>
        </div>
    );
}
