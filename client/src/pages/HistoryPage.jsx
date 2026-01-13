import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { intakeAPI } from '../services/api';
import CalorieLineChart from '../components/CalorieLineChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDisplayDate } from '../utils/helpers';

const HistoryPage = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        fetchHistory();
    }, [days]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await intakeAPI.getHistory(days);
            setHistory(response.data.history);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate weekly and monthly averages
    const calculateStats = () => {
        if (history.length === 0) return { weeklyAvg: 0, monthlyAvg: 0, totalDays: 0, daysOnTrack: 0 };

        const total = history.reduce((sum, day) => sum + day.totalCalories, 0);
        const daysOnTrack = history.filter(day => !day.exceeded).length;

        return {
            weeklyAvg: Math.round(total / Math.min(history.length, 7)),
            monthlyAvg: Math.round(total / history.length),
            totalDays: history.length,
            daysOnTrack
        };
    };

    const stats = calculateStats();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner message="Loading history..." />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        📅 Calorie History
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Track your progress over time
                    </p>
                </div>
                <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                >
                    <option value={7}>Last 7 days</option>
                    <option value={14}>Last 14 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={60}>Last 60 days</option>
                </select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {stats.totalDays}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Days Logged</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {stats.daysOnTrack}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Days On Track</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                        {stats.weeklyAvg.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Weekly Avg (kcal)</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.monthlyAvg.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Avg (kcal)</p>
                </div>
            </div>

            {/* Line Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Calorie Trend
                </h2>
                <CalorieLineChart
                    data={history}
                    goal={user?.dailyCalorieGoal || 2000}
                />
            </div>

            {/* Daily Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Daily Breakdown
                </h2>

                {history.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="text-5xl mb-4 block">📊</span>
                        <p className="text-gray-500 dark:text-gray-400">
                            No history data yet. Start logging your meals!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((day) => (
                            <div
                                key={day.date}
                                className={`flex items-center justify-between p-4 rounded-xl transition-colors ${day.exceeded
                                        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                        : 'bg-gray-50 dark:bg-gray-700/50'
                                    }`}
                            >
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {formatDisplayDate(day.date)}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        P: {Math.round(day.totalProtein)}g • C: {Math.round(day.totalCarbs)}g • F: {Math.round(day.totalFats)}g
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xl font-bold ${day.exceeded ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                        {Math.round(day.totalCalories).toLocaleString()} kcal
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Goal: {day.goal} kcal
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;
