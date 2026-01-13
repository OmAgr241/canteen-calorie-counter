const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's favorites
router.get('/', authenticateToken, (req, res) => {
    try {
        const favorites = db.prepare(`
      SELECT f.*, fav.id as favoriteId
      FROM favorites fav
      JOIN food_items f ON fav.foodId = f.id
      WHERE fav.userId = ?
      ORDER BY f.name ASC
    `).all(req.user.id);

        res.json(favorites);
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: 'Failed to get favorites' });
    }
});

// Add to favorites
router.post('/', authenticateToken, (req, res) => {
    try {
        const { foodId } = req.body;

        // Validate food exists
        const food = db.prepare('SELECT * FROM food_items WHERE id = ?').get(foodId);
        if (!food) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        // Check if already favorited
        const existing = db.prepare('SELECT * FROM favorites WHERE userId = ? AND foodId = ?')
            .get(req.user.id, foodId);

        if (existing) {
            return res.status(400).json({ error: 'Already in favorites' });
        }

        const result = db.prepare('INSERT INTO favorites (userId, foodId) VALUES (?, ?)')
            .run(req.user.id, foodId);

        res.status(201).json({
            message: 'Added to favorites',
            favoriteId: result.lastInsertRowid,
            food
        });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ error: 'Failed to add favorite' });
    }
});

// Remove from favorites
router.delete('/:foodId', authenticateToken, (req, res) => {
    try {
        const result = db.prepare('DELETE FROM favorites WHERE userId = ? AND foodId = ?')
            .run(req.user.id, req.params.foodId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ error: 'Failed to remove favorite' });
    }
});

// Check if food is favorited
router.get('/check/:foodId', authenticateToken, (req, res) => {
    try {
        const favorite = db.prepare('SELECT * FROM favorites WHERE userId = ? AND foodId = ?')
            .get(req.user.id, req.params.foodId);

        res.json({ isFavorite: !!favorite });
    } catch (error) {
        console.error('Check favorite error:', error);
        res.status(500).json({ error: 'Failed to check favorite' });
    }
});

module.exports = router;
