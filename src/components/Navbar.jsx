import React from 'react';
import { User, Home, Compass, Map, Heart } from 'lucide-react';

const Navbar = ({ onProfileClick, activeTab, setActiveTab }) => {
    const NavLink = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${activeTab === id
                ? 'bg-mysore-100 dark:bg-mysore-900/30 text-mysore-700 dark:text-mysore-400 font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
        >
            <Icon size={18} />
            <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
        </button>
    );

    return (
        <nav className="flex justify-between items-center px-6 py-6 border-b border-transparent md:border-gray-100 md:dark:border-gray-800 transition-colors duration-200">
            <div className="flex flex-col cursor-pointer" onClick={() => setActiveTab && setActiveTab('home')}>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide hidden md:block">Welcome to</span>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    Mysuru <span className="text-mysore-600">Marga</span>
                </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-1.5 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm">
                <NavLink id="home" icon={Home} label="Home" />
                <NavLink id="explore" icon={Compass} label="Explore" />
                <NavLink id="map" icon={Map} label="Map" />
                <NavLink id="saved" icon={Heart} label="Saved" />
            </div>

            <button
                onClick={onProfileClick}
                className="w-12 h-12 rounded-full bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all shadow-sm group"
                aria-label="Profile"
            >
                <div className="relative">
                    <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
            </button>
        </nav>
    );
};

export default Navbar;
