import { useState, useEffect, useCallback } from 'react';
import { foodAPI, intakeAPI, favoritesAPI } from '../services/api';
import FoodCard from '../components/FoodCard';
import SearchFilter from '../components/SearchFilter';
import LoadingSpinner from '../components/LoadingSpinner';

const MenuPage = () => {
    const [foods, setFoods] = useState([]);
    const [favorites, setFavorites] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState(null);

    const fetchFoods = useCallback(async () => {
        try {
            setLoading(true);
            const params = { search: searchQuery };

            // Apply filters
            if (filters.isVeg && filters.isVeg !== 'all') {
                params.isVeg = filters.isVeg;
            }
            if (filters.highProtein === 'true') {
                params.highProtein = 'true';
            }
            if (filters.calorieRange) {
                if (filters.calorieRange === 'low') {
                    params.maxCalories = 250;
                } else if (filters.calorieRange === 'medium') {
                    params.minCalories = 251;
                    params.maxCalories = 400;
                } else if (filters.calorieRange === 'high') {
                    params.minCalories = 400;
                }
            }
            if (filters.sortBy) {
                params.sortBy = filters.sortBy;
            }

            const response = await foodAPI.getAll(params);
            setFoods(response.data);
        } catch (error) {
            console.error('Failed to fetch foods:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filters]);

    const fetchFavorites = async () => {
        try {
            const response = await favoritesAPI.getAll();
            const favIds = new Set(response.data.map(f => f.id));
            setFavorites(favIds);
        } catch (error) {
            console.error('Failed to fetch favorites:', error);
        }
    };

    useEffect(() => {
        fetchFoods();
        fetchFavorites();
    }, [fetchFoods]);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleFilterChange = (filterName, value) => {
        if (filterName === 'reset') {
            setFilters({});
            setSearchQuery('');
        } else {
            setFilters(prev => ({
                ...prev,
                [filterName]: value === 'all' ? undefined : value
            }));
        }
    };

    const handleAddToIntake = async (foodId, quantity) => {
        try {
            await intakeAPI.add(foodId, quantity);
            const food = foods.find(f => f.id === foodId);
            showNotification(`Added ${quantity}x ${food.name} to today's intake!`);
        } catch (error) {
            showNotification('Failed to add food', 'error');
        }
    };

    const handleToggleFavorite = async (foodId) => {
        try {
            if (favorites.has(foodId)) {
                await favoritesAPI.remove(foodId);
                setFavorites(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(foodId);
                    return newSet;
                });
                showNotification('Removed from favorites');
            } else {
                await favoritesAPI.add(foodId);
                setFavorites(prev => new Set([...prev, foodId]));
                showNotification('Added to favorites!');
            }
        } catch (error) {
            showNotification('Failed to update favorites', 'error');
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    🍔 Canteen Menu
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Browse our delicious food items and track your calories
                </p>
            </div>

            {/* Search & Filters */}
            <div className="mb-8">
                <SearchFilter
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    filters={filters}
                />
            </div>

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 animate-slideUp ${notification.type === 'error'
                        ? 'bg-red-500 text-white'
                        : 'bg-emerald-500 text-white'
                    }`}>
                    {notification.message}
                </div>
            )}

            {/* Food Grid */}
            {loading ? (
                <div className="min-h-[40vh] flex items-center justify-center">
                    <LoadingSpinner message="Loading menu..." />
                </div>
            ) : foods.length === 0 ? (
                <div className="text-center py-16">
                    <span className="text-6xl mb-4 block">🍽️</span>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No items found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Try adjusting your filters or search query
                    </p>
                </div>
            ) : (
                <>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Showing {foods.length} items
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {foods.map((food) => (
                            <FoodCard
                                key={food.id}
                                food={food}
                                onAdd={handleAddToIntake}
                                onFavorite={handleToggleFavorite}
                                isFavorite={favorites.has(food.id)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MenuPage;
