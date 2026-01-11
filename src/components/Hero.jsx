import React from 'react';
import { Search, Compass, ArrowRight } from 'lucide-react';

const Hero = ({ onExploreClick }) => {
    return (
        <div className="px-5 pt-8 pb-4 space-y-8 md:px-0 md:pt-12 md:pb-12">
            {/* Modern Search Bar */}
            <div className="relative group z-30 md:max-w-2xl md:mx-auto transform hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-14 pr-32 py-5 border-none rounded-[2rem] leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all font-medium text-sm md:text-base"
                    placeholder="Search for hidden gems, culture, food..."
                />
                <div className="absolute inset-y-2 right-2 flex items-center">
                    <button className="px-5 py-2.5 bg-black dark:bg-[#D4AF37] rounded-[1.5rem] text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/20 dark:shadow-[#D4AF37]/20">
                        Filter
                    </button>
                </div>
            </div>

            {/* Immersive Hero Card */}
            <div
                className="relative w-full h-[26rem] md:h-[36rem] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] group cursor-pointer"
                onClick={onExploreClick}
            >
                <div className="absolute inset-0 bg-gray-900 animate-pulse" /> {/* Loading state placeholder */}
                <img
                    src="/src/assets/mysore-palace-daytime.jpg"
                    alt="Mysore Palace"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

                {/* Top Badge */}
                <div className="absolute top-8 left-8">
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full shadow-2xl">
                        <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_10px_#D4AF37]" />
                        <span className="text-white font-bold text-[10px] tracking-[0.2em] uppercase">Featured Destination</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="absolute bottom-10 left-8 right-8 md:left-12 md:bottom-12 max-w-2xl">
                    <div className="space-y-4 transform group-hover:-translate-y-2 transition-transform duration-500">
                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            <div className="bg-[#D4AF37] p-1.5 rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                                <Compass className="w-4 h-4 text-black" />
                            </div>
                            <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.3em] drop-shadow-md">Beyond the Palace</span>
                        </div>

                        <h2 className="text-5xl md:text-7xl font-serif text-white leading-[0.9] tracking-tight drop-shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                            Discover the <br />
                            <span className="italic relative inline-block">
                                Soul of Mysuru
                            </span>

                        </h2>

                        <p className="text-gray-200 text-sm md:text-lg font-medium leading-relaxed max-w-lg drop-shadow-md animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                            Uncover hidden gems, local artisans & authentic experiences that usually go unnoticed by the casual eye.
                        </p>
                    </div>

                    {/* Explore Button */}
                    <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                        <button
                            className="group/btn relative overflow-hidden bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                        >
                            <span className="relative z-10">
                                Start Exploring
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
