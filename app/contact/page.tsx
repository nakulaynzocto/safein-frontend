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
                    <section className="bg-hero-gradient px-4 py-12 sm:px-6 sm:py-16 md:py-20">
                        <div className="container mx-auto text-center">
                            <h1 className="mb-4 px-2 text-3xl leading-tight font-bold text-white sm:mb-6 sm:px-0 sm:text-4xl md:text-5xl lg:text-6xl">
                                Get in Touch
                            </h1>
                            <p className="mx-auto mb-6 max-w-3xl px-2 text-base leading-relaxed text-gray-300 sm:mb-8 sm:px-0 sm:text-lg md:text-xl">
                                Have questions about our visitor management system? We're here to help. Reach out to our
                                team and we'll get back to you as soon as possible.
                            </p>
                        </div>
                    </section>

                    {/* Contact Information */}
                    <section className="px-4 py-20">
                        <div className="container mx-auto">
                            <div className="mb-16 text-center">
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl">
                                    Contact Information
                                </h2>
                                <p className="text-accent text-lg">Multiple ways to reach our team</p>
                            </div>

                            <div className="mb-16 grid gap-6 md:grid-cols-3">
                                {contactInfo.map((info, index) => (
                                    <Card
                                        key={index}
                                        className="text-center transition-shadow duration-300 hover:shadow-lg"
                                    >
                                        <CardHeader>
                                            <div className="bg-brand-tint mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                                                <info.icon className="text-brand-strong h-6 w-6" />
                                            </div>
                                            <CardTitle className="text-brand text-lg">{info.title}</CardTitle>
                                            <CardDescription className="text-accent">
                                                {info.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-accent mb-4 text-sm whitespace-pre-line">
                                                {info.details}
                                            </p>
                                            {info.action && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-brand text-brand-strong hover:!text-white"
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
                    <section className="bg-white px-4 py-20">
                        <div className="container mx-auto">
                            <div className="mx-auto max-w-2xl">
                                <div className="mb-12 text-center">
                                    <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl">
                                        Send us a Message
                                    </h2>
                                    <p className="text-accent text-lg">
                                        Fill out the form below and we'll get back to you within 24 hours
                                    </p>
                                </div>

                                <Card className="shadow-lg">
                                    <CardContent className="p-8">
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
                                                        "focus:ring-brand mt-2 min-h-[120px]",
                                                        errors.message && "border-destructive focus:ring-destructive",
                                                    )}
                                                    {...register("message")}
                                                />
                                                {errors.message?.message && (
                                                    <p className="text-destructive text-xs">{errors.message.message}</p>
                                                )}
                                            </div>

                                            <Button
                                                type="submit"
                                                className="bg-brand w-full text-white"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? "Sending..." : "Send Message"}
                                                <Send className="ml-2 h-4 w-4" />
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
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl">
                                    Contact by Department
                                </h2>
                                <p className="text-accent text-lg">Reach out to the right team for faster assistance</p>
                            </div>

                            <div className="grid gap-8 md:grid-cols-3">
                                {departments.map((dept, index) => (
                                    <Card
                                        key={index}
                                        className="text-center transition-shadow duration-300 hover:shadow-lg"
                                    >
                                        <CardHeader>
                                            <div className="bg-brand-tint mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                                                <dept.icon className="text-brand-strong h-6 w-6" />
                                            </div>
                                            <CardTitle className="text-brand text-xl">{dept.title}</CardTitle>
                                            <CardDescription className="text-accent text-base">
                                                {dept.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-brand text-sm font-medium">Email:</p>
                                                    <p className="text-brand-strong text-sm">{dept.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-brand text-sm font-medium">Response Time:</p>
                                                    <p className="text-accent text-sm">{dept.response}</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-brand text-brand-strong hover:!text-white"
                                                    asChild
                                                >
                                                    <Link href={`mailto:${dept.email}`}>
                                                        <MessageSquare className="mr-2 h-4 w-4" />
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
                    <section className="bg-hero-gradient px-4 py-20">
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
