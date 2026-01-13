// Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
export const calculateBMR = (weight, height, age, gender) => {
    // weight in kg, height in cm, age in years
    if (gender === 'male') {
        return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
        return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
};

// Calculate TDEE (Total Daily Energy Expenditure) based on activity level
export const calculateTDEE = (bmr, activityLevel) => {
    const multipliers = {
        low: 1.2,      // Sedentary (little or no exercise)
        medium: 1.55,  // Moderately active (exercise 3-5 days/week)
        high: 1.9,     // Very active (hard exercise 6-7 days/week)
    };
    return Math.round(bmr * (multipliers[activityLevel] || 1.55));
};

// Calculate recommended daily calorie intake
export const calculateDailyCalories = (weight, height, age, gender, activityLevel) => {
    const bmr = calculateBMR(weight, height, age, gender);
    return calculateTDEE(bmr, activityLevel);
};

// Format date to YYYY-MM-DD
export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

// Format date for display (e.g., "Monday, Jan 13")
export const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });
};

// Get today's date in YYYY-MM-DD format
export const getToday = () => {
    return new Date().toISOString().split('T')[0];
};

// Get start of week
export const getStartOfWeek = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
};

// Format number with commas
export const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
