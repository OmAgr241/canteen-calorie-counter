const ProgressBar = ({ current, goal, label = 'Calories', showWarning = true }) => {
    const percentage = Math.min(100, Math.round((current / goal) * 100));
    const exceeded = current > goal;

    // Determine color based on percentage
    const getColor = () => {
        if (exceeded) return 'from-red-500 to-rose-500';
        if (percentage >= 90) return 'from-amber-500 to-orange-500';
        if (percentage >= 70) return 'from-yellow-500 to-amber-500';
        return 'from-emerald-500 to-teal-500';
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
                <span className={`text-sm font-bold ${exceeded ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                    {current.toLocaleString()} / {goal.toLocaleString()} kcal
                </span>
            </div>

            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getColor()} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
                {/* Animated shimmer effect */}
                <div
                    className={`absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-shimmer`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {percentage}% consumed
                </span>
                {exceeded && showWarning && (
                    <span className="text-xs font-semibold text-red-500 flex items-center gap-1 animate-pulse">
                        ⚠️ Exceeded by {(current - goal).toLocaleString()} kcal!
                    </span>
                )}
                {!exceeded && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {(goal - current).toLocaleString()} kcal remaining
                    </span>
                )}
            </div>
        </div>
    );
};

export default ProgressBar;
