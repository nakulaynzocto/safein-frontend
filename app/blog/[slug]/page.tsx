"use client";

import { useGetPublicBlogBySlugQuery } from '@/store/api/blogApi';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import ImageWithFallback from '@/components/blog/ImageWithFallback';
import BlogFaq from '@/components/blog/BlogFaq';
import { PublicLayout } from "@/components/layout/publicLayout";
import { PageSEOHead } from "@/components/seo/pageSEOHead";
import { ArrowLeft, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostPage() {
    const params = useParams();
    const slug = params.slug as string;
    
    const { data: post, isLoading, isError } = useGetPublicBlogBySlugQuery(slug);

    if (isLoading) {
        return (
            <PublicLayout>
                <div className="min-h-screen bg-white pt-32 px-4 pb-20">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <Skeleton className="h-[400px] w-full rounded-[3rem]" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-16 w-full" />
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    if (!post || isError) {
        notFound();
    }

    const blogStructuredData = post ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.metaTitle || post.title,
        "description": post.metaDescription || post.excerpt,
        "image": post.featuredImage,
        "datePublished": post.createdAt,
        "dateModified": post.updatedAt || post.createdAt,
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
            "@id": `https://safein.aynzo.com/blog/${post.slug}`
        }
    } : undefined;

    return (
        <>
            <PageSEOHead
                title={`${post.metaTitle || post.title}`}
                description={post.metaDescription || post.excerpt || ""}
                keywords={post.keywords}
                ogImage={post.featuredImage}
                noindex={post.isNoIndex}
                url={`https://safein.aynzo.com/blog/${post.slug}`}
                structuredData={blogStructuredData}
            />
            <PublicLayout>
                <div className="min-h-screen bg-white">
                    
                    {/* Full-width Featured Image - Matching AYN/aynzo UI */}
                    {post.featuredImage ? (
                        <div className="relative w-full h-72 md:h-[480px] lg:h-[560px]">
                            <ImageWithFallback
                                src={post.featuredImage}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            
                            {/* Back link — top of image */}
                            <div className="absolute top-28 left-6 md:left-14 lg:left-24 z-10">
                                <Link
                                    href="/blog"
                                    className="inline-flex items-center text-white/90 hover:text-white transition-colors font-bold group text-sm uppercase tracking-wider drop-shadow"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                                    Back to All Insights
                                </Link>
                            </div>

                            {/* Overlaid title on image */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14 lg:px-24">
                                <div className="max-w-5xl">
                                    <div className="flex items-center gap-3 mb-4 text-white/80 text-sm font-medium">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#3882a5] inline-block shadow-[0_0_10px_#3882a5]"></span>
                                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        <span className="w-1 h-1 rounded-full bg-white/50 inline-block px-[2px]"></span>
                                        <span className="uppercase tracking-widest text-[10px] text-[#3882a5] font-black">Article</span>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight uppercase tracking-tighter">
                                        {post.title}
                                    </h1>
                                    {post.excerpt && (
                                        <p className="mt-4 text-lg text-white/80 max-w-2xl leading-relaxed font-medium line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-32 pb-12 px-4 md:px-14 lg:px-24 border-b border-gray-100">
                             <div className="max-w-5xl mx-auto">
                                <Link
                                    href="/blog"
                                    className="inline-flex items-center text-[#3882a5] hover:text-[#074463] transition-colors font-bold group text-sm uppercase tracking-wider mb-8"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                                    Back to All Insights
                                </Link>
                                <div className="flex items-center gap-3 mb-4 text-sm text-gray-400 font-medium">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#3882a5] inline-block"></span>
                                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    <span className="uppercase tracking-widest text-[10px] text-[#3882a5] font-black ml-2">Article</span>
                                </div>
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#074463] leading-tight uppercase tracking-tighter">
                                    {post.title}
                                </h1>
                            </div>
                        </div>
                    )}

                    {/* Content Area — narrowed for readability */}
                    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-16 lg:py-24">
                        
                        {/* Article body with optimized typography */}
                        <article className="prose prose-blue prose-lg md:prose-xl max-w-none
                            prose-headings:text-[#074463] prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
                            prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-8 font-medium
                            prose-a:text-[#3882a5] hover:prose-a:text-[#3882a5]/80 prose-a:font-black
                            prose-img:rounded-[3rem] prose-img:shadow-2xl prose-img:my-16
                            prose-strong:text-[#074463] prose-strong:font-black
                            prose-blockquote:border-l-8 prose-blockquote:border-[#3882a5] prose-blockquote:bg-slate-50 prose-blockquote:py-10 prose-blockquote:px-12 prose-blockquote:rounded-r-[3rem] prose-blockquote:italic prose-blockquote:text-[#074463] prose-blockquote:font-black
                            prose-ul:list-disc prose-ol:list-decimal
                            prose-li:text-slate-600 prose-li:my-3
                        ">
                            <div 
                                className="blog-content-wrapper"
                                dangerouslySetInnerHTML={{ __html: post.content }} 
                            ></div>
                        </article>

                        {/* FAQs Section */}
                        <BlogFaq faqs={post.faqs} />
                    </div>
                </div>
            </PublicLayout>
        </>
    );
}
