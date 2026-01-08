"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PublicLayout } from "@/components/layout/publicLayout";
import { routes } from "@/utils/routes";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SubscriptionCancelPage() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push(routes.publicroute.PRICING);
        }, 5000); // Redirect to pricing after 5 seconds

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <PublicLayout>
            <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
                <XCircle className="mb-6 h-12 w-12 text-red-500" />
                <h1 className="mb-3 text-3xl font-bold text-gray-800">Payment Canceled</h1>
                <p className="mb-8 max-w-md text-center text-lg text-gray-600">
                    Your payment was not completed. You will be redirected to the pricing page shortly.
                </p>
                <Button asChild>
                    <Link href={routes.publicroute.PRICING}>Go to Pricing Page</Link>
                </Button>
            </div>
        </PublicLayout>
    );
}
