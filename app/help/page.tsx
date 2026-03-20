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

    // Get specific popular articles to avoid duplication with the first category
    const popularArticles = helpArticles.filter(art => 
        ["safein-onboarding-guide", "adding-and-managing-employees", "visitor-registration-process", "data-encryption-and-security", "how-to-create-your-first-appointment"].includes(art.slug)
    ).slice(0, 6);

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
                    <section className="bg-hero-gradient relative flex min-h-[400px] items-center pt-20 pb-12 sm:min-h-[450px] sm:px-6 sm:pt-28 md:min-h-[500px] md:pt-32">
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
                        </div>
                    </section>

                    {/* Popular Articles */}
                    <section className="px-4 py-20 bg-slate-50/30">
                        <div className="container mx-auto">
                            <div className="mb-16 text-center">
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl text-brand">Popular Articles</h2>
                                <p className="text-muted-foreground text-lg">Most frequently viewed help articles</p>
                            </div>

                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                {popularArticles.map((article, index) => (
                                    <div
                                        key={index}
                                        className="group relative flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-brand/10 hover:-translate-y-2"
                                    >
                                        {/* Article Image */}
                                        <div className="relative h-48 w-full overflow-hidden">
                                            <img 
                                                src={article.image || "/images/auth-side.png"} 
                                                alt={article.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <Badge
                                                variant="secondary"
                                                className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-brand border-none text-[10px] uppercase tracking-wider font-bold shadow-sm"
                                            >
                                                {article.category}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-1 flex-col p-8">
                                            <div className="mb-4 flex items-center text-xs text-slate-400 font-medium">
                                                <Clock className="mr-1.5 h-3.5 w-3.5" />
                                                {article.readTime}
                                            </div>
                                            
                                            <Link href={`/help/${article.slug}`} className="block flex-1">
                                                <h3 className="text-brand group-hover:text-brand-strong mb-4 text-xl font-bold transition-colors leading-tight">
                                                    {article.title}
                                                </h3>
                                                <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                                                    {article.description}
                                                </p>
                                            </Link>

                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="text-brand-strong hover:text-brand group-hover:translate-x-1 transition-transform hover:no-underline mt-auto h-auto justify-start p-0 font-bold text-sm tracking-tight gap-2"
                                                asChild
                                            >
                                                <Link href={`/help/${article.slug}`}>
                                                    Read Full Article <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Support Options */}
                    <section className="bg-white px-4 py-20">
                        <div className="container mx-auto">
                            <div className="mb-16 text-center">
                                <h2 className="heading-main mb-4 text-3xl font-bold md:text-4xl text-brand">Get Support</h2>
                                <p className="text-muted-foreground text-lg">Choose the support option that works best for you</p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                {supportOptions.map((option, index) => (
                                    <Card
                                        key={index}
                                        className="text-center transition-all duration-300 hover:shadow-lg border-gray-100 p-6"
                                    >
                                        <CardHeader>
                                            <CardTitle className="text-brand text-xl mb-2">{option.title}</CardTitle>
                                            <CardDescription className="text-muted-foreground text-base leading-relaxed">
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
                                <p className="text-muted-foreground text-lg">Find help organized by topic</p>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {helpCategories.map((category, index) => (
                                    <Card
                                        key={index}
                                        className="flex h-full flex-col transition-all duration-300 hover:shadow-lg border-gray-100 overflow-hidden"
                                    >
                                        <CardHeader className="bg-white pb-6">
                                            <CardTitle className="text-brand text-xl">{category.title}</CardTitle>
                                            <CardDescription className="text-muted-foreground text-base">
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
                                                                className="text-muted-foreground hover:text-brand flex items-start gap-3 text-sm hover:underline group"
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


                </div>
            </PublicLayout>
        </>
    );
}
