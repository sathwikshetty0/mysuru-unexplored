import React, { useState } from 'react';
import { Settings, Shield, Heart, HelpCircle, Info, ChevronRight, User, Phone, Mail, ArrowLeft, Bell, Moon, MapPin, Globe, Lock, FileText, ExternalLink, MessageSquare } from 'lucide-react';
import FeedbackSection from '../components/FeedbackSection';
import PlaceCard from '../components/PlaceCard';

const ProfilePage = ({ onBack, isDarkMode, onToggleDarkMode, onLogout, userData, onUpdateProfile, savedPlaceIds, allPlaces }) => {
    const [currentView, setCurrentView] = useState('main');

    const renderView = () => {
        switch (currentView) {
            case 'settings':
                return <SettingsView onBack={() => setCurrentView('main')} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} onUpdateProfile={onUpdateProfile} userData={userData} />;
            case 'privacy':
                return <PrivacyView onBack={() => setCurrentView('main')} onUpdateProfile={onUpdateProfile} userData={userData} />;
            case 'wishlist':
                return <WishlistView onBack={() => setCurrentView('main')} savedPlaceIds={savedPlaceIds} allPlaces={allPlaces} />;
            case 'help':
                return <HelpView onBack={() => setCurrentView('main')} />;
            case 'about':
                return <AboutView onBack={() => setCurrentView('main')} />;
            case 'feedback':
                return <FeedbackView onBack={() => setCurrentView('main')} userData={userData} />;
            default:
                return (
                    <MainProfileView
                        onBack={onBack}
                        onNavigate={setCurrentView}
                        onLogout={onLogout}
                        userData={userData}
                    />
                );
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-full pb-20 transition-colors duration-200">
            {renderView()}
        </div>
    );
};

const MainProfileView = ({ onBack, onNavigate, onLogout, userData }) => (
    <>
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 px-4 py-4 flex items-center shadow-sm sticky top-0 z-10 border-b dark:border-gray-800 transition-colors duration-200">
            <button onClick={onBack} className="mr-4 text-gray-600 dark:text-gray-300">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Profile</h1>
        </div>

        {/* User Info */}
        <div className="bg-white dark:bg-gray-900 mt-4 px-4 py-6 flex items-center transition-colors duration-200">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-500 mb-0 mr-4 font-bold text-2xl">
                {(userData?.fullName || userData?.full_name || 'G').charAt(0).toUpperCase()}
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {userData?.fullName || userData?.full_name || 'Guest User'}
                </h2>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                    <Mail className="w-3.5 h-3.5 mr-1.5" />
                    <span>{userData?.email || 'No email provided'}</span>
                </div>
                {userData?.phone && (
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                        <Phone className="w-3.5 h-3.5 mr-1.5" />
                        <span>{userData?.phone}</span>
                    </div>
                )}
            </div>
        </div>

        {/* Menu Options */}
        <div className="mt-6 bg-white dark:bg-gray-900 transition-colors duration-200">
            <MenuItem icon={Settings} label="Settings" onClick={() => onNavigate('settings')} />
            <MenuItem icon={Shield} label="Privacy Settings" onClick={() => onNavigate('privacy')} />
            <MenuItem icon={Heart} label="Wishlist" onClick={() => onNavigate('wishlist')} />
            <MenuItem icon={HelpCircle} label="Help & Support" onClick={() => onNavigate('help')} />
            <MenuItem icon={Info} label="About App" onClick={() => onNavigate('about')} />
            <MenuItem icon={MessageSquare} label="Share Feedback" onClick={() => onNavigate('feedback')} />
        </div>

        <div className="px-4 mt-8">
            <button
                onClick={onLogout}
                className="w-full py-3 text-red-500 font-medium bg-white dark:bg-gray-800 rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
                Log Out
            </button>
            <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-4">Version 1.0.0</p>
        </div>
    </>
);

const SettingsView = ({ onBack, isDarkMode, onToggleDarkMode, onUpdateProfile, userData }) => {

    const handleToggle = (key, value) => {
        if (onUpdateProfile) {
            onUpdateProfile({ [key]: value });
        }
    };

    return (
        <>
            <SubViewHeader title="Settings" onBack={onBack} />
            <div className="mt-4 bg-white dark:bg-gray-900 transition-colors duration-200">
                <ToggleItem
                    icon={Bell}
                    label="Notifications"
                    checked={userData?.notifications !== false}
                    onToggle={() => handleToggle('notifications', !userData?.notifications)}
                />
                <ToggleItem
                    icon={Moon}
                    label="Dark Mode"
                    checked={isDarkMode}
                    onToggle={onToggleDarkMode}
                />
                <ToggleItem
                    icon={MapPin}
                    label="Location Services"
                    checked={userData?.locationServices !== false}
                    onToggle={() => handleToggle('locationServices', !userData?.locationServices)}
                />
                <div className="h-px bg-gray-50 dark:bg-gray-800 my-2"></div>
                <MenuItem icon={Globe} label="Language" value="English" />
            </div>
        </>
    );
};

const PrivacyView = ({ onBack, onUpdateProfile, userData }) => {
    const handleToggle = (key, value) => {
        if (onUpdateProfile) {
            onUpdateProfile({ [key]: value });
        }
    };

    return (
        <>
            <SubViewHeader title="Privacy Settings" onBack={onBack} />
            <div className="mt-4 bg-white dark:bg-gray-900 transition-colors duration-200">
                <ToggleItem
                    icon={Lock}
                    label="Profile Visibility"
                    checked={userData?.isProfilePublic || false}
                    onToggle={() => handleToggle('isProfilePublic', !userData?.isProfilePublic)}
                />
                <ToggleItem
                    icon={User}
                    label="Show Phone Number"
                    checked={userData?.showPhone || false}
                    onToggle={() => handleToggle('showPhone', !userData?.showPhone)}
                />
                <div className="h-px bg-gray-50 dark:bg-gray-800 my-2"></div>
                <MenuItem icon={FileText} label="Terms of Service" />
                <MenuItem icon={Shield} label="Privacy Policy" />
            </div>
        </>
    );
};

const WishlistView = ({ onBack, savedPlaceIds, allPlaces }) => {
    const savedPlaces = allPlaces ? allPlaces.filter(p => savedPlaceIds && savedPlaceIds.includes(p.id)) : [];

    return (
        <>
            <SubViewHeader title="Wishlist" onBack={onBack} />
            {savedPlaces.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center mt-10">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                        <Heart className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Save places you want to visit by tapping the heart icon on any experience.
                    </p>
                </div>
            ) : (
                <div className="p-4 grid grid-cols-1 gap-4">
                    {savedPlaces.map(place => (
                        <div key={place.id} className="relative">
                            <PlaceCard place={place} onClick={() => { }} />
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

const HelpView = ({ onBack }) => (
    <>
        <SubViewHeader title="Help & Support" onBack={onBack} />
        <div className="mt-4 bg-white dark:bg-gray-900 transition-colors duration-200">
            <MenuItem icon={HelpCircle} label="FAQs" />
            <MenuItem icon={Phone} label="Contact Support" />
            <MenuItem icon={ExternalLink} label="Visit Website" />
        </div>
    </>
);

const AboutView = ({ onBack }) => (
    <>
        <SubViewHeader title="About App" onBack={onBack} />
        <div className="p-6 text-center">
            <div className="w-20 h-20 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-orange-200 dark:shadow-none">
                <h1 className="text-3xl font-bold text-white">M</h1>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mysuru Marga</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Version 1.0.0</p>
            <p className="text-gray-600 dark:text-gray-300 mt-6 text-sm leading-relaxed">
                Mysuru Marga is your digital companion for exploring the heritage city of Mysore.
                Discover hidden gems, local artisans, and authentic culinary experiences curated just for you.
            </p>
            <div className="mt-8 text-xs text-gray-400 dark:text-gray-600">
                © 2025 Mysuru Marga. All rights reserved.
            </div>
        </div>
    </>
);

const FeedbackView = ({ onBack, userData }) => (
    <>
        <SubViewHeader title="Feedback" onBack={onBack} />
        <div className="p-4">
            <FeedbackSection userEmail={userData?.email || 'Anonymous'} />
        </div>
    </>
);

// Helper Components

const SubViewHeader = ({ title, onBack }) => (
    <div className="bg-white dark:bg-gray-900 px-4 py-4 flex items-center shadow-sm sticky top-0 z-10 border-b dark:border-gray-800 transition-colors duration-200">
        <button onClick={onBack} className="mr-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
    </div>
);

const MenuItem = ({ icon: _Icon, label, value, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors">
        <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3 text-gray-600 dark:text-gray-400">
                <_Icon className="w-4 h-4" />
            </div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">{label}</span>
        </div>
        <div className="flex items-center">
            {value && <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">{value}</span>}
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-600" />
        </div>
    </button>
);

const ToggleItem = ({ icon: _Icon, label, defaultChecked, checked, onToggle }) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked || false);

    // Use controlled state if checked/onToggle provided, else internal state
    const isChecked = onToggle ? checked : internalChecked;
    const toggleHandler = onToggle ? onToggle : () => setInternalChecked(!internalChecked);

    return (
        <div className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-50 dark:border-gray-800 transition-colors">
            <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3 text-gray-600 dark:text-gray-400">
                    <_Icon className="w-4 h-4" />
                </div>
                <span className="text-gray-700 dark:text-gray-200 font-medium">{label}</span>
            </div>
            <button
                onClick={toggleHandler}
                className={`w-11 h-6 rounded-full relative transition-colors ${isChecked ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isChecked ? 'translate-x-full left-0.5' : 'left-0.5'}`}></div>
            </button>
        </div>
    );
};

export default ProfilePage;
