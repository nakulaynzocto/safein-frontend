"use client";

import { VisitorRegister } from "@/components/visitor/visitorRegister";
import { CreateVisitorRequest } from "@/store/api/visitorApi";
import { useRouter } from "next/navigation";
import { routes } from "@/utils/routes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Page: VisitorRegister (non-modal page version)
export default function VisitorRegisterPage() {
    const router = useRouter();

    const handleVisitorComplete = (visitorData: CreateVisitorRequest) => {
        router.push(routes.privateroute.VISITORLIST);
    };

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
                    <h1 className="text-foreground text-lg leading-tight font-semibold">Register New Visitor</h1>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                        Enter visitor details, address, ID proof, and optional notes to register them in the system
                    </p>
                </div>
            </div>
            <div className="w-full">
                <VisitorRegister onComplete={handleVisitorComplete} standalone={true} />
            </div>
        </div>
    );
}
