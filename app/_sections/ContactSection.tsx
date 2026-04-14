"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Mail,
    Phone,
    MapPin,
    ArrowRight,
    Send,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { validatePhone } from "@/utils/phoneUtils";
import { useSubmitInquiryMutation } from "@/store/api/inquiryApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { InputField } from "@/components/common/inputField";

const inquirySchema = yup.object({
    name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
    email: yup.string().email("Invalid email address").required("Email is required"),
    phone: yup
        .string()
        .required("Phone number is required")
        .test("is-valid-phone", "Please enter a valid global phone number with country code", (value) => 
            validatePhone(value)
        ),
    message: yup.string().required("Message is required").min(10, "Message must be at least 10 characters"),
});

type InquiryFormData = yup.InferType<typeof inquirySchema>;

export default function ContactSection() {
    const [submitInquiry, { isLoading: isSubmitting }] = useSubmitInquiryMutation();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<InquiryFormData>({
        resolver: yupResolver(inquirySchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            message: "",
        },
    });

    const onSubmit = async (data: InquiryFormData) => {
        try {
            const result = await submitInquiry({
                ...data,
                source: "safein",
            }).unwrap();

            showSuccessToast(result.message || "Message sent successfully!");
            reset();
        } catch (error: any) {
            showErrorToast(error?.data?.message || "Failed to send message. Please try again.");
        }
    };

    return (
        <section id="contact" className="bg-white py-12 sm:py-16">
            <div className="container mx-auto px-4">
                <div className="mb-10 text-center">
                    <h2 className="mb-4 text-3xl font-black text-slate-900 sm:text-5xl">
                        Get in <span className="text-[#3882a5]">Touch</span>
                    </h2>
                    <p className="mx-auto max-w-3xl text-slate-600 text-lg sm:text-xl font-medium leading-relaxed">
                        Have questions about SafeIn? We are here to help. Send us a message and our team will get back to you shortly.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    {/* Left Side: Contact Information */}
                    <div className="space-y-8">
                        <div className="flex gap-6 items-start">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-[#3882a5] shadow-sm">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-xl font-bold text-slate-900">Email Support</h3>
                                <p className="text-slate-600 text-lg sm:text-xl font-medium mb-1">Get help via email</p>
                                <a href="mailto:support@aynzo.com" className="text-[#3882a5] font-black text-lg hover:underline transition-all">
                                    support@aynzo.com
                                </a>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-[#3882a5] shadow-sm">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-xl font-bold text-slate-900">Phone Support</h3>
                                <p className="text-slate-600 text-lg sm:text-xl font-medium mb-1">Call us directly</p>
                                <a href="tel:+918699966076" className="text-[#3882a5] font-black text-lg hover:underline transition-all">
                                    +91 86999 66076
                                </a>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-[#3882a5] shadow-sm">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-xl font-bold text-slate-900">Office Location</h3>
                                <p className="text-slate-600 text-lg sm:text-xl font-medium mb-1">Visit us in person</p>
                                <p className="text-slate-900 font-black text-lg leading-tight">
                                    Mohali, Punjab, <br /> India
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Contact Form */}
                    <Card className="shadow-2xl shadow-[#074463]/5 border-none rounded-[3rem] overflow-hidden bg-white p-8 sm:p-10">
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <InputField
                                label="Name"
                                placeholder="Enter your full name"
                                error={errors.name?.message}
                                {...register("name")}
                                required
                            />

                            <div className="grid gap-6 md:grid-cols-2">
                                <InputField
                                    label="Email Address"
                                    type="email"
                                    placeholder="Enter your email"
                                    error={errors.email?.message}
                                    {...register("email")}
                                    required
                                />
                                <InputField
                                    label="Phone Number"
                                    placeholder="Enter your phone number"
                                    error={errors.phone?.message}
                                    {...register("phone")}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="message" className="text-slate-900 text-sm font-bold">
                                    Message<span className="ml-1 text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="message"
                                    placeholder="Tell us what you're looking for..."
                                    className={cn(
                                        "focus:ring-[#3882a5] mt-2 min-h-[140px] rounded-2xl border-slate-100 bg-slate-50/50 resize-none",
                                        errors.message && "border-destructive focus:ring-destructive",
                                    )}
                                    {...register("message")}
                                />
                                {errors.message?.message && (
                                    <p className="text-red-500 text-xs mt-1 font-semibold">{errors.message.message}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="bg-[#3882a5] w-full text-white h-16 rounded-2xl text-xl font-black shadow-xl shadow-[#3882a5]/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Sending..." : "Send Message"}
                                <Send className="h-5 w-5" />
                            </Button>
                        </form>
                    </Card>
                </div>

            </div>
        </section>
    );
}
