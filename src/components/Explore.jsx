import React, { useState } from 'react';
import Categories from './Categories';
import PlaceCard from './PlaceCard';
import { Search } from 'lucide-react';

const Explore = ({ places, onCardClick, savedPlaceIds = [], onToggleSave }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPlaces = places.filter(place =>
        place.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pb-20">
            <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 px-4 py-3 border-b border-gray-100 dark:border-gray-800 transition-colors">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search hidden gems, artisans, food..."
                        className="w-full bg-gray-100 dark:bg-gray-800 rounded-full py-2 pl-10 pr-4 text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors placeholder-gray-500 dark:placeholder-gray-400"
                    />
                </div>
            </div>

            <Categories />

            <div className="px-4 py-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    {searchQuery ? `Search Results (${filteredPlaces.length})` : 'All Experiences'}
                </h3>
                {filteredPlaces.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredPlaces.map(place => (
                            <PlaceCard
                                key={place.id}
                                {...place}
                                onClick={() => onCardClick(place)}
                                isSaved={savedPlaceIds.includes(place.id)}
                                onToggleSave={(e) => onToggleSave(e, place.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        No places found matching "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    );
};
export default Explore;
