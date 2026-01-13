import { useState, useEffect } from 'react';
import { foodAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminPage = () => {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingFood, setEditingFood] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        isVeg: true,
        isAvailable: true,
    });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchFoods();
    }, []);

    const fetchFoods = async () => {
        try {
            setLoading(true);
            const response = await foodAPI.getAllAdmin();
            setFoods(response.data);
        } catch (error) {
            console.error('Failed to fetch foods:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
        }));
    };

    const handleEdit = (food) => {
        setEditingFood(food);
        setFormData({
            name: food.name,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fats: food.fats,
            isVeg: food.isVeg === 1,
            isAvailable: food.isAvailable === 1,
        });
        setShowForm(true);
    };

    const handleAdd = () => {
        setEditingFood(null);
        setFormData({
            name: '',
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            isVeg: true,
            isAvailable: true,
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingFood) {
                await foodAPI.update(editingFood.id, formData);
                showMessage('Food item updated successfully!', 'success');
            } else {
                await foodAPI.create(formData);
                showMessage('Food item added successfully!', 'success');
            }
            setShowForm(false);
            fetchFoods();
        } catch (error) {
            showMessage('Operation failed. Please try again.', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await foodAPI.delete(id);
            showMessage('Food item deleted!', 'success');
            fetchFoods();
        } catch (error) {
            showMessage('Failed to delete item', 'error');
        }
    };

    const handleToggleAvailability = async (food) => {
        try {
            await foodAPI.update(food.id, { isAvailable: food.isAvailable ? 0 : 1 });
            fetchFoods();
        } catch (error) {
            showMessage('Failed to update availability', 'error');
        }
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner message="Loading admin panel..." />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        🛠 Admin Panel
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage food items and nutritional values
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
                >
                    ➕ Add New Item
                </button>
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

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Calories
                                    </label>
                                    <input
                                        type="number"
                                        name="calories"
                                        value={formData.calories}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Protein (g)
                                    </label>
                                    <input
                                        type="number"
                                        name="protein"
                                        value={formData.protein}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.1"
                                        required
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Carbs (g)
                                    </label>
                                    <input
                                        type="number"
                                        name="carbs"
                                        value={formData.carbs}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.1"
                                        required
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Fats (g)
                                    </label>
                                    <input
                                        type="number"
                                        name="fats"
                                        value={formData.fats}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.1"
                                        required
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isVeg"
                                        checked={formData.isVeg}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">Vegetarian</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isAvailable"
                                        checked={formData.isAvailable}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">Available</span>
                                </label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all"
                                >
                                    {editingFood ? 'Save Changes' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Food Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Calories</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">P/C/F</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {foods.map((food) => (
                                <tr key={food.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!food.isAvailable ? 'opacity-50' : ''}`}>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {food.name}
                                    </td>
                                    <td className="px-6 py-4 text-center text-orange-500 font-semibold">
                                        {food.calories}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                        {food.protein}g / {food.carbs}g / {food.fats}g
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${food.isVeg
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                            }`}>
                                            {food.isVeg ? 'Veg' : 'Non-Veg'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleToggleAvailability(food)}
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${food.isAvailable
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                                                }`}
                                        >
                                            {food.isAvailable ? 'Available' : 'Unavailable'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(food)}
                                                className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(food.id)}
                                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
