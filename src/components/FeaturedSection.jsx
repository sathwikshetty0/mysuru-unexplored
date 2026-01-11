import React from 'react';
import { Heart, MapPin, Star } from 'lucide-react';
import { featuredPlaces } from '../data';

const FeaturedCard = ({ place, onClick, isSaved, onToggleSave }) => (
    <div
        onClick={() => onClick(place)}
        className="flex-shrink-0 w-64 md:w-full bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] scale-100 hover:scale-[1.02] transition-all duration-500 ease-out group cursor-pointer relative"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(place);
            }
        }}
    >
        {/* Floating Category Badge */}
        <div className="absolute top-4 left-4 z-20">
            <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-gray-100 dark:border-gray-800">
                <span className={`text-[10px] font-black uppercase tracking-widest ${place.categoryColor?.replace('bg-', 'text-') || 'text-amber-600'}`}>
                    {place.category}
                </span>
            </div>
        </div>

        {/* Image Container */}
        <div className="relative h-64 w-full overflow-hidden">
            <div className="absolute inset-0 bg-gray-900 animate-pulse -z-10" />
            <img
                src={place.image}
                alt={place.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Save Button */}
            <button
                onClick={(e) => onToggleSave(e, place.id)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 z-20 group/heart"
            >
                <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'text-red-500 fill-current' : 'text-white group-hover/heart:text-red-500'}`} />
            </button>
        </div>

        {/* Content Overlay - Now floating over the bottom of the image for a more immersive look */}
        <div className="absolute bottom-0 inset-x-0 p-6 text-white transform transition-transform duration-500">
            <div className="flex items-center gap-2 mb-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                <div className="flex items-center gap-1 bg-[#D4AF37] text-black px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide">
                    <Star size={10} className="fill-black" />
                    {place.rating}
                </div>
                <div className="flex items-center gap-1 text-gray-300 text-[10px] font-medium tracking-wide">
                    <MapPin size={10} />
                    {place.location}
                </div>
            </div>

            <h4 className="font-serif text-2xl leading-none mb-2 drop-shadow-md group-hover:text-[#D4AF37] transition-colors duration-300">
                {place.title}
            </h4>

            <p className="text-gray-300 text-xs line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                {place.description}
            </p>
        </div>
    </div>
);

const FeaturedSection = ({ places = [], onCardClick, savedPlaceIds = [], onToggleSave, onSeeAllClick }) => {
    // Show first 5 places from the dynamic list for mobile scroll, or 4 for desktop grid
    const displayPlaces = places.length > 0 ? places.slice(0, 5) : featuredPlaces;

    return (
        <div className="py-8 transition-colors duration-200">
            <div className="flex justify-between items-end px-5 md:px-0 mb-8">
                <div>
                    <span className="text-[#D4AF37] font-black text-xs uppercase tracking-[0.3em] mb-2 block">Curated Collection</span>
                    <h3 className="text-3xl md:text-5xl font-serif text-gray-900 dark:text-white leading-none">Featured Spots</h3>
                </div>
                <button
                    onClick={onSeeAllClick}
                    className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                    See All Collection <MapPin size={14} />
                </button>
            </div>

            {/* Responsive Container: Horizontal Scroll on Mobile, Grid on Desktop */}
            <div className="flex space-x-6 overflow-x-auto px-5 pb-8 md:px-0 md:pb-0 md:space-x-0 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-8 custom-scrollbar md:overflow-visible snap-x">
                {displayPlaces.map((place, index) => (
                    <div
                        key={place.id}
                        className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <FeaturedCard
                            place={place}
                            onClick={onCardClick}
                            isSaved={savedPlaceIds.includes(place.id)}
                            onToggleSave={onToggleSave}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedSection;
