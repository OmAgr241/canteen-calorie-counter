import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { intakeAPI } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import NutrientPieChart from '../components/NutrientPieChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDisplayDate, getToday } from '../utils/helpers';

const DashboardPage = () => {
    const { user } = useAuth();
    const [todayData, setTodayData] = useState(null);
    const [intakes, setIntakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(getToday());

    useEffect(() => {
        fetchDailyData();
    }, [selectedDate]);

    const fetchDailyData = async () => {
        try {
            setLoading(true);
            const [todayRes, intakeRes] = await Promise.all([
                intakeAPI.getToday(),
                intakeAPI.getDaily(selectedDate)
            ]);
            setTodayData(todayRes.data);
            setIntakes(intakeRes.data.intakes);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteIntake = async (id) => {
        try {
            await intakeAPI.delete(id);
            fetchDailyData();
        } catch (error) {
            console.error('Failed to delete intake:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner message="Loading dashboard..." />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        📊 Calorie Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {formatDisplayDate(selectedDate)}
                    </p>
                </div>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={getToday()}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                />
            </div>

            {/* Warning Banner */}
            {todayData?.exceeded && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl flex items-center gap-3 animate-pulse">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <p className="font-semibold text-red-700 dark:text-red-400">
                            Calorie Limit Exceeded!
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-300">
                            You've consumed {todayData.consumed - todayData.goal} extra calories today. Consider lighter meals for the rest of the day.
                        </p>
                    </div>
                </div>
            )}

            {/* Main Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Calorie Progress */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Daily Progress
                    </h2>

                    {/* Big Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                {todayData?.goal || user?.dailyCalorieGoal || 2000}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Goal</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                            <p className={`text-3xl font-bold ${todayData?.exceeded ? 'text-red-500' : 'text-orange-600 dark:text-orange-400'}`}>
                                {todayData?.consumed || 0}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Consumed</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {todayData?.remaining || user?.dailyCalorieGoal || 2000}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <ProgressBar
                        current={todayData?.consumed || 0}
                        goal={todayData?.goal || user?.dailyCalorieGoal || 2000}
                        label="Today's Calories"
                    />
                </div>

                {/* Nutrients Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Nutrients
                    </h2>
                    <NutrientPieChart
                        protein={todayData?.nutrients?.protein || 0}
                        carbs={todayData?.nutrients?.carbs || 0}
                        fats={todayData?.nutrients?.fats || 0}
                    />
                </div>
            </div>

            {/* Today's Intake List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Today's Food Log
                </h2>

                {intakes.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="text-5xl mb-4 block">🍽️</span>
                        <p className="text-gray-500 dark:text-gray-400">
                            No food logged for this day yet
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {intakes.map((intake) => (
                            <div
                                key={intake.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">
                                        {intake.isVeg ? '🥗' : '🍗'}
                                    </span>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {intake.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {intake.quantity}x • {intake.protein}g protein • {intake.carbs}g carbs • {intake.fats}g fats
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-bold text-orange-500">
                                        {intake.calories * intake.quantity} kcal
                                    </span>
                                    <button
                                        onClick={() => handleDeleteIntake(intake.id)}
                                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
