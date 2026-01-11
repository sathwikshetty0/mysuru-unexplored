import React from 'react';
import { Sparkles, Palette, Utensils, MapPin, Landmark, TreePine } from 'lucide-react';

const CategoryItem = ({ icon: _Icon, label, color, bgColor }) => (
    <div className="flex flex-col items-center gap-3 min-w-[80px] group cursor-pointer">
        <div className={`w-16 h-16 rounded-full ${bgColor} flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
            <_Icon className={`w-7 h-7 ${color}`} />
        </div>
        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 text-center tracking-tight group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
    </div>
);

const Categories = ({ onSeeAllClick }) => {
    const categories = [
        { icon: Sparkles, label: "Hidden Gems", color: "text-mysore-600 dark:text-mysore-400", bgColor: "bg-mysore-100 dark:bg-mysore-900/20" },
        { icon: Palette, label: "Artisans", color: "text-rose-600 dark:text-rose-400", bgColor: "bg-rose-50 dark:bg-rose-900/20" },
        { icon: Utensils, label: "Food", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
        { icon: MapPin, label: "Near You", color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
        { icon: Landmark, label: "Heritage", color: "text-amber-700 dark:text-amber-500", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
        { icon: TreePine, label: "Nature", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-900/20" },
    ];

    return (
        <div className="py-6 transition-colors duration-200">
            <div className="flex justify-between items-center px-6 mb-4">
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Browse Categories</h3>
                <button
                    onClick={onSeeAllClick}
                    className="text-mysore-700 text-xs font-bold hover:text-mysore-800 dark:hover:text-mysore-300 uppercase tracking-widest px-3 py-1 bg-mysore-100 dark:bg-mysore-900/30 rounded-full transition-colors"
                >
                    View All
                </button>
            </div>

            <div className="flex overflow-x-auto gap-4 px-6 pb-4 custom-scrollbar snap-x md:grid md:grid-cols-6 md:px-0 md:justify-items-center md:pb-0 md:overflow-visible md:gap-8">
                {categories.map((cat, index) => (
                    <CategoryItem key={index} {...cat} />
                ))}
            </div>
        </div>
    );
};

export default Categories;
