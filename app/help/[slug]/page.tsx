"use client";

import { helpArticles, helpCategories } from "../data";
import { notFound, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageSEOHead } from "@/components/seo/pageSEOHead";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default function HelpArticlePage({ params }: PageProps) {
    const [slug, setSlug] = useState<string>("");
    const [article, setArticle] = useState<any>(null);
    const [categoryData, setCategoryData] = useState<any>(null);

    useEffect(() => {
        params.then((resolvedParams) => {
            const foundArticle = helpArticles.find((a) => a.slug === resolvedParams.slug);
            if (!foundArticle) {
                notFound();
            }
            setSlug(resolvedParams.slug);
            setArticle(foundArticle);
            const foundCategory = helpCategories.find((c) => c.title === foundArticle.category);
            setCategoryData(foundCategory);
        });
    }, [params]);

    if (!article) {
        return null; // or a loading spinner
    }

    const CategoryIcon = categoryData ? categoryData.icon : Tag;

    return (
        <>
            <PageSEOHead
                title={`${article.title} - Help Center`}
                description={article.description}
                keywords={[article.category, "help", "guide", "tutorial", "SafeIn"]}
                url={`https://safein.aynzo.com/help/${article.slug}`}
            />
            <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--background)" }}>
                <Navbar forcePublic showUpgradeButton={false} />
                <main className="flex-1">
                    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 sm:py-12">
                        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                            {/* Back Navigation */}
                            <div className="mb-6">
                                <Button
                                    variant="ghost"
                                    className="pl-0 text-gray-500 transition-all hover:pl-2 hover:text-[#3882a5]"
                                    asChild
                                >
                                    <Link href="/help">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Help Center
                                    </Link>
                                </Button>
                            </div>

                            {/* Updated Header Style (Matches Privacy Policy) */}
                            <div className="mb-8">
                                <div className="mb-4 flex items-start gap-3 sm:items-center">
                                    <div className="shrink-0 rounded-lg bg-blue-50 p-2">
                                        <CategoryIcon className="h-6 w-6 text-[#3882a5] sm:h-8 sm:w-8" />
                                    </div>
                                    <h1 className="text-2xl leading-tight font-bold text-gray-900 sm:text-3xl md:text-4xl">
                                        {article.title}
                                    </h1>
                                </div>

                                {/* Metadata */}
                                <div className="ml-1 flex flex-wrap items-center gap-4 text-sm text-gray-500 sm:ml-14">
                                    <span className="flex items-center">
                                        <Clock className="mr-1.5 h-4 w-4" />
                                        {article.readTime}
                                    </span>
                                    <span className="hidden text-gray-300 sm:inline">|</span>
                                    <span className="flex items-center">
                                        <Calendar className="mr-1.5 h-4 w-4" />
                                        Last updated: {article.lastUpdated}
                                    </span>
                                    <span className="hidden text-gray-300 sm:inline">|</span>
                                    <Badge
                                        variant="secondary"
                                        className="border-0 bg-blue-50 text-[#3882a5] hover:bg-blue-100"
                                    >
                                        {article.category}
                                    </Badge>
                                </div>
                            </div>

                            {/* Content Card */}
                            <Card className="mb-8 overflow-hidden border-slate-200 shadow-sm">
                                <CardContent className="p-6 sm:p-10">
                                    <article className="prose prose-slate prose-headings:text-[#074463] prose-headings:font-bold prose-a:text-[#3882a5] prose-img:rounded-xl max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: article.content }} />
                                    </article>
                                </CardContent>
                            </Card>

                            {/* Footer / CTA Card */}
                            <Card className="border-dashed border-slate-300 bg-slate-50">
                                <CardContent className="p-8 text-center">
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                        Still have questions?
                                    </h3>
                                    <p className="mx-auto mb-6 max-w-lg text-gray-500">
                                        Can't find what you're looking for? Our support team is here to help you get
                                        back on track.
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <Button asChild className="bg-[#3882a5] text-white hover:bg-[#2c6b8a]">
                                            <Link href="/contact">Contact Support</Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="border-slate-300 text-gray-700 hover:bg-white"
                                        >
                                            <Link href="/help">Browse More Articles</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
}
