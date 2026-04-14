"use client";

import { helpArticles, helpCategories } from "../data";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageSEOHead } from "@/components/seo/pageSEOHead";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar, MessageCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";

export default function HelpArticlePage() {
    const params = useParams();
    const slug = params.slug as string;
    
    const article = useMemo(() => helpArticles.find((a) => a.slug === slug), [slug]);

    if (!article) {
        notFound();
        return null;
    }

    const helpStructuredData = article ? {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": article.description,
        "image": article.image,
        "author": {
            "@type": "Organization",
            "name": "SafeIn by Aynzo"
        },
        "publisher": {
            "@type": "Organization",
            "name": "SafeIn",
            "logo": {
                "@type": "ImageObject",
                "url": "https://safein.aynzo.com/logo.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://safein.aynzo.com/help/${article.slug}`
        }
    } : undefined;

    return (
        <>
            <PageSEOHead
                title={`${article.title} - Help Center`}
                description={article.description}
                keywords={[article.category, "help", "guide", "tutorial", "SafeIn"]}
                ogImage={article.image}
                url={`https://safein.aynzo.com/help/${article.slug}`}
                structuredData={helpStructuredData}
            />
            <div className="flex min-h-screen flex-col bg-white">
                <Navbar forcePublic showUpgradeButton={false} />
                <main className="flex-1">
                    
                    {/* Cinematic Hero Section - Matching Blog Style */}
                    <div className="relative w-full h-[350px] md:h-[450px] lg:h-[500px] overflow-hidden">
                        {article.image ? (
                            <>
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            </>
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#074463] via-[#0b547d] to-[#3882a5]">
                                <div className="absolute inset-0 opacity-10 bg-[url('/images/pattern.png')] bg-repeat" />
                            </div>
                        )}

                        {/* Back link — top of image */}
                        <div className="absolute top-28 left-6 md:left-14 lg:left-24 z-10">
                            <Link
                                href="/help"
                                className="inline-flex items-center text-white/90 hover:text-white transition-colors font-bold group text-sm uppercase tracking-wider drop-shadow"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                                Back to Help Center
                            </Link>
                        </div>

                        {/* Overlaid title on image */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14 lg:px-24">
                            <div className="max-w-5xl">
                                <div className="flex items-center gap-3 mb-4 text-white/80 text-sm font-medium">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#3882a5] inline-block shadow-[0_0_10px_#3882a5]"></span>
                                    {article.lastUpdated}
                                    <span className="w-1 h-1 rounded-full bg-white/50 inline-block px-[2px]"></span>
                                    <Badge
                                        variant="secondary"
                                        className="bg-[#3882a5] text-white border-none text-[10px] uppercase tracking-widest font-black px-3 py-1"
                                    >
                                        {article.category}
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight uppercase tracking-tighter drop-shadow-lg">
                                    {article.title}
                                </h1>
                                <p className="mt-4 text-lg text-white/80 max-w-2xl leading-relaxed font-medium line-clamp-2 italic">
                                    {article.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content Area — widened for guide readability but consistent with blog */}
                    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-16 lg:py-24">
                        
                        {/* Guide body with optimized typography */}
                        <article className="prose prose-blue prose-lg md:prose-xl max-w-none
                            prose-headings:text-[#074463] prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
                            prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-8 font-medium
                            prose-a:text-[#3882a5] hover:prose-a:text-[#3882a5]/80 prose-a:font-black
                            prose-img:rounded-[2.5rem] prose-img:shadow-xl prose-img:my-16 prose-img:border prose-img:border-slate-100
                            prose-strong:text-[#074463] prose-strong:font-black
                            prose-blockquote:border-l-8 prose-blockquote:border-[#3882a5] prose-blockquote:bg-slate-50 prose-blockquote:py-10 prose-blockquote:px-12 prose-blockquote:rounded-r-[3rem] prose-blockquote:not-italic prose-blockquote:text-[#074463] prose-blockquote:font-black
                            prose-ul:list-disc prose-ol:list-decimal
                            prose-li:text-slate-600 prose-li:my-3
                            prose-hr:border-slate-100 prose-hr:my-16
                            prose-table:border-collapse prose-table:w-full prose-table:my-10
                            prose-th:bg-slate-50 prose-th:p-4 prose-th:text-[#074463] prose-th:font-black prose-th:uppercase prose-th:text-xs prose-th:tracking-widest
                            prose-td:p-4 prose-td:border-b prose-td:border-slate-50 prose-td:text-sm
                        ">
                            <div 
                                className="help-content-wrapper"
                                dangerouslySetInnerHTML={{ __html: article.content }} 
                            ></div>
                        </article>

                        {/* Help Footer / CTA Section */}
                        <div className="mt-20 p-8 md:p-12 bg-slate-50 rounded-[3rem] border border-slate-100 text-center relative overflow-hidden group">
                           {/* Decorative Icon Background */}
                           <div className="absolute -right-10 -bottom-10 text-slate-100 group-hover:text-slate-200 group-hover:scale-110 transition-all duration-700">
                               <HelpCircle size={200} />
                           </div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-[#074463] mb-4 uppercase tracking-tight">
                                    Still Have <span className="text-[#3882a5]">Questions?</span>
                                </h3>
                                <p className="mx-auto mb-10 max-w-xl text-slate-500 font-medium">
                                    Can't find the answer you're looking for? Our dedicated support team is ready to help you optimize your visitor experience.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Button asChild className="bg-[#074463] text-white hover:bg-[#074463]/90 h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#074463]/20 transition-all active:scale-95">
                                        <Link href="/contact" className="flex items-center gap-2">
                                            <MessageCircle size={16} /> Contact Support
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="border-slate-200 text-[#074463] hover:bg-white h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                                    >
                                        <Link href="/help">Browse Categories</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
}
