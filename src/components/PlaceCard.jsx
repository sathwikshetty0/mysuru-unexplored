import React from 'react';
import { Heart, MapPin, Star } from 'lucide-react';

const PlaceCard = ({ image, category, title, description, location, rating, onClick, isSaved, onToggleSave }) => {
    return (
        <div
            onClick={onClick}
            className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-gray-800 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 cursor-pointer relative"
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                <button
                    onClick={onToggleSave}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition-transform active:scale-90 group-hover:bg-white/30"
                >
                    <Heart className={`w-5 h-5 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                </button>

                {/* Category Badge */}
                <span className={`absolute top-4 left-4 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest text-white backdrop-blur-md
                    ${category === 'Hyperlocal Food' ? 'bg-emerald-500/80' :
                        category === 'Hidden Gems' ? 'bg-mysore-500/80' :
                            category === 'Heritage' ? 'bg-amber-600/80' : 'bg-gray-500/80'}`}>
                    {category}
                </span>

                {/* Rating Badge (Floating) */}
                <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-white">{rating}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-2 group-hover:text-mysore-700 transition-colors">
                    {title}
                </h3>

                <div className="flex items-start gap-2 text-gray-400 dark:text-gray-500 mb-3">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-xs font-medium line-clamp-1">{location}</span>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default PlaceCard;
