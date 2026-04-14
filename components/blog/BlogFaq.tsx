'use client';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from "@/lib/utils";

interface FaqItem {
    question: string;
    answer: string;
}

interface BlogFaqProps {
    faqs?: FaqItem[];
}

export default function BlogFaq({ faqs }: BlogFaqProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (!faqs || faqs.length === 0) return null;

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="mt-20 pt-10 border-t border-slate-100">
            <h2 className="text-3xl font-black text-[#074463] mb-10 flex items-center gap-3">
                <span className="bg-[#3882a5] w-2 h-8 rounded-full"></span>
                Frequently Asked Questions
            </h2>
            <div className="space-y-4">
                {faqs.map((faq, idx) => (
                    <div 
                        key={idx} 
                        className={cn(
                            "bg-white border-2 rounded-2xl transition-all duration-200 overflow-hidden",
                            openIndex === idx ? 'border-[#3882a5] shadow-md' : 'border-slate-100 hover:border-slate-200 shadow-sm'
                        )}
                    >
                        <button
                            onClick={() => toggle(idx)}
                            className="w-full text-left py-6 px-7 flex items-center justify-between gap-4 group"
                        >
                            <h3 className={cn(
                                "text-xl font-bold transition-colors",
                                openIndex === idx ? 'text-[#3882a5]' : 'text-[#074463] group-hover:text-[#3882a5]'
                            )}>
                                {faq.question}
                            </h3>
                            <span className={cn(
                                "flex-shrink-0 p-1.5 rounded-xl transition-all",
                                openIndex === idx ? 'bg-[#3882a5] text-white rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                            )}>
                                {openIndex === idx ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            </span>
                        </button>
                        <div 
                            className={cn(
                                "transition-all duration-300 ease-in-out",
                                openIndex === idx ? 'max-h-[800px] opacity-100 p-7 pt-0' : 'max-h-0 opacity-0 pointer-events-none'
                            )}
                        >
                            <div className="bg-slate-50/50 rounded-xl p-5 text-slate-600 leading-relaxed text-lg border border-slate-100/50">
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
