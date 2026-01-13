import { useState } from 'react';

const SearchFilter = ({ onSearch, onFilterChange, filters }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleSearch = (value) => {
        setSearchTerm(value);
        onSearch(value);
    };

    const handleFilterToggle = (filterName, value) => {
        onFilterChange(filterName, value);
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search food items..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    🔍
                </span>
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isFilterOpen
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                >
                    ⚙️
                </button>
            </div>

            {/* Filter Options */}
            {isFilterOpen && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 animate-fadeIn">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Veg Filter */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                                Type
                            </label>
                            <select
                                value={filters.isVeg || 'all'}
                                onChange={(e) => handleFilterToggle('isVeg', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                            >
                                <option value="all">All</option>
                                <option value="true">Veg Only</option>
                                <option value="false">Non-Veg Only</option>
                            </select>
                        </div>

                        {/* Calorie Range */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                                Calories
                            </label>
                            <select
                                value={filters.calorieRange || 'all'}
                                onChange={(e) => handleFilterToggle('calorieRange', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                            >
                                <option value="all">All</option>
                                <option value="low">Low (0-250)</option>
                                <option value="medium">Medium (251-400)</option>
                                <option value="high">High (400+)</option>
                            </select>
                        </div>

                        {/* Protein Filter */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                                Protein
                            </label>
                            <select
                                value={filters.highProtein || 'all'}
                                onChange={(e) => handleFilterToggle('highProtein', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                            >
                                <option value="all">All</option>
                                <option value="true">High Protein (15g+)</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                                Sort By
                            </label>
                            <select
                                value={filters.sortBy || 'name'}
                                onChange={(e) => handleFilterToggle('sortBy', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                            >
                                <option value="name">Name</option>
                                <option value="calories_asc">Calories (Low-High)</option>
                                <option value="calories_desc">Calories (High-Low)</option>
                                <option value="protein_desc">Protein (High-Low)</option>
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters */}
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            onSearch('');
                            onFilterChange('reset');
                        }}
                        className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default SearchFilter;
