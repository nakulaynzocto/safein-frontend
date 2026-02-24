"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VisitorRegister } from "./visitorRegister";
import { CreateVisitorRequest } from "@/store/api/visitorApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { routes } from "@/utils/routes";
import { User } from "lucide-react";

export function SimpleVisitorRegistration() {
    const router = useRouter();
    const [visitorDetails, setVisitorDetails] = useState<CreateVisitorRequest | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleVisitorComplete = async (data: CreateVisitorRequest) => {
        try {
            setIsSubmitting(true);

            setVisitorDetails(data);
            showSuccessToast("Visitor registered successfully!");

            router.push(routes.privateroute.APPOINTMENTLIST);
        } catch (error: any) {
            showErrorToast(error?.message || "Failed to register visitor");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Visitor Details Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Visitor Information</CardTitle>
                    <p className="text-sm text-gray-600">
                        Please provide complete visitor details including personal information, address, and
                        identification documents.
                    </p>
                </CardHeader>
                <CardContent>
                    <VisitorRegister onComplete={handleVisitorComplete} initialData={visitorDetails} />
                </CardContent>
            </Card>

            {/* Success Message */}
            {visitorDetails && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-green-700">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                <User className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Visitor Registered Successfully!</h3>
                                <p className="text-sm">{visitorDetails.name} has been registered in the system.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
