import React from 'react';
import { Home, Compass, Map, Heart } from 'lucide-react';

const BottomNavItem = ({ icon: _Icon, label, active, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 ${active ? 'text-mysore-700 scale-110' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
            <_Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-bold">{label}</span>
            {active && <div className="w-1 h-1 bg-mysore-600 rounded-full absolute bottom-2"></div>}
        </button>
    );
};

const BottomNav = ({ activeTab, setActiveTab }) => {
    return (
        <div className="w-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-t border-white/20 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-24 pb-6 md:pb-2 z-50 shrink-0 transition-colors duration-200 rounded-t-[2rem]">
            <div className="flex justify-around items-center h-full px-2">
                <BottomNavItem
                    icon={Home}
                    label="Home"
                    active={activeTab === 'home'}
                    onClick={() => setActiveTab('home')}
                />
                <BottomNavItem
                    icon={Compass}
                    label="Explore"
                    active={activeTab === 'explore'}
                    onClick={() => setActiveTab('explore')}
                />
                <BottomNavItem
                    icon={Map}
                    label="Map"
                    active={activeTab === 'map'}
                    onClick={() => setActiveTab('map')}
                />
                <BottomNavItem
                    icon={Heart}
                    label="Saved"
                    active={activeTab === 'saved'}
                    onClick={() => setActiveTab('saved')}
                />

            </div>
        </div>
    );
};

export default BottomNav;
