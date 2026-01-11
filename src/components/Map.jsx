import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Navigation, Car, MapPin, Star, Clock, X, ChevronRight } from 'lucide-react';

// Fix for default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom || 15, { animate: true });
        }
    }, [center, zoom, map]);
    return null;
};

const Map = ({ places, destination, interactive = true }) => {
    const defaultCenter = [12.3051, 76.6551]; // Mysuru Palace Area
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activePlace, setActivePlace] = useState(destination || null);
    const [showBookingPanel, setShowBookingPanel] = useState(false);
    const [bookingStage, setBookingStage] = useState('select'); // 'select', 'confirm', 'success'
    const [selectedCab, setSelectedCab] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const categories = ['All', 'Nature', 'Heritage', 'Food', 'Artisan', 'Stay'];

    const filteredPlaces = (places || []).filter(place => {
        const matchesSearch = place.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || place.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const suggestions = searchQuery.length > 1
        ? (places || []).filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
        : [];

    const handlePlaceSelect = (place) => {
        setActivePlace(place);
        setSearchQuery(place.title);
        setShowSuggestions(false);
        setShowBookingPanel(false);
        setBookingStage('select');
        setSelectedCab(null);
    };

    const cabOptions = [
        { id: 'bike', type: 'Bike / Two-Wheeler', price: '₹42', time: '2 min', icon: '🏍️', description: 'Fastest in traffic' },
        { id: 'auto', type: 'Auto Rickshaw', price: '₹68', time: '3 min', icon: '🛺', description: 'Affordable for 3' },
        { id: 'mini', type: 'Cab Mini', price: '₹142', time: '5 min', icon: '🚗', description: 'Compact AC cars' },
        { id: 'prime', type: 'Cab Prime', price: '₹198', time: '6 min', icon: '🚕', description: 'Premium sedans' },
    ];

    const handleBookNow = (cab) => {
        setSelectedCab(cab);
        setBookingStage('confirm');
    };

    const confirmBooking = () => {
        setBookingStage('success');
        setTimeout(() => {
            setShowBookingPanel(false);
            setBookingStage('select');
        }, 3000);
    };

    const center = activePlace?.coords || defaultCenter;
    const zoom = activePlace ? 16 : 13;

    return (
        <div className="w-full relative overflow-hidden bg-gray-100" style={{ height: 'calc(100vh - 100px)' }}>
            {/* Search Bar Overlay - Only if Interactive */}
            {interactive && (
                <div className={`absolute top-4 left-4 right-4 z-[1000] space-y-3 transition-all duration-500 ${showBookingPanel ? '-translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`}>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full"></div>
                        <div className="relative flex items-center bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-700 p-1">
                            <div className="p-3 text-gray-400">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search hidden gems..."
                                className="flex-1 bg-transparent border-none outline-none text-sm py-2 dark:text-gray-100 placeholder-gray-400"
                                value={searchQuery}
                                onFocus={() => setShowSuggestions(true)}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && suggestions.length > 0) {
                                        handlePlaceSelect(suggestions[0]);
                                    }
                                }}
                            />
                            {searchQuery && (
                                <button onClick={() => { setSearchQuery(''); setActivePlace(null); }} className="p-2 text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            )}
                            <button
                                onClick={() => suggestions.length > 0 && handlePlaceSelect(suggestions[0])}
                                className="p-2 mr-1 bg-mysore-gold/10 hover:bg-mysore-gold/20 text-mysore-gold rounded-xl transition-colors"
                            >
                                <Navigation size={20} className="fill-current" />
                            </button>
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in">
                                {suggestions.map(place => (
                                    <button
                                        key={place.id}
                                        onClick={() => handlePlaceSelect(place)}
                                        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-b border-gray-50 last:border-0"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-mysore-gold/10 flex items-center justify-center">
                                            <MapPin size={16} className="text-mysore-gold" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{place.title}</p>
                                            <p className="text-[10px] text-gray-500">{place.location}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${selectedCategory === cat
                                    ? 'bg-mysore-gold border-mysore-gold text-white shadow-lg shadow-mysore-gold/30'
                                    : 'bg-white border-white shadow-md text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Map Container - Explicit height to fix rendering issues */}
            <div className="w-full h-full absolute inset-0 z-0" onClick={() => setShowSuggestions(false)}>
                <MapContainer
                    center={center}
                    zoom={zoom}
                    scrollWheelZoom={true}
                    className="w-full h-full z-0 outline-none"
                    zoomControl={false}
                    style={{ height: '100%', width: '100%' }}
                >


                    <ChangeView center={center} zoom={zoom} />
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                    />

                    {filteredPlaces.map(place => (
                        <Marker
                            key={place.id}
                            position={place.coords}
                            eventHandlers={{
                                click: () => handlePlaceSelect(place),
                            }}
                        >
                            <Popup>
                                <div className="p-1 min-w-[150px]">
                                    <h4 className="font-bold text-sm text-gray-900">{place.title}</h4>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                                        <Star size={10} className="text-yellow-500 fill-current" />
                                        <span>{place.rating}</span>
                                        <span>•</span>
                                        <span>{place.category}</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Floating Actions */}
            {interactive && (
                <div className={`absolute bottom-24 right-4 z-[1000] flex flex-col gap-3 transition-transform ${activePlace ? '-translate-y-48' : ''}`}>
                    <button
                        onClick={() => { setActivePlace(null); setShowBookingPanel(false); setSearchQuery(''); }}
                        className="p-3 bg-white dark:bg-gray-800 shadow-xl rounded-full text-gray-600 dark:text-gray-300 hover:scale-110 active:scale-95 transition-all border border-gray-100 dark:border-gray-700"
                    >
                        <Navigation size={22} />
                    </button>
                </div>
            )}

            {/* Bottom Info Card / Cab Facility */}
            {interactive && activePlace && (
                <div className="absolute bottom-6 left-4 right-4 z-[1000] transition-all duration-500">
                    <div className={`bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-500 ${showBookingPanel ? 'h-[420px]' : 'h-max'}`}>
                        {/* Header Image */}
                        <div className={`relative transition-all duration-500 ${showBookingPanel ? 'h-20' : 'h-32'}`}>
                            <img src={activePlace.image} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <button
                                onClick={() => { setActivePlace(null); setShowBookingPanel(false); setSearchQuery(''); }}
                                className="absolute top-3 right-3 p-1.5 bg-black/40 text-white rounded-full backdrop-blur-md hover:bg-black/60 transition-colors"
                            >
                                <X size={16} />
                            </button>
                            <div className="absolute bottom-3 left-4 text-white">
                                <h3 className="font-bold leading-tight">{activePlace.title}</h3>
                                <p className="text-[10px] opacity-80">{activePlace.location}</p>
                            </div>
                        </div>

                        <div className="p-5 h-full overflow-y-auto no-scrollbar">
                            {!showBookingPanel ? (
                                <div className="flex items-center justify-between animate-in">
                                    <div className="flex gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rating</span>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star size={14} className="text-yellow-500 fill-current" />
                                                <span className="font-bold text-base">{activePlace.rating}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col border-l border-gray-100 dark:border-gray-800 pl-6">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Estimate</span>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Car size={14} className="text-mysore-gold" />
                                                <span className="font-bold text-base">₹142</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowBookingPanel(true)}
                                        className="bg-mysore-gold text-white px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-mysore-gold/30 hover:scale-[1.05] active:scale-[0.95] transition-all"
                                    >
                                        <Car size={18} />
                                        Book Ride
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in">
                                    {bookingStage === 'select' && (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Choose your vehicle</h4>
                                                <button onClick={() => setShowBookingPanel(false)} className="text-[10px] font-bold text-gray-400 uppercase">Cancel</button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {cabOptions.map(cab => (
                                                    <div
                                                        key={cab.id}
                                                        onClick={() => handleBookNow(cab)}
                                                        className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-mysore-gold/30 rounded-2xl transition-all cursor-pointer group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">{cab.icon}</div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{cab.type}</p>
                                                                <p className="text-[10px] text-gray-500">{cab.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-gray-900 dark:text-gray-100">{cab.price}</p>
                                                            <p className="text-[10px] text-green-500 font-bold">{cab.time}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {bookingStage === 'confirm' && selectedCab && (
                                        <div className="space-y-6 py-2">
                                            <div className="text-center space-y-2">
                                                <div className="w-20 h-20 bg-mysore-gold/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-pulse">
                                                    {selectedCab.icon}
                                                </div>
                                                <h4 className="text-lg font-bold">Confirm your {selectedCab.type}</h4>
                                                <p className="text-sm text-gray-500">Pick-up: Current Location<br />Drop-off: {activePlace.title}</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setBookingStage('select')}
                                                    className="flex-1 py-4 border-2 border-gray-100 dark:border-gray-800 rounded-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    onClick={confirmBooking}
                                                    className="flex-[2] py-4 bg-black text-white rounded-2xl font-bold shadow-2xl hover:bg-gray-800 transition-colors"
                                                >
                                                    Confirm & Pay {selectedCab.price}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {bookingStage === 'success' && (
                                        <div className="flex flex-col items-center justify-center py-10 space-y-4 fade-in">
                                            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                                                <Clock size={32} />
                                            </div>
                                            <div className="text-center">
                                                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Booking Confirmed!</h4>
                                                <p className="text-sm text-gray-500 mt-1">Your driver is arriving in {selectedCab?.time}</p>
                                            </div>
                                            <div className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Driver Info</p>
                                                        <p className="text-sm font-bold">Suresh Kumar</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">OTP</p>
                                                        <p className="text-sm font-bold tracking-widest text-mysore-gold">4821</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default Map;
