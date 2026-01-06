"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch } from "@/store/hooks"
import { setCredentials } from "@/store/slices/authSlice"
import { useExchangeImpersonationTokenMutation } from "@/store/api/authApi"
import { Loader2 } from "lucide-react"
import { routes } from "@/utils/routes"
import { toast } from "sonner"

export default function ImpersonatePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const dispatch = useAppDispatch()

    // Use a ref to prevent double-execution in React Strict Mode (Development)
    const hasExchanged = useRef(false)

    const [exchangeToken, { isLoading }] = useExchangeImpersonationTokenMutation()

    useEffect(() => {
        const code = searchParams.get("code")

        if (!code) {
            toast.error("Invalid impersonation link")
            router.push(routes.publicroute.LOGIN)
            return
        }

        if (hasExchanged.current) return
        hasExchanged.current = true

        const loginWithCode = async () => {
            try {
                const data = await exchangeToken({ code }).unwrap()

                if (data && data.user && data.token) {
                    dispatch(setCredentials({ user: data.user, token: data.token }))
                    toast.success(`Securely logged in as ${data.user.companyName}`)
                    router.push(routes.privateroute.DASHBOARD)
                } else {
                    throw new Error("Invalid response");
                }
            } catch (error: any) {
                toast.error("Security code expired or invalid.")
                router.push(routes.publicroute.LOGIN)
            }
        }

        loginWithCode()
    }, [searchParams, dispatch, router, exchangeToken])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
                <div className="text-center space-y-1">
                    <h1 className="text-xl font-semibold text-foreground">Verifying Security Code...</h1>
                    <p className="text-sm text-muted-foreground">Please wait while we secure your session</p>
                </div>
            </div>
        </div>
    )
}
