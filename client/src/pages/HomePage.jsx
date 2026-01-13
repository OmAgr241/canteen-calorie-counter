import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { intakeAPI, foodAPI } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import NutrientPieChart from '../components/NutrientPieChart';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
    const { user } = useAuth();
    const [todaySummary, setTodaySummary] = useState(null);
    const [recentFoods, setRecentFoods] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [summaryRes, foodsRes] = await Promise.all([
                intakeAPI.getToday(),
                foodAPI.getAll({ sortBy: 'name' })
            ]);
            setTodaySummary(summaryRes.data);
            setRecentFoods(foodsRes.data.slice(0, 6));
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner message="Loading your dashboard..." />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {getGreeting()}, <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{user?.name}!</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Track your calories and stay healthy! 🥗
                </p>
            </div>

            {/* Today's Summary Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 md:p-8 text-white mb-8 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-lg font-medium opacity-90 mb-1">Today's Calories</h2>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl md:text-6xl font-bold">
                                {todaySummary?.consumed || 0}
                            </span>
                            <span className="text-2xl opacity-80">/ {todaySummary?.goal || 2000} kcal</span>
                        </div>
                        <p className="mt-2 opacity-80">
                            {todaySummary?.exceeded
                                ? `⚠️ You've exceeded your goal by ${todaySummary.consumed - todaySummary.goal} kcal!`
                                : `🎯 ${todaySummary?.remaining || 2000} kcal remaining`}
                        </p>
                    </div>

                    <Link
                        to="/menu"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <span className="text-xl">➕</span>
                        Quick Add Food
                    </Link>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 bg-white/20 rounded-full h-4 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${todaySummary?.exceeded ? 'bg-red-400' : 'bg-white'
                            }`}
                        style={{ width: `${Math.min(100, todaySummary?.percentage || 0)}%` }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Nutrients Pie Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Today's Nutrients
                    </h3>
                    <NutrientPieChart
                        protein={todaySummary?.nutrients?.protein || 0}
                        carbs={todaySummary?.nutrients?.carbs || 0}
                        fats={todaySummary?.nutrients?.fats || 0}
                    />
                </div>

                {/* Macro Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Macros Breakdown
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">P</div>
                                <span className="text-gray-700 dark:text-gray-300">Protein</span>
                            </div>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {todaySummary?.nutrients?.protein || 0}g
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold">C</div>
                                <span className="text-gray-700 dark:text-gray-300">Carbs</span>
                            </div>
                            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                                {todaySummary?.nutrients?.carbs || 0}g
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold">F</div>
                                <span className="text-gray-700 dark:text-gray-300">Fats</span>
                            </div>
                            <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
                                {todaySummary?.nutrients?.fats || 0}g
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Quick Actions
                    </h3>
                    <div className="space-y-3">
                        <Link
                            to="/menu"
                            className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                        >
                            <span className="text-2xl">🍔</span>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Browse Menu</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">View all canteen items</p>
                            </div>
                        </Link>
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                        >
                            <span className="text-2xl">📊</span>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Dashboard</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Detailed calorie tracking</p>
                            </div>
                        </Link>
                        <Link
                            to="/history"
                            className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                        >
                            <span className="text-2xl">📅</span>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">View History</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Weekly & monthly trends</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Popular Foods */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        🔥 Popular Items
                    </h3>
                    <Link
                        to="/menu"
                        className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                    >
                        View All →
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {recentFoods.map((food) => (
                        <Link
                            key={food.id}
                            to="/menu"
                            className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center group"
                        >
                            <p className="text-2xl mb-2">{food.isVeg ? '🥗' : '🍗'}</p>
                            <p className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {food.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {food.calories} kcal
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
