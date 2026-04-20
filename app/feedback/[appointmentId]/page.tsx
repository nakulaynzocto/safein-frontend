"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSubmitFeedbackMutation } from "@/store/api/feedbackApi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function FeedbackPage() {
    const params = useParams();
    const appointmentId = params.appointmentId as string;

    const [rating, setRating] = useState<number>(0);
    const [hover, setHover] = useState<number>(0);
    const [comments, setComments] = useState<string>("");
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const [submitFeedback, { isLoading }] = useSubmitFeedbackMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!rating) {
            toast.error("Please provide a star rating before submitting.");
            return;
        }

        try {
            await submitFeedback({
                appointmentId,
                rating,
                comments: comments.trim() || undefined
            }).unwrap();
            
            setIsSubmitted(true);
            toast.success("Thank you for your feedback!");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to submit feedback. You might have already rated this visit.");
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Thank You!</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Your feedback has been successfully submitted. We appreciate your time to help us improve our visitor experience.
                    </p>
                    <Button 
                        variant="outline" 
                        onClick={() => window.close()}
                        className="w-full rounded-2xl h-12 font-bold tracking-wide shadow-sm"
                    >
                        Close Window
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 py-12 px-4 sm:px-6">
            <div className="w-full max-w-lg bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/50 overflow-hidden transform transition-all">
                
                <div className="p-8 pb-0 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-primary/10 to-primary/5 rounded-2xl mb-6 shadow-sm">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                        How was your visit?
                    </h1>
                    <p className="text-sm text-gray-500">
                        Please take a moment to rate your recent experience. Your feedback is very important to us.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-8">
                    {/* Centered Star Rating */}
                    <div className="flex flex-col items-center justify-center space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                        <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-10 h-10 transition-colors drop-shadow-sm ${
                                            star <= (hover || rating)
                                                ? "fill-amber-400 text-amber-400"
                                                : "fill-gray-100 text-gray-200"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                            {rating === 1 ? 'Poor' : 
                             rating === 2 ? 'Fair' : 
                             rating === 3 ? 'Good' : 
                             rating === 4 ? 'Very Good' : 
                             rating === 5 ? 'Excellent' : 'Select Rating'}
                        </span>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                            Additional Comments <span className="opacity-50 lowercase tracking-normal font-medium">(Optional)</span>
                        </label>
                        <Textarea
                            placeholder="Tell us what you liked or what could be improved..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="resize-none min-h-[120px] rounded-2xl bg-gray-50 border-gray-200 focus:bg-white transition-colors shadow-inner"
                        />
                    </div>

                    <Button 
                        type="submit" 
                        disabled={isLoading || !rating}
                        className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform"
                    >
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
                        ) : (
                            "Submit Feedback"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
