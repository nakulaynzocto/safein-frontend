"use client";

import { PublicLayout } from "@/components/layout/publicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, FileText, CreditCard, Mail, Phone } from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <PublicLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 sm:py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <div className="mb-4 flex items-center gap-3">
                            <Shield className="h-8 w-8 text-[#3882a5]" />
                            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Privacy Policy</h1>
                        </div>
                        <p className="text-sm text-gray-500">
                            Last updated:{" "}
                            {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                    </div>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#3882a5]" />
                                Introduction
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <p>
                                At SafeIn (operated by Aynzo), we are committed to protecting your privacy and ensuring
                                the security of your personal information. This Privacy Policy explains how we collect,
                                use, disclose, and safeguard your information when you use our visitor management and
                                appointment scheduling platform.
                            </p>
                            <p>
                                By using our services, you agree to the collection and use of information in accordance
                                with this policy. If you do not agree with our policies and practices, please do not use
                                our services.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-[#3882a5]" />
                                Information We Collect
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900">1. Personal Information</h3>
                                <ul className="ml-4 list-inside list-disc space-y-1">
                                    <li>Name, email address, phone number</li>
                                    <li>Company name and business details</li>
                                    <li>Profile picture and identification documents</li>
                                    <li>Payment information (processed securely through Razorpay)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900">2. Visitor Information</h3>
                                <ul className="ml-4 list-inside list-disc space-y-1">
                                    <li>Visitor name, contact details, and identification proof</li>
                                    <li>Appointment details and meeting history</li>
                                    <li>Check-in and check-out timestamps</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900">3. Technical Information</h3>
                                <ul className="ml-4 list-inside list-disc space-y-1">
                                    <li>IP address, browser type, and device information</li>
                                    <li>Usage data and analytics</li>
                                    <li>Cookies and similar tracking technologies</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-[#3882a5]" />
                                How We Use Your Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <p>We use the collected information for the following purposes:</p>
                            <ul className="ml-4 list-inside list-disc space-y-2">
                                <li>To provide and maintain our visitor management services</li>
                                <li>To process subscription payments securely through Razorpay</li>
                                <li>To send appointment notifications and updates via email</li>
                                <li>To manage employee and visitor records</li>
                                <li>To improve our services and user experience</li>
                                <li>To comply with legal obligations and prevent fraud</li>
                                <li>To communicate with you about your account and services</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-[#3882a5]" />
                                Payment Processing with Razorpay
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <p>
                                We use <strong>Razorpay</strong> as our payment gateway to process subscription payments
                                securely. When you make a payment:
                            </p>
                            <ul className="ml-4 list-inside list-disc space-y-2">
                                <li>
                                    Your payment information is processed directly by Razorpay and is not stored on our
                                    servers
                                </li>
                                <li>
                                    Razorpay complies with PCI DSS (Payment Card Industry Data Security Standard)
                                    requirements
                                </li>
                                <li>
                                    We only receive payment confirmation and transaction details necessary for
                                    subscription management
                                </li>
                                <li>Your card details are encrypted and handled securely by Razorpay</li>
                                <li>We do not have access to your full card number or CVV</li>
                            </ul>
                            <p className="mt-4">
                                For more information about Razorpay's privacy practices, please visit:{" "}
                                <a
                                    href="https://razorpay.com/privacy/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#3882a5] hover:underline"
                                >
                                    https://razorpay.com/privacy/
                                </a>
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-[#3882a5]" />
                                Data Security
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <p>
                                We implement appropriate technical and organizational security measures to protect your
                                personal information:
                            </p>
                            <ul className="ml-4 list-inside list-disc space-y-2">
                                <li>SSL/TLS encryption for data transmission</li>
                                <li>Secure password hashing using bcrypt</li>
                                <li>Regular security audits and updates</li>
                                <li>Access controls and authentication mechanisms</li>
                                <li>Secure cloud storage with encrypted backups</li>
                            </ul>
                            <p className="mt-4">
                                However, no method of transmission over the Internet or electronic storage is 100%
                                secure. While we strive to use commercially acceptable means to protect your
                                information, we cannot guarantee absolute security.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-[#3882a5]" />
                                Data Sharing and Disclosure
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <p>
                                We do not sell, trade, or rent your personal information to third parties. We may share
                                your information only in the following circumstances:
                            </p>
                            <ul className="ml-4 list-inside list-disc space-y-2">
                                <li>
                                    <strong>Payment Processing:</strong> With Razorpay for processing subscription
                                    payments
                                </li>
                                <li>
                                    <strong>Service Providers:</strong> With trusted third-party service providers who
                                    assist in operating our platform (email services, cloud hosting)
                                </li>
                                <li>
                                    <strong>Legal Requirements:</strong> When required by law or to protect our rights
                                    and safety
                                </li>
                                <li>
                                    <strong>Business Transfers:</strong> In connection with any merger, sale, or
                                    acquisition of our business
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#3882a5]" />
                                Your Rights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <p>You have the following rights regarding your personal information:</p>
                            <ul className="ml-4 list-inside list-disc space-y-2">
                                <li>
                                    <strong>Access:</strong> Request access to your personal data
                                </li>
                                <li>
                                    <strong>Correction:</strong> Request correction of inaccurate or incomplete data
                                </li>
                                <li>
                                    <strong>Deletion:</strong> Request deletion of your personal data
                                </li>
                                <li>
                                    <strong>Data Portability:</strong> Request transfer of your data to another service
                                </li>
                                <li>
                                    <strong>Objection:</strong> Object to processing of your personal data
                                </li>
                                <li>
                                    <strong>Withdrawal:</strong> Withdraw consent for data processing where applicable
                                </li>
                            </ul>
                            <p className="mt-4">
                                To exercise these rights, please contact us using the contact information provided
                                below.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#3882a5]" />
                                Cookies and Tracking
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <p>
                                We use cookies and similar tracking technologies to track activity on our platform and
                                store certain information. Cookies are files with a small amount of data that are sent
                                to your browser and stored on your device.
                            </p>
                            <p>
                                You can instruct your browser to refuse all cookies or to indicate when a cookie is
                                being sent. However, if you do not accept cookies, you may not be able to use some
                                portions of our service.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#3882a5]" />
                                Data Retention
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <p>
                                We retain your personal information only for as long as necessary to fulfill the
                                purposes outlined in this Privacy Policy, unless a longer retention period is required
                                or permitted by law.
                            </p>
                            <ul className="ml-4 list-inside list-disc space-y-2">
                                <li>Account information is retained while your account is active</li>
                                <li>Visitor and appointment records are retained as per business requirements</li>
                                <li>Payment transaction records are retained as required by financial regulations</li>
                                <li>
                                    Upon account deletion, data is removed within 30 days unless legal retention applies
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#3882a5]" />
                                Children's Privacy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <p>
                                Our services are not intended for individuals under the age of 18. We do not knowingly
                                collect personal information from children. If you are a parent or guardian and believe
                                your child has provided us with personal information, please contact us immediately.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#3882a5]" />
                                Changes to This Privacy Policy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <p>
                                We may update our Privacy Policy from time to time. We will notify you of any changes by
                                posting the new Privacy Policy on this page and updating the "Last updated" date.
                            </p>
                            <p>
                                You are advised to review this Privacy Policy periodically for any changes. Changes to
                                this Privacy Policy are effective when they are posted on this page.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#3882a5]" />
                                Grievance Officer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <p>
                                In accordance with Information Technology Act 2000 and rules made there under, the name
                                and contact details of the Grievance Officer are provided below:
                            </p>
                            <div className="ml-4">
                                <p>
                                    <strong>Name:</strong> Nakul (Grievance Officer)
                                </p>
                                <p>
                                    <strong>Email:</strong> grievance@aynzo.com
                                </p>
                                <p>
                                    <strong>Address:</strong> Aynzo Technologies, Zirakpur, Mohali, Punjab - 140603, India
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-6" id="refund-policy">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-[#3882a5]" />
                                Refund and Cancellation Policy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <p>
                                <strong>Cancellation:</strong> You may cancel your subscription at any time through your
                                account settings. Cancellation will be effective at the end of the current billing
                                cycle.
                            </p>
                            <p>
                                <strong>Refunds:</strong>
                            </p>
                            <ul className="ml-4 list-inside list-disc space-y-2">
                                <li>
                                    <strong>Free Trial:</strong> We offer a 3-day free trial to evaluate the platform.
                                    You will not be charged if you cancel before the trial ends.
                                </li>
                                <li>
                                    <strong>Subscription Fees:</strong> Once a subscription fee is charged, it is
                                    non-refundable for the current billing period (month/year).
                                </li>
                                <li>
                                    <strong>Exceptions:</strong> Refunds may be processed in cases of duplicate
                                    transactions or technical errors attributable to SafeIn. Refund requests must be
                                    made within 5 days of the transaction via{" "}
                                    <a href="mailto:support@aynzo.com" className="text-[#3882a5]">
                                        support@aynzo.com
                                    </a>
                                    .
                                </li>
                                <li>
                                    <strong>Processing Timeline:</strong> Approved refunds will be processed within 5-7
                                    business days to the original payment method.
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="mb-6" id="shipping-policy">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#3882a5]" />
                                Shipping and Delivery Policy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <p>
                                <strong>Service Delivery:</strong> SafeIn is a SaaS (Software as a Service) platform.
                                Services are delivered digitally and immediately upon successful registration and/or
                                payment.
                            </p>
                            <ul className="ml-4 list-inside list-disc space-y-2">
                                <li>No physical shipping is involved.</li>
                                <li>Account activation is instant.</li>
                                <li>
                                    Login credentials and invoices are sent to your registered email address
                                    immediately.
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-[#3882a5]" />
                                Contact Us
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <p>
                                If you have any questions about this Privacy Policy or wish to exercise your rights,
                                please contact us:
                            </p>
                            <div className="ml-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-[#3882a5]" />
                                    <span>
                                        Email:{" "}
                                        <a href="mailto:support@aynzo.com" className="text-[#3882a5] hover:underline">
                                            support@aynzo.com
                                        </a>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-[#3882a5]" />
                                    <span>
                                        Phone:{" "}
                                        <a href="tel:+911234567890" className="text-[#3882a5] hover:underline">
                                            +91 123 456 7890
                                        </a>
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <FileText className="mt-1 h-4 w-4 text-[#3882a5]" />
                                    <div>
                                        <p className="font-semibold">Registered Office:</p>
                                        <p>Aynzo Technologies Pvt Ltd</p>
                                        <p>Zirakpur, Mohali</p>
                                        <p>Punjab - 140603, India</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <p className="text-sm text-gray-700">
                            <strong>Note:</strong> This Privacy Policy complies with Indian data protection regulations
                            and Razorpay's requirements for payment processing. By using our services, you acknowledge
                            that you have read and understood this Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
