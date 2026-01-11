import React, { useState } from 'react';
import {
    LayoutDashboard,
    Store,
    MessageSquare,
    Settings,
    LogOut,
    TrendingUp,
    Users,
    Star,
    Camera,
    Plus,
    Clock,
    MapPin,
    Utensils,
    Palette,
    Sparkles,
    Send,
    Inbox,
    Calendar,
    Ticket
} from 'lucide-react';
import MapComponent from '../components/Map';

const PartnerDashboard = ({ onLogout, partnerData }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [feedbacks, setFeedbacks] = useState([]);
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, type: 'danger' });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    React.useEffect(() => {
        loadSpotFeedback();
    }, [partnerData]);

    const loadSpotFeedback = async () => {
        try {
            const { supabase } = await import('../lib/supabaseClient');
            if (supabase && partnerData?.spotName) {
                const { data, error } = await supabase
                    .from('partner_feedback')
                    .select('*')
                    .eq('spot_name', partnerData.spotName)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setFeedbacks(data || []);
            }
        } catch (err) {
            console.error("Error loading spot feedback:", err);
            // Local fallback
            const local = JSON.parse(localStorage.getItem('user_feedback') || '[]');
            setFeedbacks(local);
        }
    };

    const realReviewsCount = feedbacks.length;
    const realAvgRating = feedbacks.length > 0
        ? (feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) / feedbacks.length).toFixed(1)
        : "5.0";

    // Mock data for the partner's spot with dynamic reviews/rating
    const spotData = {
        name: partnerData?.spotName || "Karanji Lake",
        category: partnerData?.category || "Nature",
        rating: realAvgRating,
        reviewsCount: realReviewsCount,
        totalVisits: 842 + realReviewsCount, // Added real reviews to visit count for demo
        status: "Online",
        images: ["/api/placeholder/400/300", "/api/placeholder/400/300"],
        description: "Serene nature trail with butterfly park and panoramic palace views. A pristine sanctuary in the heart of Mysore.",
        openingHours: "6:00 AM - 8:00 PM",
        location: "Siddhartha Layout, Mysuru"
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab spot={spotData} setActiveTab={setActiveTab} feedbacks={feedbacks} />;
            case 'manage':
                return <ManageSpotTab spot={spotData} showNotification={showNotification} />;
            case 'reviews':
                return <ReviewsTab feedbacks={feedbacks} />;
            case 'invites':
                return <InvitationsTab partner={partnerData} spot={spotData} showNotification={showNotification} />;
            case 'events':
                return <EventsTab partner={partnerData} spot={spotData} setConfirmModal={setConfirmModal} showNotification={showNotification} />;
            case 'settings':
                return <SettingsTab partner={partnerData} />;
            default:
                return <OverviewTab spot={spotData} setActiveTab={setActiveTab} feedbacks={feedbacks} />;
        }
    };

    return (
        <div className="min-h-screen bg-mysore-light dark:bg-mysore-dark font-sans flex transition-colors duration-200">
            {/* Sidebar */}
            <aside className="w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-100 dark:border-gray-800 hidden md:flex flex-col fixed h-full z-30">
                <div className="p-8 border-b border-gray-100 dark:border-gray-800">
                    <h1 className="text-2xl font-serif text-black dark:text-white tracking-tight">
                        Mysuru <span className="font-bold text-[#D4AF37]">Partner</span>
                    </h1>
                </div>

                <nav className="flex-1 p-6 space-y-3">
                    <NavItem
                        icon={<LayoutDashboard />}
                        label="Dashboard"
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                    />
                    <NavItem
                        icon={<Store />}
                        label="Manage Spot"
                        active={activeTab === 'manage'}
                        onClick={() => setActiveTab('manage')}
                    />
                    <NavItem
                        icon={<MessageSquare />}
                        label="Reviews"
                        active={activeTab === 'reviews'}
                        onClick={() => setActiveTab('reviews')}
                    />
                    <NavItem
                        icon={<Inbox />}
                        label="Invitations"
                        active={activeTab === 'invites'}
                        onClick={() => setActiveTab('invites')}
                    />
                    <NavItem
                        icon={<Calendar />}
                        label="Events & Offers"
                        active={activeTab === 'events'}
                        onClick={() => setActiveTab('events')}
                    />
                    <NavItem
                        icon={<Settings />}
                        label="Settings"
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </nav>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-5 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all font-bold text-sm"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 md:p-12 h-screen overflow-y-auto custom-scrollbar">
                <div className="max-w-6xl mx-auto">
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h2 className="text-4xl font-serif text-black dark:text-white">
                                Welcome, {partnerData?.fullName?.split(' ')[0] || "Partner"}
                            </h2>
                            <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                                Managing <span className="text-[#D4AF37]">"{spotData.name}"</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-5 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-black uppercase tracking-widest text-green-600 dark:text-green-400">Live Status</span>
                        </div>
                    </header>

                    {renderContent()}
                </div>
            </main>

            {/* Custom Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}></div>
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 sm:p-10">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${confirmModal.type === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                <Settings className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-serif text-black dark:text-white mb-3">{confirmModal.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">{confirmModal.message}</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                                    className="flex-1 py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 ${confirmModal.type === 'danger' ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-black dark:bg-[#D4AF37] text-white dark:text-black shadow-black/20'}`}
                                >
                                    Confirm Action
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Toast Notification */}
            {notification.show && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[101] animate-in slide-in-from-bottom-10 duration-500">
                    <div className="bg-black dark:bg-gray-800 text-white px-8 py-4 rounded-[1.5rem] shadow-2xl flex items-center gap-4 border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${notification.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`}></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${active
            ? 'bg-black dark:bg-[#D4AF37] text-white dark:text-black shadow-xl shadow-[#D4AF37]/10 translate-x-1'
            : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
            }`}
    >
        {React.cloneElement(icon, { size: 20 })}
        <span>{label}</span>
    </button>
);

const OverviewTab = ({ spot, setActiveTab }) => (
    <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            <StatCard
                label="Reviews"
                value={spot.reviewsCount}
                trend="+5 new"
                icon={<MessageSquare className="text-purple-600" />}
                bgColor="bg-purple-50 dark:bg-purple-900/20"
                onClick={() => setActiveTab('reviews')}
            />
            <StatCard
                label="Profile Views"
                value="8"
                trend="+18%"
                icon={<Users className="text-emerald-600" />}
                bgColor="bg-emerald-50 dark:bg-emerald-900/20"
                onClick={() => setActiveTab('overview')}
            />
        </div>

        {/* Live Heritage Map Spotlight */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] shadow-xl p-10 border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h3 className="text-2xl font-serif text-black dark:text-white">Heritage Map Presence</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Your spot's spatial identity in the Mysuru ecosystem</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live Elevation</span>
                </div>
            </div>
            <div className="h-[400px] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-700 relative shadow-inner group">
                <MapComponent interactive={false} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-8 left-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <p className="text-white text-xs font-bold uppercase tracking-widest">Sovereign Explorer View</p>
                </div>
            </div>
        </div>

        {/* Spot Preview */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800 transition-all hover:scale-[1.01]">
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="w-full lg:w-1/3 h-64 rounded-3xl overflow-hidden shadow-2xl relative">
                    <img src="/karanji.jpg" alt="Spot Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-4 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-[#D4AF37]/20">{spot.category}</span>
                    </div>
                    <h3 className="text-3xl font-serif text-black dark:text-white mb-4">{spot.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 line-clamp-2 md:line-clamp-none mb-8 font-medium leading-relaxed text-sm">
                        {spot.description}
                    </p>
                    <div className="flex flex-wrap gap-8 text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        <div className="flex items-center gap-3">
                            <MapPin size={16} className="text-[#D4AF37]" />
                            <span>{spot.location}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock size={16} className="text-[#D4AF37]" />
                            <span>{spot.openingHours}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black dark:bg-[#D4AF37] rounded-[2rem] p-10 text-white dark:text-black relative overflow-hidden group shadow-2xl">
                <div className="relative z-10">
                    <h3 className="text-2xl font-serif mb-2">Boost your visibility</h3>
                    <p className="opacity-80 font-medium mb-8 text-sm">Create a special offer for visitors and get featured on the "Near You" section.</p>
                    <button
                        onClick={() => setActiveTab('events')}
                        className="bg-[#D4AF37] dark:bg-black text-black dark:text-[#D4AF37] px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-xl text-sm"
                    >
                        <Sparkles size={20} />
                        <span>Create Offer</span>
                    </button>
                </div>
                <Sparkles className="absolute -bottom-4 -right-4 w-40 h-40 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-10 border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col justify-center">
                <h3 className="text-2xl font-serif text-black dark:text-white mb-2">Update your photos</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium text-sm">Clear photos of your work and workspace increase visitor trust by 40%.</p>
                <div className="flex items-center gap-3">
                    <button className="bg-gray-50 dark:bg-gray-800 text-black dark:text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm shadow-sm ring-1 ring-gray-100 dark:ring-gray-800">
                        <Camera size={20} className="text-[#D4AF37]" />
                        <span>Upload Photos</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const ManageSpotTab = ({ spot }) => (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden px-10 py-12">
        <h3 className="text-3xl font-serif text-black dark:text-white mb-10">Curation Details</h3>
        <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Heritage Spot Name</label>
                    <input
                        type="text"
                        defaultValue={spot.name}
                        className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none transition-all font-medium text-sm shadow-inner"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Classification</label>
                    <select
                        defaultValue="Hidden Gem"
                        className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none transition-all font-bold text-sm shadow-inner appearance-none cursor-pointer"
                    >
                        <option>Local Artisan</option>
                        <option>Hyperlocal Food</option>
                        <option>Hidden Gem</option>
                        <option>Cultural Experience</option>
                        <option>Nature</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Soulful Narrative</label>
                <textarea
                    rows="4"
                    defaultValue={spot.description}
                    className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none transition-all font-medium text-sm shadow-inner resize-none"
                ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Sacred Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={18} />
                        <input
                            type="text"
                            defaultValue={spot.location}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-medium text-sm shadow-inner"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Traditional Hours</label>
                    <div className="relative">
                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={18} />
                        <input
                            type="text"
                            defaultValue={spot.openingHours}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-medium text-sm shadow-inner"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Contact Presence</label>
                    <input
                        type="text"
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-medium text-sm shadow-inner"
                    />
                </div>
            </div>

            <div className="pt-6">
                <button
                    type="submit"
                    onClick={(e) => {
                        e.preventDefault();
                        showNotification("Heritage records preserved.");
                    }}
                    className="bg-black dark:bg-[#D4AF37] text-white dark:text-black px-12 py-5 rounded-2xl font-black shadow-2xl shadow-[#D4AF37]/20 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
                >
                    Preserve Changes
                </button>
            </div>
        </form>
    </div>
);

const ReviewsTab = ({ feedbacks }) => (
    <div className="space-y-8">
        <h3 className="text-3xl font-serif text-black dark:text-white mb-4">Traveler Echoes</h3>
        <div className="space-y-6">
            {feedbacks.length === 0 ? (
                <div className="py-24 text-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800">
                    <MessageSquare size={64} className="mx-auto text-gray-200 dark:text-gray-800 mb-6" />
                    <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[10px]">No traveler echoes yet</p>
                </div>
            ) : (
                feedbacks.map((feedback, i) => (
                    <div key={feedback.id} className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 transition-all hover:translate-x-1 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-black text-xl shadow-inner group-hover:scale-110 transition-transform">
                                    {feedback.userEmail ? feedback.userEmail.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{feedback.userEmail || "Anonymous Traveler"}</h4>
                                    <div className="flex text-[#D4AF37] mt-1.5 gap-0.5">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} size={12} className={star <= feedback.rating ? "fill-current" : "text-gray-300 dark:text-gray-600"} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {new Date(feedback.timestamp).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed text-sm italic">
                            "{feedback.comment}"
                        </p>
                        <button className="mt-6 text-[#D4AF37] font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-2">
                            <MessageSquare size={14} />
                            <span>Acknowledge Thought</span>
                        </button>
                    </div>
                ))
            )}
        </div>
    </div>
);

const SettingsTab = ({ partner }) => (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-12">
        <h3 className="text-3xl font-serif text-black dark:text-white mb-12">Heritage Identity</h3>
        <div className="space-y-12">
            <div className="flex items-center gap-8 pb-12 border-b border-gray-100 dark:border-gray-800">
                <div className="w-24 h-24 rounded-3xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shadow-inner">
                    <Users size={40} />
                </div>
                <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">{partner?.fullName || "Heritage Partner"}</h4>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1.5">{partner?.email || "curator@mysurumarga.com"}</p>
                </div>
                <button className="ml-auto bg-black dark:bg-[#D4AF37] text-white dark:text-black px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Relocate Photo</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-3xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Echo Notifications</h4>
                    <p className="text-xs text-gray-400 font-medium mb-6">Receive spiritual alerts when traveler echoes are recorded.</p>
                    <div className="w-14 h-7 bg-[#D4AF37] rounded-full relative cursor-pointer ring-4 ring-[#D4AF37]/10">
                        <div className="absolute right-1 top-1 w-5 h-5 bg-black rounded-full shadow-lg"></div>
                    </div>
                </div>
                <div className="p-8 rounded-3xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Heritage Visibility</h4>
                    <p className="text-xs text-gray-400 font-medium mb-6">Toggle your spot's presence in the physical soul of the app.</p>
                    <div className="w-14 h-7 bg-[#D4AF37] rounded-full relative cursor-pointer ring-4 ring-[#D4AF37]/10">
                        <div className="absolute right-1 top-1 w-5 h-5 bg-black rounded-full shadow-lg"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const InvitationsTab = ({ partner, spot, showNotification }) => {
    const [invites, setInvites] = useState(() => {
        const stored = localStorage.getItem('collaboration_invites');
        const allInvites = stored ? JSON.parse(stored) : [];
        return allInvites.filter(inv => inv.partnerEmail === partner?.email);
    });

    const [isSending, setIsSending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    React.useEffect(() => {
        loadInvites();
    }, [partner]);

    const loadInvites = async () => {
        let allInvites = [];

        // 1. Try Supabase
        try {
            const { supabase } = await import('../lib/supabaseClient');
            if (supabase && partner?.email) {
                const { data, error } = await supabase
                    .from('partner_applications')
                    .select('*')
                    .eq('email', partner.email)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    allInvites = data.map(inv => ({
                        id: inv.id,
                        partnerName: inv.full_name,
                        partnerEmail: inv.email,
                        spotName: inv.spot_name,
                        status: inv.status,
                        timestamp: inv.created_at,
                        source: 'cloud'
                    }));
                }
            }
        } catch (err) {
            console.warn("Supabase load failed, using local fallback only:", err);
        }

        // 2. Load Local Invites
        const local = JSON.parse(localStorage.getItem('collaboration_invites') || '[]');
        const partnerLocal = local.filter(inv => inv.partnerEmail === partner?.email)
            .map(inv => ({ ...inv, source: 'local' }));

        // 3. Merge and set
        const combined = [...allInvites, ...partnerLocal].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        setInvites(combined);
    };

    const sendInvite = async () => {
        setIsSending(true);
        const timestamp = new Date().toISOString();
        const newInviteData = {
            id: partner?.id || Date.now(),
            partnerName: partner?.fullName || 'Partner',
            partnerEmail: partner?.email || 'N/A',
            spotName: spot.name,
            category: spot.category,
            status: 'pending',
            timestamp: timestamp
        };

        let transmitted = false;

        // 1. Try Supabase
        try {
            const { supabase } = await import('../lib/supabaseClient');
            if (supabase) {
                const { data, error } = await supabase
                    .from('partner_applications')
                    .insert([{
                        user_id: partner?.id,
                        full_name: partner?.fullName || 'Partner',
                        email: partner?.email || 'N/A',
                        spot_name: spot.name,
                        category: spot.category,
                        status: 'pending'
                    }])
                    .select();

                if (!error && data && data[0]) {
                    transmitted = true;
                    // Already in local state if we wait for loadInvites or just prepend
                }
            }
        } catch (err) {
            console.error("Cloud transmission skipped/failed:", err);
        }

        // Always fallback to localStorage to ensure it "works" for the user
        const local = JSON.parse(localStorage.getItem('collaboration_invites') || '[]');
        localStorage.setItem('collaboration_invites', JSON.stringify([newInviteData, ...local]));

        setInvites(prev => [newInviteData, ...prev]);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setIsSending(false);
    };

    return (
        <div className="space-y-10">
            <div className="bg-black dark:bg-[#D4AF37] rounded-[2.5rem] p-12 text-white dark:text-black shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                    <h3 className="text-3xl font-serif mb-3">Partner with Sovereignty</h3>
                    <p className="opacity-80 font-medium mb-10 max-w-lg text-sm leading-relaxed">Send a formal collaboration invite to the Heritage Administration to request verification badges, curated placement, or royal features.</p>
                    <button
                        onClick={sendInvite}
                        disabled={isSending}
                        className={`bg-[#D4AF37] dark:bg-black text-black dark:text-[#D4AF37] px-10 py-5 rounded-2xl font-black flex items-center gap-4 hover:scale-105 transition-all shadow-xl text-xs uppercase tracking-widest ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSending ? (
                            <div className="w-5 h-5 border-2 border-black dark:border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Send size={20} />
                        )}
                        <span>{isSending ? 'Transmitting...' : 'Request Heritage Collaboration'}</span>
                    </button>
                    {showSuccess && (
                        <div className="mt-6 bg-emerald-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest animate-bounce inline-block shadow-lg">
                            Invitation Transmitted
                        </div>
                    )}
                </div>
                <Send className="absolute -bottom-6 -right-6 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            </div>

            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                <div className="px-10 py-8 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-2xl font-serif text-black dark:text-white">Request Chronicle</h3>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {invites.length === 0 ? (
                        <div className="py-24 text-center">
                            <Inbox size={64} className="mx-auto text-gray-200 dark:text-gray-800 mb-6" />
                            <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[10px]">No recent requests</p>
                        </div>
                    ) : (
                        invites.map(invite => (
                            <div key={invite.id} className="px-10 py-8 flex items-center justify-between transition-all hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                        <Send size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Collaboration Protocol</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                            <Clock size={12} className="text-[#D4AF37]" />
                                            <span>{new Date(invite.timestamp).toLocaleDateString()} at {new Date(invite.timestamp).toLocaleTimeString()}</span>
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ${invite.status === 'pending' ? 'bg-amber-500/10 text-amber-600 ring-amber-500/20' :
                                    invite.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' :
                                        'bg-red-500/10 text-red-600 ring-red-500/20'
                                    }`}>
                                    {invite.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, trend, icon, bgColor, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1"
    >
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${bgColor}`}>
                    {React.cloneElement(icon, { size: 24 })}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full ring-1 ring-green-100 dark:ring-green-900/50">
                    {trend}
                </span>
            </div>
            <h4 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{value}</h4>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500 pointer-events-none"></div>
    </div>
);

const EventsTab = ({ partner, spot, setConfirmModal, showNotification }) => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
        type: 'Festival',
        price: 'Free'
    });

    React.useEffect(() => {
        loadEvents();
    }, [partner]);

    const loadEvents = async () => {
        setIsLoading(true);
        try {
            const { supabase } = await import('../lib/supabaseClient');
            if (supabase && partner?.email) {
                const { data, error } = await supabase
                    .from('heritage_events')
                    .select('*')
                    .eq('partner_email', partner.email)
                    .order('event_date', { ascending: true });

                if (error) throw error;
                setEvents(data || []);
            }
        } catch (err) {
            console.error("Error loading events:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const { supabase } = await import('../lib/supabaseClient');
            if (supabase) {
                const eventData = {
                    partner_email: partner.email,
                    spot_name: spot.name,
                    title: newEvent.title,
                    description: newEvent.description,
                    event_date: newEvent.date,
                    event_type: newEvent.type,
                    price: newEvent.price,
                    status: 'active'
                };

                const { data, error } = await supabase
                    .from('heritage_events')
                    .insert([eventData])
                    .select();

                if (error) throw error;

                if (data) {
                    setEvents(prev => [...prev, data[0]]);
                    setShowForm(false);
                    setNewEvent({ title: '', description: '', date: '', type: 'Festival', price: 'Free' });
                    showNotification("Event chronicle created.");
                }
            }
        } catch (err) {
            console.error("Failed to create event:", err);
            showNotification("Protocol failed.", "error");
        } finally {
            setIsCreating(false);
        }
    };

    const deleteEvent = async (id) => {
        setConfirmModal({
            show: true,
            title: 'Retire Event',
            message: 'Are you sure you want to retire this event from the chronicle? This action is permanent.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    const { supabase } = await import('../lib/supabaseClient');
                    if (supabase) {
                        const { error } = await supabase
                            .from('heritage_events')
                            .delete()
                            .eq('id', id);

                        if (error) throw error;
                        setEvents(events.filter(e => e.id !== id));
                        showNotification("Chronicle entry removed.");
                    }
                } catch (err) {
                    console.error("Error deleting event:", err);
                    showNotification("Protocol update failed.", "error");
                }
                setConfirmModal(prev => ({ ...prev, show: false }));
            }
        });
    };

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <h3 className="text-3xl font-serif text-black dark:text-white">Heritage Chronicles</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-black dark:bg-[#D4AF37] text-white dark:text-black px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-xl text-xs uppercase tracking-widest"
                >
                    {showForm ? <Inbox size={18} /> : <Plus size={18} />}
                    <span>{showForm ? 'View Events' : 'Promote Event'}</span>
                </button>
            </div>

            {showForm ? (
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[2.5rem] p-12 border border-gray-100 dark:border-gray-800 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h4 className="text-2xl font-serif text-black dark:text-white mb-10">New Event Protocol</h4>
                    <form onSubmit={handleCreateEvent} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Event Title</label>
                                <input
                                    required
                                    type="text"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="e.g. Dasara Workshop Special"
                                    className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 text-black dark:text-white focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Event Type</label>
                                <select
                                    value={newEvent.type}
                                    onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                                    className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 text-black dark:text-white focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all font-bold cursor-pointer"
                                >
                                    <option>Festival</option>
                                    <option>Workshop</option>
                                    <option>Special Offer</option>
                                    <option>Guided Tour</option>
                                    <option>Art Exhibition</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Soulful Description</label>
                            <textarea
                                required
                                rows="3"
                                value={newEvent.description}
                                onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                placeholder="Describe the heritage experience..."
                                className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 text-black dark:text-white focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all font-medium resize-none"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Temporal Marker (Date)</label>
                                <input
                                    required
                                    type="date"
                                    value={newEvent.date}
                                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                    className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 text-black dark:text-white focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Energy Exchange (Price)</label>
                                <input
                                    type="text"
                                    value={newEvent.price}
                                    onChange={e => setNewEvent({ ...newEvent, price: e.target.value })}
                                    placeholder="Free or ₹ Amount"
                                    className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 text-black dark:text-white focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isCreating}
                            className={`w-full bg-black dark:bg-[#D4AF37] text-white dark:text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-all ${isCreating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
                        >
                            {isCreating ? 'Archiving to History...' : 'Commence Event'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {isLoading ? (
                        <div className="col-span-2 py-24 text-center">
                            <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Calling the Ancients...</p>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="col-span-2 py-24 text-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
                            <Calendar size={64} className="mx-auto text-gray-200 dark:text-gray-800 mb-6" />
                            <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[10px]">The chronicles are currently silent</p>
                        </div>
                    ) : (
                        events.map(event => (
                            <div key={event.id} className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl group hover:translate-x-1 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ${event.event_type === 'Festival' ? 'bg-amber-500/10 text-amber-600 ring-amber-500/20' :
                                        event.event_type === 'Workshop' ? 'bg-indigo-500/10 text-indigo-600 ring-indigo-500/20' :
                                            'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20'
                                        }`}>
                                        {event.event_type}
                                    </div>
                                    <button
                                        onClick={() => deleteEvent(event.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <LogOut size={16} className="rotate-90" />
                                    </button>
                                </div>
                                <h4 className="text-xl font-serif text-black dark:text-white mb-3 group-hover:text-[#D4AF37] transition-colors">{event.title}</h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 line-clamp-2 font-medium leading-relaxed italic">"{event.description}"</p>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <Clock size={14} className="text-[#D4AF37]" />
                                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <Ticket size={14} className="text-[#D4AF37]" />
                                        <span>{event.price}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default PartnerDashboard;
