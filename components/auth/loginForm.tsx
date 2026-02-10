import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputField } from "@/components/common/inputField";
import { useAppDispatch } from "@/store/hooks";
import { useLoginMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { routes } from "@/utils/routes";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { encryptData } from "@/utils/crypto";
const loginSchema = yup.object({
    email: yup.string().email("Invalid email address").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export function LoginForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const [login, { isLoading }] = useLoginMutation();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, result: 0 });
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
    });

    const generateCaptcha = () => {
        const n1 = Math.floor(Math.random() * 10) + 1;
        const n2 = Math.floor(Math.random() * 10) + 1;
        setCaptcha({ num1: n1, num2: n2, result: n1 + n2 });
        setCaptchaInput("");
        setCaptchaError(null);
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    useEffect(() => {
        const message = searchParams.get("message");
        if (message) {
            showSuccessToast(message);
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("message");
            window.history.replaceState({}, "", newUrl.toString());
        }
    }, [searchParams]);

    const onSubmit = async (data: LoginFormData) => {
        if (parseInt(captchaInput) !== captcha.result) {
            setCaptchaError("Incorrect answer. Please solve the math problem.");
            generateCaptcha();
            return;
        }

        try {
            const encryptedEmail = encryptData(data.email);
            const encryptedPassword = encryptData(data.password);
            const result = await login({
                email: encryptedEmail,
                password: encryptedPassword,
            }).unwrap();

            if (!result.token || result.token === "undefined") {
                throw new Error("No valid token received from server");
            }

            if (!result.user) {
                throw new Error("No user data received from server");
            }

            dispatch(setCredentials(result));
            setErrorMessage(null);

            const next = searchParams.get("next");
            const target = next || routes.privateroute.DASHBOARD;
            window.location.replace(target);
        } catch (error: any) {
            const message = error?.data?.message || error?.message || "Login failed";
            setErrorMessage(message);
            generateCaptcha();
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mb-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(routes.publicroute.HOME)}
                        className="text-muted-foreground hover:bg-[#3882a5] hover:text-white"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div className="flex flex-1 justify-center">
                        <img src="/aynzo-logo.svg" alt="Aynzo Logo" className="h-10 w-auto" />
                    </div>
                    <div className="w-20"></div>
                </div>
                <CardTitle className="text-brand text-2xl">Welcome Back</CardTitle>
                <CardDescription>Sign in to your account</CardDescription>
            </CardHeader>
            <CardContent>
                {errorMessage && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <InputField
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        error={errors.email?.message}
                        required
                        {...register("email")}
                    />

                    <InputField
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        error={errors.password?.message}
                        required
                        {...register("password")}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Security Check: {captcha.num1} + {captcha.num2} = ?
                        </label>
                        <div className="flex gap-2">
                            <InputField
                                placeholder="Answer"
                                type="number"
                                value={captchaInput}
                                onChange={(e) => setCaptchaInput(e.target.value)}
                                error={captchaError || undefined}
                                className="flex-1"
                                required
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={generateCaptcha}
                                className="h-12 w-12 rounded-xl"
                                title="Refresh Captcha"
                            >
                                🔄
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Link
                            href={routes.publicroute.FORGOT_PASSWORD}
                            className="text-primary text-sm hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-muted-foreground text-sm">
                        Don't have an account?{" "}
                        <Link
                            href={routes.publicroute.REGISTER}
                            className="text-primary hover:underline"
                            prefetch={true}
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
