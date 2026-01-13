import { useState } from 'react';

const FoodCard = ({ food, onAdd, onFavorite, isFavorite, showActions = true }) => {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = async () => {
        if (onAdd) {
            setIsAdding(true);
            await onAdd(food.id, quantity);
            setIsAdding(false);
            setQuantity(1);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group">
            {/* Header with tags */}
            <div className="relative p-4 pb-0">
                <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${food.isVeg
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                            {food.isVeg ? '🌿 Veg' : '🍖 Non-Veg'}
                        </span>
                    </div>
                    {showActions && onFavorite && (
                        <button
                            onClick={() => onFavorite(food.id)}
                            className={`p-2 rounded-full transition-all ${isFavorite
                                    ? 'text-red-500 scale-110'
                                    : 'text-gray-400 hover:text-red-500 hover:scale-110'
                                }`}
                        >
                            {isFavorite ? '❤️' : '🤍'}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {food.name}
                </h3>

                {/* Calories highlight */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                        {food.calories}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">kcal</span>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
                        <p className="font-semibold text-blue-600 dark:text-blue-400">{food.protein}g</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Carbs</p>
                        <p className="font-semibold text-amber-600 dark:text-amber-400">{food.carbs}g</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Fats</p>
                        <p className="font-semibold text-rose-600 dark:text-rose-400">{food.fats}g</p>
                    </div>
                </div>

                {/* Add to intake */}
                {showActions && onAdd && (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-lg transition-colors"
                            >
                                −
                            </button>
                            <span className="px-3 py-2 font-semibold text-gray-900 dark:text-white min-w-[40px] text-center">
                                {quantity}x
                            </span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-lg transition-colors"
                            >
                                +
                            </button>
                        </div>
                        <button
                            onClick={handleAdd}
                            disabled={isAdding}
                            className="flex-1 py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-md"
                        >
                            {isAdding ? '✓ Added!' : '+ Add'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodCard;
