"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useGetPublicBlogsQuery, Blog } from '@/store/api/blogApi';
import { PublicLayout } from "@/components/layout/publicLayout";
import { PageSEOHead } from "@/components/seo/pageSEOHead";
import ImageWithFallback from '@/components/blog/ImageWithFallback';
import { ChevronRight, Calendar, ArrowRight, Clock, ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { safeInPageSEO } from '@/lib/seoConfig';

const BlogCard = ({ post }: { post: Blog }) => (
    <div className="bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col overflow-hidden h-full group p-2">
        <Link href={`/blog/${post.slug}`} className="cursor-pointer block h-full flex flex-col">
            <div className="relative h-64 w-full overflow-hidden rounded-[2rem]">
                <ImageWithFallback
                    src={post.featuredImage || ''}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#074463]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-4 left-4">
                     <span className="bg-white/90 backdrop-blur-md text-[#3882a5] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                        Productivity
                    </span>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 mb-4 text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                            {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">5 min read</span>
                    </div>
                </div>
                <h3 className="font-black text-[#074463] text-xl mb-4 line-clamp-2 group-hover:text-[#3882a5] transition-colors leading-tight uppercase tracking-tight">
                    {post.title}
                </h3>
                <p className="text-slate-500 text-sm flex-1 mb-6 line-clamp-3 leading-relaxed font-medium">
                    {post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '')}
                </p>
                <div className="flex items-center text-[#3882a5] font-black text-[10px] uppercase tracking-widest group-hover:gap-2 transition-all">
                    Read Full Article
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    </div>
);

export default function BlogsPage() {
    const [page, setPage] = useState(1);
    const limit = 9;
    
    const { data, isLoading } = useGetPublicBlogsQuery({ page, limit });
    const blogs = data?.blogs || [];
    const pagination = data?.pagination;

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <PageSEOHead
                title={safeInPageSEO.blog.title}
                description={safeInPageSEO.blog.description}
                keywords={safeInPageSEO.blog.keywords}
                url={`https://safein.aynzo.com${safeInPageSEO.blog.path}`}
            />
            <PublicLayout>
                <div className="min-h-screen bg-white">
                    
                    {/* Hero Section - Matching Help Page Style */}
                    <section className="bg-hero-gradient relative flex min-h-[400px] items-center pt-20 pb-12 sm:min-h-[450px] sm:px-6 sm:pt-28 md:min-h-[500px] md:pt-32">
                        <div className="container mx-auto px-4 sm:px-6 text-center">
                            <h1 className="mb-4 px-2 text-3xl leading-tight font-black text-white sm:mb-6 sm:px-0 sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter">
                                SafeIn Insights
                            </h1>
                            <p className="mx-auto mb-6 max-w-3xl px-2 text-base leading-relaxed text-gray-300 sm:mb-8 sm:px-0 sm:text-lg md:text-xl font-medium">
                                Exploration of technology, security, and human experience in the evolving business landscape. 
                                Find expert perspectives on digital transformation and workplace security.
                            </p>
                        </div>
                    </section>

                    {/* Blog Grid */}
                    <section className="py-24 bg-slate-50/50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="mb-16 text-center">
                                <h2 className="text-3xl font-black text-[#074463] md:text-4xl uppercase tracking-tight">Recent <span className="text-[#3882a5]">Articles</span></h2>
                                <p className="text-slate-500 font-medium mt-4">Browse our latest thoughts and industry updates</p>
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="space-y-4 bg-white p-3 rounded-[3rem] border border-slate-100">
                                            <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                                            <div className="space-y-2 px-4 py-4">
                                                <Skeleton className="h-4 w-1/4" />
                                                <Skeleton className="h-8 w-full" />
                                                <Skeleton className="h-20 w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : blogs.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                        {blogs.map((post: Blog) => (
                                            <BlogCard key={post._id} post={post} />
                                        ))}
                                    </div>

                                    {/* Pagination Controls */}
                                    {pagination && pagination.pages > 1 && (
                                        <div className="mt-20 flex flex-wrap justify-center items-center gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => handlePageChange(Math.max(1, page - 1))}
                                                disabled={page === 1}
                                                className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border-slate-200 text-[#074463] hover:bg-white hover:text-primary transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
                                            >
                                                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </Button>
                                            
                                            <div className="flex flex-wrap gap-2">
                                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                                                    <Button
                                                        key={p}
                                                        variant={page === p ? "default" : "outline"}
                                                        onClick={() => handlePageChange(p)}
                                                        className={cn(
                                                            "h-12 w-12 sm:h-14 sm:w-14 rounded-2xl font-black text-base sm:text-lg transition-all active:scale-90",
                                                            page === p 
                                                                ? "bg-[#074463] text-white shadow-xl shadow-[#074463]/20" 
                                                                : "border-slate-200 text-[#074463] hover:bg-white hover:text-primary"
                                                        )}
                                                    >
                                                        {p}
                                                    </Button>
                                                ))}
                                            </div>

                                            <Button
                                                variant="outline"
                                                onClick={() => handlePageChange(Math.min(pagination.pages, page + 1))}
                                                disabled={page === pagination.pages}
                                                className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border-slate-200 text-[#074463] hover:bg-white hover:text-primary transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
                                            >
                                                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-32 bg-white rounded-[3rem] shadow-sm border border-slate-100">
                                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-50 mb-8">
                                        <ArrowRight className="w-10 h-10 text-slate-300 -rotate-45" />
                                    </div>
                                    <h3 className="text-2xl font-black text-[#074463] mb-4 uppercase tracking-tight">No Insights Published Yet</h3>
                                    <p className="text-slate-500 font-medium max-w-md mx-auto">We're curating some amazing content for you. Subscribe to our newsletter to stay updated.</p>
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </PublicLayout>
        </>
    );
}
