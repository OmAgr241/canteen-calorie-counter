import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const CalorieLineChart = ({ data, goal }) => {
    // Format date for display
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Prepare chart data
    const chartData = sortedData.map((item) => ({
        date: formatDate(item.date),
        fullDate: item.date,
        calories: Math.round(item.totalCalories),
        goal: goal,
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const calories = payload[0].value;
            const exceeded = calories > goal;
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
                    <p className={`${exceeded ? 'text-red-500' : 'text-emerald-500'} font-medium`}>
                        {calories.toLocaleString()} kcal
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Goal: {goal.toLocaleString()} kcal
                    </p>
                    {exceeded && (
                        <p className="text-xs text-red-400">
                            Over by {(calories - goal).toLocaleString()} kcal
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-72">
            {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <p>No history data yet</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickLine={{ stroke: '#9CA3AF' }}
                        />
                        <YAxis
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickLine={{ stroke: '#9CA3AF' }}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine
                            y={goal}
                            stroke="#10B981"
                            strokeDasharray="5 5"
                            label={{ value: 'Goal', fill: '#10B981', fontSize: 12 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="calories"
                            stroke="#8B5CF6"
                            strokeWidth={3}
                            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#8B5CF6' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default CalorieLineChart;
