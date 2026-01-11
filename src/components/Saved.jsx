import React from 'react';
import { Heart } from 'lucide-react';
import PlaceCard from './PlaceCard';

const Saved = ({ savedPlaceIds = [], allPlaces = [], onToggleSave, onCardClick }) => {
    const savedPlaces = allPlaces.filter(place => savedPlaceIds.includes(place.id));

    if (savedPlaces.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] px-4 text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 transition-colors">
                    <Heart className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Saved Places Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
                    Start exploring and save your favorite hidden gems to create your personal itinerary.
                </p>
            </div>
        );
    }

    return (
        <div className="px-4 py-4 pb-20">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Saved Places ({savedPlaces.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedPlaces.map(place => (
                    <PlaceCard
                        key={place.id}
                        {...place}
                        isSaved={true}
                        onToggleSave={(e) => onToggleSave(e, place.id)}
                        onClick={() => onCardClick && onCardClick(place)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Saved;
