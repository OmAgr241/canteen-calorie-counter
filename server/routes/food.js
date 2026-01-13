const express = require('express');
const db = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all food items (public)
router.get('/', (req, res) => {
    try {
        const { search, isVeg, minCalories, maxCalories, highProtein, sortBy } = req.query;

        let query = 'SELECT * FROM food_items WHERE isAvailable = 1';
        const params = [];

        // Search filter
        if (search) {
            query += ' AND name LIKE ?';
            params.push(`%${search}%`);
        }

        // Veg filter
        if (isVeg === 'true') {
            query += ' AND isVeg = 1';
        } else if (isVeg === 'false') {
            query += ' AND isVeg = 0';
        }

        // Calorie range filter
        if (minCalories) {
            query += ' AND calories >= ?';
            params.push(parseInt(minCalories));
        }
        if (maxCalories) {
            query += ' AND calories <= ?';
            params.push(parseInt(maxCalories));
        }

        // High protein filter (>15g)
        if (highProtein === 'true') {
            query += ' AND protein >= 15';
        }

        // Sorting
        if (sortBy === 'calories_asc') {
            query += ' ORDER BY calories ASC';
        } else if (sortBy === 'calories_desc') {
            query += ' ORDER BY calories DESC';
        } else if (sortBy === 'protein_desc') {
            query += ' ORDER BY protein DESC';
        } else {
            query += ' ORDER BY name ASC';
        }

        const foods = db.prepare(query).all(...params);
        res.json(foods);
    } catch (error) {
        console.error('Get foods error:', error);
        res.status(500).json({ error: 'Failed to get food items' });
    }
});

// Get single food item
router.get('/:id', (req, res) => {
    try {
        const food = db.prepare('SELECT * FROM food_items WHERE id = ?').get(req.params.id);
        if (!food) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        res.json(food);
    } catch (error) {
        console.error('Get food error:', error);
        res.status(500).json({ error: 'Failed to get food item' });
    }
});

// Admin: Get all foods including unavailable
router.get('/admin/all', authenticateToken, requireAdmin, (req, res) => {
    try {
        const foods = db.prepare('SELECT * FROM food_items ORDER BY name ASC').all();
        res.json(foods);
    } catch (error) {
        console.error('Get all foods error:', error);
        res.status(500).json({ error: 'Failed to get food items' });
    }
});

// Admin: Add new food item
router.post('/', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { name, calories, protein, carbs, fats, isVeg } = req.body;

        // Validation
        if (!name || calories === undefined || protein === undefined || carbs === undefined || fats === undefined) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const result = db.prepare(`
      INSERT INTO food_items (name, calories, protein, carbs, fats, isVeg)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, calories, protein, carbs, fats, isVeg ? 1 : 0);

        const food = db.prepare('SELECT * FROM food_items WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ message: 'Food item added', food });
    } catch (error) {
        console.error('Add food error:', error);
        res.status(500).json({ error: 'Failed to add food item' });
    }
});

// Admin: Update food item
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { name, calories, protein, carbs, fats, isVeg, isAvailable } = req.body;

        db.prepare(`
      UPDATE food_items 
      SET name = COALESCE(?, name),
          calories = COALESCE(?, calories),
          protein = COALESCE(?, protein),
          carbs = COALESCE(?, carbs),
          fats = COALESCE(?, fats),
          isVeg = COALESCE(?, isVeg),
          isAvailable = COALESCE(?, isAvailable)
      WHERE id = ?
    `).run(name, calories, protein, carbs, fats, isVeg, isAvailable, req.params.id);

        const food = db.prepare('SELECT * FROM food_items WHERE id = ?').get(req.params.id);
        if (!food) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        res.json({ message: 'Food item updated', food });
    } catch (error) {
        console.error('Update food error:', error);
        res.status(500).json({ error: 'Failed to update food item' });
    }
});

// Admin: Delete food item
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
    try {
        const result = db.prepare('DELETE FROM food_items WHERE id = ?').run(req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        res.json({ message: 'Food item deleted' });
    } catch (error) {
        console.error('Delete food error:', error);
        res.status(500).json({ error: 'Failed to delete food item' });
    }
});

module.exports = router;
