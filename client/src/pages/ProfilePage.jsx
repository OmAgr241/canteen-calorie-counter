import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { calculateDailyCalories } from '../utils/helpers';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        height: 170,
        weight: 70,
        age: 25,
        gender: 'male',
        activityLevel: 'medium',
        dailyCalorieGoal: 2000,
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                height: user.height || 170,
                weight: user.weight || 70,
                age: user.age || 25,
                gender: user.gender || 'male',
                activityLevel: user.activityLevel || 'medium',
                dailyCalorieGoal: user.dailyCalorieGoal || 2000,
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'height' || name === 'weight' || name === 'age' || name === 'dailyCalorieGoal'
                ? Number(value)
                : value,
        }));
    };

    const calculateSuggestedGoal = () => {
        const { weight, height, age, gender, activityLevel } = formData;
        return calculateDailyCalories(weight, height, age, gender, activityLevel);
    };

    const handleUseSuggested = () => {
        setFormData((prev) => ({
            ...prev,
            dailyCalorieGoal: calculateSuggestedGoal(),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await authAPI.updateProfile(formData);
            updateUser(response.data.user);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner message="Loading profile..." />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    👤 Your Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Update your information to get personalized calorie recommendations
                </p>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-xl ${message.type === 'success'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-600 border-0 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Body Info */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Body Information
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Height (cm)
                            </label>
                            <input
                                type="number"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                                min="100"
                                max="250"
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Weight (kg)
                            </label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                min="30"
                                max="300"
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Age
                            </label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                min="10"
                                max="100"
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Gender
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Activity & Goal */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Activity & Calorie Goal
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Activity Level
                            </label>
                            <select
                                name="activityLevel"
                                value={formData.activityLevel}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                            >
                                <option value="low">Low (Sedentary)</option>
                                <option value="medium">Medium (Moderate exercise)</option>
                                <option value="high">High (Intense exercise)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Daily Calorie Goal
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="dailyCalorieGoal"
                                    value={formData.dailyCalorieGoal}
                                    onChange={handleChange}
                                    min="1000"
                                    max="5000"
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={handleUseSuggested}
                                    className="px-4 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium"
                                >
                                    Use Suggested
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Suggested Goal */}
                    <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Based on your profile, your recommended daily calorie intake is:
                        </p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            {calculateSuggestedGoal()} kcal/day
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Calculated using Mifflin-St Jeor Equation (BMR × Activity Level)
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg"
                >
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;
