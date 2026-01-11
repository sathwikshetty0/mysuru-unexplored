import React, { useState } from 'react';
import { Send, MessageSquare, Star } from 'lucide-react';

const FeedbackSection = ({ userEmail, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { supabase } = await import('../lib/supabaseClient');

            if (supabase) {
                const feedbackData = {
                    user_email: userEmail || 'Anonymous',
                    comment: comment,
                    created_at: new Date().toISOString()
                };

                // Determine which table to use
                if (window.location.href.includes('admin') || !onSuccess) {
                    // Admin/General Feedback
                    const { error } = await supabase
                        .from('admin_feedback')
                        .insert([{ ...feedbackData, subject: 'General' }]);
                    if (error) throw error;
                } else {
                    // Partner/Spot Feedback (assuming we are on a place details view)
                    const { error } = await supabase
                        .from('partner_feedback')
                        .insert([{
                            ...feedbackData,
                            rating: rating,
                            spot_name: document.querySelector('h1')?.innerText || 'Unknown Spot'
                        }]);
                    if (error) throw error;
                }
            }

            // Fallback to local storage for instant UI update
            const feedback = {
                id: Date.now(),
                userEmail,
                rating,
                comment,
                timestamp: new Date().toISOString()
            };

            const isSiteFeedback = window.location.href.includes('admin') || !onSuccess;
            const storageKey = isSiteFeedback ? 'admin_feedback_local' : 'partner_feedback_local';
            const existingFeedback = JSON.parse(localStorage.getItem(storageKey) || '[]');
            localStorage.setItem(storageKey, JSON.stringify([feedback, ...existingFeedback]));

            setSubmitted(true);
            setComment('');
            if (onSuccess) onSuccess();
            setTimeout(() => setSubmitted(false), 3000);
        } catch (err) {
            console.error("Feedback error:", err);
            // Error is handled by console or parent
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                    <h3 className="text-xl font-serif text-gray-900 dark:text-white">Share Your Feedback</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Help us preserve Mysuru's spirit</p>
                </div>
            </div>

            {submitted ? (
                <div className="py-8 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="h-6 w-6 text-emerald-600" />
                    </div>
                    <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Feedback Received!</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => setRating(num)}
                                className={`p-2 transition-all ${rating >= num ? 'text-amber-500 scale-110' : 'text-gray-300 dark:text-gray-600'}`}
                            >
                                <Star fill={rating >= num ? 'currentColor' : 'none'} size={24} />
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us about your experience..."
                        required
                        className="w-full h-32 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 bg-black dark:bg-[#D4AF37] text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Sending Heritage Echo...' : 'Submit Feedback'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default FeedbackSection;
