import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Heart, MapPin, Clock, IndianRupee, Star, Navigation, Check, MessageSquare, Car } from 'lucide-react';
import FeedbackSection from './FeedbackSection';

const PlaceDetails = ({ place, onBack, isSaved, onToggleSave, userEmail, onGetDirections }) => {
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [localFeedbacks, setLocalFeedbacks] = useState([]);

    useEffect(() => {
        // Load initial feedbacks
        const feedbacks = JSON.parse(localStorage.getItem('user_feedback') || '[]');
        setLocalFeedbacks(feedbacks);

        // Listen for new feedbacks
        const handleStorageChange = () => {
            const updatedFeedbacks = JSON.parse(localStorage.getItem('user_feedback') || '[]');
            setLocalFeedbacks(updatedFeedbacks);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    if (!place) return null;

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: place.title,
                text: place.description,
                url: window.location.href,
            }).catch(console.error);
        } else {
            // Fallback for browsers without share API
            navigator.clipboard.writeText(window.location.href);
            // We could add a toast here, but for now simple clipboard is better than ugly alert
        }
    };

    return (
        <div className="relative flex flex-col h-full bg-white dark:bg-gray-900 animate-in fade-in slide-in-from-right duration-300 overflow-hidden">
            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto pb-6 custom-scrollbar">
                {/* Hero Image Section */}
                <div className="relative h-80 w-full shrink-0">
                    <img
                        src={place.image}
                        alt={place.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

                    {/* Top Controls */}
                    <div className="absolute top-6 inset-x-0 px-6 flex items-center justify-between">
                        <button
                            onClick={onBack}
                            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div className="flex gap-3">
                            <button
                                onClick={handleShare}
                                className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={(e) => onToggleSave(e, place.id)}
                                className={`p-2 backdrop-blur-md rounded-full transition-colors ${isSaved ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section - Overlapping Card */}
                <div className="relative -mt-10 bg-white dark:bg-gray-900 rounded-t-[32px] px-6 pt-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${place.categoryColor || 'bg-amber-600'}`}>
                                {place.category}
                            </span>
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{place.rating}</span>
                                <span className="text-xs text-gray-500">(128)</span>
                            </div>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{place.title}</h1>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                {place.description}
                            </p>
                        </div>

                        {/* Quick Info */}
                        <div className="flex flex-wrap gap-4 py-4 border-y border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                </div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">{place.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                </div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">6:00 AM - 8:00 PM</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <IndianRupee className="w-4 h-4 text-gray-500" />
                                </div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">Budget Friendly</span>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                            {['#heritage', '#culture', '#mysore'].map(tag => (
                                <span key={tag} className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* About Section */}
                        <div className="mt-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">About</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {place.title} is a landmark destination in Mysore that offers an authentic glimpse into local life.
                                The vibrant atmosphere, historic architecture, and unique offerings make it a must-visit for anyone
                                exploring the cultural landscape of the city.
                            </p>
                        </div>

                        {/* Highlights */}
                        <div className="mt-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Highlights</h2>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    "150+ year old heritage market",
                                    "Famous for Mysore jasmine garlands",
                                    "Traditional spices and sandalwood",
                                    "Best local street food"
                                ].map((highlight, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-800/30">
                                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{highlight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Best Time to Visit */}
                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-400 mb-1">Best Time to Visit</h3>
                            <p className="text-sm text-amber-700 dark:text-amber-500 font-medium leading-relaxed">
                                Early morning (6-8 AM) for the freshest flowers and produce
                            </p>
                        </div>

                        {/* Reviews Section */}
                        <div className="mt-8 mb-10">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Reviews</h2>
                                <button
                                    onClick={() => setShowReviewForm(!showReviewForm)}
                                    className="text-sm font-bold text-amber-600 hover:text-amber-700"
                                >
                                    {showReviewForm ? 'View Reviews' : 'Write Review'}
                                </button>
                            </div>

                            {showReviewForm ? (
                                <FeedbackSection
                                    userEmail={userEmail}
                                    onSuccess={() => {
                                        // Update local state immediately after submission
                                        const updatedFeedbacks = JSON.parse(localStorage.getItem('user_feedback') || '[]');
                                        setLocalFeedbacks(updatedFeedbacks);
                                        // Optionally close the form after a delay or instantly
                                        setTimeout(() => setShowReviewForm(false), 2000);
                                    }}
                                />
                            ) : (
                                <div className="space-y-4">
                                    {localFeedbacks.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                                                <MessageSquare className="w-6 h-6 text-gray-300" />
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No reviews yet. Be the first!</p>
                                        </div>
                                    ) : (
                                        localFeedbacks.map((fb) => (
                                            <div key={fb.id} className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-xs">
                                                            {fb.userEmail?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{fb.userEmail}</p>
                                                            <div className="flex gap-0.5">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star key={star} size={10} className={star <= fb.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 uppercase font-bold">
                                                        {new Date(fb.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">"{fb.comment}"</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Actions Container */}
            <div className="bg-white dark:bg-gray-900 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            const url = `https://m.uber.com/ul/?action=setPickup&client_id=YOUR_CLIENT_ID&pickup=my_location&dropoff[formatted_address]=${place.title}+Mysore&dropoff[nickname]=${place.title}`;
                            window.open(url, '_blank');
                        }}
                        className="flex-1 bg-black dark:bg-gray-800 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                        <Car className="w-5 h-5" />
                        Book Ride
                    </button>
                    <button
                        onClick={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${place.title}+Mysore`;
                            window.open(url, '_blank');
                        }}
                        className="flex-1 bg-[#D4AF37] hover:bg-[#B8962F] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 transition-all active:scale-95"
                    >
                        <Navigation className="w-5 h-5 fill-current" />
                        Directions
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaceDetails;
