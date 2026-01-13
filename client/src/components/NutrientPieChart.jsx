import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const NutrientPieChart = ({ protein, carbs, fats }) => {
    const data = [
        { name: 'Protein', value: protein, color: '#3B82F6' }, // Blue
        { name: 'Carbs', value: carbs, color: '#F59E0B' },     // Amber
        { name: 'Fats', value: fats, color: '#F43F5E' },       // Rose
    ];

    const total = protein + carbs + fats;

    // Calculate percentages
    const getPercentage = (value) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white">{data.name}</p>
                    <p className="text-gray-600 dark:text-gray-300">{data.value}g ({getPercentage(data.value)}%)</p>
                </div>
            );
        }
        return null;
    };

    const renderCustomLabel = ({ name, value }) => {
        if (value === 0) return null;
        return `${value}g`;
    };

    return (
        <div className="h-64">
            {total === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <p>No data to display</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={renderCustomLabel}
                            labelLine={false}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value, entry) => (
                                <span className="text-gray-700 dark:text-gray-300 text-sm">
                                    {value} ({getPercentage(entry.payload.value)}%)
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default NutrientPieChart;
