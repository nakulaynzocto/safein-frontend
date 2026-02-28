"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    MessageSquare,
    ArrowRight,
    Send,
    Headphones,
    Users,
    Briefcase,
} from "lucide-react";
import Link from "next/link";
import { routes } from "@/utils/routes";
import { PublicLayout } from "@/components/layout/publicLayout";
import { PageSEOHead } from "@/components/seo/pageSEOHead";
import { generateStructuredData } from "@/lib/seoHelpers";
import { cn } from "@/lib/utils";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSubmitInquiryMutation } from "@/store/api/inquiryApi";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { InputField } from "@/components/common/inputField";

const inquirySchema = yup.object({
    name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
    email: yup.string().email("Invalid email address").required("Email is required"),
    phone: yup
        .string()
        .required("Phone number is required")
        .matches(/^[0-9+-\s]{10,20}$/, "Invalid phone number"),
    message: yup.string().required("Message is required").min(10, "Message must be at least 10 characters"),
});

type InquiryFormData = yup.InferType<typeof inquirySchema>;

export default function ContactPage() {
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

    const contactStructuredData = generateStructuredData("contact");
    const contactInfo = [
        {
            icon: Mail,
            title: "Email Support",
            description: "Get help via email",
            details: "support@aynzo.com",
            action: "mailto:support@aynzo.com",
        },
        {
            icon: Phone,
            title: "Phone Support",
            description: "Call us directly",
            details: "+91 86999 66076",
            action: "tel:+918699966076",
        },
        {
            icon: Clock,
            title: "Business Hours",
            description: "When we're available",
            details: "Monday - Friday: 9:00 AM - 6:00 PM EST\nSaturday: 10:00 AM - 4:00 PM EST",
            action: null,
        },
        {
            icon: MapPin,
            title: "Office Address",
            description: "Visit our office",
            details: "Zirakpur, Mohali\nPunjab - 140603\nIndia",
            action: null,
        },
    ];

    const departments = [
        {
            icon: Headphones,
            title: "Technical Support",
            description: "Get help with technical issues, setup, and troubleshooting",
            email: "support@aynzo.com",
            response: "Response within 2 hours",
        },
        {
            icon: Users,
            title: "Customer Success",
            description: "Learn how to maximize your visitor management system",
            email: "success@aynzo.com",
            response: "Response within 4 hours",
        },
        {
            icon: Briefcase,
            title: "Sales & Partnerships",
            description: "Discuss pricing, enterprise solutions, and partnerships",
            email: "sales@aynzo.com",
            response: "Response within 1 hour",
        },
    ];

    return (
        <>
            <PageSEOHead
                title="Contact Us"
                description="Get in touch with SafeIn support team for assistance with visitor management and appointment scheduling solutions."
                keywords={[
                    "contact",
                    "support",
                    "help",
                    "visitor management support",
                    "appointment system help",
                    "SafeIn contact",
                    "customer service",
                ]}
                url="https://safein.aynzo.com/contact"
                structuredData={contactStructuredData}
            />
            <PublicLayout>
                <div className="min-h-screen bg-white">
                    {/* Hero Section */}
                    <section className="bg-hero-gradient relative pt-20 pb-8 sm:px-6 sm:pt-24 sm:pb-10 md:pt-32 md:pb-12">
                        <div className="container mx-auto px-4 sm:px-6 text-center">
                            <h1 className="mb-4 px-2 text-3xl leading-tight font-bold text-white sm:mb-6 sm:px-0 sm:text-4xl md:text-5xl lg:text-6xl">
                                Get in Touch
                            </h1>
                            <p className="mx-auto mb-6 max-w-3xl px-2 text-base leading-relaxed text-gray-300 sm:mb-8 sm:px-0 sm:text-lg md:text-xl">
                                Have questions about our comprehensive visitor management system, real-time chat,
                                spot pass, or any features? We're here to help with 24/7 support. Reach out and we'll
                                get back to you promptly.
                            </p>
                        </div>
                    </section>

                    {/* Contact Information */}
                    <section className="px-4 py-20">
                        <div className="container mx-auto">
                            <div className="mb-16 text-center">
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl text-brand">
                                    Contact Information
                                </h2>
                                <p className="text-accent text-lg">Multiple ways to reach our team</p>
                            </div>

                            <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {contactInfo.map((info, index) => (
                                    <Card
                                        key={index}
                                        className="text-center transition-all duration-300 hover:shadow-lg border-gray-100 p-4"
                                    >
                                        <CardHeader>
                                            <CardTitle className="text-brand text-xl mb-1">{info.title}</CardTitle>
                                            <CardDescription className="text-accent text-base">
                                                {info.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-brand-strong mb-6 text-sm font-semibold whitespace-pre-line">
                                                {info.details}
                                            </p>
                                            {info.action && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-brand text-brand-strong hover:!text-white rounded-full px-6"
                                                    asChild
                                                >
                                                    <Link href={info.action}>Contact Us</Link>
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Contact Form */}
                    <section className="bg-slate-50/30 px-4 py-20">
                        <div className="container mx-auto">
                            <div className="mx-auto max-w-2xl">
                                <div className="mb-12 text-center">
                                    <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl text-brand">
                                        Send us a Message
                                    </h2>
                                    <p className="text-accent text-lg">
                                        Fill out the form below and we'll get back to you within 24 hours
                                    </p>
                                </div>

                                <Card className="shadow-xl border-none rounded-3xl overflow-hidden">
                                    <CardContent className="p-8 sm:p-12">
                                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                                            {/* Name */}
                                            <InputField
                                                label="Name"
                                                placeholder="Enter your full name"
                                                error={errors.name?.message}
                                                {...register("name")}
                                                required
                                            />

                                            {/* Email and Phone */}
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

                                            {/* Message */}
                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor="message"
                                                    className="text-foreground text-sm font-medium"
                                                >
                                                    Message
                                                    <span className="ml-1 text-red-500">*</span>
                                                </Label>
                                                <Textarea
                                                    id="message"
                                                    placeholder="Tell us more about your inquiry..."
                                                    className={cn(
                                                        "focus:ring-brand mt-2 min-h-[150px] rounded-xl border-gray-200",
                                                        errors.message && "border-destructive focus:ring-destructive",
                                                    )}
                                                    {...register("message")}
                                                />
                                                {errors.message?.message && (
                                                    <p className="text-destructive text-xs mt-1">{errors.message.message}</p>
                                                )}
                                            </div>

                                            <Button
                                                type="submit"
                                                className="bg-brand w-full text-white h-12 rounded-xl text-lg font-semibold transition-all hover:scale-[1.02]"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? "Sending..." : "Send Message"}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* Departments */}
                    <section className="px-4 py-20">
                        <div className="container mx-auto">
                            <div className="mb-16 text-center">
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl text-brand">
                                    Contact by Department
                                </h2>
                                <p className="text-accent text-lg">Reach out to the right team for faster assistance</p>
                            </div>

                            <div className="grid gap-8 md:grid-cols-3">
                                {departments.map((dept, index) => (
                                    <Card
                                        key={index}
                                        className="text-center transition-all duration-300 hover:shadow-lg border-gray-100 overflow-hidden rounded-2xl"
                                    >
                                        <CardHeader className="bg-slate-50/50 pb-8">
                                            <CardTitle className="text-brand text-xl mb-1">{dept.title}</CardTitle>
                                            <CardDescription className="text-accent text-base">
                                                {dept.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-8">
                                            <div className="space-y-6">
                                                <div className="bg-brand-tint/30 py-4 rounded-xl">
                                                    <p className="text-brand text-xs font-bold uppercase tracking-wider mb-1">Email</p>
                                                    <p className="text-brand-strong text-lg font-semibold">{dept.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-brand text-xs font-bold uppercase tracking-wider mb-1">Response Time</p>
                                                    <p className="text-accent text-sm">{dept.response}</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-brand text-brand-strong hover:!text-white rounded-full w-full h-10"
                                                    asChild
                                                >
                                                    <Link href={`mailto:${dept.email}`}>
                                                        Send Email
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="bg-[#074463] px-4 pt-20 pb-8">
                        <div className="container mx-auto text-center">
                            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">Ready to Get Started?</h2>
                            <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300">
                                Don't wait - start managing your visitors more efficiently today with our free trial.
                            </p>
                            <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                <Button size="lg" className="bg-brand text-white" asChild>
                                    <Link href={routes.publicroute.REGISTER}>
                                        Start 3 Day Trial
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white text-gray-900 hover:bg-white hover:text-gray-900"
                                >
                                    <Link href={routes.publicroute.PRICING}>View Pricing</Link>
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>
            </PublicLayout>
        </>
    );
}
