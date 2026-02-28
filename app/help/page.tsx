"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/utils/routes";
import { Book, MessageCircle, Phone, ArrowRight, Clock } from "lucide-react";
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
                    <section className="bg-hero-gradient relative pt-20 pb-8 sm:px-6 sm:pt-24 sm:pb-10 md:pt-32 md:pb-12">
                        <div className="container mx-auto px-4 sm:px-6 text-center">
                            <h1 className="mb-4 px-2 text-3xl leading-tight font-bold text-white sm:mb-6 sm:px-0 sm:text-4xl md:text-5xl lg:text-6xl">
                                How can we help you?
                            </h1>
                            <p className="mx-auto mb-6 max-w-3xl px-2 text-base leading-relaxed text-gray-300 sm:mb-8 sm:px-0 sm:text-lg md:text-xl">
                                Find answers to your questions about appointments, real-time chat, spot pass, bulk
                                operations, smart notifications, and more. Learn new features and get the most out of
                                your SafeIn management system with our comprehensive help resources and 24/7 support
                                chat.
                            </p>

                            {/* Search Bar Removed */}
                        </div>
                    </section>

                    {/* Support Options */}
                    <section className="px-4 py-20">
                        <div className="container mx-auto">
                            <div className="mb-16 text-center">
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl text-brand">Get Support</h2>
                                <p className="text-accent text-lg">Choose the support option that works best for you</p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                {supportOptions.map((option, index) => (
                                    <Card
                                        key={index}
                                        className="text-center transition-all duration-300 hover:shadow-lg border-gray-100 p-6"
                                    >
                                        <CardHeader>
                                            <CardTitle className="text-brand text-xl mb-2">{option.title}</CardTitle>
                                            <CardDescription className="text-accent text-base leading-relaxed">
                                                {option.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-brand text-brand-strong hover:!text-white rounded-full px-8"
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
                    <section className="bg-slate-50/50 px-4 py-20">
                        <div className="container mx-auto">
                            <div className="mb-16 text-center">
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl text-brand">Browse by Category</h2>
                                <p className="text-accent text-lg">Find help organized by topic</p>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {helpCategories.map((category, index) => (
                                    <Card
                                        key={index}
                                        className="flex h-full flex-col transition-all duration-300 hover:shadow-lg border-gray-100 overflow-hidden"
                                    >
                                        <CardHeader className="bg-white pb-6">
                                            <CardTitle className="text-brand text-xl">{category.title}</CardTitle>
                                            <CardDescription className="text-accent text-base">
                                                {category.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-1 flex-col pt-6 bg-white">
                                            <ul className="mb-8 flex-1 space-y-4">
                                                {category.articles.map((slug, articleIndex) => {
                                                    const article = getArticleBySlug(slug);
                                                    if (!article) return null;
                                                    return (
                                                        <li key={articleIndex}>
                                                            <Link
                                                                href={`/help/${slug}`}
                                                                className="text-accent hover:text-brand-strong flex items-start gap-3 text-sm hover:underline group"
                                                            >
                                                                <span className="bg-brand mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full transition-transform group-hover:scale-150" />
                                                                <span>{article.title}</span>
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-brand text-brand-strong mt-auto w-full rounded-xl hover:!text-white h-11"
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
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl text-brand">Popular Articles</h2>
                                <p className="text-accent text-lg">Most frequently viewed help articles</p>
                            </div>

                            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {popularArticles.map((article, index) => (
                                    <Card
                                        key={index}
                                        className="group flex h-full cursor-pointer flex-col transition-all duration-300 hover:shadow-xl border-gray-100"
                                    >
                                        <CardContent className="flex flex-1 flex-col p-8">
                                            <div className="mb-4 flex items-start justify-between">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-brand-tint/50 text-brand-strong border-none text-[10px] uppercase tracking-wider font-bold"
                                                >
                                                    {article.category}
                                                </Badge>
                                                <span className="flex items-center text-xs text-slate-400 font-medium">
                                                    {article.readTime}
                                                </span>
                                            </div>
                                            <Link href={`/help/${article.slug}`} className="block flex-1">
                                                <h3 className="text-brand group-hover:text-brand-strong mb-6 text-lg font-bold transition-colors leading-snug">
                                                    {article.title}
                                                </h3>
                                            </Link>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="text-brand-strong hover:text-brand-strong/80 hover:no-underline mt-auto h-auto justify-start p-0 font-bold text-sm tracking-tight"
                                                asChild
                                            >
                                                <Link href={`/help/${article.slug}`}>
                                                    Read Full Article
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="bg-[#074463] px-4 pt-16 pb-12 sm:px-6 sm:pt-20 md:pt-24 md:pb-16">
                        <div className="container mx-auto text-center">
                            <h2 className="mb-4 px-2 text-3xl leading-tight font-bold text-white sm:mb-6 sm:px-0 sm:text-4xl">
                                Ready to Get Started?
                            </h2>
                            <p className="mx-auto mb-8 max-w-2xl px-2 text-lg leading-relaxed text-slate-300">
                                Start your free trial today and see how easy SafeIn management can be.
                            </p>
                            <div className="flex flex-col justify-center gap-4 px-4 sm:flex-row sm:px-0">
                                <Button
                                    size="lg"
                                    className="bg-brand w-full px-8 py-4 text-base font-bold text-white sm:w-auto h-14 rounded-2xl shadow-lg transition-transform hover:scale-105"
                                    asChild
                                >
                                    <Link href={routes.publicroute.REGISTER}>
                                        Start 3 Day Trial
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full border-white/20 bg-white/5 text-white hover:bg-white hover:text-slate-900 sm:w-auto h-14 rounded-2xl backdrop-blur-sm"
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
