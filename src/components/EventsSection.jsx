import React from 'react';
import { Calendar, MapPin, Tag, ArrowRight } from 'lucide-react';

const EventCard = ({ event }) => (
    <div className="flex-shrink-0 w-72 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 group cursor-pointer">
        <div className="relative h-40 w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            <img
                src={event.image || `https://images.unsplash.com/photo-1590740608759-6799516ca4d0?auto=format&fit=crop&q=80&w=400`}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 z-20">
                <span className="px-3 py-1 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                    {event.event_type || event.type}
                </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 z-20">
                <h4 className="text-white font-serif text-lg leading-tight line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
                    {event.title}
                </h4>
            </div>
        </div>
        <div className="p-5 space-y-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#D4AF37]" />
                    <span>{new Date(event.event_date || event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Tag size={14} className="text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">{event.price || 'Free'}</span>
                </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {event.description}
            </p>

            <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                    <MapPin size={14} />
                    <span className="truncate max-w-[120px]">{event.spot_name}</span>
                </div>
                <button className="p-2 bg-gray-50 dark:bg-gray-700 rounded-xl group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    </div>
);

const EventsSection = ({ events = [] }) => {
    if (events.length === 0) return null;

    return (
        <div className="py-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex justify-between items-center px-5 mb-6">
                <div>
                    <h3 className="text-2xl font-serif text-gray-900 dark:text-white">Upcoming Events</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mt-1">Heritage festivals & workshops</p>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#D4AF37] transition-colors">
                    View All
                </button>
            </div>

            <div className="flex space-x-5 overflow-x-auto px-5 pb-6 custom-scrollbar scroll-smooth">
                {events.map((event, index) => (
                    <EventCard key={event.id || index} event={event} />
                ))}
            </div>
        </div>
    );
};

export default EventsSection;
