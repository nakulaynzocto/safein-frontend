"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PublicLayout } from "@/components/layout/publicLayout";
import { routes } from "@/utils/routes";
import { Loader2 } from "lucide-react";

export default function SubscriptionSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // In a real application, you would verify the session ID with your backend
    // and activate the subscription here. For this example, we'll just redirect.
    const timer = setTimeout(() => {
      router.push(routes.privateroute.DASHBOARD);
    }, 3000); // Redirect to dashboard after 3 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 text-brand animate-spin mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Payment Successful!</h1>
        <p className="text-lg text-gray-600 text-center max-w-md">
          Your subscription is being activated. You will be redirected to the dashboard shortly.
        </p>
      </div>
    </PublicLayout>
  );
}





