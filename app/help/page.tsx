"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/utils/routes";
import { Search, Book, MessageCircle, Phone, ArrowRight, Tag, Clock } from "lucide-react";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/publicLayout";
import { PageSEOHead } from "@/components/seo/pageSEOHead";
import { helpCategories, helpArticles } from "./data";

export default function HelpPage() {
    const getArticleBySlug = (slug: string) => {
        return helpArticles.find((a) => a.slug === slug);
    };

    // Get most popular articles (first 5 for demo)
    const popularArticles = helpArticles.slice(0, 5);

    const supportOptions = [
        {
            icon: MessageCircle,
            title: "24/7 Live Chat",
            description: "Get instant help with our real-time chat support system",
            action: "Start Chat",
            color: "#3882a5",
        },
        {
            icon: Book,
            title: "Knowledge Base",
            description: "Browse our comprehensive documentation and step-by-step guides",
            action: "Browse Articles",
            color: "#3882a5",
        },
        {
            icon: Phone,
            title: "Phone Support",
            description: "Call us during business hours for immediate assistance",
            action: "Call Now",
            color: "#3882a5",
        },
    ];

    return (
        <>
            <PageSEOHead
                title="Help & Support - Complete Guide to SafeIn Features"
                description="Get help with SafeIn's complete feature set: appointments, real-time chat, spot pass, notifications, bulk import, and analytics. Find guides, tutorials, and 24/7 support."
                keywords={[
                    "help",
                    "support",
                    "documentation",
                    "tutorials",
                    "guides",
                    "visitor management help",
                    "SafeIn support",
                    "real-time chat help",
                    "spot pass guide",
                    "appointment links",
                ]}
                url="https://safein.aynzo.com/help"
            />
            <PublicLayout>
                <div className="min-h-screen bg-white">
                    {/* Hero Section */}
                    <section className="bg-hero-gradient px-4 py-12 sm:px-6 sm:py-16 md:py-20">
                        <div className="container mx-auto text-center">
                            <h1 className="mb-4 px-2 text-3xl leading-tight font-bold text-white sm:mb-6 sm:px-0 sm:text-4xl md:text-5xl lg:text-6xl">
                                How can we help you?
                            </h1>
                            <p className="mx-auto mb-6 max-w-3xl px-2 text-base leading-relaxed text-gray-300 sm:mb-8 sm:px-0 sm:text-lg md:text-xl">
                                Find answers to your questions about appointments, real-time chat, spot pass, bulk
                                operations, smart notifications, and more. Learn new features and get the most out of
                                your SafeIn management system with our comprehensive help resources and 24/7 support
                                chat.
                            </p>

                            {/* Search Bar */}
                            <div className="mx-auto max-w-2xl px-4 sm:px-0">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 sm:left-4 sm:h-5 sm:w-5" />
                                    <Input
                                        placeholder="Search for help articles..."
                                        className="border-white/20 bg-white/10 py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-gray-300 sm:py-3 sm:pl-12 sm:text-base md:text-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Support Options */}
                    <section className="px-4 py-20">
                        <div className="container mx-auto">
                            <div className="mb-16 text-center">
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl">Get Support</h2>
                                <p className="text-accent text-lg">Choose the support option that works best for you</p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                {supportOptions.map((option, index) => (
                                    <Card
                                        key={index}
                                        className="text-center transition-shadow duration-300 hover:shadow-lg"
                                    >
                                        <CardHeader>
                                            <div className="bg-brand-tint mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                                                <option.icon className="text-brand-strong h-6 w-6" />
                                            </div>
                                            <CardTitle className="text-brand text-lg">{option.title}</CardTitle>
                                            <CardDescription className="text-accent">
                                                {option.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-brand text-brand-strong hover:!text-white"
                                            >
                                                {option.action}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Help Categories */}
                    <section className="bg-white px-4 py-20">
                        <div className="container mx-auto">
                            <div className="mb-16 text-center">
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl">Browse by Category</h2>
                                <p className="text-accent text-lg">Find help organized by topic</p>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {helpCategories.map((category, index) => (
                                    <Card
                                        key={index}
                                        className="flex h-full flex-col transition-shadow duration-300 hover:shadow-lg"
                                    >
                                        <CardHeader>
                                            <div className="bg-brand-tint mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                                                <category.icon className="text-brand-strong h-6 w-6" />
                                            </div>
                                            <CardTitle className="text-brand text-lg">{category.title}</CardTitle>
                                            <CardDescription className="text-accent">
                                                {category.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-1 flex-col">
                                            <ul className="mb-6 flex-1 space-y-3">
                                                {category.articles.map((slug, articleIndex) => {
                                                    const article = getArticleBySlug(slug);
                                                    if (!article) return null;
                                                    return (
                                                        <li key={articleIndex}>
                                                            <Link
                                                                href={`/help/${slug}`}
                                                                className="text-accent hover:text-brand-strong flex items-start gap-2 text-sm hover:underline"
                                                            >
                                                                <span className="bg-brand-light mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                                                                <span>{article.title}</span>
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-brand text-brand-strong mt-auto w-full hover:!text-white"
                                                asChild
                                            >
                                                <Link href={`/help/${category.articles[0]}`}>View All Articles</Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Popular Articles */}
                    <section className="px-4 py-20">
                        <div className="container mx-auto">
                            <div className="mb-16 text-center">
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl">Popular Articles</h2>
                                <p className="text-accent text-lg">Most frequently viewed help articles</p>
                            </div>

                            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {popularArticles.map((article, index) => (
                                    <Card
                                        key={index}
                                        className="group flex h-full cursor-pointer flex-col transition-all duration-300 hover:shadow-lg"
                                    >
                                        <CardContent className="flex flex-1 flex-col p-6">
                                            <div className="mb-3 flex items-start justify-between">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-brand-tint text-brand-strong hover:bg-brand-light/20 text-xs"
                                                >
                                                    {article.category}
                                                </Badge>
                                                <span className="flex items-center text-xs text-gray-500">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    {article.readTime}
                                                </span>
                                            </div>
                                            <Link href={`/help/${article.slug}`} className="block flex-1">
                                                <h3 className="text-brand group-hover:text-brand-strong mb-4 text-lg font-semibold transition-colors">
                                                    {article.title}
                                                </h3>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-brand-strong hover:text-brand mt-auto h-auto justify-start p-0 font-medium hover:bg-transparent"
                                                asChild
                                            >
                                                <Link href={`/help/${article.slug}`}>
                                                    Read Article
                                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="bg-[#074463] px-4 pt-12 pb-8 sm:px-6 sm:pt-16 md:pt-20">
                        <div className="container mx-auto text-center">
                            <h2 className="mb-4 px-2 text-2xl leading-tight font-bold text-white sm:mb-6 sm:px-0 sm:text-3xl md:text-4xl">
                                Ready to Get Started?
                            </h2>
                            <p className="mx-auto mb-6 max-w-2xl px-2 text-base leading-relaxed text-gray-300 sm:mb-8 sm:px-0 sm:text-lg md:text-xl">
                                Start your free trial today and see how easy SafeIn management can be.
                            </p>
                            <div className="flex flex-col justify-center gap-3 px-4 sm:flex-row sm:gap-4 sm:px-0">
                                <Button
                                    size="lg"
                                    className="bg-brand w-full px-6 py-2.5 text-sm text-white sm:w-auto sm:px-8 sm:py-3 sm:text-base"
                                    asChild
                                >
                                    <Link href={routes.publicroute.REGISTER}>
                                        Start 3 Day Trial
                                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full border-white px-6 py-2.5 text-sm hover:bg-white hover:text-gray-900 sm:w-auto sm:px-8 sm:py-3 sm:text-base"
                                    asChild
                                >
                                    <Link href={routes.publicroute.CONTACT}>Contact Sales</Link>
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>
            </PublicLayout>
        </>
    );
}
