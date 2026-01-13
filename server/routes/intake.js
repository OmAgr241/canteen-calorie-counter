const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get today's date in YYYY-MM-DD format
const getToday = () => {
    return new Date().toISOString().split('T')[0];
};

// Add food to daily intake
router.post('/', authenticateToken, (req, res) => {
    try {
        const { foodId, quantity = 1, date } = req.body;
        const intakeDate = date || getToday();

        // Validate food exists
        const food = db.prepare('SELECT * FROM food_items WHERE id = ?').get(foodId);
        if (!food) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        // Add to intake
        const result = db.prepare(`
      INSERT INTO daily_intake (userId, foodId, quantity, date)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, foodId, quantity, intakeDate);

        res.status(201).json({
            message: 'Added to daily intake',
            intake: {
                id: result.lastInsertRowid,
                foodId,
                quantity,
                date: intakeDate,
                food
            }
        });
    } catch (error) {
        console.error('Add intake error:', error);
        res.status(500).json({ error: 'Failed to add intake' });
    }
});

// Get daily intake for a specific date
router.get('/daily', authenticateToken, (req, res) => {
    try {
        const date = req.query.date || getToday();

        const intakes = db.prepare(`
      SELECT di.*, f.name, f.calories, f.protein, f.carbs, f.fats, f.isVeg
      FROM daily_intake di
      JOIN food_items f ON di.foodId = f.id
      WHERE di.userId = ? AND di.date = ?
      ORDER BY di.createdAt DESC
    `).all(req.user.id, date);

        // Calculate totals
        const totals = intakes.reduce((acc, item) => ({
            calories: acc.calories + (item.calories * item.quantity),
            protein: acc.protein + (item.protein * item.quantity),
            carbs: acc.carbs + (item.carbs * item.quantity),
            fats: acc.fats + (item.fats * item.quantity)
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

        res.json({ date, intakes, totals });
    } catch (error) {
        console.error('Get daily intake error:', error);
        res.status(500).json({ error: 'Failed to get daily intake' });
    }
});

// Get today's summary
router.get('/today', authenticateToken, (req, res) => {
    try {
        const today = getToday();

        const intakes = db.prepare(`
      SELECT di.quantity, f.calories, f.protein, f.carbs, f.fats
      FROM daily_intake di
      JOIN food_items f ON di.foodId = f.id
      WHERE di.userId = ? AND di.date = ?
    `).all(req.user.id, today);

        const user = db.prepare('SELECT dailyCalorieGoal FROM users WHERE id = ?').get(req.user.id);

        // Calculate totals
        const totals = intakes.reduce((acc, item) => ({
            calories: acc.calories + (item.calories * item.quantity),
            protein: acc.protein + (item.protein * item.quantity),
            carbs: acc.carbs + (item.carbs * item.quantity),
            fats: acc.fats + (item.fats * item.quantity)
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

        const remaining = user.dailyCalorieGoal - totals.calories;
        const percentage = Math.round((totals.calories / user.dailyCalorieGoal) * 100);

        res.json({
            date: today,
            goal: user.dailyCalorieGoal,
            consumed: totals.calories,
            remaining: Math.max(0, remaining),
            percentage: Math.min(100, percentage),
            exceeded: totals.calories > user.dailyCalorieGoal,
            nutrients: {
                protein: Math.round(totals.protein * 10) / 10,
                carbs: Math.round(totals.carbs * 10) / 10,
                fats: Math.round(totals.fats * 10) / 10
            }
        });
    } catch (error) {
        console.error('Get today summary error:', error);
        res.status(500).json({ error: 'Failed to get today summary' });
    }
});

// Get history (last 30 days)
router.get('/history', authenticateToken, (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;

        const history = db.prepare(`
      SELECT 
        di.date,
        SUM(f.calories * di.quantity) as totalCalories,
        SUM(f.protein * di.quantity) as totalProtein,
        SUM(f.carbs * di.quantity) as totalCarbs,
        SUM(f.fats * di.quantity) as totalFats
      FROM daily_intake di
      JOIN food_items f ON di.foodId = f.id
      WHERE di.userId = ? AND di.date >= date('now', '-' || ? || ' days')
      GROUP BY di.date
      ORDER BY di.date DESC
    `).all(req.user.id, days);

        const user = db.prepare('SELECT dailyCalorieGoal FROM users WHERE id = ?').get(req.user.id);

        res.json({
            history: history.map(day => ({
                ...day,
                goal: user.dailyCalorieGoal,
                exceeded: day.totalCalories > user.dailyCalorieGoal
            })),
            goal: user.dailyCalorieGoal
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to get history' });
    }
});

// Update intake quantity
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const { quantity } = req.body;

        // Verify ownership
        const intake = db.prepare('SELECT * FROM daily_intake WHERE id = ? AND userId = ?')
            .get(req.params.id, req.user.id);

        if (!intake) {
            return res.status(404).json({ error: 'Intake record not found' });
        }

        db.prepare('UPDATE daily_intake SET quantity = ? WHERE id = ?')
            .run(quantity, req.params.id);

        res.json({ message: 'Intake updated', quantity });
    } catch (error) {
        console.error('Update intake error:', error);
        res.status(500).json({ error: 'Failed to update intake' });
    }
});

// Delete intake
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        // Verify ownership
        const intake = db.prepare('SELECT * FROM daily_intake WHERE id = ? AND userId = ?')
            .get(req.params.id, req.user.id);

        if (!intake) {
            return res.status(404).json({ error: 'Intake record not found' });
        }

        db.prepare('DELETE FROM daily_intake WHERE id = ?').run(req.params.id);
        res.json({ message: 'Intake deleted' });
    } catch (error) {
        console.error('Delete intake error:', error);
        res.status(500).json({ error: 'Failed to delete intake' });
    }
});

module.exports = router;
